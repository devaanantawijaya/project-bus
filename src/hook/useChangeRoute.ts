import React, { useRef } from "react";
import { MutableRefObject } from "react";
import L from "leaflet";

interface IChangeRoute {
  mapRef: MutableRefObject<L.Map | null>;
  routingRef: React.MutableRefObject<L.Routing.Control | null>;
}

export default function useChangeRoute({ mapRef, routingRef }: IChangeRoute) {
  const ChangeRute = ({
    from,
    to,
    center,
  }: {
    from: { lat: number; lng: number };
    to: { lat: number; lng: number };
    center: { lat: number; lng: number };
  }) => {
    if (typeof window !== "undefined") {
      const L = require("leaflet");
      require("leaflet-routing-machine");

      if (routingRef.current) {
        routingRef.current.setWaypoints([
          L.latLng(from.lat, from.lng),
          L.latLng(to.lat, to.lng),
        ]);
      }
    }
    mapRef.current?.setView([center.lat, center.lng], 10);
  };
  return { ChangeRute };
}
