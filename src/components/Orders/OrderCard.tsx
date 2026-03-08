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
  /** Si false, la card es solo lectura (pestaña Preparadas): no click para completar ni selección múltiple */
  allowActions?: boolean;
}

export default function OrderCard({ order, now, allowActions = true }: OrderCardProps) {
  const {
    multiSelectMode,
    selectedOrders,
    enterMultiSelect,
    toggleSelectOrder,
  } = useOrderStore();

  const isSelected = selectedOrders.includes(order.orderId);

  // Backend sends dates with Bogotá timezone offset (e.g., "2026-01-21T01:20:21.919-05:00")
  // normalizeColombianDate parses it correctly, and getTime() returns UTC timestamp
  // Both now and createdAt are UTC timestamps, so the subtraction works correctly
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
    new Audio("https://cms.prontopolloportal.com/wp-content/uploads/2024/02/newPedido_join-1.mp3")
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
    if (!allowActions || multiSelectMode) return;

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
        relative bg-white rounded-lg border transition
        ${allowActions ? "cursor-pointer hover:shadow" : "cursor-default"}
        ${isNew ? "animate-newOrder" : ""}
        ${isSelected ? "ring-4 ring-slate-500 ring-offset-2" : "border-gray-200"}
      `}
    >
      {/* Loader */}
      {isPending && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex justify-center items-center z-20 rounded-lg">
          <div className="animate-spin w-6 h-6 border-2 border-gray-400 border-t-slate-600 rounded-full" />
        </div>
      )}

      {/* Header */}
      <div
        className={`text-sm font-semibold px-2 py-1 rounded-md mb-2 w-full
        ${
          order.orderSource === "online"
            ? "bg-teal-600 text-white" // Teal para órdenes de app (contraste alto)
            : order.orderType === "rappi"
            ? "bg-orange-500 text-white" // Naranja para Rappi
            : order.orderType === "delivery"
            ? "bg-sky-600 text-white" // Azul solo delivery
            : order.orderType === "table"
            ? "bg-fuchsia-600 text-white" // Fuchsia para mesas (distinto de azul y de counter/amarillo)
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

            {item.variants?.map((variant, idx) => {
              const attrs = variant.attributes ?? {};
              const hasContent = Object.keys(attrs).length > 0 || variant.note;
              return (
                <div
                  key={idx}
                  className={`ml-2 mt-1 border-l-4 pl-2 text-[15px] rounded pr-2 min-h-[1.5rem] ${
                    variant.kitchenPrepared === true
                      ? "bg-emerald-200 border-emerald-600"
                      : "border-gray-300"
                  }`}
                >
                  {Object.entries(attrs).map(([k, v]) => (
                    <p key={k} className="flex gap-1">
                      <span className="text-gray-500">{k}:</span>
                      <span className="font-medium">{v}</span>
                    </p>
                  ))}

                  {variant.note && (
                    <p className="italic text-gray-600">📝 {variant.note}</p>
                  )}
                  {!hasContent && (
                    <span className="text-gray-400 select-none">—</span>
                  )}
                </div>
              );
            })}
          </li>
        ))}
      </ul>
    </div>
  );
}
