import Swal from "sweetalert2";
import { useNow } from "../../hooks/useNow";
import type { Order } from "../../types/index.types";
import { formatElapsed } from "../../utils";
import { useUpdateOrderStatus } from "../../hooks/useUpdateOrder";
import "../../index.css";

interface OrderCardProps {
  order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
  const now = useNow();
  const createdAt = new Date(order.createdAt).getTime();
  const elapsed = formatElapsed(now - createdAt);

  const { mutate, isPending } = useUpdateOrderStatus();

  const isDelayed =
    order.orderStatus === "cooking" && now - createdAt > 12 * 60 * 1000;


  const isNew = now - createdAt < 10 * 1000;

  const OnPrepared = async (id: number) => {
    const result = await Swal.fire({
      title: `¿Marcar orden ${order.dailyOrderNumber} como preparada?`,
      text: "Esta orden pasará al siguiente estado.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, continuar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      mutate(id, {
        onSuccess: () => {
          Swal.fire({
            title: "Actualizada",
            text: "La orden ha sido marcada como preparada.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
        },
        onError: () => {
          Swal.fire({
            title: "Error",
            text: "Hubo un problema al actualizar la orden.",
            icon: "error",
          });
        },
      });
    }
  };

  return (
    <div
      onClick={() => !isPending && OnPrepared(order.orderId)}
      className={`
        relative bg-white rounded-lg border border-gray-200 hover:shadow transition cursor-pointer
        ${isNew ? "animate-newOrder" : ""}
      `}
    >
      {/* Loader mientras se actualiza */}
      {isPending && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex justify-center items-center z-20 rounded-lg">
          <div className="animate-spin w-6 h-6 border-2 border-gray-400 border-t-blue-600 rounded-full" />
        </div>
      )}

      {/* Header */}
      <div
        className={`text-sm font-semibold px-2 py-1 rounded-md mb-2 w-full
        ${
          order.orderType === "delivery"
            ? "bg-sky-600 text-white"
            : order.orderType === "table"
            ? "bg-purple-500 text-white"
            : order.orderType === "counter"
            ? "bg-yellow-500 text-white"
            : "bg-gray-400 text-white"
        }`}
      >
        #{order.dailyOrderNumber} • {order.orderType}{" "}
        {order.orderType === "table" ? order.address : ""}

        <span className="float-right flex items-center gap-2 text-xs opacity-90">
          <span>⏱ {elapsed}</span>
          {isDelayed && (
            <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] rounded-full animate-pulse">
              Demora
            </span>
          )}
        </span>
      </div>

      {/* Items */}
      <ul className="space-y-1 p-3">
        {order.items.map((item, i) => (
          <li key={i} className="text-sm">
            <div className="flex justify-between items-center font-semibold text-gray-800">
              <span className="flex items-center gap-2">
                <span className="w-5 aspect-square flex justify-center items-center rounded-full bg-black text-white text-xs font-bold">
                  {item.code}
                </span>
                × <span className="text-red-500">{item.quantity}</span>
              </span>
            </div>

            {item.variants?.map((variant, idx) => (
              <div key={idx} className="ml-2 mt-1 border-l border-gray-300 pl-2">
                <ul className="text-[12px] space-y-0.5">
                  {Object.entries(variant.attributes).map(([name, value]) => (
                    <li key={name} className="flex gap-1">
                      <span className="text-gray-500">{name}:</span>
                      <span className="font-medium">{value}</span>
                    </li>
                  ))}
                </ul>

                {variant.note && (
                  <p className="text-[12px] text-gray-600 italic mt-0.5">
                    📝 {variant.note}
                  </p>
                )}
              </div>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
