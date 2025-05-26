import { MutableRefObject, useRef } from "react";

interface IHandleFocus {
  koordinat: { lat: number; lng: number };
  zoom: number;
  navigasi?: "Rute" | "Jemput" | "Tujuan" | "Bus" | "Bayar" | null;
  nama_bus?: string | null;
  platNomor?: string | null;
}

export default function useHandleFocus({
  mapRef,
}: {
  mapRef: MutableRefObject<L.Map | null>;
}) {
  const focusMarkerBusRef = useRef<L.Marker | null>(null);

  const handleFocus = ({
    koordinat,
    zoom,
    navigasi,
    nama_bus,
    platNomor,
  }: IHandleFocus) => {
    if (mapRef.current && typeof window !== "undefined") {
      const L = require("leaflet");
      require("leaflet-routing-machine");

      // Custom icon bus
      const busIcon = L.icon({
        iconUrl: "/marker-bus.png", // pastikan pathnya benar
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
      });

      mapRef.current.flyTo([koordinat.lat, koordinat.lng], zoom);
      if (navigasi === "Bus") {
        if (focusMarkerBusRef.current) {
          focusMarkerBusRef.current.remove();
        }

        const marker = L.marker([koordinat.lat, koordinat.lng], {
          icon: busIcon,
        }).addTo(mapRef.current);
        marker
          .bindPopup(
            `
              <div style="text-align: center;">
                Bus ${nama_bus}
                <br />
                [${platNomor}]
              </div>
            `
          )
          .openPopup();
        focusMarkerBusRef.current = marker;
      }
    }
  };

  const handleDeleteMarkerBus = () => {
    if (focusMarkerBusRef.current) {
      focusMarkerBusRef.current.remove();
    }
  };

  return { handleFocus, handleDeleteMarkerBus };
}
