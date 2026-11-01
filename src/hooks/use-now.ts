import { useEffect, useState } from "react";

/** Current time, ticking every second in the browser; null during server render. */
export function useNow(enabled = true) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    if (!enabled) return;
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, [enabled]);
  return now;
}
