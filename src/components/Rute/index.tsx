import React from "react";

interface IProv {
  prov: "Bali" | "Jawa Timur" | undefined;
  setProv: React.Dispatch<
    React.SetStateAction<"Bali" | "Jawa Timur" | undefined>
  >;
  setPagRute: React.Dispatch<React.SetStateAction<number>>;
  navigasi: "Rute" | "Jemput" | "Tujuan" | "Bus" | "Bayar" | null;
  selectedRute?: string | null;
}

export default function Rute({
  prov,
  setProv,
  setPagRute,
  navigasi,
  selectedRute,
}: IProv) {
  return (
    <div className="absolute top-0 w-full z-40">
      <div className="flex justify-center mt-5 mx-5 items-center">
        {navigasi === "Rute" && (
          <select
            className="rounded-lg border-2 p-2 border-black text-black bg-white"
            value={prov}
            onChange={(e) => {
              setProv(e.target.value as "Bali" | "Jawa Timur");
              setPagRute(0);
            }}
          >
            <option disabled selected>
              Pilih Provinsi
            </option>
            <option value="Bali">Bali</option>
            <option value="Jawa Timur">Jawa Timur</option>
          </select>
        )}

        {(navigasi === "Jemput" || navigasi === "Tujuan") && selectedRute && (
          <div className="bg-[#121418] py-1 px-3 rounded-lg border-2 border-white">
            {selectedRute}
          </div>
        )}
      </div>
    </div>
  );
}
