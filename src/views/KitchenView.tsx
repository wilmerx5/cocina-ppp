import { useState } from "react";
import OrderCard from "../components/Orders/OrderCard";
import { useOrderStore } from "../stores/orderStore";


export default function KitchenView() {
  const { orders } = useOrderStore();

  // 👇 estado de filtro
  const [filter, setFilter] = useState<"por-preparar" | "preparadas">("por-preparar");

  // 👇 aplica el filtro según orderStatus
  const filteredOrders = orders.filter((o) => {
    if (filter === "por-preparar") {
      return o.orderStatus === "cooking";
    } else {
      return o.orderStatus !== "cooking";
    }
  });

  const normalOrders = filteredOrders.filter((o) => o.orderType !== "table");
  const tableOrders = filteredOrders.filter((o) => o.orderType === "table");

  return (
    <div className="px-4 py-4">
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setFilter("por-preparar")}
          className={`px-4 py-1 text-sm rounded-md font-medium 
            ${
              filter === "por-preparar"
                ? "bg-sky-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
        >
          Por preparar
        </button>

        <button
          onClick={() => setFilter("preparadas")}
          className={`px-4 py-1 text-sm rounded-md font-medium 
            ${
              filter === "preparadas"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
        >
          Preparadas
        </button>
      </div>

      {/* 🧩 Grilla 5 columnas (3 normales – 2 mesas) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">

        {/* Columnas 1–3 → delivery/pickup/counter */}
        <div className="col-span-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          {normalOrders.length > 0 ? (
            normalOrders.map((order) => (
              <OrderCard key={order.orderId} order={order} />
            ))
          ) : (
            <p className="text-gray-500 text-sm col-span-full">No hay órdenes</p>
          )}
        </div>

        {/* Columnas 4–5 → solo mesas */}
        <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
          {tableOrders.length > 0 ? (
            tableOrders.map((order) => (
              <OrderCard key={order.orderId} order={order} />
            ))
          ) : (
            <p className="text-gray-500 text-sm col-span-full">No hay órdenes de mesa</p>
          )}
        </div>

      </div>
    </div>
  );
}
