import React from "react";

export default function Comments() {
  return (
    <div className="flex flex-col pl-5 pt-4 gap-2">
      <div>
        <p className="font-semibold text-base">janeD43</p>
        <p className="text-sm text-publishmodalsubtext">This is such a useful map for my history class!</p>
      </div>

      <div>
        <p className="font-semibold text-base">mcKilla6969</p>
        <p className="text-sm text-publishmodalsubtext">I wish this map had more properties about the states though</p>
      </div>

      <div>
        <p className="font-semibold text-base">janeD43</p>
        <p className="text-sm text-publishmodalsubtext">I plan on making an extension of this app soon!</p>
      </div>
    </div>
  );
}