import React, {useContext} from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../auth";
import { GlobalStoreContext } from '../store';
import { ViewMode } from "../enums";
export default function SplashScreenButtons() {
  const { auth } = useContext(AuthContext);
  const { store } = useContext(GlobalStoreContext);
  const navigate = useNavigate();

  function handleRegister(){
    navigate("/register");
  }

  function handleAbout(){
    navigate("/about");
  }

  function handleGuestAccess(){
    store.setViewMode(ViewMode.PUBLISHED);
    auth.setGuestAccess(true);
  }

  return (
    <div>
      <div className="flex items-center justify-center gap-6">
          <input onClick={handleRegister} type="submit" className="h-12 w-[150px] bg-brownshade-500 hover:bg-brownshade-600" value="Register"></input>
          <input onClick={handleGuestAccess} type="submit" className="h-12 w-[150px] bg-brownshade-500 hover:bg-brownshade-600" value="Continue as Guest"></input>
          <input onClick={handleAbout} type="submit" className="h-12 w-[150px] bg-brownshade-500 hover:bg-brownshade-600" value="About"></input>
        </div>
    </div>
  );
}