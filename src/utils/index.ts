export function formatElapsed(ms: number): string {
  if (isNaN(ms) || ms < 0) return "--";

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const h = hours > 0 ? `${hours}h ` : "";
  const m = minutes > 0 ? `${minutes}m ` : "";
  const s = `${seconds}s`;

  return `${h}${m}${s}`.trim();
}




export function parseUTCtoLocal(dateStr: string): Date {
  const d = new Date(dateStr); // esto sigue siendo UTC
  const offsetInMs = 5 * 60 * 60 * 1000; // Colombia UTC-5
  return new Date(d.getTime() - offsetInMs);
}

export function normalizeColombianDate(dateStr: string) {
  let date = new Date(dateStr);

  if (isNaN(date.getTime())) return null;

  // Si termina en Z → es UTC → convertir a local (automático)
  if (dateStr.endsWith("Z")) {
    return new Date(
      date.getTime() + (new Date().getTimezoneOffset() * 60 * 1000)
    );
  }

  return date;
}

