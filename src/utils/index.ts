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
 * Parses a date string with Bogotá timezone offset from the backend.
 * The backend sends dates with Bogotá timezone offset (e.g., "2026-01-21T01:20:21.919-05:00").
 * JavaScript will correctly parse the timezone offset and convert it to UTC internally.
 * 
 * @param dateStr - ISO string with Bogotá timezone offset from backend (e.g., "2026-01-21T01:20:21.919-05:00")
 * @returns Date object (in UTC internally) or null if invalid
 */
export function normalizeColombianDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  // Parse the date string - JavaScript will correctly interpret the timezone offset
  // and convert it to UTC internally. getTime() will return the correct UTC timestamp.
  const date = new Date(dateStr);
  
  if (isNaN(date.getTime())) return null;
  
  return date;
}

/**
 * @deprecated Use normalizeColombianDate instead. Dates from backend are already in Bogotá timezone.
 */
export function parseUTCtoLocal(dateStr: string): Date {
  return normalizeColombianDate(dateStr) || new Date();
}

