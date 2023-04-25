import React, {useContext} from "react";
import MushroomLogo from '../assets/MushroomLogo.png'
import ProfileIcon from '../assets/ProfileIcon.png'
import { useNavigate } from "react-router-dom";
import AuthContext from "../auth";

export default function Header() {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  function handleSplashScreen(){
    navigate("/")
  }

  function handleHomeScreen(){
    navigate("/")
  }

  function toggleMenuOpen(e){
    e.stopPropagation();
    document.getElementById("profile-dd").classList.toggle("hidden");
  }

  function handleProfileScreen(){
    navigate("/profile")
  }

  function handleLogOut(){
    auth.logoutUser();
  }

  return (
    <div className="h-16 w-full bg-brownshade-900 flex items-center justify-between min-w-[1120px]">
      <div className="flex items-center gap-x-7">
        <img onClick={handleSplashScreen} className="w-12 h-12 pl-8" src={MushroomLogo} alt=""></img>
        <h1 className="text-white text-4xl">
          MapStory
        </h1>
      </div>
      <div className="w-[50px] h-[50px] mx-12 rounded-full bg-white flex flex-row-reverse z-50">
        <img id="profileIcon" onClick={toggleMenuOpen} className="w-12 h-12" src={ProfileIcon} alt=""></img>
        <div id="profile-dd" className="absolute w-[150px] mt-[55px] rounded-lg bg-white hidden">
          <p onClick={handleProfileScreen} className="text-left px-3 py-3 hover:bg-dropdownhover rounded-tl-lg rounded-tr-lg">Profile</p>
          <p onClick={handleHomeScreen} className="text-left px-3 py-3 hover:bg-dropdownhover">Home</p>
          <p onClick={handleLogOut} className="text-left px-3 py-3 hover:bg-dropdownhover rounded-bl-lg rounded-br-lg">Logout</p>
        </div>
      </div>
    </div>
  );
}
