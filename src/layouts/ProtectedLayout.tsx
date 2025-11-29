import { useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { io, Socket } from "socket.io-client";
import { useOrderStore } from "../stores/orderStore";
import { useOrders } from "../hooks/useOrders";
import type { Order } from "../types/index.types";
import { useAuth } from "../hooks/useAuth";
import Loader from "../components/Loader/Loader";
import ErrorFetchingData from "../components/Error/ErrorFetchinData";



export default function ProtectedLayout() {
  const { setOrder, removeOrder, updateOrder } = useOrderStore();
  const {

    isLoading: isLoadingOrders,
    isError: isOrdersError,
    refetch: refetchOrders,
  } = useOrders();


  const socketRef = useRef<Socket | null>(null);
  const reconnectAttempts = useRef(0);

  const notify = useRef<HTMLAudioElement | null>(null);
  const deletedOrderSound = useRef<HTMLAudioElement | null>(null);

  // 🚀 Notificaciones sonoras
  notify.current = new Audio(
    "https://prontopolloportal.com/wp-content/uploads/2025/06/notificacion.mp3"
  );
  deletedOrderSound.current = new Audio(
    "https://prontopolloportal.com/wp-content/uploads/2025/06/deleted_join.mp3"
  );

  // ✔ Conexión robusta estilo Slack/Discord
  const connectSocket = () => {
    if (socketRef.current && socketRef.current.connected) return;

    const socket = io(import.meta.env.VITE_API_URL);

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🔌 Socket conectado");
      reconnectAttempts.current = 0;
      socket.emit("join_room", "kitchen");

      // 🔄 Sync inmediato al reconectar
      console.log("🔄 Refetch al reconectar");
      refetchOrders();
    });

    socket.on("disconnect", () => {
      console.warn("⚠️ Socket desconectado");
      tryReconnect();
    });

    // 🟢 Eventos
    socket.on("created_order", (order) => {
      console.log("🆕 Orden creada :", order);
      toast.success("Nueva orden");

      if (notify.current) {
        notify.current.currentTime = 0;
        notify.current.play().catch(() => {});
      }

      setOrder(order);
    });

    socket.on("updated_order_items", (order: Order) => {
      console.log("🛠️ Ítems actualizados:", order);
      toast.success(`Orden ${order.dailyOrderNumber} actualizada`);

      if (notify.current) {
        notify.current.currentTime = 0;
        notify.current.play().catch(() => {});
      }

      updateOrder(order);
    });

    socket.on("deleted_order", (order: Order) => {
      console.log("🗑️ Orden eliminada:", order);

      if (deletedOrderSound.current) {
        deletedOrderSound.current.currentTime = 0;
        deletedOrderSound.current.play().catch(() => {});
      }

      toast.error(`Eliminando orden ${order.dailyOrderNumber}`);
      setTimeout(() => removeOrder(order.dailyOrderNumber), 4000);
    });
  };

  // ♻ Backoff progresivo inteligente
  const tryReconnect = () => {
    reconnectAttempts.current++;
    const delay = Math.min(1000 * reconnectAttempts.current, 10000);

    console.log(`⏳ Intentando reconectar en ${delay / 1000}s...`);

    setTimeout(() => connectSocket(), delay);
  };

  // ❤️ Heartbeat para evitar suspensión del socket
  useEffect(() => {
    const interval = setInterval(() => {
      if (socketRef.current?.connected) {
        socketRef.current.emit("ping_check");
      }
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  // 🔥 Conexión inicial de socket
  useEffect(() => {
    connectSocket();

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  // 🔄 Refetch y reconexión cuando la pestaña vuelve a estar activa
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        console.log("🔄 Tab activa → resync");

        if (socketRef.current && !socketRef.current.connected) {
          tryReconnect();
        }

        refetchOrders();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [refetchOrders]);

  // 🔒 Auth
  const { data: user, isLoading: isLoadingAuth, isError: isErrorAuth } =
    useAuth();

  if (isLoadingAuth) return <div>Cargando...</div>;

  if (isErrorAuth || !user) {
    window.location.replace(import.meta.env.VITE_AUTH_SERVICE_URL);
    return null;
  }

  if (!user?.roles.includes("kitchenUser")) {
    window.location.replace(import.meta.env.VITE_AUTH_SERVICE_URL);
    return null;
  }

  if ( isLoadingOrders) return <Loader />;
  if (isOrdersError) return <ErrorFetchingData />;

  return (
    <>
      <main className="bg-slate-50 min-h-screen pt-10">
        <Outlet />
      </main>
      <ToastContainer />
    </>
  );
}
