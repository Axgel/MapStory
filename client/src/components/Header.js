import React from "react";
import MushroomLogo from '../assets/MushroomLogo.png'

export default function Header() {
  return (
    <div className="h-16 w-full bg-brownshade-900 flex items-center gap-x-7">
      <img className="w-12 h-12 pl-8" src={MushroomLogo} alt=""></img>
      <h1 className="text-white text-4xl">
        MapStory
      </h1>
    </div>
  );
}
