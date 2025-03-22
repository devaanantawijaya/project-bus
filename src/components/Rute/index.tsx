import React from "react";

interface IProv {
  prov: string | null;
  setProv: React.Dispatch<React.SetStateAction<string>>;
}

export default function Rute({ prov, setProv }: IProv) {
  return (
    <div className="absolute top-0 w-full z-40">
      <div className="flex justify-center mt-5 mx-5 items-center">
        {/* <div className="bg-[#121418] py-1 px-3 rounded-lg border-2 border-white">{`Gilimanuk => Denpasar`}</div> */}
        <select
          className="rounded-lg border-2 p-2 border-black text-black bg-white"
          value={prov}
          onChange={(e) => setProv(e.target.value)}
        >
          <option value="" disabled selected>
            Pilih Provinsi
          </option>
          <option value="Bali">Bali</option>
          <option value="Surabaya">Surabaya</option>
          <option value="Semarang">Semarang</option>
          <option value="Bandung">Bandung</option>
        </select>
      </div>
    </div>
  );
}
