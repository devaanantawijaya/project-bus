import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

interface IMaps {
  center: { lat: number; lng: number };
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  userLocation: { lat: number; lng: number } | null;
  triggerFocus: boolean;
}

const Map = ({ center, from, to, userLocation, triggerFocus }: IMaps) => {
  const mapRef = useRef<L.Map | null>(null);
  const routingRef = useRef<L.Routing.Control | null>(null);
  const markerRef = useRef<L.Marker | null>(null); // Marker untuk userLocation

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

  // 🔹 Update rute jika from/to berubah
  useEffect(() => {
    if (routingRef.current) {
      routingRef.current.setWaypoints([
        L.latLng(from.lat, from.lng),
        L.latLng(to.lat, to.lng),
      ]);
    }
  }, [from, to]);

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

  // 🔥 Fokus ke center atau userLocation dalam satu useEffect
  useEffect(() => {
    if (!mapRef.current) return;

    // 🚀 Pastikan ukuran peta valid di mobile
    mapRef.current.invalidateSize();

    setTimeout(() => {
      if (triggerFocus && userLocation) {
        console.log("Fokus ke userLocation:", userLocation);
        mapRef.current?.setView([userLocation.lat, userLocation.lng], 11);
      } else if (!triggerFocus) {
        console.log("Fokus ke center:", center);
        mapRef.current?.setView([center.lat, center.lng], 10);
      }
    }, 300);
  }, [center, triggerFocus, userLocation]);

  return (
    <div
      id="map"
      style={{
        width: "100%",
        height: "100vh",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: -1,
      }}
    />
  );
};

export default Map;
