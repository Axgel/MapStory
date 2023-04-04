import React, { useContext } from "react";
import { GlobalStoreContext } from "../store";
import { MenuBar } from "../components";

export default function SplashScreen() {
  const { store } = useContext(GlobalStoreContext);

  const handleClick = () => {
    store.logIn();
  };

  return (
    <div>
      <MenuBar />
      <h1>SPLASH SCREEN HERE</h1>
      <a href="/register">TO REGISTER SCREEN</a><br></br>
      <a href="/recover">TO RECOVER PASSWORD SCREEN</a><br></br>
      <a href="/profile">TO PROFILE SCREEN</a><br></br>
      <a href="/map">TO MAP SCREEN</a><br></br>

      <button type="button" onClick={handleClick}>
        LogIn!
      </button>
    </div>
  );
}
