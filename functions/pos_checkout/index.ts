import { createClient } from 'npm:@supabase/supabase-js@2';

interface CheckoutRequest {
  cart: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
    notes?: string;
  }>;
  table_number?: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  payment_method: 'cash' | 'card' | 'qr';
  received_amount?: number;
}

Deno.serve(async (req: Request) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    // Create Supabase client with SERVICE_ROLE_KEY for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const checkoutData: CheckoutRequest = await req.json();

    // Start transaction-like operations
    // 1. Create order
    const { data: order, error: orderError } = await supabase
      .from('pos_orders')
      .insert({
        table_number: checkoutData.table_number || null,
        subtotal: checkoutData.subtotal,
        tax: checkoutData.tax,
        discount: checkoutData.discount,
        total: checkoutData.total,
        status: 'completed',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Create order items
    const orderItems = checkoutData.cart.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.unit_price * item.quantity,
      notes: item.notes,
    }));

    const { error: itemsError } = await supabase
      .from('pos_order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // 3. Create payment
    const { error: paymentError } = await supabase
      .from('pos_payments')
      .insert({
        order_id: order.id,
        payment_method: checkoutData.payment_method,
        amount: checkoutData.total,
        received_amount: checkoutData.received_amount,
        change_amount: checkoutData.received_amount
          ? checkoutData.received_amount - checkoutData.total
          : 0,
      });

    if (paymentError) throw paymentError;

    // 4. Update inventory (deduct stock)
    for (const item of checkoutData.cart) {
      const { error: inventoryError } = await supabase.rpc('deduct_inventory', {
        product_id: item.product_id,
        quantity: item.quantity,
      });

      if (inventoryError) {
        console.error('Error updating inventory:', inventoryError);
        // Continue even if inventory update fails
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        order_id: order.id,
        message: 'Checkout completed successfully',
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Checkout error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});

