import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

interface IUseMaps {
  center: { lat: number; lng: number };
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  userLocation: { lat: number; lng: number };
}

export default function UseMap({ center, from, to, userLocation }: IUseMaps) {
  const mapRef = useRef<L.Map | null>(null);
  const routingRef = useRef<L.Routing.Control | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const ChangeRute = ({
    from,
    to,
    center,
  }: {
    from: { lat: number; lng: number };
    to: { lat: number; lng: number };
    center: { lat: number; lng: number };
  }) => {
    if (routingRef.current) {
      routingRef.current.setWaypoints([
        L.latLng(from.lat, from.lng),
        L.latLng(to.lat, to.lng),
      ]);
    }
    mapRef.current?.setView([center.lat, center.lng], 10);
  };

  const userFocus = () => {
    mapRef.current?.setView([userLocation?.lat, userLocation?.lng], 11);
  };

  useEffect(() => {
    if (!mapRef.current) {
      // Inisialisasi peta hanya sekali
      mapRef.current = L.map("map", {
        center: [center.lat, center.lng],
        zoom: 10,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
      }).addTo(mapRef.current);

      routingRef.current = L.Routing.control({
        waypoints: [L.latLng(from.lat, from.lng), L.latLng(to.lat, to.lng)],
        show: false, // Menyembunyikan panel rute
        createMarker: () => null, // Menghilangkan marker titik awal & tujuan
        lineOptions: {
          styles: [{ color: "#007bff", weight: 5 }], // Warna dan ketebalan garis rute
        },
      }).addTo(mapRef.current);
    }
  }, []);

  // 🔹 Tambahkan atau update marker untuk lokasi user
  useEffect(() => {
    if (mapRef.current && userLocation) {
      if (!markerRef.current) {
        // Jika marker belum ada, buat marker baru
        markerRef.current = L.marker([userLocation.lat, userLocation.lng], {
          icon: L.icon({
            iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", // Ikon marker user
            iconSize: [30, 30],
            iconAnchor: [15, 30],
          }),
        }).addTo(mapRef.current);
      } else {
        // Jika marker sudah ada, update posisinya
        markerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      }
    }
  }, [userLocation]);

  return { ChangeRute, userFocus };
}
