import { useEffect, useState } from "react";

function formatJam(date: Date): string {
  const jam = String(date.getHours()).padStart(2, "0");
  const menit = String(date.getMinutes()).padStart(2, "0");
  return `${jam}:${menit}`;
}

export default function useRealtimeHour(): string {
  const [waktu, setWaktu] = useState(formatJam(new Date()));

  useEffect(() => {
    const interval = setInterval(() => {
      setWaktu(formatJam(new Date()));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return waktu;
}
