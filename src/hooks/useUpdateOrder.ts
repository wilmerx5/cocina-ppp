import { useMutation } from "@tanstack/react-query";
import orderService from "../services/orderService";
import type { OrderStatus } from "../types/index.types";

export const useUpdateOrderStatus = () =>
  useMutation({
    mutationFn: ({ orderId, orderStatus }: { orderId: number; orderStatus: OrderStatus }) =>
      orderService.updateOrderGeneralInfo({ orderId, info: { orderStatus } }),
  });
