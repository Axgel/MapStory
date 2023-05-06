import React, {useContext} from "react";
import MushroomLogo from '../assets/MushroomLogo.png'
import ProfileIcon from '../assets/ProfileIcon.png'
import { useNavigate } from "react-router-dom";
import { ViewMode } from "../enums";
import AuthContext from "../auth";
import { GlobalStoreContext } from '../store'

export default function Header() {
  const { auth } = useContext(AuthContext);
  const { store } = useContext(GlobalStoreContext);
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

  function handleExit(){
    store.setViewMode(ViewMode.PERSONAL);
    auth.setGuestAccess(false);
  }

  let profileOptions = <></>
  if(auth.loggedIn) {
    profileOptions = <>
      <p onClick={handleProfileScreen} className="cursor-pointer text-left px-3 py-3 hover:bg-dropdownhover rounded-tl-lg rounded-tr-lg">Profile</p>
      {/* <p onClick={handleHomeScreen} className="cursor-pointer text-left px-3 py-3 hover:bg-dropdownhover">Home</p> */}
      <p onClick={handleLogOut} className="cursor-pointer text-left px-3 py-3 hover:bg-dropdownhover rounded-bl-lg rounded-br-lg">Logout</p>
      </>
  } else {
    profileOptions = <p onClick={handleExit} className="cursor-pointer text-left px-3 py-3 hover:bg-dropdownhover rounded-lg rounded-br-lg">Exit Guest</p>
  }

  return (
    <div className="flex-none h-16 w-full bg-brownshade-900 flex items-center justify-between min-w-[1120px]">
      <div className="flex items-center pl-8 gap-x-7">
        <img onClick={handleSplashScreen} className="cursor-pointer w-12 h-12 p-1 hover:w-14 hover:h-14 hover:p-0" src={MushroomLogo} alt=""></img>
        <h1 className="text-white text-4xl">
          MapStory
        </h1>
      </div>
      <div className="w-[55px] h-[55px] mx-12 rounded-full bg-white flex flex-row-reverse z-50">
        <img id="profileIcon" onClick={toggleMenuOpen} className="w-12 h-12 p-1 hover:w-14 hover:h-14 hover:p-0 " src={ProfileIcon} alt=""></img>
        <div id="profile-dd" className="absolute w-[100px] mt-[55px] rounded-lg bg-white hidden">
          {profileOptions}
        </div>
      </div>
    </div>
  );
}
