import React, { useContext } from "react";
import { GlobalStoreContext } from "../store";

export default function AllScreen() {
  const { store } = useContext(GlobalStoreContext);

  const handleClick = () => {
    if (store.loggedIn) {
      store.logOut();
    } else {
      store.logIn();
    }
  };

  return (
    <div className="bg-gradient-to-b from-brownshade-500 via-brownshade-200 via-50% to-brownshade-100 to-90% h-screen">
      <h1>Access all screens here</h1>
      <a href="/">TO SPLASH SCREEN</a>
      <br></br>
      <a href="/home">TO HOME SCREEN</a>
      <br></br>
      <a href="/register">TO REGISTER SCREEN</a>
      <br></br>
      <a href="/recover">TO RECOVER PASSWORD SCREEN</a>
      <br></br>
      <a href="/profile">TO PROFILE SCREEN</a>
      <br></br>
      <a href="/map">TO MAP SCREEN</a>
      <br></br>
    </div>
  );
}
