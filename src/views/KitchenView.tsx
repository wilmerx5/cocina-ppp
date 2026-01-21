import { useState } from "react";
import OrderCard from "../components/Orders/OrderCard";
import { useOrderStore } from "../stores/orderStore";
import { useUpdateOrderStatus } from "../hooks/useUpdateOrder";
import { useNow } from "../hooks/useNow";
import Swal from "sweetalert2";

export default function KitchenView() {
  const {
    orders,
    multiSelectMode,
    selectedOrders,
    exitMultiSelect,
    enterMultiSelect,
    clearSelection,
  } = useOrderStore();

  const { mutate } = useUpdateOrderStatus();
  const now = useNow();

  // Filtro estado
  const [filter, setFilter] = useState<"por-preparar" | "preparadas">(
    "por-preparar"
  );

  // Filtrar órdenes: por-preparar = pending | cooking; preparadas = cooked, packing, inDelivery, completed
  const filteredOrders = orders.filter((o) =>
    filter === "por-preparar"
      ? o.orderStatus === "pending" || o.orderStatus === "cooking"
      : ["cooked", "packing", "inDelivery", "completed"].includes(o.orderStatus)
  );

  const normalOrders = filteredOrders.filter(
    (o) => o.orderType !== "table"
  );
  const tableOrders = filteredOrders.filter(
    (o) => o.orderType === "table"
  );

  // -----------------------------
  // 🟩 Completar varias órdenes
  // -----------------------------
  const completeSelected = async () => {
    const result = await Swal.fire({
      title: `¿Completar ${selectedOrders.length} órdenes?`,
      text: "Se marcarán todas como \"Empacando\".",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, continuar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#22c55e",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    selectedOrders.forEach((id) => mutate({ orderId: id, orderStatus: "packing" }));
    exitMultiSelect();
  };

  return (
    <div className="px-4 py-4">
      {/* Filtros */}
      <div className="flex gap-3 mb-4 items-center">
        <button
          onClick={() => setFilter("por-preparar")}
          className={`px-4 py-1 text-sm rounded-md font-medium ${
            filter === "por-preparar"
              ? "bg-sky-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Por preparar
        </button>

        <button
          onClick={() => setFilter("preparadas")}
          className={`px-4 py-1 text-sm rounded-md font-medium ${
            filter === "preparadas"
              ? "bg-green-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Preparadas
        </button>

        {/* 🔘 Botón de selección múltiple */}
        <button
          onClick={() => {
            if (multiSelectMode) {
              exitMultiSelect(); // cancelar modo
            } else {
              enterMultiSelect(); // activar modo
            }
            clearSelection();
          }}
          className={`ml-auto px-4 py-1 text-sm rounded-md font-medium ${
            multiSelectMode
              ? "bg-red-600 text-white"
              : "bg-amber-500 text-white"
          }`}
        >
          {multiSelectMode ? "Cancelar selección" : "Seleccionar múltiples"}
        </button>
      </div>

      {/* Grid 5 columnas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">

        {/* Normales → columnas 1–3 */}
        <div className="col-span-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          {normalOrders.length > 0 ? (
            normalOrders.map((order) => (
              <OrderCard key={order.orderId} order={order} now={now} />
            ))
          ) : (
            <p className="text-gray-500 text-sm col-span-full">
              No hay órdenes
            </p>
          )}
        </div>

        {/* Mesas → columnas 4–5 */}
        <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
          {tableOrders.length > 0 ? (
            tableOrders.map((order) => (
              <OrderCard key={order.orderId} order={order} now={now} />
            ))
          ) : (
            <p className="text-gray-500 text-sm col-span-full">
              No hay órdenes de mesa
            </p>
          )}
        </div>
      </div>

      {/* Barra inferior para completar varias órdenes */}
      {multiSelectMode && selectedOrders.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 p-4 flex justify-between items-center">
          <p className="text-gray-700 font-medium">
            {selectedOrders.length} órdenes seleccionadas
          </p>

          <button
            onClick={completeSelected}
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Completar seleccionadas
          </button>
        </div>
      )}
    </div>
  );
}
