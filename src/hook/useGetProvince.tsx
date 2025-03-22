import { useEffect, useState } from "react";
import UseUserLocation from "./useUserLocation";

export default function UseGetProvince() {
  const [province, setProvince] = useState("");
  const { userLocation } = UseUserLocation();

  useEffect(() => {
    const getProvince = async () => {
      try {
        if (!userLocation?.lat || !userLocation?.lng) return;

        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLocation.lat}&lon=${userLocation.lng}`
        );
        const data = await response.json();

        if (data.address?.state) {
          setProvince(data.address.state);
        } else {
          setProvince("Provinsi tidak ditemukan");
        }
      } catch (error) {
        console.error("Error fetching province:", error);
      }
    };
    getProvince();
  }, [userLocation]);

  return { province };
}
