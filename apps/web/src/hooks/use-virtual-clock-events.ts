import { useEffect, useRef, useState } from "react";

const TICK_INTERVAL_MS = 1000;

export function useVirtualClockEvents() {
  const offsetRef = useRef<number | null>(null);

  const [virtualDateTime, setVirtualDateTime] = useState<Date | null>(null);

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const eventSource = new EventSource(
      "http://localhost:8080/virtual-clock/events",
    );

    const handleClockTick = (event: MessageEvent<string>) => {
      const dateTime = new Date(JSON.parse(event.data));
      const timestamp = dateTime.getTime();

      offsetRef.current = timestamp - Date.now();

      setVirtualDateTime(dateTime);
    };

    eventSource.addEventListener("clock-tick", handleClockTick);

    return () => {
      eventSource.removeEventListener("clock-tick", handleClockTick);
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, TICK_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const liveVirtualDateTime =
    // eslint-disable-next-line react-hooks/refs
    offsetRef.current !== null ? new Date(now + offsetRef.current) : null;

  return {
    virtualDateTime,
    liveVirtualDateTime,
    isConnected: virtualDateTime !== null,
  };
}
