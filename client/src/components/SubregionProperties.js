import React from "react";
import closeIcon from "../assets/closeIcon.png"

export default function SubregionProperties() {

  
  return (
    <div className="h-48 w-80 border-solid border bg-modalbgfill">
      <p className="text-center py-1 text-lg font-semibold ">New York</p>
      <div className="flex flex-col mx-2 gap-3">
        <div className="flex gap-2 items-center border-solid border-modalborder border-opacity-60 bg-modalbgfill px-0.5 ">
          <p className="text-xs font-semibold px-2">Population</p>
          <div className="w-[1px] h-[30px] bg-black"></div>
          <div>
            <label htmlFor="email"></label>
            <input className="border-none bg-transparent outline-none  w-[160px] text-base" type="email" name="email" defaultValue="john.smith@gmail.com"></input>
          </div>
          <img className="w-[15px] h-[15px] ml-auto pr-1" src={closeIcon} alt=""></img>
        </div>


        <div className="flex gap-2 items-center border-solid border-modalborder border-opacity-60 bg-modalbgfill px-0.5 ">
          <p className="text-xs font-semibold px-2">Population</p>
          <div className="w-[1px] h-[30px] bg-black"></div>
          <div>
            <label htmlFor="email"></label>
            <input className="border-none bg-transparent outline-none  w-[160px] text-base" type="email" name="email" defaultValue="john.smith@gmail.com"></input>
          </div>
          <img className="w-[15px] h-[15px] ml-auto pr-1" src={closeIcon} alt=""></img>
        </div>

      </div>
    </div>
  );
}