import { useState } from "react";

export default function useGetJarakTempuh() {
  const [jarakTempuh, setJarakTempuh] = useState<number | null>(null);

  const handleJarakTempuh = ({
    titikJemput,
    titikTujuan,
  }: {
    titikJemput: { lat: number; lng: number } | null;
    titikTujuan: { lat: number; lng: number } | null;
  }) => {
    if (!titikJemput || !titikTujuan) return;

    if (typeof window === "undefined") return;
    const L = require("leaflet");
    require("leaflet-routing-machine");

    const jemputLatLng = L.latLng(titikJemput.lat, titikJemput.lng);
    const tujuanLatLng = L.latLng(titikTujuan.lat, titikTujuan.lng);

    const jarakDalamMeter = jemputLatLng.distanceTo(tujuanLatLng); // hasilnya dalam meter
    const jarakDalamKM = jarakDalamMeter / 1000;
    const jarakDibulatkan = Math.ceil(jarakDalamKM);

    setJarakTempuh(jarakDibulatkan);
  };

  return { handleJarakTempuh, jarakTempuh };
}
