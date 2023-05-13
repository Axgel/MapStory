import React from "react";
import { LogInForm } from "../forms";
import BGImage from "../assets/BGImage.png"
import { SplashScreenButtons } from "../components";

export default function SplashScreen() {

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
