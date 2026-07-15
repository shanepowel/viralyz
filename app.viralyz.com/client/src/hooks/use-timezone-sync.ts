import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

export function useTimezoneSync() {
  const { user } = useAuth();
  useEffect(() => {
    if (!user) return;
    // Only auto-set when the user has never set a timezone — never overwrite a manual choice.
    if (user.timezone) return;
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (!tz) return;
      fetch("/api/user/timezone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ timezone: tz }),
      }).catch(() => {});
    } catch {}
  }, [user?.id]);
}
