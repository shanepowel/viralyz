export function dowHourInTz(date: Date, timeZone: string): { dow: number; hour: number } {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      weekday: "short",
      hour: "numeric",
      hour12: false,
    }).formatToParts(date);
    const wd = parts.find((p) => p.type === "weekday")?.value ?? "Sun";
    const hourStr = parts.find((p) => p.type === "hour")?.value ?? "0";
    const dows: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    const hourNum = parseInt(hourStr, 10);
    return { dow: dows[wd] ?? 0, hour: (hourNum === 24 ? 0 : hourNum) % 24 };
  } catch {
    return { dow: date.getDay(), hour: date.getHours() };
  }
}
