import { MutableRefObject } from "react";

interface IHandleFocus {
  koordinat: { lat: number; lng: number };
  zoom: number;
}

export default function useHandleFocus({
  mapRef,
}: {
  mapRef: MutableRefObject<L.Map | null>;
}) {
  const handleFocus = ({ koordinat, zoom }: IHandleFocus) => {
    if (mapRef.current) {
      mapRef.current.flyTo([koordinat.lat, koordinat.lng], zoom);
    }
  };
  return { handleFocus };
}
