import { useAuth } from "@/hooks/use-auth";

export function useEffectiveTimezone(): string {
  const { user } = useAuth();
  if (user?.timezone) return user.timezone;
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}
