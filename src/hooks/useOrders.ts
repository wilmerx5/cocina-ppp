import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { useOrderStore } from "../stores/orderStore";
import orderService from "../services/orderService";


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
        setOrders(orders);
        console.log(orders)
      }
    }, [orders, setOrders]);
  
    return { orders, isError, isLoading,refetch };
  };