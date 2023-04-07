import React, { useContext } from "react";
import { GlobalStoreContext } from "../store";
import { LogInForm } from "../forms";
import BGImage from "../assets/BGImage.png"
import { SplashScreenButtons } from "../components";

export default function SplashScreen() {
  const { store } = useContext(GlobalStoreContext);

  return (
    <div className="">
      <div className="flex flex-col items-center gap-y-10">
        <h1 className="text-white text-6xl my-20">
          MapStory
        </h1>
        <img src={BGImage} alt=""/>
        <LogInForm />
        <SplashScreenButtons />
      </div>
    </div>
  );
}
