"use client";

import React, { useState } from "react";
import { FaBus } from "react-icons/fa";
import { BsBusFrontFill } from "react-icons/bs";
import { FaFerry } from "react-icons/fa6";
import { FaBox } from "react-icons/fa6";
import NavbarDashboard from "@/components/NavbarDashboard";
import ViewProfile from "@/components/ViewProfile";
import Link from "next/link";
import dataUser from "@/data/dataUser.json";

export default function HomePage() {
  const [isSelectedNav, setIsSelectedNav] = useState<
    "home" | "tiketku" | "promo" | "akun"
  >("home");

  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);

  const handleFlip = (idx: number) => {
    setFlippedIndex(flippedIndex === idx ? null : idx);
  };

  // Filter Nama Budi Awan
  const dataTiketUser = dataUser.data.find(
    (user) => user.namaDepan === "Budi" && user.namaBelakang === "Awan"
  )?.tiket;

  return (
    <div>
      {/* Customer */}
      <ViewProfile />

      {/* Home */}
      {isSelectedNav === "home" && (
        <div>
          {/* Layanan Kami */}
          <div className="mt-40 mx-10">
            <h1 className="text-center text-2xl font-bold pb-5">
              Transportasi Kami Bli
            </h1>

            <div className="grid grid-cols-2 gap-y-5">
              {/* Bus */}
              <Link
                href="/bus"
                className="flex flex-col items-center justify-center"
              >
                <div className="bg-[#07362D] rounded-xl w-fit p-5 mb-2">
                  <BsBusFrontFill className="text-6xl text-[#30E6C1]" />
                </div>
                <p className="text-xl">BusBli</p>
              </Link>

              {/* Angkot */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative bg-[#07362D] rounded-xl w-fit p-5 mb-2">
                  {/* Segera Ada */}
                  <div className="absolute top-0 bg-[#30E6C1] left-0 p-1 w-full rounded-t-xl border-2 border-[#07362D]">
                    <p className="text-xs font-semibold text-black text-center">
                      Segera Ada!
                    </p>
                  </div>
                  <FaBus className="text-6xl text-[#30E6C1]" />
                </div>
                <p className="text-xl">AngkotBli</p>
              </div>

              {/* Kapal */}
              <div className="flex flex-col items-center justify-center ">
                <div className="relative bg-[#07362D] rounded-xl w-fit p-5 mb-2">
                  {/* Segera Ada */}
                  <div className="absolute top-0 bg-[#30E6C1] left-0 p-1 w-full rounded-t-xl border-2 border-[#07362D]">
                    <p className="text-xs font-semibold text-black text-center">
                      Segera Ada!
                    </p>
                  </div>
                  <FaFerry className="text-6xl text-[#30E6C1]" />
                </div>
                <p className="text-xl">KapalBli</p>
              </div>

              {/* paket */}
              <div className="flex flex-col items-center justify-center ">
                <div className="relative bg-[#07362D] rounded-xl w-fit p-5 mb-2">
                  {/* Segera Ada */}
                  <div className="absolute top-0 bg-[#30E6C1] left-0 p-1 w-full rounded-t-xl border-2 border-[#07362D]">
                    <p className="text-xs font-semibold text-black text-center">
                      Segera Ada!
                    </p>
                  </div>
                  <FaBox className="text-6xl text-[#30E6C1]" />
                </div>
                <p className="text-xl">PaketBli</p>
              </div>
            </div>
          </div>

          {/* Isi Lainnya */}
        </div>
      )}

      {/* Tiketku */}
      {isSelectedNav === "tiketku" && (
        <div className="mt-40 mx-10">
          <div className="text-center text-2xl font-bold pb-5">TIKETKU</div>
          {/* Semua Tiket */}
          <div className="overflow-y-auto overflow-x-hidden h-[530px]">
            {dataTiketUser?.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleFlip(idx)}
                className="w-full h-60 perspective cursor-pointer"
              >
                <div
                  className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
                    flippedIndex === idx ? "rotate-x-180" : ""
                  }`}
                >
                  {/* Sisi Depan */}
                  <div className="absolute w-full h-full backface-hidden">
                    <div className="bg-[#35F9D1] rounded-xl py-3 px-7 relative mb-5 h-[200px]">
                      {/* Lingkaran kiri */}
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-0 w-10 h-10 bg-[#121418] rounded-full"></div>
                      {/* Lingkaran kanan */}
                      <div className="absolute top-1/2 -translate-y-1/2 translate-x-1/2 right-0 w-10 h-10 bg-[#121418] rounded-full"></div>

                      {/* Isi Tiket */}
                      <div className="text-[#1A443B] border-3 py-2 px-3 rounded-xl border-[#1A443B] h-full overflow-y-auto">
                        <p className="font-bold">
                          {item.statusPembayaran.toLocaleUpperCase()}{" "}
                          {`(${item.tanggalPemesanan})`}
                        </p>
                        <p>Rute: {item.rute}</p>
                        <p>Nama Bus: {item.nama_bus}</p>
                        <p>Nomor Plat: {item.platNomor}</p>
                        <p>
                          Jenis Bus: {item.jenisBus.toLocaleUpperCase()} | No.
                          Kursi: {item.nomorKursi}
                        </p>
                        {item.lewatTgl ? (
                          <button className="font-bold bg-[#1A443B] text-[#35F9D1] text-sm px-3 py-1 rounded-full mt-1">
                            AYO REVIEW BUS
                          </button>
                        ) : (
                          <button className="font-bold bg-[#1A443B] text-[#35F9D1] text-sm px-3 py-1 rounded-full mt-1">
                            CEK LOKASI BUS
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sisi Belakang */}
                  <div className="absolute w-full h-full backface-hidden rotate-x-180 ">
                    <div className="bg-[#1A443B] rounded-xl py-3 px-7 relative mb-5 h-[200px]">
                      {/* Lingkaran kiri */}
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-0 w-10 h-10 bg-[#121418] rounded-full"></div>
                      {/* Lingkaran kanan */}
                      <div className="absolute top-1/2 -translate-y-1/2 translate-x-1/2 right-0 w-10 h-10 bg-[#121418] rounded-full"></div>

                      {/* Isi Tiket */}
                      <div className="text-[#35F9D1] border-3 py-2 px-3 rounded-xl border-[#35F9D1] h-full overflow-y-auto">
                        <div>
                          <p>Lokasi Jemput: {item.detailJemput}</p>
                          <p>Lokasi Tujuan: {item.detailTujuan}</p>
                          <p>Tarif Bus: Rp. {item.tarifBusPerKM},-/km</p>
                          <p>Jarak Tempuh: {item.jarakTempuhKM} km</p>
                          <p>Fee Pelayanan: Rp. 1000,-</p>
                          <p>Total Harga: Rp. {item.totalHarga},-</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Promo */}
      {isSelectedNav === "promo" && (
        <div className="mt-40 mx-10">Ini Isi Promo</div>
      )}

      {/* Akun */}
      {isSelectedNav === "akun" && (
        <div className="mt-40 mx-10">Ini Isi Akun</div>
      )}

      {/* Navigasi */}
      <NavbarDashboard
        isSelectedNav={isSelectedNav}
        setIsSelectedNav={setIsSelectedNav}
        setFlippedIndex={setFlippedIndex}
      />
    </div>
  );
}
