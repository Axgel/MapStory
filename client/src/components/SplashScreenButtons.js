import React from "react";
import { useNavigate } from "react-router-dom";

export default function SplashScreenButtons() {
  const navigate = useNavigate();

  function handleRegister(){
    navigate("/register");
  }

  function handleHome(){
    navigate("/");
  }

  return (
    <div>
      <div className="flex items-center justify-center gap-6">
          <input onClick={handleRegister} type="submit" className="h-12 w-[150px] bg-brownshade-500" value="Register"></input>
          <input onClick={handleHome} type="submit" className="h-12 w-[150px] bg-brownshade-500" value="Continue as Guest"></input>
          <input type="submit" className="h-12 w-[150px] bg-brownshade-500" value="About"></input>
        </div>
    </div>
  );
}