import React, { useContext } from "react";
import PersonalIcon from '../assets/PersonalIcon.png'
import PublishedIcon from '../assets/PublishedIcon.png'
import SharedIcon from '../assets/SharedIcon.png'
import { ViewMode } from "../enums";

import { GlobalStoreContext } from '../store'
import AuthContext from "../auth";

export default function ViewModeButtons() {
  const { store } = useContext(GlobalStoreContext);
  const { auth } = useContext(AuthContext);

  let baseIconClassName = "w-[50px] h-[50px] border-solid border-black rounded-lg flex justify-center ";
  if(auth.loggedIn){
    baseIconClassName += "cursor-pointer ";
  }

  let personalIconClassName = baseIconClassName;
  let sharedIconClassName = baseIconClassName;
  let publishedIconClassName = baseIconClassName;

  if(!auth.loggedIn){
    // disable other button options
    personalIconClassName += "cursor-not-allowed opacity-30";
    sharedIconClassName += "cursor-not-allowed opacity-30";
    publishedIconClassName += "bg-periwinkle "
  } else {
    // user logged in
    switch(store.viewMode){
      case ViewMode.PERSONAL:
        personalIconClassName += "bg-periwinkle";
        break;
      case ViewMode.SHARED:
        sharedIconClassName += "bg-periwinkle";
        break;
      case ViewMode.PUBLISHED:
        publishedIconClassName += "bg-periwinkle"; 
        break;
    }
  }


  function setViewMode(e, viewMode){
    e.stopPropagation();
    store.setViewMode(viewMode);
  }

  return (
    <div className="flex gap-x-4">
      <div className={personalIconClassName} onClick={(e) => setViewMode(e, ViewMode.PERSONAL)}>
        <img id="personalMapIcon" className="p-1.5" src={PersonalIcon} alt=""></img>
      </div>

      <div className={sharedIconClassName} onClick={(e) => setViewMode(e, ViewMode.SHARED)}>
        <img id="sharedMapIcon" className="p-1.5" src={SharedIcon} alt=""></img>
      </div>
      
      <div className={publishedIconClassName} onClick={(e) => setViewMode(e, ViewMode.PUBLISHED)}>
        <img id="publishedMapIcon" className="p-1.5" src={PublishedIcon} alt=""></img>
      </div>
    </div>
  );
}
