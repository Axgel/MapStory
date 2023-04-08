import React from "react";
import { MapCard, Header, NavBar, MapDetailCard } from "../components";

export default function HomeScreen() {
  return (
    <div>
      <Header />
      <NavBar />
      {/* <div className="flex flex-row-reverse px-10 mt-8 min-w-[900px]">
        
      </div> */}

      <div className="flex mt-8">

        <div className="px-10 flex flex-col gap-5 min-w-max flex-grow pb-5">
          <div className="flex justify-between">
            <p className="text-3xl font-bold">Maps</p>
            <p className="w-[100px] px-5 py-2 border-solid bg-periwinkle inline rounded-lg border ml-auto">
              + Create Map
            </p>
          </div>
          <MapCard />
          <MapCard />
          <MapCard />

        </div>
        <div className="w-[300px] flex flex-col gap-5 mt-16 pr-10 sticky top-5 self-start">
          <MapDetailCard />
        </div>
      </div>
    </div>
  );
}
