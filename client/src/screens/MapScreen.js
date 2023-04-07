import React from "react";
import { MapCard, Header, NavBar } from "../components";

export default function MapScreen() {
  return (
    <div>
      <Header />
      <NavBar />
      <div className="flex flex-row-reverse px-10 mt-8">
        <p className="px-5 py-2 border-solid bg-periwinkle inline rounded-lg border">
          + Create Map
        </p>
      </div>

      <div className="px-10 flex flex-col gap-5">
        <p className="text-3xl font-bold">Maps</p>
        <MapCard />
        <MapCard />
        <MapCard />
      </div>

    </div>
  );
}
