import React from "react";

export default function SearchBy() {
  return (
    <div className="flex gap-x-4 px-8">
      <div className="w-[100px] h-[50px] rounded-lg shadow-lg bg-white flex justify-center items-center">
        Search By:
      </div>

      <input className="w-[400px] h-[50px] rounded-lg shadow-lg bg-white outline-none border-none pl-4 text-lg" type="text"></input>

    </div>
  );
}
