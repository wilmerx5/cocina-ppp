import { create } from "zustand";
import type { Order } from "../types/index.types";

interface OrderStore {
  orders: Order[];
  setOrder: (order: Order) => void;
  setOrders: (orders: Order[]) => void;
  removeOrder: (dailyOrderNumber: number) => void;
  updateOrder: (order: Order) => void;

  // Multi select
  multiSelectMode: boolean;
  selectedOrders: number[];

  enterMultiSelect: () => void;
  exitMultiSelect: () => void;
  toggleSelectOrder: (id: number) => void;
  clearSelection: () => void;
}

export const useOrderStore = create<OrderStore>((set) => ({
  orders: [],

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

  setOrders: (orders) => set({ orders }),

  // -------------------------
  // Multi select
  // -------------------------
  multiSelectMode: false,
  selectedOrders: [],

  enterMultiSelect: () => set({ multiSelectMode: true }),
  exitMultiSelect: () => set({ multiSelectMode: false, selectedOrders: [] }),

  toggleSelectOrder: (id) =>
    set((state) => ({
      selectedOrders: state.selectedOrders.includes(id)
        ? state.selectedOrders.filter((x) => x !== id)
        : [...state.selectedOrders, id],
    })),

  clearSelection: () => set({ selectedOrders: [] }),
}));
