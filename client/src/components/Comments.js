import React from "react";
import paperPlaneIcon from "../assets/paperPlaneIcon.png"

export default function Comments() {

  function handleComment(e){
    //add comment to database
  }

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
      <div className="absolute bottom-2 left-3">
        <input className="w-[230px] h-[35px] rounded-lg shadow-lg bg-white outline-none border-none pl-2 text-base" type="text"></input>
        <img className="h-[35px] absolute bottom-0" src={paperPlaneIcon} onClick={handleComment} alt=""></img>
      </div>
    </div>
  );
}