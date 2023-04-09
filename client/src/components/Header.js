import React from "react";
import MushroomLogo from '../assets/MushroomLogo.png'
import { useNavigate } from "react-router-dom";


export default function Header() {
  const navigate = useNavigate();

  function handleSplashScreen(){
    navigate("/")
  }

  return (
    <div className="h-16 w-full bg-brownshade-900 flex items-center gap-x-7">
      <img onClick={handleSplashScreen} className="w-12 h-12 pl-8" src={MushroomLogo} alt=""></img>
      <h1 className="text-white text-4xl">
        MapStory
      </h1>
    </div>
  );
}
