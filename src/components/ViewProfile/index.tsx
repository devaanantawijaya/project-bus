import React from "react";
import { IoPersonCircle } from "react-icons/io5";
import { IoChatbubbleEllipsesSharp } from "react-icons/io5";

export default function ViewProfile() {
  return (
    <div className="fixed flex bg-[#35F9D1] px-0 py-5 rounded-b-3xl justify-between items-center pl-3 pr-5 w-full top-0">
      <div className="flex items-center gap-x-1">
        <IoPersonCircle className="text-8xl text-[#1A443B]" />
        <div>
          <p className="text-[#1A443B] text-sm">{`Naik Apa Hari Ini, Bli? 👋`}</p>
          <h1 className="font-bold text-3xl text-[#1A443B]">{`Budi Awan`}</h1>
        </div>
      </div>
      <div className="bg-[#1A443B] p-3 rounded-full">
        <IoChatbubbleEllipsesSharp className="text-[#35F9D1] text-2xl" />
      </div>
    </div>
  );
}
