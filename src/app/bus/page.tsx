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
import Map from "@/components/Map";
import UseUserLocation from "@/hook/useUserLocation";
import { TbArrowZigZag } from "react-icons/tb";
import UseGetProvince from "@/hook/useGetProvince";

export default function BusPage() {
  const [isOpenRute, setIsOpenRute] = useState(false);
  const [isOpenDetailRute, setOpenDetailRute] = useState<"A" | "B" | null>(
    null
  );
  const [pagRute, setPagRute] = useState<number>(0);
  const { userLocation } = UseUserLocation();
  const [triggerFocusUser, setTriggerFocusUser] = useState(true);
  const { province } = UseGetProvince();
  const [prov, setProv] = useState("");

  console.log("prov: ", prov);

  const handleOpenRute = () => {
    setIsOpenRute(!isOpenRute);
  };

  const handleOpenDetailRute = (detailRute: "A" | "B") => {
    setOpenDetailRute(isOpenDetailRute === detailRute ? null : detailRute);
  };

  useEffect(() => {
    if (triggerFocusUser) setProv(province);
  }, [province, triggerFocusUser]);

  const mencariPronvinsi = RutePerProvinsi.find(
    (provinsi) => provinsi?.namaProvinsi?.toLocaleLowerCase() === "bali" // bali nya hanya sample
  );

  const ruteForUser = mencariPronvinsi?.rute;
  console.log("ruteUser: ", ruteForUser);

  return (
    <div className="relative w-full">
      <Rute prov={prov} setProv={setProv} />

      <div className="fixed bottom-0 w-full z-50">
        {/* Back Home, Fokus Rute, User Location */}
        <div className="flex justify-between items-center mb-5 mx-5">
          {/* Back Home*/}
          <Link
            href="/"
            className="border-2 border-white w-fit p-1 rounded-xl bg-[#121418]"
          >
            <FaArrowLeft className="text-4xl" />
          </Link>

          <button
            className="border-2 border-white w-fit p-1 rounded-xl bg-[#121418]"
            onClick={() => {
              setTriggerFocusUser(false);
            }}
          >
            <BiTargetLock className="text-4xl" />
          </button>
        </div>

        {/* Pilih Rute */}
        <div
          className={` bg-[#121418] p-5 rounded-t-3xl transition-all duration-300 ${
            isOpenRute ? `h-[470px]` : "h-36"
          }`}
        >
          {/* Button Pilih Rute */}
          <div>
            <h1 className="text-center text-xl mb-5">PILIH RUTE</h1>
            <div
              className={`${
                isOpenRute ? "hidden" : "block"
              } flex justify-between items-center gap-x-2`}
            >
              {/* Prev */}
              <button
                className="bg-[#07362D] py-2 rounded-lg"
                onClick={() => {
                  setPagRute(
                    pagRute > 0 ? pagRute - 1 : ruteForUser.length - 1
                  );
                  setTriggerFocusUser(false);
                }}
              >
                <IoIosArrowBack className="text-[#35F9D1] text-4xl" />
              </button>
              {/* Open Detail Rute */}
              <button
                className={`bg-[#35F9D1] text-[#1A443B] w-full py-3 font-bold text-xl rounded-lg`}
                onClick={handleOpenRute}
              >
                <div>{ruteForUser?.[pagRute].namaRute}</div>
              </button>
              {/* Next */}
              <button
                className="bg-[#07362D] py-2 rounded-lg"
                onClick={() => {
                  setPagRute(
                    pagRute < ruteForUser.length - 1 ? pagRute + 1 : 0
                  );
                  setTriggerFocusUser(false);
                }}
              >
                <IoIosArrowForward className="text-[#35F9D1] text-4xl" />
              </button>
            </div>
          </div>

          {/* Isi List Pilihan Rute */}
          <div className={`${isOpenRute ? "block" : "hidden"}`}>
            <div className="flex justify-between items-center pb-5">
              <div className="flex justify-end">
                <MdCancelPresentation className="text-3xl text-[#121418]" />
              </div>
              <h1 className="text-xl font-bold text-right">
                {ruteForUser[pagRute].namaRute}
              </h1>
              <button className="flex justify-end" onClick={handleOpenRute}>
                <MdCancelPresentation className="text-3xl" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[260px]">
              <div className="pb-5">
                <button
                  className={`bg-[#07362D] text-[#35F9D1] w-full py-3 font-bold text-xl rounded-xl`}
                >
                  {`${ruteForUser[pagRute].from.loc} ⇨ ${ruteForUser[pagRute].to.loc}`}
                </button>
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
              <div className="pb-5">
                <button
                  className={`bg-[#07362D] text-[#35F9D1] w-full py-3 font-bold text-xl rounded-xl`}
                >
                  {`${ruteForUser[pagRute].to.loc} ⇨ ${ruteForUser[pagRute].from.loc}`}
                </button>
                <div className="flex items-center gap-x-1">
                  <button
                    className="my-2"
                    onClick={() => handleOpenDetailRute("B")}
                  >
                    Detail Rute
                  </button>
                  {isOpenDetailRute === "B" ? (
                    <IoMdArrowDropdown className="text-3xl" />
                  ) : (
                    <IoMdArrowDropup className="text-3xl" />
                  )}
                </div>
                {isOpenDetailRute === "B" && (
                  <p
                    className={`bg-[#434343] text-center p-3 rounded-xl`}
                  >{`GIlimanuk => Negara => Mendoyo => Pekutatan => Tabanan => Badung => Denpasar`}</p>
                )}
              </div>
            </div>
            <div className="mt-3">
              <button
                className={`bg-[#35F9D1] text-[#1A443B] w-full py-3 font-bold text-xl rounded-3xl`}
              >
                LANJUT
              </button>
            </div>
          </div>
        </div>
      </div>

      <Map
        from={{
          lat: ruteForUser[pagRute].from.lat,
          lng: ruteForUser[pagRute].from.lng,
        }}
        to={{
          lat: ruteForUser[pagRute].to.lat,
          lng: ruteForUser[pagRute].to.lng,
        }}
        center={{
          lat: ruteForUser[pagRute].center.lat,
          lng: ruteForUser[pagRute].center.lng,
        }}
        userLocation={userLocation}
        triggerFocus={triggerFocusUser}
      />
    </div>
  );
}
