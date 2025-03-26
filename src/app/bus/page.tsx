"use client";

import React, { useEffect, useState } from "react";
import Rute from "@/components/Rute";
import { MdCancelPresentation } from "react-icons/md";
import { IoMdArrowDropup } from "react-icons/io";
import { IoMdArrowDropdown } from "react-icons/io";
import { FaArrowLeft } from "react-icons/fa6";
import { BiTargetLock } from "react-icons/bi";
import Link from "next/link";
import { IoIosArrowForward } from "react-icons/io";
import { IoIosArrowBack } from "react-icons/io";
import { RutePerProvinsi } from "@/data/rutePerProv";
import UseUserLocation from "@/hook/useUserLocation";
import UseGetProvince from "@/hook/useGetProvince";
import UseMap from "@/hook/useMap";
import { useForm } from "react-hook-form";

interface IBookingBus {
  rute: string;
}

export default function BusPage() {
  const [navigasi, setNavigasi] = useState<
    "Rute" | "Jemput" | "Tujuan" | "Bus" | null
  >("Rute");
  const [isOpenRute, setIsOpenRute] = useState(false);
  const [isOpenDetailRute, setOpenDetailRute] = useState<"A" | "B" | null>(
    null
  );
  const [pagRute, setPagRute] = useState<number>(0);
  const { userLocation } = UseUserLocation();
  const { province } = UseGetProvince();
  const [prov, setProv] = useState<"Bali" | "Jawa Timur" | undefined>(
    undefined
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<IBookingBus>();

  const selectedRute = watch("rute");

  const handleBooking = (data: IBookingBus) => {
    console.log("Rute: ", data.rute);
  };

  const handleOpenRute = () => {
    setIsOpenRute(!isOpenRute);
    setValue("rute", "");
  };

  const handleOpenDetailRute = (detailRute: "A" | "B") => {
    setOpenDetailRute(isOpenDetailRute === detailRute ? null : detailRute);
  };

  useEffect(() => {
    setProv(province);
  }, [province]);

  const cariProv = RutePerProvinsi.find(
    (provinsi) => provinsi?.namaProvinsi?.toLocaleLowerCase() === "bali"
  );

  const ruteForUser = cariProv?.rute;

  const { ChangeRute, userFocus } = UseMap({
    from: ruteForUser ? ruteForUser[pagRute].from : { lat: 0, lng: 0 },
    to: ruteForUser ? ruteForUser[pagRute].to : { lat: 0, lng: 0 },
    center: ruteForUser ? ruteForUser[pagRute].center : { lat: 0, lng: 0 },
    userLocation: userLocation || { lat: 0, lng: 0 },
  });

  return (
    <div className="relative w-full">
      <Rute prov={prov} setProv={setProv} />

      <div className="fixed bottom-0 w-full z-50">
        {/* Back Home, Fokus Rute, User Location */}
        <div className="flex justify-between items-center mb-5 mx-5">
          {/* Back Home*/}
          {navigasi === "Rute" && (
            <Link
              href="/"
              className="border-2 border-white w-fit p-1 rounded-xl bg-[#121418]"
            >
              <FaArrowLeft className="text-4xl" />
            </Link>
          )}
          {navigasi === "Jemput" && (
            <button
              className="border-2 border-white w-fit p-1 rounded-xl bg-[#121418]"
              onClick={() => {
                setIsOpenRute(false)
                setNavigasi("Rute");
              }}
            >
              <FaArrowLeft className="text-4xl" />
            </button>
          )}

          <button
            className="border-2 border-white w-fit p-1 rounded-xl bg-[#121418]"
            onClick={() => {
              userFocus();
            }}
          >
            <BiTargetLock className="text-4xl" />
          </button>
        </div>

        {/* Isi Rute, Titik Jemput, Titik Tujuan, Pilih Bus */}
        <form
          className={` bg-[#121418] p-5 rounded-t-3xl transition-all duration-300 ${
            isOpenRute ? `h-[470px]` : "h-36"
          }`}
          onSubmit={handleSubmit(handleBooking)}
        >
          {/* Form Rute */}
          {navigasi === "Rute" && (
            <div>
              {/* Pilih Rute */}
              <div>
                <h1
                  className={`${
                    isOpenRute ? "hidden" : "block"
                  } text-center text-xl mb-5`}
                >
                  PILIH RUTE
                </h1>
                <div
                  className={`${
                    isOpenRute ? "hidden" : "block"
                  } flex justify-between items-center gap-x-2`}
                >
                  {/* Prev */}
                  <button
                    type="button"
                    className="bg-[#07362D] py-2 rounded-lg"
                    onClick={() => {
                      if (!ruteForUser) return;

                      const idx =
                        pagRute > 0 ? pagRute - 1 : ruteForUser.length - 1;

                      setPagRute(idx);

                      ChangeRute({
                        from: ruteForUser[idx].from,
                        to: ruteForUser[idx].to,
                        center: ruteForUser[idx].center,
                      });
                    }}
                  >
                    <IoIosArrowBack className="text-[#35F9D1] text-4xl" />
                  </button>
                  {/* Open Detail Rute */}
                  <button
                    type="button"
                    className={`bg-[#35F9D1] text-[#1A443B] w-full py-3 font-bold text-xl rounded-lg`}
                    onClick={handleOpenRute}
                  >
                    <div>{ruteForUser?.[pagRute]?.namaRute}</div>
                  </button>
                  {/* Next */}
                  <button
                    type="button"
                    className="bg-[#07362D] py-2 rounded-lg"
                    onClick={() => {
                      if (!ruteForUser) return;

                      const idx =
                        pagRute < ruteForUser.length - 1 ? pagRute + 1 : 0;

                      setPagRute(idx);

                      ChangeRute({
                        from: ruteForUser[idx].from,
                        to: ruteForUser[idx].to,
                        center: ruteForUser[idx].center,
                      });
                    }}
                  >
                    <IoIosArrowForward className="text-[#35F9D1] text-4xl" />
                  </button>
                </div>
              </div>

              {/* Isi Pilih Rute */}
              <div className={`${isOpenRute ? "block" : "hidden"}`}>
                <div className="flex justify-between items-start pb-5">
                  <div className="flex justify-end">
                    <MdCancelPresentation className="text-3xl text-[#121418]" />
                  </div>
                  <div>
                    <h1 className="text-center text-xl mb-2">PILIH RUTE</h1>
                    <h1 className="text-xl font-bold">
                      {ruteForUser ? ruteForUser[pagRute].namaRute : ""}
                    </h1>
                  </div>
                  {/* CLose */}
                  <button
                    type="button"
                    className="flex justify-end"
                    onClick={handleOpenRute}
                  >
                    <MdCancelPresentation className="text-3xl" />
                  </button>
                </div>
                <div className="overflow-y-auto max-h-[260px]">
                  {[
                    `${ruteForUser?.[pagRute]?.from?.loc || ""} ⇨ ${
                      ruteForUser?.[pagRute]?.to?.loc || ""
                    }`,
                    `${ruteForUser?.[pagRute]?.to?.loc || ""} ⇨ ${
                      ruteForUser?.[pagRute]?.from?.loc || ""
                    }`,
                  ].map((namaRute) => (
                    <div key={namaRute} className="pb-5">
                      <div
                        className={`bg-[#07362D] ${
                          selectedRute === namaRute ? "text-[#35F9D1]" : ""
                        } w-full py-3 font-bold text-xl rounded-xl text-center`}
                        onClick={() => {
                          setValue("rute", namaRute);
                        }}
                      >
                        {namaRute}
                      </div>
                      <div className="flex items-center gap-x-1">
                        <button
                          className="my-2"
                          onClick={() => handleOpenDetailRute("A")}
                        >
                          Detail Rute
                        </button>
                        {isOpenDetailRute === "A" ? (
                          <IoMdArrowDropdown className="text-3xl" />
                        ) : (
                          <IoMdArrowDropup className="text-3xl" />
                        )}
                      </div>
                      {isOpenDetailRute === "A" && (
                        <p
                          className={`bg-[#434343] text-center p-3 rounded-xl`}
                        >{`GIlimanuk => Negara => Mendoyo => Pekutatan => Tabanan => Badung => Denpasar`}</p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <button
                    type="button"
                    className={` text-[#1A443B] w-full py-3  text-xl rounded-3xl ${
                      selectedRute ? "bg-[#35F9D1] font-bold" : "bg-[#25b498]"
                    }`}
                    disabled={!selectedRute}
                    onClick={() => {
                      setIsOpenRute(false);
                      setNavigasi("Jemput");
                    }}
                  >
                    LANJUT
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Form Jemput */}
          {navigasi === "Jemput" && (
            <div>
              {/* Pilih jemput */}
              <div>
                <h1
                  className={`${
                    isOpenRute ? "hidden" : "block"
                  } text-center text-xl mb-5`}
                >
                  PILIH TITIK PENJEMPUTAN
                </h1>
                <div
                  className={`${
                    isOpenRute ? "hidden" : "block"
                  } flex justify-between items-center gap-x-2`}
                >
                  {/* Cari Titik Jemput */}
                  <button
                    type="button"
                    className={`bg-[#35F9D1] text-[#1A443B] w-full py-3 font-bold text-xl rounded-lg`}
                    onClick={handleOpenRute}
                  >
                    TITIK JEMPUT
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Form Tujuan */}
          {/* Form Bus */}
        </form>
      </div>

      {/* Tampilkan Map */}
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
    </div>
  );
}
