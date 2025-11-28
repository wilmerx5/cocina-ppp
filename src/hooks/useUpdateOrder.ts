// hooks/useUpdateOrderStatus.ts
import { useMutation } from "@tanstack/react-query";
import orderService from "../services/orderService";


export const useUpdateOrderStatus = () =>
  useMutation({
    mutationFn: (orderId: number) =>
      orderService.updateOrderGeneralInfo({orderId,info:{orderStatus:'cooked'}}),
  });
