import MapPicture from "@/assets/mapPicture";
import React from "react";

export default function LocationPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full px-5">
      <div className="pb-20">
        <MapPicture width={263} height={231} />
      </div>
      <h1 className="text-2xl font-bold text-[#35F9D1] pb-5">
        Enable location
      </h1>
      <p className="px-10 text-center pb-5">
        To enable location, show we will know your location
      </p>
      <button className="w-full bg-[#35F9D1] font-bold text-[#1A443B] py-3 rounded-xl text-xl">
        Enable
      </button>
    </div>
  );
}
