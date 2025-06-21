"use client";

import React from "react";
import { MutableRefObject } from "react";
import { MapContainer, Marker, TileLayer, useMap, Popup } from "react-leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import L from "leaflet";
import useUserLocationV2 from "@/hook/useUserLocationV2";
import RoutingMachine from "../RoutingMachine";

interface IMapView {
  mapRef: MutableRefObject<L.Map | null>;
  routingRef: React.MutableRefObject<L.Routing.Control | null>;
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  navigasi: "Rute" | "Jemput" | "Tujuan" | "Bus" | "Bayar" | null;
  titikJemput: { lat: number; lng: number } | null;
}

const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function MapView({
  mapRef,
  routingRef,
  navigasi,
  from,
  to,
  titikJemput,
}: IMapView) {
  const { userLocation } = useUserLocationV2();
  if (!userLocation) return null;

  // Komponen untuk ambil map instance
  function MyMapController() {
    const map = useMap();
    if (mapRef) {
      mapRef.current = map;
    }
    return null;
  }

  return (
    <div className="relative h-screen w-full">
      <MapContainer
        className="z-0"
        style={{ height: "100vh", width: "100%" }}
        center={[userLocation.lat, userLocation.lng]}
        zoom={11}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {navigasi === "Rute" && userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={redIcon}
          >
            <Popup>Kamu Disini</Popup>
          </Marker>
        )}
        {(navigasi === "Bus" || navigasi === "Bayar") && titikJemput && (
          <Marker position={[titikJemput.lat, titikJemput.lng]} icon={redIcon}>
            <Popup>Kamu Disini</Popup>
          </Marker>
        )}
        <MyMapController />
        <RoutingMachine from={from} to={to} routingRef={routingRef} />
      </MapContainer>
      {(navigasi === "Jemput" || navigasi === "Tujuan") && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-10 pointer-events-none">
          <img
            src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png"
            alt="marker"
            className="w-[25px] h-[41px]"
          />
        </div>
      )}
    </div>
  );
}
