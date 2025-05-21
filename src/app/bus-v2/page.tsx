"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import { BiTargetLock } from "react-icons/bi";
import { useForm } from "react-hook-form";
import { IoIosArrowForward } from "react-icons/io";
import { IoIosArrowBack } from "react-icons/io";
import { MdCancelPresentation } from "react-icons/md";
import useUserLocationV2 from "@/hook/useUserLocationV2";
import Rute from "@/components/Rute";
import UseGetProvinceV2 from "@/hook/useGetProvinceV2";
import { RutePerProvinsi } from "@/data/rutePerProv";
import useChangeRoute from "@/hook/useChangeRoute";
import L from "leaflet";
import useHandleFocus from "@/hook/useHandleFocus";

interface IBookingBus {
  rute: string | null;
  titikJemput: { lat: number; lng: number } | null;
  detailJemput: string | null;
  titikTujuan: { lat: number; lng: number } | null;
  detailTujuan: string | null;
  namaBus: string | null;
  nomorPlat: string | null;
  nomorKursi: string | null;
}

// Load MapView hanya di client-side
const DynamicMap = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => <p>Loading map...</p>,
});

export default function BusPageV2() {
  const [navigasi, setNavigasi] = useState<
    "Rute" | "Jemput" | "Tujuan" | "Bus" | "Bayar" | null
  >("Rute");
  const [isOpenRute, setIsOpenRute] = useState(false);
  const [layananBus, setLayananBus] = useState<
    "List" | "Terdekat" | "Booking" | null
  >(null);
  const [popUp, setPopUp] = useState(false);
  const [pagRute, setPagRute] = useState<number>(0);
  const [prov, setProv] = useState<"Bali" | "Jawa Timur" | undefined>(
    undefined
  );
  const mapRef = useRef<L.Map | null>(null);
  const routingRef = useRef<L.Routing.Control | null>(null);

  const { userLocation } = useUserLocationV2();
  const { province } = UseGetProvinceV2();
  const { handleFocus } = useHandleFocus({ mapRef: mapRef });
  const { ChangeRute } = useChangeRoute({
    mapRef: mapRef,
    routingRef: routingRef,
  });
  const { handleSubmit, setValue, watch } = useForm<IBookingBus>();

  const handleBooking = (data: IBookingBus) => {
    console.log("Rute: ", data.rute);
    console.log("titik jemput: ", data.titikJemput);
    console.log("detail jemput: ", data.detailJemput);
    console.log("titik tujuan: ", data.titikTujuan);
    console.log("detail tujuan: ", data.detailTujuan);
    console.log("nama bus: ", data.namaBus);
    console.log("nomor plat: ", data.nomorPlat);
    console.log("nomor kursi: ", data.nomorKursi);
  };

  const handleOpenRute = () => {
    setIsOpenRute(!isOpenRute);
  };

  useEffect(() => {
    setProv(province);
  }, [province]);

  const cariProv = RutePerProvinsi.find(
    (provinsi) =>
      provinsi?.namaProvinsi?.toLocaleLowerCase() === prov?.toLocaleLowerCase()
  );
  const ruteForUser = cariProv?.rute;
  if (!ruteForUser) return undefined;

  return (
    <div>
      {/* <Rute
        prov={prov}
        setProv={setProv}
        setPagRute={setPagRute}
        navigasi={navigasi}
      /> */}
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
              // onClick={() => {
              //   setIsOpenRute(false);
              //   setNavigasi("Rute");
              //   setSelectedLocationJemput(null);
              //   setNameKabupaten(undefined);
              //   setNameProvinsi(undefined);
              //   setTempatSpesifik(undefined);
              // }}
            >
              <FaArrowLeft className="text-4xl" />
            </button>
          )}
          {navigasi === "Tujuan" && (
            <button
              className="border-2 border-white w-fit p-1 rounded-xl bg-[#121418]"
              // onClick={() => {
              //   setIsOpenRute(false);
              //   setNavigasi("Jemput");
              //   setSelectedLocationJemput(null);
              //   setNameKabupaten(undefined);
              //   setNameProvinsi(undefined);
              //   setTempatSpesifik(undefined);
              //   setValue("detailJemput", null);
              // }}
            >
              <FaArrowLeft className="text-4xl" />
            </button>
          )}
          {navigasi === "Bus" && (
            <button
              className="border-2 border-white w-fit p-1 rounded-xl bg-[#121418]"
              // onClick={() => {
              //   setIsOpenRute(false);
              //   setNavigasi("Tujuan");
              //   setSelectedLocationTujuan(null);
              //   setNameKabupaten(undefined);
              //   setNameProvinsi(undefined);
              //   setTempatSpesifik(undefined);
              //   setValue("detailTujuan", null);
              // }}
            >
              <FaArrowLeft className="text-4xl" />
            </button>
          )}
          {navigasi === "Bayar" && (
            <button
              className="border-2 border-white w-fit p-1 rounded-xl bg-[#121418]"
              onClick={() => {
                setNavigasi("Bus");
                // setIsOpenRute(true);
                // setPopUp(false);
              }}
            >
              <FaArrowLeft className="text-4xl" />
            </button>
          )}

          {/* Fokus User */}
          {navigasi === "Rute" && (
            <button
              className="border-2 border-white w-fit p-1 rounded-xl bg-[#121418]"
              onClick={() => {
                if (userLocation)
                  handleFocus({ koordinat: userLocation, zoom: 11 });
                setProv(province);
              }}
            >
              <BiTargetLock className="text-4xl" />
            </button>
          )}
          {/* {navigasi === "Jemput" && !selectedLocationJemput && (
            <button
              className="border-2 border-white w-fit p-1 rounded-xl bg-[#121418]"
              onClick={() => {
                userFocus({ zoom: 14 });
              }}
            >
              <BiTargetLock className="text-4xl" />
            </button>
          )} */}
          {/* {navigasi === "Jemput" && selectedLocationJemput && (
            <button
              className="border-2 border-white w-fit p-1 rounded-xl bg-[#121418]"
              onClick={() => {
                focusSelectedLocationJemput();
              }}
            >
              <BiTargetLock className="text-4xl" />
            </button>
          )} */}
          {/* {navigasi === "Tujuan" && !selectedLocationTujuan && (
            <button
              className="border-2 border-white w-fit p-1 rounded-xl bg-[#121418]"
              onClick={() => {
                focusRuteTujuan();
              }}
            >
              <BiTargetLock className="text-4xl" />
            </button>
          )} */}
          {/* {navigasi === "Tujuan" && selectedLocationTujuan && (
            <button
              className="border-2 border-white w-fit p-1 rounded-xl bg-[#121418]"
              onClick={() => {
                focusSelectedLocationTujuan();
              }}
            >
              <BiTargetLock className="text-4xl" />
            </button>
          )} */}
          {/* {navigasi === "Bus" && selectedLocationJemput && (
            <button
              className="border-2 border-white w-fit p-1 rounded-xl bg-[#121418]"
              onClick={() => {
                focusSelectedLocationJemput();
              }}
            >
              <BiTargetLock className="text-4xl" />
            </button>
          )} */}
        </div>

        {/* Isi Rute, Titik Jemput, Titik Tujuan, Pilih Bus */}
        <form
          className={` bg-[#121418] p-5 rounded-t-3xl transition-all duration-300 ${
            isOpenRute
              ? navigasi === "Bus"
                ? "h-[400px]"
                : navigasi === "Bayar"
                ? "h-[510px]"
                : "h-[470px]"
              : "h-36"
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
                    onClick={() => {
                      handleOpenRute();
                      // setKoordinatAwal(null);
                    }}
                  >
                    <MdCancelPresentation className="text-3xl" />
                  </button>
                </div>
                {/* <div className="overflow-y-auto h-[270px]">
                  {[
                    `${ruteForUser?.[pagRute]?.from?.loc || ""} ⇨ ${
                      ruteForUser?.[pagRute]?.to?.loc || ""
                    }`,
                    `${ruteForUser?.[pagRute]?.to?.loc || ""} ⇨ ${
                      ruteForUser?.[pagRute]?.from?.loc || ""
                    }`,
                  ].map((namaRute, idx) => (
                    <div key={idx} className="pb-5">
                      <div
                        className={`bg-[#07362D] ${
                          selectedRute === namaRute ? "text-[#35F9D1]" : ""
                        } w-full py-3 font-bold text-xl rounded-xl text-center`}
                        onClick={() => {
                          setValue("rute", namaRute);
                          setKoordinatAwal(
                            idx === 0
                              ? {
                                  lat: ruteForUser?.[pagRute]?.from?.lat || 0,
                                  lng: ruteForUser?.[pagRute]?.from?.lng || 0,
                                }
                              : {
                                  lat: ruteForUser?.[pagRute]?.to?.lat || 0,
                                  lng: ruteForUser?.[pagRute]?.to?.lng || 0,
                                }
                          );
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
                </div> */}
                <div className="mt-5">
                  <button
                    type="button"
                    // className={` text-[#1A443B] w-full py-3  text-xl rounded-3xl ${
                    //   selectedRute ? "bg-[#35F9D1] font-bold" : "bg-[#25b498]"
                    // }`}
                    // disabled={!selectedRute}
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
                    onClick={() => {
                      handleOpenRute();
                      // handleLokasiJemput();
                    }}
                  >
                    TITIK JEMPUT
                  </button>
                </div>
              </div>

              {/* Isi Pilih Jemput */}
              <div className={`${isOpenRute ? "block" : "hidden"}`}>
                <div className="flex justify-between items-start pb-3">
                  <div className="flex justify-end">
                    <MdCancelPresentation className="text-3xl text-[#121418]" />
                  </div>
                  <div>
                    <h1 className="text-center text-xl mb-2">ISI DETAIL</h1>
                    <h1 className="text-center text-xl">PENJEMPUTAN</h1>
                  </div>
                  {/* CLose */}
                  <button
                    type="button"
                    className="flex justify-end"
                    onClick={() => {
                      handleOpenRute();
                      // setSelectedLocationJemput(null);
                      // setNameKabupaten(undefined);
                      // setNameProvinsi(undefined);
                      // setTempatSpesifik(undefined);
                    }}
                  >
                    <MdCancelPresentation className="text-3xl" />
                  </button>
                </div>
                <div className="overflow-y-auto max-h-[280px]">
                  <h1 className="text-xl">{`Kecamatan:`}</h1>
                  <select
                    className="bg-white text-black p-3 text-xl rounded-xl mt-2 appearance-none w-full"
                    // onChange={(e) => setSelectedKec(e.target.value)}
                  >
                    <option value="">Pilih Kecamatan</option>
                    {/* {cariNameKab?.kecamatan.map((kec, idx) => (
                      <option key={idx} value={kec.namaKec}>
                        {kec.namaKec}
                      </option>
                    ))} */}
                  </select>
                  <h1 className="mt-5 text-xl">{`Kelurahan/Desa:`}</h1>
                  <select
                    className="bg-white text-black p-3 text-xl rounded-xl mt-2 appearance-none w-full"
                    // onChange={(e) => setSelectedDesaKel(e.target.value)}
                  >
                    <option value="">Pilih Kelurahan/Desa</option>
                    {/* {cariNameKec?.desaKel.map((desaKel, idx) => (
                      <option key={idx} value={desaKel}>
                        {desaKel}
                      </option>
                    ))} */}
                  </select>
                  <h1 className="mt-5 text-xl">{`Tempat Spesifik:`}</h1>
                  <input
                    placeholder="Isi Nama Tempat yang Spesifik"
                    className="bg-white text-black py-3 px-5 w-full rounded-xl text-xl my-2"
                    // value={tempatSpesifik || ""}
                    // onChange={(e) => setTempatSpesifik(e.target.value)}
                  />
                </div>
                <div className="mt-5">
                  <button
                    type="button"
                    // className={` text-[#1A443B] w-full py-3  text-xl rounded-3xl ${
                    //   selectedKec && selectedDesaKel && tempatSpesifik
                    //     ? "bg-[#35F9D1] font-bold"
                    //     : "bg-[#25b498]"
                    // }`}
                    // disabled={
                    //   !selectedKec || !selectedDesaKel || !tempatSpesifik
                    // }
                    onClick={() => {
                      // setValue(
                      //   "detailJemput",
                      //   `${tempatSpesifik} di ${selectedDesaKel}, Kec. ${selectedKec}, Kab. ${namekabupaten}`
                      // );
                      setIsOpenRute(false);
                      // setTempatSpesifik(undefined);
                      localStorage.setItem("lastNavigasi", "Tujuan");
                      setNavigasi("Tujuan");
                    }}
                  >
                    LANJUT
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Form Tujuan */}
          {navigasi === "Tujuan" && (
            <div>
              {/* Pilih Tujuan */}
              <div>
                <h1
                  className={`${
                    isOpenRute ? "hidden" : "block"
                  } text-center text-xl mb-5`}
                >
                  PILIH TITIK TUJUAN
                </h1>
                <div
                  className={`${
                    isOpenRute ? "hidden" : "block"
                  } flex justify-between items-center gap-x-2`}
                >
                  {/* Cari Titik Tujuan */}
                  <button
                    type="button"
                    className={`bg-[#35F9D1] text-[#1A443B] w-full py-3 font-bold text-xl rounded-lg`}
                    onClick={() => {
                      handleOpenRute();
                      // handleLokasiTujuan();
                    }}
                  >
                    TITIK TUJUAN
                  </button>
                </div>
              </div>

              {/* Isi Pilih Tujuan */}
              <div className={`${isOpenRute ? "block" : "hidden"}`}>
                <div className="flex justify-between items-start pb-3">
                  <div className="flex justify-end">
                    <MdCancelPresentation className="text-3xl text-[#121418]" />
                  </div>
                  <div>
                    <h1 className="text-center text-xl mb-2">ISI DETAIL</h1>
                    <h1 className="text-center text-xl">TUJUAN</h1>
                  </div>
                  {/* CLose */}
                  <button
                    type="button"
                    className="flex justify-end"
                    onClick={() => {
                      handleOpenRute();
                      // setSelectedLocationTujuan(null);
                    }}
                  >
                    <MdCancelPresentation className="text-3xl" />
                  </button>
                </div>
                <div className="overflow-y-auto max-h-[280px]">
                  <h1 className="text-xl">{`Kecamatan:`}</h1>
                  <select
                    className="bg-white text-black p-3 text-xl rounded-xl mt-2 appearance-none w-full"
                    // onChange={(e) => setSelectedKec(e.target.value)}
                  >
                    <option value="">Pilih Kecamatan</option>
                    {/* {cariNameKab?.kecamatan.map((kec, idx) => (
                      <option key={idx} value={kec.namaKec}>
                        {kec.namaKec}
                      </option>
                    ))} */}
                  </select>
                  <h1 className="mt-5 text-xl">{`Kelurahan/Desa:`}</h1>
                  <select
                    className="bg-white text-black p-3 text-xl rounded-xl mt-2 appearance-none w-full"
                    // onChange={(e) => setSelectedDesaKel(e.target.value)}
                  >
                    <option value="">Pilih Kelurahan/Desa</option>
                    {/* {cariNameKec?.desaKel.map((desaKel, idx) => (
                      <option key={idx} value={desaKel}>
                        {desaKel}
                      </option>
                    ))} */}
                  </select>
                  <h1 className="mt-5 text-xl">{`Tempat Spesifik:`}</h1>
                  <input
                    placeholder="Isi Nama Tempat yang Spesifik"
                    className="bg-white text-black py-3 px-5 w-full rounded-xl text-xl my-2"
                    // value={tempatSpesifik || ""}
                    // onChange={(e) => setTempatSpesifik(e.target.value)}
                  />
                </div>
                <div className="mt-5">
                  <button
                    type="button"
                    // className={` text-[#1A443B] w-full py-3  text-xl rounded-3xl ${
                    //   selectedKec && selectedDesaKel && tempatSpesifik
                    //     ? "bg-[#35F9D1] font-bold"
                    //     : "bg-[#25b498]"
                    // }`}
                    // disabled={
                    //   !selectedKec || !selectedDesaKel || !tempatSpesifik
                    // }
                    onClick={() => {
                      // setValue(
                      //   "detailTujuan",
                      //   `${tempatSpesifik} di ${selectedDesaKel}, Kec. ${selectedKec}, Kab. ${namekabupaten}`
                      // );
                      setIsOpenRute(false);
                      setNavigasi("Bus");
                      // updateLokasiBusTrue();
                    }}
                  >
                    LANJUT
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Form Bus */}
          {navigasi === "Bus" && (
            <div>
              {/* Pilih Jenis Layanan Bus */}
              <div>
                <h1
                  className={`${
                    isOpenRute ? "hidden" : "block"
                  } text-center text-xl mb-5`}
                >
                  PILIH JENIS LAYANAN BUS
                </h1>
                <div
                  className={`${
                    isOpenRute ? "hidden" : "block"
                  } flex justify-between items-center gap-x-2`}
                >
                  {/* Pilihan Layanan Bus */}
                  <button
                    type="button"
                    className={`bg-[#35F9D1] text-[#1A443B] w-full py-3 font-bold text-xl rounded-lg`}
                    onClick={() => {
                      handleOpenRute();
                      setLayananBus("List");
                    }}
                  >
                    LIST
                  </button>
                  <button
                    type="button"
                    className={`bg-[#35F9D1] text-[#1A443B] w-full py-3 font-bold text-xl rounded-lg`}
                    onClick={() => {
                      handleOpenRute();
                      setLayananBus("Terdekat");
                    }}
                  >
                    TERDEKAT
                  </button>
                  <button
                    type="button"
                    className={`bg-[#35F9D1] text-[#1A443B] w-full py-3 font-bold text-xl rounded-lg`}
                    onClick={() => {
                      handleOpenRute();
                      setLayananBus("Booking");
                    }}
                  >
                    BOOKING
                  </button>
                </div>
              </div>

              {/* Isi Layanan Bus */}
              <div className={`${isOpenRute ? "block" : "hidden"}`}>
                <div className="flex justify-between items-start pb-3">
                  <div className="flex justify-end">
                    <MdCancelPresentation className="text-3xl text-[#121418]" />
                  </div>
                  <div>
                    <h1 className="text-center text-xl mb-2">
                      ISI LAYANAN {layananBus === "List" ? "" : "BUS"}
                    </h1>
                    <h1 className="text-center text-xl">
                      {layananBus === "List"
                        ? `${layananBus?.toLocaleUpperCase()} BUS`
                        : layananBus?.toLocaleUpperCase()}
                    </h1>
                  </div>
                  {/* CLose */}
                  <button
                    type="button"
                    className="flex justify-end"
                    onClick={() => {
                      handleOpenRute();
                      setLayananBus(null);
                      // setSelectedPlatNomor(null);
                    }}
                  >
                    <MdCancelPresentation className="text-3xl" />
                  </button>
                </div>
                {/* Isi Bus Favorit */}
                {layananBus === "List" && (
                  <div>
                    {/* <div className="flex flex-col gap-y-5 mt-3 overflow-y-auto h-[200px]">
                      {updateListBus &&
                        (updateListBus as BusType[])
                          .filter((item) =>
                            item.platBus.some(
                              (plat) => plat.lokasiBusTrue === true
                            )
                          )
                          .map((item, idx) => (
                            <div key={idx}>
                              <div
                                className="bg-[#35F9D1] font-bold text-[#1A443B] p-2 text-xl rounded-lg w-full flex items-center justify-between"
                                onClick={() => toggleOpenListBus(idx)}
                              >
                                <div
                                  onClick={() =>
                                    setValue("namaBus", item.nama_bus)
                                  }
                                >
                                  BUS {item.nama_bus.toLocaleUpperCase()}
                                </div>
                                <div>{openListBus === idx ? "▲" : "▼"}</div>
                              </div>
                              {openListBus === idx && (
                                <ul className="flex flex-col gap-y-1 mt-2 text-xl px-2">
                                  {item.platBus.map((plat, i) => (
                                    <li key={i} className="border-b-2 pb-1">
                                      <label className="cursor-pointer flex justify-between">
                                        <span>{plat.nomorBus}</span>
                                        <div className="flex items-center gap-x-2">
                                          <span>{`${plat.jarakDenganUser} KM`}</span>
                                          <input
                                            type="radio"
                                            name="platNomor"
                                            value={plat.nomorBus}
                                            checked={
                                              selectedPlatNomor ===
                                              plat.nomorBus
                                            }
                                            onChange={() => {
                                              setSelectedPlatNomor(
                                                plat.nomorBus
                                              );
                                              setValue(
                                                "nomorPlat",
                                                plat.nomorBus
                                              );
                                              busFocus({
                                                koordinat: plat.lokasiBus,
                                              });
                                            }}
                                            className="w-6 h-6"
                                          />
                                        </div>
                                      </label>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                    </div> */}
                    <div className="mt-4">
                      <button
                        type="button"
                        // className={` text-[#1A443B] w-full py-3  text-xl rounded-3xl ${
                        //   selectedPlatNomor
                        //     ? "bg-[#35F9D1] font-bold"
                        //     : "bg-[#25b498]"
                        // }`}
                        // disabled={!selectedPlatNomor}
                        // onClick={() => {
                        //   setPopUp(true);
                        // }}
                      >
                        PILIH KURSI & LANJUT
                      </button>
                    </div>
                  </div>
                )}
                {/* Isi Bus Terdekat */}
                {layananBus === "Terdekat" && (
                  <div>
                    {/* <div className="flex flex-col gap-y-5 mt-3 overflow-y-auto h-[200px]">
                      {updateListBus && (
                        <div className="flex flex-col gap-2">
                          {(updateListBus as BusType[])
                            .flatMap((bus) =>
                              bus.platBus
                                .filter((plat) => plat.lokasiBusTrue === true)
                                .map((plat) => ({
                                  namaBus: bus.nama_bus,
                                  ...plat,
                                }))
                            )
                            .sort(
                              (a, b) =>
                                (a.jarakDenganUser ?? Infinity) -
                                (b.jarakDenganUser ?? Infinity)
                            )
                            .map((item, idx) => (
                              <label
                                key={idx}
                                className="flex justify-between items-center border-b py-2 text-lg"
                              >
                                <div>
                                  BUS {item.namaBus.toUpperCase()} [
                                  {item.nomorBus}]
                                </div>
                                <div className="flex items-center gap-2">
                                  <span>
                                    {(item.jarakDenganUser ?? 0).toFixed(2)} KM
                                  </span>
                                  <input
                                    type="radio"
                                    name="pilihBus"
                                    value={item.nomorBus}
                                    checked={
                                      selectedPlatNomor === item.nomorBus
                                    }
                                    onChange={() => {
                                      setSelectedPlatNomor(item.nomorBus);
                                      setValue("nomorPlat", item.nomorBus);
                                      busFocus({ koordinat: item.lokasiBus });
                                    }}
                                    className="w-5 h-5"
                                  />
                                </div>
                              </label>
                            ))}
                        </div>
                      )}
                    </div> */}
                    <div className="mt-4">
                      <button
                        type="button"
                        // className={` text-[#1A443B] w-full py-3  text-xl rounded-3xl ${
                        //   selectedPlatNomor
                        //     ? "bg-[#35F9D1] font-bold"
                        //     : "bg-[#25b498]"
                        // }`}
                        // disabled={!selectedPlatNomor}
                        // onClick={() => {
                        //   setPopUp(true);
                        // }}
                      >
                        PILIH KURSI & LANJUT
                      </button>
                    </div>
                  </div>
                )}
                {/* Isi Bus Booking */}
                {layananBus === "Booking" && <div>Ini Isi Booking</div>}
                {/* Pop Up Pilih Kursi */}
                {popUp && (
                  <div
                    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
                    onClick={() => setPopUp(false)}
                  >
                    <div
                      className="bg-white p-5 rounded-2xl w-[80%] max-w-md shadow-xl"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <MdCancelPresentation className="text-2xl text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-black">
                          PILIH KURSI:
                        </h2>
                        <button type="button" onClick={() => setPopUp(false)}>
                          <MdCancelPresentation className="text-2xl text-gray-700" />
                        </button>
                      </div>

                      {/* Denah kursi berdasarkan layout bus*/}
                      <div className="mb-6 space-y-2 border-2 p-3 rounded-xl">
                        {/* Kursi Driver */}
                        <div className="grid grid-cols-3 px-2">
                          <div className="p-2" />
                          <div className="p-2" />
                          <div className="p-2 bg-[#35F9D1] rounded-lg text-sm font-bold hover:bg-[#25b498] text-black text-center">
                            DRIVER
                          </div>
                        </div>
                        {/* kursi depan */}
                        {[...Array(6)].map((_, rowIndex) => {
                          const base = rowIndex * 4;
                          return (
                            <div
                              key={rowIndex}
                              className="grid grid-cols-5 gap-2"
                            >
                              {[...Array(5)].map((_, colIndex) => {
                                if (colIndex === 2) {
                                  // Spasi tengah
                                  return <div key={`spacer-${rowIndex}`} />;
                                } else {
                                  const seatNumber =
                                    base +
                                    (colIndex > 2 ? colIndex - 1 : colIndex) +
                                    1;
                                  return (
                                    <button
                                      key={seatNumber}
                                      type="button"
                                      className="p-2 bg-[#35F9D1] rounded-lg text-sm font-bold hover:bg-[#25b498] text-black"
                                    >
                                      {seatNumber}
                                    </button>
                                  );
                                }
                              })}
                            </div>
                          );
                        })}

                        {/* kursi side tangga */}
                        <div className="grid grid-cols-5 gap-2">
                          {/* Spacer kolom 0,1,2 */}
                          <div />
                          <div />
                          <div />
                          {[...Array(2)].map((_, i) => {
                            const seatNumber = i + 25;
                            return (
                              <button
                                key={seatNumber}
                                type="button"
                                className="p-2 bg-[#35F9D1] rounded-lg text-sm font-bold hover:bg-[#25b498] text-black"
                              >
                                {seatNumber}
                              </button>
                            );
                          })}
                        </div>

                        {/* kursi belakang */}
                        <div className="grid grid-cols-5 gap-2">
                          {[...Array(5)].map((_, i) => {
                            const seatNumber = i + 27;
                            return (
                              <button
                                key={seatNumber}
                                type="button"
                                className="p-2 bg-[#35F9D1] rounded-lg text-sm font-bold hover:bg-[#25b498] text-black"
                              >
                                {seatNumber}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <button
                        type="button"
                        className={`text-[#1A443B] w-full py-3  text-xl rounded-3xl bg-[#25b498]`}
                        onClick={() => {
                          setIsOpenRute(true);
                          setNavigasi("Bayar");
                        }}
                      >
                        LANJUT PEMBAYARAN
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Pembayaran */}
          {navigasi === "Bayar" && (
            <div className={`${isOpenRute ? "block" : "hidden"}`}>
              <h1 className="text-center text-xl mb-5">DETAIL PEMBAYARAN</h1>
              <div className="overflow-y-auto h-[350px] border p-2 rounded-xl">
                <p className="pb-2">RUTE:</p>
                <p className="pb-2">Lokasi Jemput: {watch("detailJemput")}</p>
                <p className="pb-2">Lokasi Tujuan: {watch("detailTujuan")}</p>
                <p className="pb-2">
                  Nama Bus: BUS {watch("namaBus")?.toLocaleUpperCase()}{" "}
                  {`[ ${watch("nomorPlat")} ]`}
                </p>
                <p className="pb-2">No. Kursi: 00</p>
                <p className="pb-2">Tarif Bus: Rp.400/km</p>
                <p className="pb-2">Jarak Tempuh: 000 km</p>
                <p className="pb-2">Fee Pelayanan: Rp.2000</p>
                <p className="pb-2">Total Harga: Rp.42.000</p>
              </div>
              <div className="mt-5">
                <button
                  type="button"
                  className={`text-[#1A443B] w-full py-3  text-xl rounded-3xl bg-[#35F9D1] font-bold`}
                >
                  BAYAR
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
      <DynamicMap
        mapRef={mapRef}
        routingRef={routingRef}
        from={ruteForUser[0].from}
        to={ruteForUser[0].to}
      />
    </div>
  );
}
