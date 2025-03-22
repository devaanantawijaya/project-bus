"use client";

import React from "react";
import { FaBus } from "react-icons/fa";
import { BsBusFrontFill } from "react-icons/bs";
import { FaFerry } from "react-icons/fa6";
import { FaBox } from "react-icons/fa6";
import NavbarDashboard from "@/components/NavbarDashboard";
import ViewProfile from "@/components/ViewProfile";
import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      {/* Customer */}
      <ViewProfile />

      {/* Isi Konten */}
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

        {/* Promo Spesial */}
      </div>

      {/* Navigasi */}
      <NavbarDashboard />
    </div>
  );
}
