"use client";

import BrandIcon from "@/assets/brandIcon";
import React from "react";

export default function ScreenPage() {
  return (
    <div className="flex flex-col justify-center items-center h-screen w-full">
      <div className="pb-5">
        <BrandIcon size={150} />
      </div>
      <h1 className="text-4xl font-extrabold pb-5">Trans-nyaBli</h1>
      <p className="text-3xl">Customer</p>
    </div>
  );
}
