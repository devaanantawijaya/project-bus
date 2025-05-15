import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { setToLocalStorage } from "@/utils/localStorage";

interface IUseMaps {
  center: { lat: number; lng: number };
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  userLocation: { lat: number; lng: number };
  navigasi: "Rute" | "Jemput" | "Tujuan" | "Bus" | null;
  listBus: DataBus[];
}

interface LokasiBus {
  lat: number;
  lng: number;
}

interface PlatBus {
  nomorBus: string;
  lokasiBus: LokasiBus;
  lokasiBusTrue: boolean;
}

interface DataBus {
  nama_bus: string;
  platBus: PlatBus[];
}

export default function UseMap({
  center,
  from,
  to,
  userLocation,
  navigasi,
  listBus,
}: IUseMaps) {
  const mapRef = useRef<L.Map | null>(null);
  const routingRef = useRef<L.Routing.Control | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const selectedMarkerRef = useRef<L.Marker | null>(null);
  const [selectedLocationJemput, setSelectedLocationJemput] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedLocationTujuan, setSelectedLocationTujuan] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [koordinatAwal, setKoordinatAwal] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [updateListBus, setUpdateListBus] = useState(listBus);

  // Rute: Trigger Fokus ke Rute
  const ChangeRute = ({
    from,
    to,
    center,
  }: {
    from: { lat: number; lng: number };
    to: { lat: number; lng: number };
    center: { lat: number; lng: number };
  }) => {
    if (routingRef.current) {
      routingRef.current.setWaypoints([
        L.latLng(from.lat, from.lng),
        L.latLng(to.lat, to.lng),
      ]);
    }
    mapRef.current?.setView([center.lat, center.lng], 10);
  };

  // Rute: Trigger Fokus ke User
  const userFocus = ({ zoom }: { zoom: number }) => {
    mapRef.current?.setView([userLocation?.lat, userLocation?.lng], zoom);
  };

  // Rute: Awal Render Munculin Peta dan fokus ke user
  useEffect(() => {
    if (!mapRef.current && userLocation && navigasi === "Rute") {
      // Awal Render Fokus ke User Dulu
      mapRef.current = L.map("map", {
        center: [userLocation.lat, userLocation.lng],
        zoom: 11,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
      }).addTo(mapRef.current);

      routingRef.current = L.Routing.control({
        waypoints: [L.latLng(from.lat, from.lng), L.latLng(to.lat, to.lng)],
        show: false, // Menyembunyikan panel rute
        createMarker: () => null, // Menghilangkan marker titik awal & tujuan
        lineOptions: {
          styles: [{ color: "#007bff", weight: 5 }], // Warna dan ketebalan garis rute
        },
      }).addTo(mapRef.current);
    }
  }, [userLocation]);

  // Rute: Awal Render Fokus ke User
  useEffect(() => {
    if (mapRef.current && userLocation && navigasi === "Rute") {
      // 🔹 Hapus marker jemput jika ada
      if (selectedMarkerRef.current) {
        mapRef.current.removeLayer(selectedMarkerRef.current);
        selectedMarkerRef.current = null;
      }
      // 🔹 Tampilkan marker userLocation
      if (!markerRef.current) {
        markerRef.current = L.marker([userLocation.lat, userLocation.lng], {
          icon: L.icon({
            iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
            iconSize: [30, 30],
            iconAnchor: [15, 30],
          }),
        }).addTo(mapRef.current);
      } else {
        markerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      }
    } else {
      // 🔹 Jika navigasi bukan "Rute", hapus marker userLocation
      if (markerRef.current) {
        mapRef.current?.removeLayer(markerRef.current);
        markerRef.current = null;
      }
    }
  }, [userLocation, navigasi]);

  // Rute: Fokus ke User saat Back
  useEffect(() => {
    if (navigasi === "Rute" && userLocation) {
      setTimeout(() => {
        mapRef.current?.setView([userLocation?.lat, userLocation?.lng], 11);
      }, 500); // Tunggu 500ms sebelum mengubah tampilan peta
    }
  }, [navigasi, userLocation]);

  // Jemput: Awal Jemput Fokus ke User lalu Pilih Lokasi Jemput
  useEffect(() => {
    const map = mapRef.current;

    // Fokus ke lokasi user saat navigasi = Jemput
    if (navigasi === "Jemput" && userLocation && map) {
      setTimeout(() => {
        // Jika reset atau pertama kali masuk, fokus ke userLocation
        if (!selectedLocationJemput) {
          map.setView([userLocation.lat, userLocation.lng], 14);
        }

        // Jika marker belum ada atau setelah reset, buat ulang marker di userLocation
        if (!markerRef.current || selectedLocationJemput === null) {
          if (markerRef.current) {
            markerRef.current.remove(); // Hapus marker lama jika ada
          }
          markerRef.current = L.marker([userLocation.lat, userLocation.lng], {
            icon: L.icon({
              iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
              iconSize: [30, 30],
              iconAnchor: [15, 30],
            }),
          }).addTo(map);
        }

        // Set listener untuk pergerakan peta hanya jika navigasi = Jemput
        if (!selectedLocationJemput) {
          map.on("move", () => {
            if (markerRef.current) {
              const viewCenter = map.getCenter();
              markerRef.current.setLatLng([viewCenter.lat, viewCenter.lng]); // Update posisi marker di tengah
            }
          });
        }
      }, 500);
    }

    // Bersihkan listener saat komponen unmount atau navigasi berubah
    return () => {
      if (map) {
        map.off("move"); // Menghapus event listener ketika komponen unmount atau navigasi berubah
      }
    };
  }, [navigasi, userLocation, selectedLocationJemput]); // Trigger effect saat navigasi atau userLocation berubah

  // Button Pilih Lokasi Penjemputan
  const handleLokasiJemput = () => {
    if (mapRef.current && navigasi === "Jemput") {
      const getLokasiJemput = mapRef.current.getCenter();

      const location = {
        lat: getLokasiJemput.lat,
        lng: getLokasiJemput.lng,
      }

      setSelectedLocationJemput(location); // Simpan lokasi saat tombol ditekan

      setToLocalStorage("titikJemput", location);

      // Update posisi marker ke lokasi yang dipilih
      if (markerRef.current) {
        markerRef.current.setLatLng([getLokasiJemput.lat, getLokasiJemput.lng]);
      }

      // Setelah lokasi dipilih, matikan listener "move"
      mapRef.current.off("move");
    }
  };

  // Trigger Fokus ke Lokasi Penjemputan
  const focusSelectedLocationJemput = () => {
    if (selectedLocationJemput) {
      mapRef.current?.setView(
        [selectedLocationJemput?.lat, selectedLocationJemput?.lng],
        14
      );
    }
  };

  // Tujuan: Awal Jemput Fokus ke Center Rute lalu Pilih Lokasi Tujuan
  useEffect(() => {
    const map = mapRef.current;

    // Fokus ke lokasi user saat navigasi = Jemput
    if (navigasi === "Tujuan" && center && map) {
      setTimeout(() => {
        // Jika reset atau pertama kali masuk, fokus ke userLocation
        if (!selectedLocationTujuan) {
          map.setView([center.lat, center.lng], 10);
        }

        // Jika marker belum ada atau setelah reset, buat ulang marker di userLocation
        if (!markerRef.current || selectedLocationTujuan === null) {
          if (markerRef.current) {
            markerRef.current.remove(); // Hapus marker lama jika ada
          }
          markerRef.current = L.marker([center.lat, center.lng], {
            icon: L.icon({
              iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
              iconSize: [30, 30],
              iconAnchor: [15, 30],
            }),
          }).addTo(map);
        }

        // Set listener untuk pergerakan peta hanya jika navigasi = Tujuan
        if (!selectedLocationTujuan) {
          map.on("move", () => {
            if (markerRef.current) {
              const viewCenter = map.getCenter();
              markerRef.current.setLatLng([viewCenter.lat, viewCenter.lng]); // Update posisi marker di tengah
            }
          });
        }
      }, 500);
    }

    // Bersihkan listener saat komponen unmount atau navigasi berubah
    return () => {
      if (map) {
        map.off("move"); // Menghapus event listener ketika komponen unmount atau navigasi berubah
      }
    };
  }, [navigasi, center, selectedLocationTujuan]); // Trigger effect saat navigasi atau center berubah

  // Button Pilih Lokasi Tujuan
  const handleLokasiTujuan = () => {
    if (mapRef.current && navigasi === "Tujuan") {
      const getLokasiTujuan = mapRef.current.getCenter();
      setSelectedLocationTujuan({
        lat: getLokasiTujuan.lat,
        lng: getLokasiTujuan.lng,
      }); // Simpan lokasi saat tombol ditekan

      // Update posisi marker ke lokasi yang dipilih
      if (markerRef.current) {
        markerRef.current.setLatLng([getLokasiTujuan.lat, getLokasiTujuan.lng]);
      }

      // Setelah lokasi dipilih, matikan listener "move"
      mapRef.current.off("move");
    }
  };

  // Trigger Fokus kembali ke Rute Tujuan
  const focusRuteTujuan = () => {
    mapRef.current?.setView([center?.lat, center?.lng], 10);
  };

  // Trigger Fokus ke Lokasi Tujuan
  const focusSelectedLocationTujuan = () => {
    if (selectedLocationTujuan) {
      mapRef.current?.setView(
        [selectedLocationTujuan?.lat, selectedLocationTujuan?.lng],
        14
      );
    }
  };

  // Bus: Fokus ke User saat Mau pilih Layanan Bus
  useEffect(() => {
    if (navigasi === "Bus" && selectedLocationJemput) {
      setTimeout(() => {
        const { lat, lng } = selectedLocationJemput;
        const map = mapRef.current;

        if (map) {
          map.setView([lat, lng], 11);

          // Buat custom icon
          const customIcon = L.icon({
            iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
            iconSize: [32, 32],
            iconAnchor: [16, 32],
          });

          // Hapus marker lama kalau ada
          if (markerRef.current) {
            markerRef.current.remove();
          }

          // Buat marker baru dan simpan di ref
          markerRef.current = L.marker([lat, lng], { icon: customIcon }).addTo(
            map
          );
        }
      }, 500);
    }
  }, [navigasi, selectedLocationJemput]);

  // true false lokasi list bus
  // const updateLokasiBusTrue = () => {
  //   if (mapRef.current && koordinatAwal && selectedLocationJemput) {
  //     const routing = L.Routing.osrmv1(); // Engine routing default

  //     routing.route(
  //       [
  //         L.Routing.waypoint(L.latLng(koordinatAwal.lat, koordinatAwal.lng)),
  //         L.Routing.waypoint(
  //           L.latLng(selectedLocationJemput.lat, selectedLocationJemput.lng)
  //         ),
  //       ],
  //       (err, routes) => {
  //         if (!err && routes && routes.length > 0) {
  //           const routeCoords = routes[0].coordinates;

  //           const updatedBus = listBus.map((bus) => ({
  //             ...bus,
  //             platBus: bus.platBus.map((plat) => {
  //               const isTrue = isNearRoute(routeCoords, plat.lokasiBus, 100);
  //               return {
  //                 ...plat,
  //                 lokasiBusTrue: isTrue,
  //               };
  //             }),
  //           }));

  //           setUpdateListBus(updatedBus);
  //         } else {
  //           console.error("❌ Gagal menghitung rute:", err);
  //         }
  //       }
  //     );
  //   } else {
  //     console.warn("❌ Ada data yang belum tersedia:", {
  //       mapRef: mapRef.current,
  //       koordinatAwal,
  //       selectedLocationJemput,
  //     });
  //   }

  //   const isNearRoute = (routeCoords, checkLatLng, maxDistanceMeters = 100) => {
  //     return routeCoords.some((point) => {
  //       const dist = L.latLng(point.lat, point.lng).distanceTo(
  //         L.latLng(checkLatLng.lat, checkLatLng.lng)
  //       );
  //       return dist <= maxDistanceMeters;
  //     });
  //   };
  // };

  const updateLokasiBusTrue = () => {
    if (mapRef.current && koordinatAwal && selectedLocationJemput) {
      const routing = L.Routing.osrmv1();

      routing.route(
        [
          L.Routing.waypoint(L.latLng(koordinatAwal.lat, koordinatAwal.lng)),
          L.Routing.waypoint(
            L.latLng(selectedLocationJemput.lat, selectedLocationJemput.lng)
          ),
        ],
        (err, routes) => {
          if (!err && routes && routes.length > 0) {
            const routeCoords = routes[0].coordinates;

            const userLatLng = L.latLng(
              selectedLocationJemput.lat,
              selectedLocationJemput.lng
            ); // lokasi user

            const updatedBus = listBus.map((bus) => ({
              ...bus,
              platBus: bus.platBus.map((plat) => {
                const isTrue = isNearRoute(routeCoords, plat.lokasiBus, 100);

                const busLatLng = L.latLng(
                  plat.lokasiBus.lat,
                  plat.lokasiBus.lng
                );
                const jarak = userLatLng.distanceTo(busLatLng) / 1000; // meter to kilometer

                return {
                  ...plat,
                  lokasiBusTrue: isTrue,
                  jarakDenganUser: parseFloat(jarak.toFixed(2)), // misalnya: 3.75
                };
              }),
            }));

            setUpdateListBus(updatedBus);
          } else {
            console.error("❌ Gagal menghitung rute:", err);
          }
        }
      );
    } else {
      console.warn("❌ Ada data yang belum tersedia:", {
        mapRef: mapRef.current,
        koordinatAwal,
        selectedLocationJemput,
      });
    }

    const isNearRoute = (routeCoords, checkLatLng, maxDistanceMeters = 100) => {
      return routeCoords.some((point) => {
        const dist = L.latLng(point.lat, point.lng).distanceTo(
          L.latLng(checkLatLng.lat, checkLatLng.lng)
        );
        return dist <= maxDistanceMeters;
      });
    };
  };

  // Fokus ke Bus
  const busFocus = ({
    koordinat,
  }: {
    koordinat: { lat: number; lng: number };
  }) => {
    if (!mapRef.current) return;

    // Hapus marker lama
    if (markerRef.current) {
      mapRef.current.removeLayer(markerRef.current);
    }

    // Buat custom icon
    const busIcon = L.icon({
      iconUrl: "https://cdn-icons-png.flaticon.com/512/3448/3448339.png", // ganti dengan link kamu
      iconSize: [40, 40], // ukuran ikon [width, height]
      iconAnchor: [20, 40], // titik anchor (biasanya bagian bawah ikon)
    });

    // Buat marker baru pakai icon
    const newMarker = L.marker([koordinat.lat, koordinat.lng], {
      icon: busIcon,
    });

    // Tambah ke peta dan simpan ke ref
    newMarker.addTo(mapRef.current);
    markerRef.current = newMarker;

    // Fokus ke lokasi
    mapRef.current.setView([koordinat.lat, koordinat.lng], 14);
  };

  return {
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
    updateLokasiBusTrue,
    updateListBus,
    busFocus,
    koordinatAwal,
  };
}
