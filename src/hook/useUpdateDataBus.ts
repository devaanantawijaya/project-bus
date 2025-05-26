import { useState } from "react";
import { MutableRefObject } from "react";

interface IUpdateHasilDataBus {
  koordinatAwal: { lat: number; lng: number } | null;
  titikJemput: { lat: number; lng: number } | null;
  hasilDataBus: IUpdateDataBus[];
}

interface IUpdateDataBus {
  nama_bus: string;
  bus: IListBus[];
}

interface IListBus {
  jenisBus: string;
  jumlahKursi: number;
  platNomor: string;
  denahKursi: number[][];
  kursiTerisi: number[];
  koordinat: { lat: number; lng: number };
  trueLocation: boolean;
  jarakDenganUser: number;
}

interface IRoute {
  coordinates: { lat: number; lng: number }[];
}

export default function useUpdateDataBus({
  mapRef,
}: {
  mapRef: MutableRefObject<L.Map | null>;
}) {
  const [updateDataBus, setUpdateDataBus] = useState<IUpdateDataBus[]>([]);

  const handleUpdateDataBus = ({
    koordinatAwal,
    titikJemput,
    hasilDataBus,
  }: IUpdateHasilDataBus) => {
    if (
      mapRef.current &&
      koordinatAwal &&
      titikJemput &&
      typeof window !== "undefined"
    ) {
      const L = require("leaflet");
      require("leaflet-routing-machine");

      const routing = L.Routing.osrmv1();

      routing.route(
        [
          L.Routing.waypoint(L.latLng(koordinatAwal.lat, koordinatAwal.lng)),
          L.Routing.waypoint(L.latLng(titikJemput.lat, titikJemput.lng)),
        ],
        (err: Error | null, routes: IRoute[] | undefined) => {
          if (!err && routes && routes.length > 0) {
            const [firstRoute] = routes;
            const routeCoords = firstRoute.coordinates;

            if (routeCoords) {
              const userLatLng = L.latLng(titikJemput.lat, titikJemput.lng);

              const updatedBus: IUpdateDataBus[] = hasilDataBus.map(
                (listBus) => ({
                  ...listBus,
                  bus: listBus.bus.map((bus) => {
                    const isTrue = isNearRoute(routeCoords, bus.koordinat, 100);

                    const busLatLng = L.latLng(
                      bus.koordinat.lat,
                      bus.koordinat.lng
                    );
                    const jarak = userLatLng.distanceTo(busLatLng) / 1000;

                    return {
                      ...bus,
                      trueLocation: isTrue,
                      jarakDenganUser: parseFloat(jarak.toFixed(2)),
                    };
                  }),
                })
              );

              setUpdateDataBus(updatedBus);
            }
          } else {
            console.error("❌ Gagal menghitung rute:", err);
          }
        }
      );
    } else {
      console.warn("❌ Ada data yang belum tersedia:", {
        mapRef: mapRef.current,
        koordinatAwal,
        titikJemput,
      });
    }

    const isNearRoute = (
      routeCoords: { lat: number; lng: number }[],
      checkLatLng: { lat: number; lng: number },
      maxDistanceMeters = 100
    ): boolean => {
      return routeCoords.some((point) => {
        if (typeof window !== "undefined") {
          const L = require("leaflet");
          require("leaflet-routing-machine");
          const dist = L.latLng(point.lat, point.lng).distanceTo(
            L.latLng(checkLatLng.lat, checkLatLng.lng)
          );
          return dist <= maxDistanceMeters;
        }
      });
    };
  };

  return { handleUpdateDataBus, updateDataBus };
}
