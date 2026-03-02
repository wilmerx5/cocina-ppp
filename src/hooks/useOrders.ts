import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { useOrderStore } from "../stores/orderStore";
import orderService from "../services/orderService";
import type { Order } from "../types/index.types";


export const useOrders=()=>{
    const { setOrders } = useOrderStore(); 

    const { data: orders, isError, isLoading,refetch } = useQuery({
      queryKey: ['orders'],
      queryFn: orderService.getDailyOrders,
      retry: false,
      refetchOnWindowFocus: false,
    });

  
    useEffect(() => {
      if (orders) {
        const fromServer = orders;
        const prev = useOrderStore.getState().orders;
        const serverIds = new Set(fromServer.map((o: Order) => o.orderId));
        const onlyInStore = prev.filter((o) => !serverIds.has(o.orderId));
        const toSet =
          onlyInStore.length === 0
            ? fromServer
            : [...fromServer, ...onlyInStore].sort(
                (a, b) => (b.orderId ?? 0) - (a.orderId ?? 0)
              );
        setOrders(toSet);
      }
    }, [orders, setOrders]);
  
    return { orders, isError, isLoading,refetch };
  };