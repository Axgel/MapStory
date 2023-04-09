import React from "react";
import closeIcon from "../assets/closeIcon.png";

export default function CollaboratorCard() {
  return (
    <div className="flex items-center gap-5">
    <div className="w-[280px] h-[40px] rounded-lg shadow-lg bg-white outline-none border-none px-4 my-1 text-lg flex justify-between items-center">
      <div className="flex flex-col items-start">
        <p className="text-sm">jSmithy123</p>
        <p className="text-lightgrey text-xs">jsmithy3@gmail.com</p>
      </div>
      <div>
        <p className="text-base text-lightgrey">Owner</p>
      </div>
    </div>
      <img className="w-[25px] h-[25px]" src={closeIcon} alt=""></img>
    </div>
  );
}