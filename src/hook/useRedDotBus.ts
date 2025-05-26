import { MutableRefObject, useRef } from "react";

type IKoordinat = { lat: number; lng: number };

export default function useRedDotBus({
  mapRef,
}: {
  mapRef: MutableRefObject<L.Map | null>;
}) {
  const redDotBusRef = useRef<L.Marker[]>([]);

  const handleOpenRedDotBus = ({
    allKoordinatBus,
  }: {
    allKoordinatBus: IKoordinat[];
  }) => {
    if (mapRef.current && typeof window !== "undefined") {
      const L = require("leaflet");
      require("leaflet-routing-machine");

      const redDotIcon = L.divIcon({
        className: "",
        html: `<div class="w-3 h-3 bg-red-500 rounded-full border border-white shadow-md"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      redDotBusRef.current.forEach((marker) => marker.remove());
      redDotBusRef.current = [];

      allKoordinatBus.forEach(({ lat, lng }) => {
        const marker = L.marker([lat, lng], { icon: redDotIcon }).addTo(
          mapRef.current!
        );
        redDotBusRef.current.push(marker);
      });
    }
  };

  const handleCloseRedDotBus = () => {
    redDotBusRef.current.forEach((marker) => marker.remove());
    redDotBusRef.current = [];
  };
  return { handleOpenRedDotBus, handleCloseRedDotBus };
}
