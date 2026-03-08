import { useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { io, Socket } from "socket.io-client";

import { useOrderStore } from "../stores/orderStore";
import { useOrders } from "../hooks/useOrders";
import { useAuth } from "../hooks/useAuth";

import Loader from "../components/Loader/Loader";
import ErrorFetchingData from "../components/Error/ErrorFetchinData";

import type { Order } from "../types/index.types";

export default function ProtectedLayout() {
  const { setOrder, removeOrder, updateOrder } = useOrderStore();

  const {
    isLoading: isLoadingOrders,
    isError: isOrdersError,
    refetch: refetchOrders,
  } = useOrders();

  const {
    data: user,
    isLoading: isLoadingAuth,
    isError: isErrorAuth,
  } = useAuth();

  // ⭐ WebSocket único por todo el ciclo de vida del componente
  const socketRef = useRef<Socket | null>(null);

  // ⭐ Audios creados solo una vez
  const notify = useRef(
    new Audio(
      "https://cms.prontopolloportal.com/wp-content/uploads/2025/06/notificacion.mp3"
    )
  );

  const deletedOrderSound = useRef(
    new Audio(
      "https://cms.prontopolloportal.com/wp-content/uploads/2025/06/deleted_join.mp3"
    )
  );

  // ---------------------------------------------------------
  // 🔌 SOCKET.IO — SIN DUPLICADOS, effect corre SOLO UNA VEZ
  // ---------------------------------------------------------
  useEffect(() => {
    if (socketRef.current) return; // Evita recrear socket si ya existe

    const socket = io(import.meta.env.VITE_API_URL, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;

    // --- EVENTOS DEL SOCKET ---
    socket.on("connect", () => {
      socket.emit("join_room", "kitchen");
      refetchOrders();
    });

    socket.on("created_order", (order: Order) => {
      toast.success("Nueva orden");
      notify.current.currentTime = 0;
      notify.current.play().catch(() => {});

      setOrder(order);
      // Refrescar lista desde el servidor en breve para mantener store y servidor alineados
      setTimeout(() => refetchOrders(), 500);
    });

    socket.on("updated_order_items", (order: Order) => {
      toast.success(`Orden ${order.dailyOrderNumber} actualizada`);
      notify.current.currentTime = 0;
      notify.current.play().catch(() => {});

      updateOrder(order);
    });

    // Mesa completada desde ppp-mesas: actualizar orden para que salga de "Por preparar"
    socket.on("orderCompleted", (order: Order) => {
      updateOrder(order);
    });

    socket.on("deleted_order", (order: Order) => {
      deletedOrderSound.current.currentTime = 0;
      deletedOrderSound.current.play().catch(() => {});

      toast.error(`Orden ${order.dailyOrderNumber} eliminada`);

      setTimeout(() => removeOrder(order.dailyOrderNumber), 4000);
    });

    socket.on("disconnect", () => {});

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, []); // 👈 SOLO UNA VEZ: NO DEPENDE DE refetchOrders NI Zustand

  // ---------------------------------------------------------
  // 🔄 REFETCH AL VOLVER A LA PESTAÑA
  // ---------------------------------------------------------
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        refetchOrders();
        if (socketRef.current && !socketRef.current.connected) socketRef.current.connect();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [refetchOrders]);

  // ---------------------------------------------------------
  // 🔒 AUTH
  // ---------------------------------------------------------
  if (isLoadingAuth) return <div>Cargando...</div>;

  if (isErrorAuth || !user) {
    window.location.replace(import.meta.env.VITE_AUTH_SERVICE_URL);
    return null;
  }

  if (!user.roles.includes("kitchenUser")) {
    window.location.replace(import.meta.env.VITE_AUTH_SERVICE_URL);
    return null;
  }

  // ---------------------------------------------------------
  // 🛠 LOADING & ERROR
  // ---------------------------------------------------------
  if (isLoadingOrders) return <Loader />;
  if (isOrdersError) return <ErrorFetchingData />;

  // ---------------------------------------------------------
  // 🎨 RENDER
  // ---------------------------------------------------------
  return (
    <>
      <main className="bg-slate-50 min-h-screen pt-10">
        <Outlet />
      </main>

      <ToastContainer />
    </>
  );
}
