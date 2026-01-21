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




/**
 * Parses a date string that is already in Bogotá timezone.
 * The backend sends dates already converted to Bogotá timezone, so we just parse them directly.
 * 
 * @param dateStr - ISO string in Bogotá timezone from backend
 * @returns Date object or null if invalid
 */
export function normalizeColombianDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  const date = new Date(dateStr);
  
  if (isNaN(date.getTime())) return null;
  
  // Backend already sends dates in Bogotá timezone, so we just parse directly
  return date;
}

/**
 * @deprecated Use normalizeColombianDate instead. Dates from backend are already in Bogotá timezone.
 */
export function parseUTCtoLocal(dateStr: string): Date {
  return normalizeColombianDate(dateStr) || new Date();
}

