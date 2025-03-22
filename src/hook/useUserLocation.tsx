import { useEffect, useState } from "react";

const UseUserLocation = () => {
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error mendapatkan lokasi:", error);
        },
        { enableHighAccuracy: true, maximumAge: 2000, timeout: 5000 }
      );
    } else {
      console.error("Geolocation tidak didukung di browser ini.");
    }
  }, []);

  return { userLocation, setUserLocation };
};

export default UseUserLocation;
