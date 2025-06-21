"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function QrisPopup() {
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setShowSuccess(true);
    }, 3000);

    const timer2 = setTimeout(() => {
      router.push("/");
    }, 5500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [router]);

  return (
    <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-[320px] shadow-xl text-center relative">
        {!showSuccess ? (
          <>
            <h2 className="text-xl font-semibold mb-4 text-black">
              Scan QRIS untuk Bayar
            </h2>
            <img src="/qr.png" alt="QRIS Dummy" className="mx-auto rounded" />
            <p className="text-sm mt-4 text-gray-600">
              Silakan scan QR menggunakan aplikasi pembayaran.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-black mb-2">
              ✅ Transaksi Berhasil
            </h2>
            <p className="text-black">
              Anda akan diarahkan ke halaman utama...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
