"use client";

import Map from "@/components/Map";
import React from "react";

export default function TryMap() {
  return (
    <div>
      <Map
        center={{
          lat: -8.356987,
          lng: 114.620484,
        }}
        from={{
          lat: -8.177741,
          lng: 114.437648,
        }}
        to={{
          lat: -8.635151,
          lng: 115.206792,
        }}
      />
    </div>
  );
}
