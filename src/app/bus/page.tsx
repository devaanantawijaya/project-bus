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
import UseGetProvKab from "@/hook/useGetKabupaten";
import { NamaLokasi } from "@/data/namaLokasi";
import listBus from "@/data/listBus.json";

interface IBookingBus {
  rute: string;
  titikJemput: { lat: number; lng: number } | null;
  detailJemput: string | null;
  titikTujuan: { lat: number; lng: number } | null;
  detailTujuan: string | null;
}

export default function BusPage() {
  const [navigasi, setNavigasi] = useState<
    "Rute" | "Jemput" | "Tujuan" | "Bus" | null
  >("Rute");
  const [layananBus, setLayananBus] = useState<
    "List" | "Terdekat" | "Booking" | null
  >(null);
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
  const [selectedKec, setSelectedKec] = useState<string | undefined>(undefined);
  const [selectedDesaKel, setSelectedDesaKel] = useState<string | undefined>(
    undefined
  );
  const [tempatSpesifik, setTempatSpesifik] = useState<string | undefined>(
    undefined
  );
  const [openListBus, setOpenListBus] = useState(null);
  const [selectedPlatNomor, setSelectedPlatNomor] = useState("");

  const { handleSubmit, setValue, watch } = useForm<IBookingBus>();

  const selectedRute = watch("rute");

  const handleBooking = (data: IBookingBus) => {
    console.log("Rute: ", data.rute);
    console.log("titik jemput: ", data.titikJemput);
    console.log("detail jemput: ", data.detailJemput);
    console.log("titik tujuan: ", data.titikTujuan);
    console.log("detail tujuan: ", data.detailTujuan);
  };

  const handleOpenRute = () => {
    setIsOpenRute(!isOpenRute);
  };

  const handleOpenDetailRute = (detailRute: "A" | "B") => {
    setOpenDetailRute(isOpenDetailRute === detailRute ? null : detailRute);
  };

  useEffect(() => {
    setProv(province);
  }, [province]);

  const cariProv = RutePerProvinsi.find(
    (provinsi) =>
      provinsi?.namaProvinsi?.toLocaleLowerCase() === prov?.toLocaleLowerCase()
  );

  const ruteForUser = cariProv?.rute;

  const {
    ChangeRute,
    userFocus,
    handleLokasiJemput,
    selectedLocationJemput,
    setSelectedLocationJemput,
    focusSelectedLocationJemput,
    handleLokasiTujuan,
    selectedLocationTujuan,
    setSelectedLocationTujuan,
    focusRuteTujuan,
    focusSelectedLocationTujuan,
    setKoordinatAwal,
  } = UseMap({
    from: ruteForUser ? ruteForUser[pagRute].from : { lat: 0, lng: 0 },
    to: ruteForUser ? ruteForUser[pagRute].to : { lat: 0, lng: 0 },
    center: ruteForUser ? ruteForUser[pagRute].center : { lat: 0, lng: 0 },
    userLocation: userLocation || { lat: 0, lng: 0 },
    navigasi: navigasi || null,
  });

  useEffect(() => {
    ChangeRute({
      from: ruteForUser ? ruteForUser[pagRute].from : { lat: 0, lng: 0 },
      to: ruteForUser ? ruteForUser[pagRute].to : { lat: 0, lng: 0 },
      center: ruteForUser ? ruteForUser[pagRute].center : { lat: 0, lng: 0 },
    });
  }, [ruteForUser, ChangeRute, pagRute]);

  const selectedLocationNaikTurun =
    navigasi === "Jemput" ? selectedLocationJemput : selectedLocationTujuan;
  const { namekabupaten, setNameKabupaten, nameProvinsi, setNameProvinsi } =
    UseGetProvKab(selectedLocationNaikTurun);

  const cariNameProv = NamaLokasi.find(
    (prov) => prov.namaProv === nameProvinsi
  );

  let cariNameKab;
  if (cariNameProv) {
    cariNameKab = cariNameProv.kabupaten.find(
      (kab) => kab.namaKab === namekabupaten
    );
  }

  let cariNameKec;
  if (cariNameKab && selectedKec) {
    cariNameKec = cariNameKab.kecamatan.find(
      (kec) => kec.namaKec === selectedKec
    );
  }

  const hasilListBus = [];
  listBus.data.forEach((brandBusGroup) => {
    const hasilListPlat = [];

    brandBusGroup.bus.forEach((listBus) => {
      const keberangkatanBus = listBus.keberangkatan.some(
        (data) =>
          data.IsiRute === selectedRute &&
          data.otw === true &&
          data.booking === false
      );

      if (keberangkatanBus) {
        hasilListPlat.push(listBus.platNomor);
      }
    });

    if (hasilListPlat.length > 0) {
      hasilListBus.push({
        nama_bus: brandBusGroup.nama_bus,
        platNomor: hasilListPlat,
      });
    }
  });

  const toggleOpenListBus = (idx) => {
    setOpenListBus(openListBus === idx ? null : idx);
  };

  return (
    <div className="relative w-full">
      <Rute
        prov={prov}
        setProv={setProv}
        setPagRute={setPagRute}
        navigasi={navigasi}
        selectedRute={selectedRute}
      />

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
                setIsOpenRute(false);
                setNavigasi("Rute");
                setSelectedLocationJemput(null);
                setNameKabupaten(undefined);
                setNameProvinsi(undefined);
                setTempatSpesifik(undefined);
              }}
            >
              <FaArrowLeft className="text-4xl" />
            </button>
          )}
          {navigasi === "Tujuan" && (
            <button
              className="border-2 border-white w-fit p-1 rounded-xl bg-[#121418]"
              onClick={() => {
                setIsOpenRute(false);
                setNavigasi("Jemput");
                setSelectedLocationJemput(null);
                setNameKabupaten(undefined);
                setNameProvinsi(undefined);
                setTempatSpesifik(undefined);
                setValue("detailJemput", null);
              }}
            >
              <FaArrowLeft className="text-4xl" />
            </button>
          )}
          {navigasi === "Bus" && (
            <button
              className="border-2 border-white w-fit p-1 rounded-xl bg-[#121418]"
              onClick={() => {
                setIsOpenRute(false);
                setNavigasi("Tujuan");
                setSelectedLocationTujuan(null);
                setNameKabupaten(undefined);
                setNameProvinsi(undefined);
                setTempatSpesifik(undefined);
                setValue("detailTujuan", null);
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
                userFocus({ zoom: 11 });
                setProv(province);
              }}
            >
              <BiTargetLock className="text-4xl" />
            </button>
          )}
          {navigasi === "Jemput" && !selectedLocationJemput && (
            <button
              className="border-2 border-white w-fit p-1 rounded-xl bg-[#121418]"
              onClick={() => {
                userFocus({ zoom: 14 });
              }}
            >
              <BiTargetLock className="text-4xl" />
            </button>
          )}
          {navigasi === "Jemput" && selectedLocationJemput && (
            <button
              className="border-2 border-white w-fit p-1 rounded-xl bg-[#121418]"
              onClick={() => {
                focusSelectedLocationJemput();
              }}
            >
              <BiTargetLock className="text-4xl" />
            </button>
          )}
          {navigasi === "Tujuan" && !selectedLocationTujuan && (
            <button
              className="border-2 border-white w-fit p-1 rounded-xl bg-[#121418]"
              onClick={() => {
                focusRuteTujuan();
              }}
            >
              <BiTargetLock className="text-4xl" />
            </button>
          )}
          {navigasi === "Tujuan" && selectedLocationTujuan && (
            <button
              className="border-2 border-white w-fit p-1 rounded-xl bg-[#121418]"
              onClick={() => {
                focusSelectedLocationTujuan();
              }}
            >
              <BiTargetLock className="text-4xl" />
            </button>
          )}
          {navigasi === "Bus" && selectedLocationJemput && (
            <button
              className="border-2 border-white w-fit p-1 rounded-xl bg-[#121418]"
              onClick={() => {
                focusSelectedLocationJemput();
              }}
            >
              <BiTargetLock className="text-4xl" />
            </button>
          )}
        </div>

        {/* Isi Rute, Titik Jemput, Titik Tujuan, Pilih Bus */}
        <form
          className={` bg-[#121418] p-5 rounded-t-3xl transition-all duration-300 ${
            isOpenRute
              ? navigasi === "Bus"
                ? "h-[400px]"
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
                      setKoordinatAwal(null);
                    }}
                  >
                    <MdCancelPresentation className="text-3xl" />
                  </button>
                </div>
                <div className="overflow-y-auto h-[270px]">
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
                </div>
                <div className="mt-5">
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
                    onClick={() => {
                      handleOpenRute();
                      handleLokasiJemput();
                      setValue("titikJemput", selectedLocationJemput);
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
                      setSelectedLocationJemput(null);
                      setNameKabupaten(undefined);
                      setNameProvinsi(undefined);
                      setTempatSpesifik(undefined);
                    }}
                  >
                    <MdCancelPresentation className="text-3xl" />
                  </button>
                </div>
                <div className="overflow-y-auto max-h-[280px]">
                  <h1 className="text-xl">{`Kecamatan:`}</h1>
                  <select
                    className="bg-white text-black p-3 text-xl rounded-xl mt-2 appearance-none w-full"
                    onChange={(e) => setSelectedKec(e.target.value)}
                  >
                    <option value="">Pilih Kecamatan</option>
                    {cariNameKab?.kecamatan.map((kec, idx) => (
                      <option key={idx} value={kec.namaKec}>
                        {kec.namaKec}
                      </option>
                    ))}
                  </select>
                  <h1 className="mt-5 text-xl">{`Kelurahan/Desa:`}</h1>
                  <select
                    className="bg-white text-black p-3 text-xl rounded-xl mt-2 appearance-none w-full"
                    onChange={(e) => setSelectedDesaKel(e.target.value)}
                  >
                    <option value="">Pilih Kelurahan/Desa</option>
                    {cariNameKec?.desaKel.map((desaKel, idx) => (
                      <option key={idx} value={desaKel}>
                        {desaKel}
                      </option>
                    ))}
                  </select>
                  <h1 className="mt-5 text-xl">{`Tempat Spesifik:`}</h1>
                  <input
                    placeholder="Isi Nama Tempat yang Spesifik"
                    className="bg-white text-black py-3 px-5 w-full rounded-xl text-xl my-2"
                    value={tempatSpesifik || ""}
                    onChange={(e) => setTempatSpesifik(e.target.value)}
                  />
                </div>
                <div className="mt-5">
                  <button
                    type="button"
                    className={` text-[#1A443B] w-full py-3  text-xl rounded-3xl ${
                      selectedKec && selectedDesaKel && tempatSpesifik
                        ? "bg-[#35F9D1] font-bold"
                        : "bg-[#25b498]"
                    }`}
                    disabled={
                      !selectedKec || !selectedDesaKel || !tempatSpesifik
                    }
                    onClick={() => {
                      setValue(
                        "detailJemput",
                        `${tempatSpesifik} di ${selectedDesaKel}, Kec. ${selectedKec}, Kab. ${namekabupaten}`
                      );
                      setIsOpenRute(false);
                      setTempatSpesifik(undefined);
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
                      handleLokasiTujuan();
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
                      setSelectedLocationTujuan(null);
                    }}
                  >
                    <MdCancelPresentation className="text-3xl" />
                  </button>
                </div>
                <div className="overflow-y-auto max-h-[280px]">
                  <h1 className="text-xl">{`Kecamatan:`}</h1>
                  <select
                    className="bg-white text-black p-3 text-xl rounded-xl mt-2 appearance-none w-full"
                    onChange={(e) => setSelectedKec(e.target.value)}
                  >
                    <option value="">Pilih Kecamatan</option>
                    {cariNameKab?.kecamatan.map((kec, idx) => (
                      <option key={idx} value={kec.namaKec}>
                        {kec.namaKec}
                      </option>
                    ))}
                  </select>
                  <h1 className="mt-5 text-xl">{`Kelurahan/Desa:`}</h1>
                  <select
                    className="bg-white text-black p-3 text-xl rounded-xl mt-2 appearance-none w-full"
                    onChange={(e) => setSelectedDesaKel(e.target.value)}
                  >
                    <option value="">Pilih Kelurahan/Desa</option>
                    {cariNameKec?.desaKel.map((desaKel, idx) => (
                      <option key={idx} value={desaKel}>
                        {desaKel}
                      </option>
                    ))}
                  </select>
                  <h1 className="mt-5 text-xl">{`Tempat Spesifik:`}</h1>
                  <input
                    placeholder="Isi Nama Tempat yang Spesifik"
                    className="bg-white text-black py-3 px-5 w-full rounded-xl text-xl my-2"
                    value={tempatSpesifik || ""}
                    onChange={(e) => setTempatSpesifik(e.target.value)}
                  />
                </div>
                <div className="mt-5">
                  <button
                    type="button"
                    className={` text-[#1A443B] w-full py-3  text-xl rounded-3xl ${
                      selectedKec && selectedDesaKel && tempatSpesifik
                        ? "bg-[#35F9D1] font-bold"
                        : "bg-[#25b498]"
                    }`}
                    disabled={
                      !selectedKec || !selectedDesaKel || !tempatSpesifik
                    }
                    onClick={() => {
                      setValue(
                        "detailTujuan",
                        `${tempatSpesifik} di ${selectedDesaKel}, Kec. ${selectedKec}, Kab. ${namekabupaten}`
                      );
                      setIsOpenRute(false);
                      setNavigasi("Bus");
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
                      ISI LAYANAN BUS
                    </h1>
                    <h1 className="text-center text-xl">
                      {layananBus?.toLocaleUpperCase()}
                    </h1>
                  </div>
                  {/* CLose */}
                  <button
                    type="button"
                    className="flex justify-end"
                    onClick={() => {
                      handleOpenRute();
                      setLayananBus(null);
                    }}
                  >
                    <MdCancelPresentation className="text-3xl" />
                  </button>
                </div>
                {/* Isi Bus Favorit */}
                {layananBus === "List" && (
                  <div>
                    <div className="flex flex-col gap-y-5 mt-3 overflow-y-auto h-[200px]">
                      {hasilListBus.map((item, idx) => (
                        <div key={idx}>
                          <div
                            className="bg-[#35F9D1] font-bold text-[#1A443B] p-2 text-xl rounded-lg w-full flex items-center justify-between"
                            onClick={() => toggleOpenListBus(idx)}
                          >
                            <div>BUS {item.nama_bus.toLocaleUpperCase()}</div>
                            <div>{openListBus === idx ? "▲" : "▼"}</div>
                          </div>
                          {openListBus === idx && (
                            <ul className="flex flex-col gap-y-1 mt-2 text-xl px-2">
                              {item.platNomor.map((plat, i) => (
                                <li key={i} className="border-b-2 pb-1">
                                  <label className="cursor-pointer flex justify-between">
                                    <span>{plat}</span>
                                    <input
                                      type="radio"
                                      name="platNomor"
                                      value={plat}
                                      checked={selectedPlatNomor === plat}
                                      onChange={() =>
                                        setSelectedPlatNomor(plat)
                                      }
                                      className="w-6 h-6"
                                    />
                                  </label>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <button
                        type="button"
                        className={` text-[#1A443B] w-full py-3  text-xl rounded-3xl ${
                          selectedPlatNomor
                            ? "bg-[#35F9D1] font-bold"
                            : "bg-[#25b498]"
                        }`}
                      >
                        LANJUT
                      </button>
                    </div>
                  </div>
                )}

                {/* Isi Bus Terdekat */}
                {layananBus === "Terdekat" && <div>Ini Isi Terdekat</div>}

                {/* Isi Bus Booking */}
                {layananBus === "Booking" && <div>Ini Isi Booking</div>}
              </div>
            </div>
          )}
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
