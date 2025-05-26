import { useState } from "react";
import { MutableRefObject } from "react";

export default function useGetLocationCenter({
  mapRef,
}: {
  mapRef: MutableRefObject<L.Map | null>;
}) {
  const [locationCenter, setLocationCenter] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const handleGetLocationCenter = () => {
    const getLocationCenter = mapRef.current?.getCenter();
    if (getLocationCenter) {
      setLocationCenter({
        lat: getLocationCenter.lat,
        lng: getLocationCenter.lng,
      });
    }
  };

  return { handleGetLocationCenter, locationCenter, setLocationCenter };
}
