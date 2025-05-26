"use client";

import dynamic from "next/dynamic";
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
import useGetLocationCenter from "@/hook/useGetLocationCenter";
import useGetProvKab from "@/hook/useGetKabupaten";
import { NamaLokasi } from "@/data/namaLokasi";
import { useRouter } from "next/navigation";
import useUpdateDataBus from "@/hook/useUpdateDataBus";
import dataBus from "@/data/dataBus.json";
import useRedDotBus from "@/hook/useRedDotBus";
import MapView from "@/components/MapView";
import useFutureDates from "@/hook/useFutureDates";
import useRealtimeHour from "@/hook/useRealtimeHour";

interface IBookingBus {
  rute: string | null;
  titikJemput: { lat: number; lng: number } | null;
  detailJemput: string | null;
  titikTujuan: { lat: number; lng: number } | null;
  detailTujuan: string | null;
  namaBus: string | null;
  platNomor: string | null;
  nomorKursi: string | null;
  mulaiJalan: string | null;
  tanggalJemput: string | null;
}

interface IHasilDataBus {
  nama_bus: string;
  bus: IListBus[];
}

interface IListBus {
  jenisBus: string;
  jumlahKursi: number;
  platNomor: string;
  denahKursi: number[][];
  kursiTerisi: number[];
  koordinat: { lat: number; lng: number };
  trueLocation: boolean;
  jarakDenganUser: number;
}

interface BookingWaktu {
  [jam: string]: number[];
}
interface BookingRute {
  [rute: string]: BookingWaktu;
}
interface BookingKelas {
  [kelas: string]: BookingRute;
}
interface BookingTanggal {
  [tanggal: string]: BookingKelas;
}
interface BookingBus {
  nama_bus: string;
  booking: BookingTanggal;
}

// Load MapView hanya di client-side
// const DynamicMap = dynamic(() => import("@/components/MapView"), {
//   ssr: false,
//   loading: () => <p>Loading map...</p>,
// });

export default function BusPageV2() {
  const router = useRouter();

  // useState
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
  const [koordinatAwal, setKoordinatAwal] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedKec, setSelectedKec] = useState<string | undefined>(undefined);
  const [selectedDesaKel, setSelectedDesaKel] = useState<string | undefined>(
    undefined
  );
  const [tempatSpesifik, setTempatSpesifik] = useState<string | undefined>(
    undefined
  );
  const [ruteCenter, setRuteCenter] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [openListBus, setOpenListBus] = useState<number | null>(null);
  const [selectedPlatNomor, setSelectedPlatNomor] = useState<string | null>("");

  // Ref
  const mapRef = useRef<L.Map | null>(null);
  const routingRef = useRef<L.Routing.Control | null>(null);

  // Custom Hook
  const { userLocation } = useUserLocationV2();
  const { province } = UseGetProvinceV2();
  const { handleFocus, handleDeleteMarkerBus } = useHandleFocus({
    mapRef: mapRef,
  });
  const { ChangeRute } = useChangeRoute({
    mapRef: mapRef,
    routingRef: routingRef,
  });
  const { handleGetLocationCenter, locationCenter, setLocationCenter } =
    useGetLocationCenter({
      mapRef: mapRef,
    });
  const { namekabupaten, setNameKabupaten, nameProvinsi, setNameProvinsi } =
    useGetProvKab(locationCenter);
  const { handleUpdateDataBus, updateDataBus } = useUpdateDataBus({
    mapRef: mapRef,
  });
  const { handleOpenRedDotBus, handleCloseRedDotBus } = useRedDotBus({
    mapRef: mapRef,
  });
  const tanggalKedepan = useFutureDates(3);
  const jam = useRealtimeHour();
  const { handleSubmit, setValue, watch } = useForm<IBookingBus>();

  // useEffect
  useEffect(() => {
    setProv(province);
  }, [province]);

  // Filter Rute
  const cariProv = RutePerProvinsi.find(
    (provinsi) =>
      provinsi?.namaProvinsi?.toLocaleLowerCase() === prov?.toLocaleLowerCase()
  );
  const ruteForUser = cariProv?.rute;
  if (!ruteForUser) return undefined;

  // Filter Daerah untuk detail patokan jemput/tujuan
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

  // Filter Data Bus
  const hasilDataBus: IHasilDataBus[] = [];
  dataBus.data.forEach((namaBrandBus) => {
    const hasilListBus: IListBus[] = [];
    namaBrandBus.bus.forEach((bus) => {
      const cekKeberangkatanBus = bus.keberangkatan.some(
        (berangkat) =>
          berangkat.IsiRute === watch("rute") && berangkat.otw === true
      );
      if (cekKeberangkatanBus)
        hasilListBus.push({
          jenisBus: bus.jenisBus,
          jumlahKursi: bus.jumlahKursi,
          platNomor: bus.platNomor,
          denahKursi: bus.denahKursi,
          kursiTerisi: bus.kursiTerisi,
          koordinat: bus.koordinat,
          trueLocation: false,
          jarakDenganUser: 0,
        });
    });
    if (hasilListBus.length > 0)
      hasilDataBus.push({
        nama_bus: namaBrandBus.nama_bus,
        bus: hasilListBus,
      });
  });

  // Filter Update Data Bus
  const filterUpdateDataBusTrue = updateDataBus
    .map((item) => {
      const filteredBus = item.bus.filter((bus) => bus.trueLocation === true);
      if (filteredBus.length > 0) {
        return { ...item, bus: filteredBus };
      }
      return null;
    })
    .filter((item): item is IHasilDataBus => item !== null);

  // Filter all koordinat bus
  const allKoordinatBus = filterUpdateDataBusTrue.flatMap((item) =>
    item.bus.map((bus) => bus.koordinat)
  );

  // Filter Booking
  const targetRute = watch("rute");
  const nowDate = tanggalKedepan[0];
  const nowTime = "06:30"; // nanti ganti "jam"

  const timeToMinutes = (time: string): number => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m + 15; // dikasih toleransi 15 menit
  };

  const nowMinutes = timeToMinutes(nowTime);

  const resultFilteredBooking: BookingBus[] = dataBus.data.reduce<BookingBus[]>(
    (acc, bus) => {
      const filteredBooking: BookingTanggal = {};

      Object.entries(bus.booking).forEach(([tanggal, kelasObj]) => {
        if (tanggal >= nowDate) {
          Object.entries(kelasObj).forEach(([kelas, ruteObjRaw]) => {
            if (targetRute) {
              const ruteObj = ruteObjRaw as BookingRute;
              const rute = ruteObj[targetRute];

              if (rute) {
                Object.entries(rute).forEach(([jam, seatList]) => {
                  const jamMenit = timeToMinutes(jam);
                  const isValid =
                    tanggal > nowDate ||
                    (tanggal === nowDate && jamMenit > nowMinutes);

                  if (isValid) {
                    if (!filteredBooking[tanggal]) {
                      filteredBooking[tanggal] = {};
                    }

                    if (!filteredBooking[tanggal][kelas]) {
                      filteredBooking[tanggal][kelas] = {};
                    }

                    if (!filteredBooking[tanggal][kelas][targetRute]) {
                      filteredBooking[tanggal][kelas][targetRute] = {};
                    }

                    filteredBooking[tanggal][kelas][targetRute][jam] = seatList;
                  }
                });
              }
            }
          });
        }
      });

      if (Object.keys(filteredBooking).length > 0) {
        acc.push({
          nama_bus: bus.nama_bus,
          booking: filteredBooking,
        });
      }

      return acc;
    },
    []
  );

  // const/let
  const titikJemput = watch("titikJemput");
  const titikTujuan = watch("titikTujuan");
  const ruteForUserFrom = ruteForUser?.[pagRute]?.from?.loc || "";
  const ruteForUserTo = ruteForUser?.[pagRute]?.to?.loc || "";

  // HandleClick
  const handleBooking = (data: IBookingBus) => {
    console.log("Rute: ", data.rute);
    console.log("titik jemput: ", data.titikJemput);
    console.log("detail jemput: ", data.detailJemput);
    console.log("titik tujuan: ", data.titikTujuan);
    console.log("detail tujuan: ", data.detailTujuan);
    console.log("nama bus: ", data.namaBus);
    console.log("nomor plat: ", data.platNomor);
    console.log("nomor kursi: ", data.nomorKursi);
  };
  const handleOpenClose = () => {
    setIsOpenRute(!isOpenRute);
  };
  const handleBackButton = () => {
    if (navigasi === "Rute") {
      router.replace("/");
      return;
    }
    if (navigasi === "Jemput") {
      setIsOpenRute(false);
      setNavigasi("Rute");
      if (userLocation) {
        handleFocus({ koordinat: userLocation, zoom: 11 });
      }
      setValue("rute", null);
      setLocationCenter(null);
      setNameKabupaten(undefined);
      setNameProvinsi(undefined);
      setTempatSpesifik(undefined);
      return;
    }
    if (navigasi === "Tujuan") {
      setIsOpenRute(false);
      setNavigasi("Jemput");
      if (titikJemput) {
        handleFocus({ koordinat: titikJemput, zoom: 11 });
      }
      setLocationCenter(null);
      setNameKabupaten(undefined);
      setNameProvinsi(undefined);
      setTempatSpesifik(undefined);
      setValue("detailJemput", null);
      return;
    }
    if (navigasi === "Bus") {
      setIsOpenRute(false);
      setNavigasi("Tujuan");
      if (titikTujuan) {
        handleFocus({ koordinat: titikTujuan, zoom: 11 });
      }
      setNameKabupaten(undefined);
      setNameProvinsi(undefined);
      setTempatSpesifik(undefined);
      setValue("detailTujuan", null);
      setValue("namaBus", null);
      handleDeleteMarkerBus();
      handleCloseRedDotBus();
      return;
    }
    if (navigasi === "Bayar") {
    }
  };
  const handleFocusButton = () => {
    if (navigasi === "Rute") {
      if (userLocation) handleFocus({ koordinat: userLocation, zoom: 11 });
      setProv(province);
    }
    if (navigasi === "Jemput") {
      if (locationCenter) {
        handleFocus({ koordinat: locationCenter, zoom: 11 });
      } else if (userLocation) {
        handleFocus({ koordinat: userLocation, zoom: 11 });
      }
    }
    if (navigasi === "Tujuan") {
      if (locationCenter) {
        handleFocus({ koordinat: locationCenter, zoom: 11 });
      } else if (ruteCenter) {
        handleFocus({ koordinat: ruteCenter, zoom: 10 });
      }
    }
    if (navigasi === "Bus") {
      if (titikJemput) {
        handleFocus({ koordinat: titikJemput, zoom: 11 });
      }
    }
    if (navigasi === "Bayar") {
    }
  };
  const toggleOpenListBus = (idx: number | null) => {
    setOpenListBus(openListBus === idx ? null : idx);
  };

  // console.log("booking", resultFilteredBooking);

  return (
    <div>
      <Rute
        prov={prov}
        setProv={setProv}
        setPagRute={setPagRute}
        navigasi={navigasi}
        selectedRute={watch("rute")}
      />
      <div className="fixed bottom-0 w-full z-50">
        {/* Back Home, Fokus Rute, User Location */}
        <div className="flex justify-between items-center mb-5 mx-5">
          {/* Back Home*/}
          <button
            className="border-2 border-white w-fit p-1 rounded-xl bg-[#121418]"
            onClick={handleBackButton}
          >
            <FaArrowLeft className="text-4xl" />
          </button>
          {/*
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
          )} */}

          {/* Fokus User */}
          <button
            className="border-2 border-white w-fit p-1 rounded-xl bg-[#121418]"
            onClick={handleFocusButton}
          >
            <BiTargetLock className="text-4xl" />
          </button>
        </div>

        {/* Isi Rute, Titik Jemput, Titik Tujuan, Pilih Bus */}
        <form
          className={` bg-[#121418] p-5 rounded-t-3xl transition-all duration-300 ${
            isOpenRute
              ? navigasi === "Bus"
                ? "h-[400px]"
                : navigasi === "Bayar"
                ? "h-[510px]"
                : navigasi === "Rute"
                ? "h-[350px]"
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
                    onClick={handleOpenClose}
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
                      handleOpenClose();
                      setValue("rute", null);
                      setKoordinatAwal(null);
                    }}
                  >
                    <MdCancelPresentation className="text-3xl" />
                  </button>
                </div>
                <div className="overflow-y-auto h-[150px]">
                  {[
                    `${ruteForUserFrom} ⇨ ${ruteForUserTo}`,
                    `${ruteForUserTo} ⇨ ${ruteForUserFrom}`,
                  ].map((namaRute, idx) => (
                    <div key={idx} className="pb-5">
                      <div
                        className={`bg-[#07362D] ${
                          watch("rute") === namaRute ? "text-[#35F9D1]" : ""
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
                    </div>
                  ))}
                </div>
                <div className="mt-5">
                  <button
                    type="button"
                    className={` text-[#1A443B] w-full py-3  text-xl rounded-3xl ${
                      watch("rute") ? "bg-[#35F9D1] font-bold" : "bg-[#25b498]"
                    }`}
                    disabled={!watch("rute")}
                    onClick={() => {
                      setIsOpenRute(false);
                      setRuteCenter(ruteForUser[pagRute].center);
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
                      handleOpenClose();
                      handleGetLocationCenter();
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
                      handleOpenClose();
                      if (locationCenter) {
                        handleFocus({ koordinat: locationCenter, zoom: 11 });
                      } else if (userLocation) {
                        handleFocus({ koordinat: userLocation, zoom: 11 });
                      }
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
                    disabled={!selectedKec}
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
                      setValue("titikJemput", locationCenter);
                      setLocationCenter(null);
                      setNavigasi("Tujuan");
                      if (ruteCenter) {
                        handleFocus({ koordinat: ruteCenter, zoom: 10 });
                      }
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
                      handleOpenClose();
                      handleGetLocationCenter();
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
                      handleOpenClose();
                      if (locationCenter) {
                        handleFocus({ koordinat: locationCenter, zoom: 11 });
                      } else if (ruteCenter) {
                        handleFocus({ koordinat: ruteCenter, zoom: 10 });
                      }
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
                      setValue("titikTujuan", locationCenter);
                      setNavigasi("Bus");
                      if (titikJemput) {
                        handleFocus({
                          koordinat: titikJemput,
                          zoom: 11,
                        });
                      }
                      handleUpdateDataBus({
                        hasilDataBus: hasilDataBus,
                        koordinatAwal: koordinatAwal,
                        titikJemput: titikJemput,
                      });
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
                      handleOpenClose();
                      handleOpenRedDotBus({ allKoordinatBus: allKoordinatBus });
                      setLayananBus("List");
                    }}
                  >
                    LIST
                  </button>
                  <button
                    type="button"
                    className={`bg-[#35F9D1] text-[#1A443B] w-full py-3 font-bold text-xl rounded-lg`}
                    onClick={() => {
                      handleOpenClose();
                      handleOpenRedDotBus({ allKoordinatBus: allKoordinatBus });
                      setLayananBus("Terdekat");
                    }}
                  >
                    TERDEKAT
                  </button>
                  <button
                    type="button"
                    className={`bg-[#35F9D1] text-[#1A443B] w-full py-3 font-bold text-xl rounded-lg`}
                    onClick={() => {
                      handleOpenClose();
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
                      handleOpenClose();
                      setLayananBus(null);
                      setValue("namaBus", null);
                      setSelectedPlatNomor(null);
                      handleDeleteMarkerBus();
                      handleCloseRedDotBus();
                      setOpenListBus(null);
                      setValue("tanggalJemput", null);
                      if (titikJemput) {
                        handleFocus({ koordinat: titikJemput, zoom: 11 });
                      }
                    }}
                  >
                    <MdCancelPresentation className="text-3xl" />
                  </button>
                </div>
                {/* Isi List Bus */}
                {layananBus === "List" && (
                  <div>
                    <div className="flex flex-col gap-y-5 mt-3 overflow-y-auto h-[200px]">
                      {filterUpdateDataBusTrue &&
                        filterUpdateDataBusTrue.map((item, idx) => (
                          <div key={idx}>
                            <div
                              className="bg-[#35F9D1] font-bold text-[#1A443B] p-2 text-xl rounded-lg w-full flex items-center justify-between"
                              onClick={() => {
                                toggleOpenListBus(idx);
                                setValue("namaBus", item.nama_bus);
                              }}
                            >
                              <div>BUS {item.nama_bus.toLocaleUpperCase()}</div>
                              <div>{openListBus === idx ? "▲" : "▼"}</div>
                            </div>
                            {openListBus === idx && (
                              <ul className="flex flex-col gap-y-1 mt-2 text-xl px-2">
                                {item.bus.map((bus, i) => (
                                  <li key={i} className="border-b-2 pb-1">
                                    <label className="cursor-pointer flex justify-between">
                                      <span>{bus.platNomor}</span>
                                      <div className="flex items-center gap-x-2">
                                        <span>{`${bus.jarakDenganUser} KM`}</span>
                                        <input
                                          type="radio"
                                          name="platNomor"
                                          value={bus.platNomor}
                                          checked={
                                            selectedPlatNomor === bus.platNomor
                                          }
                                          onChange={() => {
                                            setSelectedPlatNomor(bus.platNomor);
                                            setValue(
                                              "platNomor",
                                              bus.platNomor
                                            );
                                            if (bus.koordinat) {
                                              handleFocus({
                                                koordinat: bus.koordinat,
                                                zoom: 12,
                                                navigasi: navigasi,
                                                nama_bus: watch("namaBus"),
                                                platNomor: bus.platNomor,
                                              });
                                            }
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
                    </div>
                    <div className="mt-4">
                      <button
                        type="button"
                        className={` text-[#1A443B] w-full py-3  text-xl rounded-3xl ${
                          selectedPlatNomor
                            ? "bg-[#35F9D1] font-bold"
                            : "bg-[#25b498]"
                        }`}
                        disabled={!selectedPlatNomor}
                        onClick={() => {
                          setPopUp(true);
                        }}
                      >
                        PILIH KURSI & LANJUT
                      </button>
                    </div>
                  </div>
                )}
                {/* Isi Bus Terdekat */}
                {layananBus === "Terdekat" && (
                  <div>
                    <div className="flex flex-col gap-y-5 mt-3 overflow-y-auto h-[200px]">
                      {filterUpdateDataBusTrue && (
                        <div className="flex flex-col gap-2">
                          {filterUpdateDataBusTrue
                            .flatMap((listBus) =>
                              listBus.bus.map((itemBus) => ({
                                ...itemBus,
                                nama_bus: listBus.nama_bus,
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
                                <div className="flex flex-col gap-y-2">
                                  <div>BUS {item.nama_bus.toUpperCase()} </div>
                                  <div>[{item.platNomor}]</div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span>
                                    {(item.jarakDenganUser ?? 0).toFixed(2)} KM
                                  </span>
                                  <input
                                    type="radio"
                                    name="pilihBus"
                                    value={item.platNomor}
                                    checked={
                                      selectedPlatNomor === item.platNomor
                                    }
                                    onChange={() => {
                                      setSelectedPlatNomor(item.platNomor);
                                      setValue("namaBus", item.nama_bus);
                                      setValue("platNomor", item.platNomor);
                                      if (item.koordinat) {
                                        handleFocus({
                                          koordinat: item.koordinat,
                                          zoom: 12,
                                          navigasi: navigasi,
                                          nama_bus: item.nama_bus,
                                          platNomor: item.platNomor,
                                        });
                                      }
                                    }}
                                    className="w-5 h-5"
                                  />
                                </div>
                              </label>
                            ))}
                        </div>
                      )}
                    </div>
                    <div className="mt-4">
                      <button
                        type="button"
                        className={` text-[#1A443B] w-full py-3  text-xl rounded-3xl ${
                          watch("mulaiJalan")
                            ? "bg-[#35F9D1] font-bold"
                            : "bg-[#25b498]"
                        }`}
                        disabled={!watch("mulaiJalan")}
                        onClick={() => {
                          setPopUp(true);
                        }}
                      >
                        PILIH KURSI & LANJUT
                      </button>
                    </div>
                  </div>
                )}
                {/* Isi Bus Booking */}
                {layananBus === "Booking" && (
                  <div>
                    <div className="mt-3 overflow-y-auto h-[200px]">
                      <div>PILIH TANGGAL:</div>
                      <div className="flex justify-between mt-1">
                        {tanggalKedepan.map((tanggal, idx) => (
                          <div
                            key={idx}
                            className={`${
                              watch("tanggalJemput") === tanggal
                                ? "bg-[#35F9D1] font-bold"
                                : "bg-[#25b498]"
                            } px-3 py-1 rounded-sm text-[#1A443B]`}
                            onClick={() => {
                              setValue("tanggalJemput", tanggal);
                            }}
                          >
                            {tanggal}
                          </div>
                        ))}
                      </div>
                      <div>PILIH JENIS BUS:</div>
                      <div>PILIH WAKTU BERANGKAT BUS:</div>
                    </div>
                    <div className="mt-4">
                      <button
                        type="button"
                        className={` text-[#1A443B] w-full py-3  text-xl rounded-3xl ${
                          selectedPlatNomor
                            ? "bg-[#35F9D1] font-bold"
                            : "bg-[#25b498]"
                        }`}
                        disabled={!selectedPlatNomor}
                        onClick={() => {
                          setPopUp(true);
                        }}
                      >
                        PILIH KURSI & LANJUT
                      </button>
                    </div>
                  </div>
                )}
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
                  {`[ ${watch("platNomor")} ]`}
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
      {/* <DynamicMap
        navigasi={navigasi}
        mapRef={mapRef}
        routingRef={routingRef}
        from={ruteForUser[0].from}
        to={ruteForUser[0].to}
        titikJemput={titikJemput}
      /> */}
      <MapView
        navigasi={navigasi}
        mapRef={mapRef}
        routingRef={routingRef}
        from={ruteForUser[0].from}
        to={ruteForUser[0].to}
        titikJemput={titikJemput}
      />
    </div>
  );
}
