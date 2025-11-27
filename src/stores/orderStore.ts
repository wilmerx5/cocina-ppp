// store/orderStore.ts
import { create } from 'zustand';
import type { Order } from '../types/index.types';




interface OrderStore {
  orders: Order[];
  setOrder: (order: Order) => void;
  setOrders: (orders: Order[]) => void;
  removeOrder:(orderId: Order['orderId'])=>void
  updateOrder:(order: Order) => void;

}

export const useOrderStore = create<OrderStore>((set) => ({
  orders: [],
  setOrder: (order) =>  set((state) => ({
    orders: [ order,...state.orders],
  })),
  updateOrder: (orderUpdated) =>
  set((state) => ({
    orders: state.orders.map((order) =>
      order.orderId === orderUpdated.orderId ? { ...orderUpdated } : order
    ),
  })),

    removeOrder: (dailyOrderNumber) =>  set((state) => ({
    orders: [...state.orders.filter(order=>order.dailyOrderNumber!=dailyOrderNumber)],
  })),
  setOrders: (orders) =>  set(() => ({
    orders: orders,
  })),
}));
