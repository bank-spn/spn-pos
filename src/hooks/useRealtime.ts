import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export const useRealtimeOrders = (onOrderUpdate: () => void) => {
  const channelRef = useRef<any>(null);

  useEffect(() => {
    // Check if already subscribed
    if (channelRef.current?.state === 'subscribed') return;

    const channel = supabase.channel('pos_orders:changes', {
      config: { broadcast: { self: false } },
    });

    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'INSERT' }, (payload) => {
        console.log('New order:', payload);
        toast.success('New order received!');
        onOrderUpdate();
      })
      .on('broadcast', { event: 'UPDATE' }, (payload) => {
        console.log('Order updated:', payload);
        onOrderUpdate();
      })
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [onOrderUpdate]);
};

export const useRealtimeInventory = (onInventoryUpdate: () => void) => {
  const channelRef = useRef<any>(null);

  useEffect(() => {
    // Check if already subscribed
    if (channelRef.current?.state === 'subscribed') return;

    const channel = supabase.channel('erp_inventory_items:changes', {
      config: { broadcast: { self: false } },
    });

    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'UPDATE' }, (payload) => {
        console.log('Inventory updated:', payload);
        toast.info('Inventory updated');
        onInventoryUpdate();
      })
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [onInventoryUpdate]);
};

