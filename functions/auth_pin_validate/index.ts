interface PinValidateRequest {
  pin: string;
}

Deno.serve(async (req: Request) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    const { pin }: PinValidateRequest = await req.json();
    
    // Get master PIN from environment (server-side validation)
    const masterPin = Deno.env.get('MASTER_PIN') || '260539';

    const isValid = pin === masterPin;

    return new Response(
      JSON.stringify({
        valid: isValid,
        message: isValid ? 'PIN is valid' : 'Invalid PIN',
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        valid: false,
        error: error.message,
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});

