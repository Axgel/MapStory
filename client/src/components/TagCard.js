import React from "react";
import closeIcon from "../assets/closeIcon.png";

export default function TagCard() {
  return (
    <div className="flex items-center gap-5">
      <div className="w-auto h-[25px] rounded-lg shadow-lg bg-white outline-none border-none px-2 text-lg flex justify-between items-center gap-3">
        <p className="text-sm">jSmithy123</p>
        <img className="w-[15px] h-[15px]" src={closeIcon} alt=""></img>
      </div>
    </div>

  );
}