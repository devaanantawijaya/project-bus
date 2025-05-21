import React, { useEffect, useState } from "react";

export default function useUserLocationV2() {
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      console.log("Geolocation tidak didukung oleh browser ini.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (err) => {
        console.log("Gagal mendapatkan lokasi:", err.message);
      }
    );
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  return { userLocation, getUserLocation };
}
