import { useEffect, useState } from "react";
import axios from "axios";

interface Address {
  city: string; // antara county / city
  county: string; // antara county / city
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

export default function useGetProvKab(
  selectedLocation: { lat: number; lng: number } | null
) {
  const [namekabupaten, setNameKabupaten] = useState<string | undefined>(
    undefined
  );
  const [nameProvinsi, setNameProvinsi] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    const getProvKab = async () => {
      try {
        if (!selectedLocation?.lat || !selectedLocation?.lng) return;

        const response = await axios.get<IPlace>(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${selectedLocation.lat}&lon=${selectedLocation.lng}`
        );
        const { data } = response;

        if (data.address.county) {
          setNameKabupaten(data.address.county);
          setNameProvinsi(data.address.state);
        } else if (data.address.city) {
          setNameKabupaten(data.address.city);
          setNameProvinsi(data.address.state);
        } else {
          setNameKabupaten(undefined);
        }
      } catch (error) {
        console.error("Error fetching prov-kab:", error);
      }
    };
    getProvKab();
  }, [selectedLocation]);

  return { namekabupaten, setNameKabupaten, nameProvinsi, setNameProvinsi };
}
