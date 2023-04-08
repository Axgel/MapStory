import React from "react";

export default function SplashScreenButtons() {
  return (
    <div>
      <div className="flex items-center justify-center gap-6">
          <input type="submit" className="h-12 w-[150px] bg-brownshade-500" value="Register"></input>
          <input type="submit" className="h-12 w-[150px] bg-brownshade-500" value="Continue as Guest"></input>
          <input type="submit" className="h-12 w-[150px] bg-brownshade-500" value="About"></input>
        </div>
    </div>
  );
}