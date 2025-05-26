import { useCallback, useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

const RoutingMachine = ({
  from,
  to,
  routingRef,
}: {
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  routingRef: React.MutableRefObject<L.Routing.Control | null>;
}) => {
  const map = useMap();

  const addRoutingControl = useCallback(() => {
    const control = L.Routing.control({
      waypoints: [L.latLng(from.lat, from.lng), L.latLng(to.lat, to.lng)],
      lineOptions: {
        styles: [{ color: "blue", weight: 5 }],
        extendToWaypoints: false,
        missingRouteTolerance: 0,
      },
      routeWhileDragging: false,
      fitSelectedRoutes: false,
      show: false,
      addWaypoints: false,
      // @ts-expect-error, "createMarker" does not exist in type "RoutingConstrolOptions"
      createMarker: () => null,
    }).addTo(map);
    return control;
  }, []);

  useEffect(() => {
    if (!map || routingRef.current) return;

    const control = addRoutingControl();
    routingRef.current = control;

    return () => {
      if (map) map.removeControl(control);
      routingRef.current = null;
    };
  }, []);

  return null;
};

export default RoutingMachine;
