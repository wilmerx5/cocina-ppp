import type { Socket } from "socket.io-client";

/** Restore an expired staff session once; do not loop on invalid credentials. */
export function installStaffSocketSessionRecovery(
  socket: Socket,
  refreshSession: () => Promise<unknown>,
  onSessionLost: () => void,
) {
  let active = true;
  let pending = false;
  let attempted = false;
  const recover = async () => {
    if (!active || pending || attempted) return;
    pending = true;
    attempted = true;
    try {
      await refreshSession();
      if (active) socket.connect();
    } catch {
      if (active) onSessionLost();
    } finally {
      pending = false;
    }
  };
  const connected = () => { attempted = false; };
  const disconnected = (reason: string) => {
    if (reason === "io server disconnect") void recover();
  };
  const failed = (error: Error) => {
    if (error.message !== "Unauthorized") return;
    if (active && attempted && !pending) { onSessionLost(); return; }
    void recover();
  };
  socket.on("connect", connected);
  socket.on("disconnect", disconnected);
  socket.on("connect_error", failed);
  return () => {
    active = false;
    socket.off("connect", connected);
    socket.off("disconnect", disconnected);
    socket.off("connect_error", failed);
  };
}
