import { useEffect, useState } from "react";
import axios from "axios";
import useUserLocationV2 from "./useUserLocationV2";

interface Address {
  state: string;
  ISO3166_2_lvl4: string;
  archipelago: string;
  ISO3166_2_lvl3: string;
  postcode: string;
  country: string;
  country_code: string;
}

interface IPlace {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  class: string;
  type: string;
  place_rank: number;
  importance: number;
  addresstype: string;
  name?: string;
  display_name: string;
  address: Address;
  boundingbox: [string, string, string, string];
}

export default function UseGetProvinceV2() {
  const [province, setProvince] = useState<"Bali" | "Jawa Timur" | undefined>(
    undefined
  );
  const { userLocation } = useUserLocationV2();

  useEffect(() => {
    const getProvince = async () => {
      try {
        if (!userLocation?.lat || !userLocation?.lng) return;

        const response = await axios.get<IPlace>(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLocation.lat}&lon=${userLocation.lng}`
        );
        const { data } = response;

        if (data.address.state) {
          setProvince(data.address.state as "Bali" | "Jawa Timur");
        } else {
          setProvince(undefined);
        }
      } catch (error) {
        console.error("Error fetching province:", error);
      }
    };
    getProvince();
  }, [userLocation]);

  return { province };
}
