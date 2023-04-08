import React from "react";
import PersonalIcon from '../assets/PersonalIcon.png'
import PublishedIcon from '../assets/PublishedIcon.png'
import SharedIcon from '../assets/SharedIcon.png'

export default function ViewModeButtons() {
  return (
    <div className="flex gap-x-4">
      <div className="w-[50px] h-[50px] border-solid border-black rounded-lg flex justify-center">
        <img className="p-1.5" src={PersonalIcon} alt=""></img>
      </div>

      <div className="w-[50px] h-[50px] border-solid border-black rounded-lg flex justify-center">
        <img className="p-1.5" src={SharedIcon} alt=""></img>
      </div>
      
      <div className="w-[50px] h-[50px] border-solid border-black rounded-lg flex justify-center">
        <img className="p-1.5" src={PublishedIcon} alt=""></img>
      </div>
    </div>
  );
}
