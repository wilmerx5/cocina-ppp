// store/orderStore.ts
import { create } from "zustand";
import type { Order } from "../types/index.types";

interface OrderStore {
  orders: Order[];

  // 👉 NUEVOS CAMPOS
  multiSelectMode: boolean;
  selectedOrders: number[];

  // 👉 MÉTODOS EXISTENTES (idénticos)
  setOrder: (order: Order) => void;
  setOrders: (orders: Order[]) => void;
  removeOrder: (orderId: Order["orderId"]) => void;
  updateOrder: (order: Order) => void;

  // 👉 NUEVOS MÉTODOS PARA MULTISELECT
  enterMultiSelect: () => void;
  exitMultiSelect: () => void;
  toggleSelectOrder: (orderId: number) => void;
}

export const useOrderStore = create<OrderStore>((set) => ({
  orders: [],

  // ⭐ NUEVAS PROPIEDADES
  multiSelectMode: false,
  selectedOrders: [],

  // ⭐ FUNCIONES EXISTENTES (NO SE TOCAN)
  setOrder: (order) =>
    set((state) => ({
      orders: [order, ...state.orders],
    })),

  updateOrder: (orderUpdated) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.orderId === orderUpdated.orderId ? { ...orderUpdated } : order
      ),
    })),

  removeOrder: (dailyOrderNumber) =>
    set((state) => ({
      orders: state.orders.filter(
        (order) => order.dailyOrderNumber !== dailyOrderNumber
      ),
    })),

  setOrders: (orders) =>
    set(() => ({
      orders,
    })),

  // ⭐ NUEVAS FUNCIONES PARA MULTISELECT
  enterMultiSelect: () =>
    set(() => ({
      multiSelectMode: true,
      selectedOrders: [],
    })),

  exitMultiSelect: () =>
    set(() => ({
      multiSelectMode: false,
      selectedOrders: [],
    })),

  toggleSelectOrder: (orderId) =>
    set((state) => {
      const exists = state.selectedOrders.includes(orderId);
      return {
        selectedOrders: exists
          ? state.selectedOrders.filter((id) => id !== orderId)
          : [...state.selectedOrders, orderId],
      };
    }),
}));
