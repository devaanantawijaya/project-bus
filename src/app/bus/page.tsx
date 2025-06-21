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
// import MapView from "@/components/MapView";
import useFutureDates from "@/hook/useFutureDates";
import useRealtimeHour from "@/hook/useRealtimeHour";
import { TbAirConditioning } from "react-icons/tb";
import { TbCarFan } from "react-icons/tb";
import { HiOutlineMusicNote } from "react-icons/hi";
import { PiPlugCharging } from "react-icons/pi";
import { IoIosWifi } from "react-icons/io";
import useGetJarakTempuh from "@/hook/useGetJarakTempuh";

interface IBookingBus {
  rute: string | null;
  titikJemput: { lat: number; lng: number } | null;
  detailJemput: string | null;
  titikTujuan: { lat: number; lng: number } | null;
  detailTujuan: string | null;
  namaBus: string | null;
  platNomor: string | null;
  nomorKursi: string | null;
  tanggalJemput: string | null;
  jenisBus: string | null;
  jamBerangkat: string | null;
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

interface FilterDataBookingBus {
  nama_bus: string;
  jadwal: [string, number[], number][];
}

// Load MapView hanya di client-side ↴
const DynamicMap = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => <p>Loading map...</p>,
});

const QrisPopup = dynamic(() => import("@/components/QrisPopUp"), {
  ssr: false, // ⛔ jangan render di server
});

export default function Bus() {
  const router = useRouter();

  // useState
  const [navigasi, setNavigasi] = useState<
    "Rute" | "Jemput" | "Tujuan" | "Bus" | "Bayar" | null
  >("Rute");
  const [isOpenRute, setIsOpenRute] = useState(false);
  const [layananBus, setLayananBus] = useState<
    "List" | "Terdekat" | "Booking" | null
  >(null);
  const [layananBusBooking, setLayananBusBooking] = useState<
    "Tanggal&JenisBus" | "NamaBus&Waktu" | null
  >("Tanggal&JenisBus");
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
  const [selectedPlatNomor, setSelectedPlatNomor] = useState<string | null>(
    null
  );
  const [filterDataBookingBus, setFilterDataBookingBus] = useState<
    (FilterDataBookingBus | null)[]
  >([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [denahKursi, setDenahKursi] = useState<number[][]>([]);
  const [fiturBus, setFiturBus] = useState<string[]>([]);
  const [jumlahKursiBus, setJumlahKursiBus] = useState<number | null>();

  const [showQris, setShowQris] = useState(false); // ini hanya notif

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
  const { handleJarakTempuh, jarakTempuh } = useGetJarakTempuh();
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
  const parseTanggal = (tgl: string): Date => {
    const [d, m, y] = tgl.split("-").map(Number);
    return new Date(y, m - 1, d); // karena bulan dimulai dari 0
  };

  const targetRute = watch("rute");
  const nowDateStr = tanggalKedepan[0]; // contoh: "01-05-2025"
  const nowDate = parseTanggal(nowDateStr);
  const nowTime = "06:30"; // nanti diganti pakai jam aktual

  const timeToMinutes = (time: string): number => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m + 15; // toleransi 15 menit
  };

  const nowMinutes = timeToMinutes(nowTime);

  const resultFilteredBooking: BookingBus[] = dataBus.data.reduce<BookingBus[]>(
    (acc, bus) => {
      const filteredBooking: BookingTanggal = {};

      Object.entries(bus.booking).forEach(([tanggalStr, kelasObj]) => {
        const tanggalObj = parseTanggal(tanggalStr);

        // Bandingkan objek Date, bukan string
        if (tanggalObj >= nowDate) {
          Object.entries(kelasObj).forEach(([kelas, ruteObjRaw]) => {
            if (targetRute) {
              const ruteObj = ruteObjRaw as BookingRute;
              const rute = ruteObj[targetRute];

              if (rute) {
                Object.entries(rute).forEach(([jam, seatList]) => {
                  const jamMenit = timeToMinutes(jam);

                  const isValid =
                    tanggalObj > nowDate ||
                    (tanggalObj.getTime() === nowDate.getTime() &&
                      jamMenit > nowMinutes);

                  if (isValid) {
                    if (!filteredBooking[tanggalStr]) {
                      filteredBooking[tanggalStr] = {};
                    }

                    if (!filteredBooking[tanggalStr][kelas]) {
                      filteredBooking[tanggalStr][kelas] = {};
                    }

                    if (!filteredBooking[tanggalStr][kelas][targetRute]) {
                      filteredBooking[tanggalStr][kelas][targetRute] = {};
                    }

                    filteredBooking[tanggalStr][kelas][targetRute][jam] =
                      seatList;
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

  // Filter Jenis Bus
  const jenisBusList: string[] = [];
  resultFilteredBooking.forEach((bus) => {
    const booking = bus.booking;
    Object.values(booking).forEach((tanggal) => {
      Object.keys(tanggal).forEach((jenisKey) => {
        const [tipe] = jenisKey.split("_");
        const tipeUpper = tipe.toUpperCase();
        if (!jenisBusList.includes(tipeUpper)) {
          // Hindari duplikat
          jenisBusList.push(tipeUpper);
        }
      });
    });
  });

  // Filter data booking (tanggal dan jenis bus)
  const handleFilterDataBookingBus = (
    tanggal: string | null,
    kelas: string | null
  ) => {
    const rute = watch("rute");

    if (!tanggal || !kelas || !rute) {
      setFilterDataBookingBus([]);
      setSelectedSeats([]);
      return;
    }

    const result = resultFilteredBooking
      .map((bus) => {
        const allKelasData = bus.booking[tanggal];
        if (!allKelasData) return null;

        const matchedKelasKey = Object.keys(allKelasData).find((k) =>
          k.startsWith(`${kelas.toLowerCase()}_`)
        );
        if (!matchedKelasKey) return null;

        const jamData = allKelasData[matchedKelasKey][rute];
        if (!jamData) return null;

        // Ambil angka setelah underscore
        const jumlahKursi = parseInt(matchedKelasKey.split("_")[1], 10);

        // Ubah hasil jadwal agar menyertakan jumlah kursi
        const jadwalWithKursi = Object.entries(jamData).map(
          ([jam, seats]) =>
            [jam, seats, jumlahKursi] as [string, number[], number]
        );

        return {
          nama_bus: bus.nama_bus,
          jadwal: jadwalWithKursi,
        };
      })
      .filter(Boolean);

    setFilterDataBookingBus(result);
    setSelectedSeats([]);
  };

  // Filter Denah Kursi
  const getDenahKursi_Fitur = (
    namaBus: string | null,
    jenisBus: string | null,
    jumlahKursi: number | null
  ) => {
    const perusahaan = dataBus.data.find(
      (item: any) => item.nama_bus === namaBus
    );
    if (!perusahaan) return;

    const bus = perusahaan.listBus.find(
      (item: any) =>
        item.jenisBus === jenisBus?.toLocaleLowerCase() &&
        item.jumlahKursi === jumlahKursi
    );
    if (bus) {
      setDenahKursi(bus.denahKursi);
      setFiturBus(bus.fitur);
    }
  };

  // Filter Tarif Bus
  const tarifBusPerKM = dataBus.data
    .find((namaBrand) => namaBrand.nama_bus === watch("namaBus"))
    ?.listBus.find((bus) => bus.jenisBus === watch("jenisBus"))?.tarifPerKM;

  // const/let
  const titikJemput = watch("titikJemput");
  const titikTujuan = watch("titikTujuan");
  const ruteForUserFrom = ruteForUser?.[pagRute]?.from?.loc || "";
  const ruteForUserTo = ruteForUser?.[pagRute]?.to?.loc || "";
  const iconsFitur = [
    { name: "AC", icon: <TbAirConditioning /> },
    { name: "Kipas", icon: <TbCarFan /> },
    { name: "Musik", icon: <HiOutlineMusicNote /> },
    { name: "Stop Kontak", icon: <PiPlugCharging /> },
    { name: "WiFi", icon: <IoIosWifi /> },
  ];

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
      setValue("tanggalJemput", null);
      setValue("jenisBus", null);
      setValue("jamBerangkat", null);
      setFilterDataBookingBus([]);
      setSelectedSeats([]);
      return;
    }
    if (navigasi === "Bayar") {
      setNavigasi("Bus");
      setIsOpenRute(false);
      setPopUp(false);
      setLayananBus(null);
      setValue("namaBus", null);
      setSelectedPlatNomor(null);
      handleDeleteMarkerBus();
      handleCloseRedDotBus();
      setOpenListBus(null);
      setValue("tanggalJemput", null);
      setValue("jenisBus", null);
      setValue("platNomor", null);
      setValue("jamBerangkat", null);
      setValue("nomorKursi", null);
      setFilterDataBookingBus([]);
      setSelectedSeats([]);
      setLayananBusBooking("Tanggal&JenisBus");
      if (titikJemput) {
        handleFocus({ koordinat: titikJemput, zoom: 11 });
      }
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
                ? "h-[300px]"
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
                <div className="flex justify-between items-start">
                  <div className="flex justify-end">
                    <MdCancelPresentation className="text-3xl text-[#121418]" />
                  </div>
                  <div className="flex gap-x-1">
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
                      setValue("jenisBus", null);
                      setValue("platNomor", null);
                      setValue("jamBerangkat", null);
                      setFilterDataBookingBus([]);
                      setSelectedSeats([]);
                      setLayananBusBooking("Tanggal&JenisBus");
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
                    <div className="flex flex-col gap-y-5 mt-3 overflow-y-auto h-[140px]">
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
                                      <span>{`${bus.jenisBus.toUpperCase()} [${
                                        bus.platNomor
                                      }]`}</span>
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
                                            setSelectedSeats(bus.kursiTerisi);
                                            setJumlahKursiBus(bus.jumlahKursi);
                                            setValue("jenisBus", bus.jenisBus);
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
                        className={`text-[#1A443B] w-full py-3  text-xl rounded-3xl ${
                          selectedPlatNomor
                            ? "bg-[#35F9D1] font-bold"
                            : "bg-[#25b498]"
                        }`}
                        disabled={!selectedPlatNomor}
                        onClick={() => {
                          setPopUp(true);
                          getDenahKursi_Fitur(
                            watch("namaBus"),
                            watch("jenisBus"),
                            jumlahKursiBus ?? null
                          );
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
                    <div className="flex flex-col gap-y-5 mt-3 overflow-y-auto h-[140px]">
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
                                className="flex justify-between items-center border-b text-lg"
                              >
                                <div className="flex flex-col gap-y-2">
                                  <div>BUS {item.nama_bus.toUpperCase()} </div>
                                  <div>{`${item.jenisBus.toUpperCase()} [${
                                    item.platNomor
                                  }]`}</div>
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
                                      setJumlahKursiBus(item.jumlahKursi);
                                      setSelectedSeats(item.kursiTerisi);
                                      setValue("namaBus", item.nama_bus);
                                      setValue("jenisBus", item.jenisBus);
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
                          selectedPlatNomor
                            ? "bg-[#35F9D1] font-bold"
                            : "bg-[#25b498]"
                        }`}
                        disabled={!selectedPlatNomor}
                        onClick={() => {
                          setPopUp(true);
                          getDenahKursi_Fitur(
                            watch("namaBus"),
                            watch("jenisBus"),
                            jumlahKursiBus ?? null
                          );
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
                    <div className="overflow-y-auto mt-3 h-[140px]">
                      {layananBusBooking === "Tanggal&JenisBus" && (
                        <div>
                          <div>PILIH TANGGAL:</div>
                          <div className="flex justify-between mt-1 gap-x-2">
                            {tanggalKedepan.map((tanggal, idx) => (
                              <div
                                key={idx}
                                className={`${
                                  watch("tanggalJemput") === tanggal
                                    ? "bg-[#35F9D1] font-bold"
                                    : "bg-[#25b498]"
                                } w-full text-center py-1 rounded-sm text-[#1A443B]`}
                                onClick={() => {
                                  setValue("tanggalJemput", tanggal);
                                }}
                              >
                                {tanggal}
                              </div>
                            ))}
                          </div>
                          <div className="mt-3">PILIH JENIS BUS:</div>
                          <div className="flex justify-between mt-1 gap-x-2">
                            {jenisBusList.map((jenisBus, idx) => (
                              <div
                                key={idx}
                                className={`${
                                  watch("jenisBus") === jenisBus
                                    ? "bg-[#35F9D1] font-bold"
                                    : "bg-[#25b498]"
                                } w-full text-center py-1 rounded-sm text-[#1A443B]`}
                                onClick={() => {
                                  setValue("jenisBus", jenisBus);
                                }}
                              >
                                <div>{jenisBus}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {layananBusBooking === "NamaBus&Waktu" && (
                        <div className="flex flex-col gap-y-5 mt-3 overflow-y-auto h-[200px]">
                          {filterDataBookingBus &&
                            filterDataBookingBus.map((item, idx) => (
                              <div key={idx}>
                                <div
                                  className="bg-[#35F9D1] font-bold text-[#1A443B] p-2 text-xl rounded-lg w-full flex items-center justify-between"
                                  onClick={() => {
                                    toggleOpenListBus(idx);
                                    setValue("namaBus", item?.nama_bus ?? null);
                                  }}
                                >
                                  <div>
                                    BUS {item?.nama_bus.toLocaleUpperCase()}
                                  </div>
                                  <div>{openListBus === idx ? "▲" : "▼"}</div>
                                </div>
                                {openListBus === idx && (
                                  <ul className="flex flex-col gap-y-1 mt-2 text-xl px-2">
                                    {item?.jadwal.map((bus, i) => (
                                      <li key={i} className="border-b-2 pb-1">
                                        <label className="cursor-pointer flex justify-between">
                                          <span>{bus[0]}</span>{" "}
                                          <input
                                            type="radio"
                                            name="jamBerangkat"
                                            className="w-6 h-6"
                                            onChange={() => {
                                              setValue("jamBerangkat", bus[0]);
                                              setSelectedSeats(bus[1]);
                                              setJumlahKursiBus(bus[2]);
                                            }}
                                          />
                                        </label>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                    <div className="mt-4">
                      {layananBusBooking === "Tanggal&JenisBus" && (
                        <button
                          type="button"
                          className={` text-[#1A443B] w-full py-3  text-xl rounded-3xl ${
                            watch("tanggalJemput") && watch("jenisBus")
                              ? "bg-[#35F9D1] font-bold"
                              : "bg-[#25b498]"
                          }`}
                          disabled={
                            !watch("tanggalJemput") || !watch("jenisBus")
                          }
                          onClick={() => {
                            setLayananBusBooking("NamaBus&Waktu");
                            handleFilterDataBookingBus(
                              watch("tanggalJemput"),
                              watch("jenisBus")
                            );
                          }}
                        >
                          LANJUT
                        </button>
                      )}
                      {layananBusBooking === "NamaBus&Waktu" && (
                        <div className="flex gap-x-2">
                          <button
                            type="button"
                            className="bg-[#07362D] py-2 rounded-lg"
                            onClick={() => {
                              setLayananBusBooking("Tanggal&JenisBus");
                              setValue("jamBerangkat", null);
                              setOpenListBus(null);
                              setFilterDataBookingBus([]);
                              setSelectedSeats([]);
                              setDenahKursi([]);
                            }}
                          >
                            <IoIosArrowBack className="text-[#35F9D1] text-4xl" />
                          </button>
                          <button
                            type="button"
                            className={`text-[#1A443B] w-full py-3 text-xl rounded-lg ${
                              watch("jamBerangkat")
                                ? "bg-[#35F9D1] font-bold"
                                : "bg-[#25b498]"
                            }`}
                            disabled={!watch("jamBerangkat")}
                            onClick={() => {
                              getDenahKursi_Fitur(
                                watch("namaBus"),
                                watch("jenisBus"),
                                jumlahKursiBus ?? null
                              );
                              setPopUp(true);
                            }}
                          >
                            PILIH KURSI & LANJUT
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {/* Pop Up Pilih Kursi */}
                {popUp && (
                  <div
                    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
                    onClick={() => {
                      setPopUp(false);
                      setValue("nomorKursi", null);
                    }}
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
                        <button
                          type="button"
                          onClick={() => {
                            setPopUp(false);
                            setValue("nomorKursi", null);
                          }}
                        >
                          <MdCancelPresentation className="text-2xl text-gray-700" />
                        </button>
                      </div>

                      {/* Denah kursi berdasarkan layout bus */}
                      <div className="flex flex-col gap-2 mb-3 border-2 p-2 border-gray-500 rounded-lg">
                        {denahKursi.map((row, rowIndex) => (
                          <div
                            key={rowIndex}
                            className={`grid ${
                              watch("jenisBus")?.toLocaleLowerCase() ===
                              "medium+"
                                ? "grid-cols-5"
                                : "grid-cols-4"
                            }  gap-2`}
                          >
                            {row.map((item, colIndex) => {
                              const key = `${rowIndex}-${colIndex}`;

                              // Skip driver kedua (-1) agar tidak dirender dua kali
                              if (
                                item === -1 &&
                                colIndex > 0 &&
                                row[colIndex - 1] === -1
                              ) {
                                return null;
                              }

                              let content = "";
                              let bgColor = "bg-white";
                              let colSpan = "";
                              let isClickable = false;

                              const selected = watch("nomorKursi");
                              const isSeat = item > 0;
                              const isTaken = selectedSeats.includes(item);

                              if (item === -1) {
                                content = "Driver";
                                bgColor = "bg-orange-500 text-white";
                                colSpan = "col-span-2";
                              } else if (item === 0) {
                                // ruang kosong
                                bgColor = "bg-gray-200";
                              } else if (isSeat) {
                                content = item.toString();

                                if (isTaken) {
                                  bgColor = "bg-red-500 text-white";
                                  isClickable = false;
                                } else {
                                  isClickable = true;
                                  bgColor =
                                    item.toString() === selected
                                      ? "bg-blue-500 text-white"
                                      : "bg-green-500 text-white";
                                }
                              }

                              return (
                                <div
                                  key={key}
                                  className={`h-12 flex items-center justify-center rounded ${bgColor} ${colSpan} ${
                                    isClickable
                                      ? "cursor-pointer"
                                      : "cursor-not-allowed"
                                  }`}
                                  onClick={() => {
                                    if (isClickable) {
                                      setValue("nomorKursi", item.toString());
                                    }
                                  }}
                                >
                                  {content}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>

                      <div className="text-black font-bold text-center mb-2">
                        FITUR BUS:
                      </div>
                      <div className="flex gap-4 text-4xl justify-between mb-3">
                        {iconsFitur.map((item) => {
                          const isActiveFitur = fiturBus.includes(item.name);
                          return (
                            <div
                              key={item.name}
                              className={`border-2 rounded-sm ${
                                isActiveFitur
                                  ? "text-blue-500 border-blue-500"
                                  : "text-gray-400 border-gray-400"
                              }`}
                              title={item.name}
                            >
                              {item.icon}
                            </div>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        className={`text-[#1A443B] w-full py-3 text-xl rounded-3xl ${
                          watch("nomorKursi")
                            ? "bg-[#35F9D1] font-bold"
                            : "bg-[#25b498]"
                        }`}
                        onClick={() => {
                          setIsOpenRute(true);
                          handleDeleteMarkerBus();
                          handleCloseRedDotBus();
                          setNavigasi("Bayar");
                          handleJarakTempuh({
                            titikJemput: watch("titikJemput"),
                            titikTujuan: watch("titikTujuan"),
                          });
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
                <p className="pb-2">Rute: {watch("rute")}</p>
                <p className="pb-2">Lokasi Jemput: {watch("detailJemput")}</p>
                <p className="pb-2">Lokasi Tujuan: {watch("detailTujuan")}</p>
                <p className="pb-2">
                  Nama Bus: BUS {watch("namaBus")?.toLocaleUpperCase()}{" "}
                  {`[ ${watch("platNomor")} ]`}
                </p>
                <p className="pb-2">
                  Jenis Bus: {watch("jenisBus")?.toLocaleUpperCase()} | No.
                  Kursi: {watch("nomorKursi")}
                </p>
                <p className="pb-2">Tarif Bus per km: Rp. {tarifBusPerKM},-</p>
                <p className="pb-2">Jarak Tempuh: {jarakTempuh} km</p>
                <p className="pb-2">Fee Pelayanan: Rp.1000,-</p>
                <p className="pb-2">
                  Total Harga: Rp.
                  {(jarakTempuh ?? 0) * (tarifBusPerKM ?? 0) + 1000},-
                </p>
              </div>
              <div className="mt-5">
                <button
                  type="button"
                  className={`text-[#1A443B] w-full py-3  text-xl rounded-3xl bg-[#35F9D1] font-bold`}
                  onClick={() => setShowQris(true)}
                >
                  BAYAR Rp.{(jarakTempuh ?? 0) * (tarifBusPerKM ?? 0) + 1000},-
                </button>
              </div>
              {showQris && <QrisPopup />}
            </div>
          )}
        </form>
      </div>
      <DynamicMap
        navigasi={navigasi}
        mapRef={mapRef}
        routingRef={routingRef}
        from={ruteForUser[0].from}
        to={ruteForUser[0].to}
        titikJemput={titikJemput}
      />
      {/* <MapView
        navigasi={navigasi}
        mapRef={mapRef}
        routingRef={routingRef}
        from={ruteForUser[0].from}
        to={ruteForUser[0].to}
        titikJemput={titikJemput}
      /> */}
    </div>
  );
}
