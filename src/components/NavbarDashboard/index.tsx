"use client";

import React, { useState } from "react";
import { AiFillHome } from "react-icons/ai";
import { HiMiniTicket } from "react-icons/hi2";
import { RiDiscountPercentFill } from "react-icons/ri";
import { MdAccountCircle } from "react-icons/md";

export default function NavbarDashboard({
  isSelectedNav,
  setIsSelectedNav,
  setFlippedIndex,
}: {
  isSelectedNav: "home" | "tiketku" | "promo" | "akun";
  setIsSelectedNav: (value: "home" | "tiketku" | "promo" | "akun") => void;
  setFlippedIndex: (value: number | null) => void;
}) {
  return (
    <div className="fixed bottom-0 w-full flex items-center justify-between px-5 py-5 shadow-2xl shadow-white bg-black">
      {/* home */}
      <button
        className="flex flex-col justify-center items-center gap-y-1"
        onClick={() => {
          setIsSelectedNav("home");
          setFlippedIndex(null);
        }}
      >
        <div
          className={`${
            isSelectedNav === "home" && "bg-[#DCF3EF]"
          } p-4 rounded-full`}
        >
          <AiFillHome
            className={`text-5xl ${
              isSelectedNav === "home" && "text-[#07362D]"
            }`}
          />
        </div>
        <h1 className={`${isSelectedNav === "home" && "text-[#30E6C1]"}`}>
          Home
        </h1>
      </button>

      {/* tiketku */}
      <button
        className="flex flex-col justify-center items-center gap-y-1"
        onClick={() => {
          setIsSelectedNav("tiketku");
          setFlippedIndex(null);
        }}
      >
        <div
          className={`${
            isSelectedNav === "tiketku" && "bg-[#DCF3EF]"
          } p-4 rounded-full`}
        >
          <HiMiniTicket
            className={`text-5xl ${
              isSelectedNav === "tiketku" && "text-[#07362D]"
            }`}
          />
        </div>
        <h1 className={`${isSelectedNav === "tiketku" && "text-[#30E6C1]"}`}>
          Tiketku
        </h1>
      </button>

      {/* promo */}
      <button
        className="flex flex-col justify-center items-center gap-y-1"
        onClick={() => {
          setIsSelectedNav("promo");
          setFlippedIndex(null);
        }}
      >
        <div
          className={`${
            isSelectedNav === "promo" && "bg-[#DCF3EF]"
          } p-4 rounded-full`}
        >
          <RiDiscountPercentFill
            className={`text-5xl ${
              isSelectedNav === "promo" && "text-[#07362D]"
            }`}
          />
        </div>
        <h1 className={`${isSelectedNav === "promo" && "text-[#30E6C1]"}`}>
          Promo
        </h1>
      </button>

      {/* akun */}
      <button
        className="flex flex-col justify-center items-center gap-y-1"
        onClick={() => {
          setIsSelectedNav("akun");
          setFlippedIndex(null);
        }}
      >
        <div
          className={`${
            isSelectedNav === "akun" && "bg-[#DCF3EF]"
          } p-4 rounded-full`}
        >
          <MdAccountCircle
            className={`text-5xl ${
              isSelectedNav === "akun" && "text-[#07362D]"
            }`}
          />
        </div>
        <h1 className={`${isSelectedNav === "akun" && "text-[#30E6C1]"}`}>
          Akun
        </h1>
      </button>
    </div>
  );
}
