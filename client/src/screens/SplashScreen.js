import React from "react";
import { MenuBar } from "../components";

export default function SplashScreen() {
  return (
    <div>
      <MenuBar />
      <h1>SPLASH SCREEN HERE</h1>
      <a href="/register">TO REGISTER SCREEN</a><br></br>
      <a href="/home">TO HOME SCREEN</a>
    </div>
  );
}
