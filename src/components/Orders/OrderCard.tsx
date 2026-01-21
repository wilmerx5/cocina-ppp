import { useEffect, useRef } from "react";
import Swal from "sweetalert2";
import type { Order } from "../../types/index.types";
import { useUpdateOrderStatus } from "../../hooks/useUpdateOrder";
import { formatElapsed, normalizeColombianDate } from "../../utils";
import { useOrderStore } from "../../stores/orderStore";
import "../../index.css";

interface OrderCardProps {
  order: Order;
  now: number;
}

export default function OrderCard({ order, now }: OrderCardProps) {
  const {
    multiSelectMode,
    selectedOrders,
    enterMultiSelect,
    toggleSelectOrder,
  } = useOrderStore();

  const isSelected = selectedOrders.includes(order.orderId);

  // Date from backend is already in Bogotá timezone, just parse it
  const createdAtDate = normalizeColombianDate(order.createdAt);
  const createdAt = createdAtDate?.getTime() ?? null;
  const elapsed = createdAt ? formatElapsed(now - createdAt) : "--";

  const { mutate, isPending } = useUpdateOrderStatus();

  // Siguiente estado: pending → cooking, cooking → packing (al completar pasa a empacando)
  const nextStatus = order.orderStatus === "pending" ? "cooking" : order.orderStatus === "cooking" ? "packing" : null;

  const isNew = createdAt !== null && now - createdAt < 10 * 1000;
  const isDelayed =
    createdAt !== null &&
    (order.orderStatus === "cooking" || order.orderStatus === "pending") &&
    now - createdAt > 12 * 60 * 1000;

  // 🔊 Sonido nueva orden
  const newOrderSound = useRef<HTMLAudioElement | null>(
    new Audio("https://prontopolloportal.com/wp-content/uploads/2024/02/newPedido_join-1.mp3")
  );
  const hasPlayedSound = useRef(false);

  useEffect(() => {
    if (isNew && !hasPlayedSound.current) {
      newOrderSound.current?.play().catch(() => {});
      hasPlayedSound.current = true;
    }
  }, [isNew]);

  // Long Press (2 segundos)
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePressStart = () => {
    if (multiSelectMode) return;

    pressTimer.current = setTimeout(() => {
      enterMultiSelect();
      toggleSelectOrder(order.orderId);
    }, 2000);
  };

  const handlePressEnd = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    pressTimer.current = null;
  };

  // Click normal
  const handleClick = () => {
    if (isPending) return;

    if (multiSelectMode) {
      toggleSelectOrder(order.orderId);
      return;
    }

    if (!nextStatus) return;
    OnPrepared(order.orderId, nextStatus);
  };

  const OnPrepared = async (id: number, status: "cooking" | "packing") => {
    const isStart = status === "cooking";
    const result = await Swal.fire({
      title: isStart
        ? `¿Iniciar preparación de orden #${order.dailyOrderNumber}?`
        : `¿Completar orden #${order.dailyOrderNumber}?`,
      text: isStart ? "La orden pasará a \"En preparación\"." : "La orden pasará a \"Empacando\".",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, continuar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
    });

    if (result.isConfirmed) mutate({ orderId: id, orderStatus: status });
  };

  return (
    <div
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onClick={handleClick}
      className={`
        relative bg-white rounded-lg border transition cursor-pointer hover:shadow
        ${isNew ? "animate-newOrder" : ""}
        ${isSelected ? "ring-4 ring-blue-500 ring-offset-2" : "border-gray-200"}
      `}
    >
      {/* Loader */}
      {isPending && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex justify-center items-center z-20 rounded-lg">
          <div className="animate-spin w-6 h-6 border-2 border-gray-400 border-t-blue-600 rounded-full" />
        </div>
      )}

      {/* Header */}
      <div
        className={`text-sm font-semibold px-2 py-1 rounded-md mb-2 w-full
        ${
          order.orderSource === "online"
            ? "bg-emerald-500 text-white" // Verde para órdenes de app (cliente)
            : order.orderType === "rappi"
            ? "bg-orange-500 text-white" // Naranja para Rappi
            : order.orderType === "delivery"
            ? "bg-sky-600 text-white"
            : order.orderType === "table"
            ? "bg-purple-500 text-white"
            : order.orderType === "counter"
            ? "bg-yellow-500 text-white"
            : "bg-gray-400 text-white"
        }`}
      >
        {order.orderSource === "online" && (
          <span className="mr-1" title="Orden de app (cliente)">🌐</span>
        )}
        #{order.dailyOrderNumber} • {order.orderType}{" "}
        {order.orderType === "table" && order.address}

        {/* Timer siempre visible sobre un fondo */}
        <span className="float-right">
          <span className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-black/70 text-white text-xs sm:text-sm shadow-sm">
            <span className="flex items-center gap-1">
              <span>⏱</span>
              <span>{elapsed}</span>
            </span>
            {isDelayed && (
              <span className="px-2 py-[1px] bg-red-600 text-white text-[10px] rounded-full animate-pulse whitespace-nowrap">
                Demora
              </span>
            )}
          </span>
        </span>
      </div>

      {/* Items */}
      <ul className="space-y-1 p-3">
        {order.items.map((item, i) => (
          <li key={i}>
            <div className="flex items-center font-semibold text-gray-800 gap-2">
              {/* Burbuja del código del producto */}
              <span
                className="
                  h-7 aspect-square px-1 
                  bg-black text-white 
                  rounded-full flex justify-center items-center 
                  text-sm font-bold 
                  whitespace-nowrap
                "
              >
                {item.code}
              </span>

              ×<span className="text-red-500 text-xl">{item.quantity}</span>
            </div>

            {item.variants?.map((variant, idx) => (
              <div key={idx} className="ml-2 mt-1 border-l pl-2 text-[15px]">
                {Object.entries(variant.attributes).map(([k, v]) => (
                  <p key={k} className="flex gap-1">
                    <span className="text-gray-500">{k}:</span>
                    <span className="font-medium">{v}</span>
                  </p>
                ))}

                {variant.note && (
                  <p className="italic text-gray-600">📝 {variant.note}</p>
                )}
              </div>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
