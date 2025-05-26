import { useMemo } from "react";

function formatTanggal(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export default function useFutureDates(jumlahHari = 1) {
  const tanggalList = useMemo(() => {
    const result = [];
    const now = new Date();

    for (let i = 0; i < jumlahHari; i++) {
      const next = new Date(now);
      next.setDate(now.getDate() + i);
      result.push(formatTanggal(next));
    }

    return result;
  }, [jumlahHari]);

  return tanggalList;
}
