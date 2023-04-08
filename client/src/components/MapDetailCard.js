import React from "react";
import closeIcon from "../assets/closeIcon.png"
import Properties from "./Properties";
import Comments from "./Comments";

export default function MapDetailCard() {
  return (
    <div className="w-[300px] h-[550px] border-solid border flex flex-col bg-brownshade-700">
      <div className="h-12 flex items-center px-2 gap-10">
        <img src={closeIcon} alt=""></img>
        <p className="text-2xl font-bold">Australia 1982</p>
      </div>

      <div className="h-[1px] bg-black"></div>

      <div className="flex">
        <p className="px-9 py-2.5 font-semibold">Properties</p>
        <div className="w-[1px] bg-black"></div>
        <p className="px-9 py-2.5 font-semibold">Comments</p>
      </div>

      <div className="h-[1px] bg-black"></div>

      <div>
        <Properties />
      </div>
    </div>
  );
}
