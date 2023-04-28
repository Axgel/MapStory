import React, {useContext, useState} from "react";
import closeIcon from "../assets/closeIcon.png"
import Properties from "./Properties";
import Comments from "./Comments";
import { DetailView } from "../enums";

import { GlobalStoreContext } from '../store'

export default function MapDetailCard(props) {
  const { store } = useContext(GlobalStoreContext);
  const { mapDetails } = props;
  const [editActive, setEditActive] = useState(false);

  let propertyTabCSS = "px-9 py-2.5 font-semibold ";
  let commentTabCSS = "px-9 py-2.5 font-semibold ";
  let detailTab;

  if(store.detailView === DetailView.PROPERTIES){
    // add to properties, show properties
    propertyTabCSS += "bg-mapselectedfill";
    detailTab = <Properties />;

  } else if(store.detailView === DetailView.COMMENTS){
    commentTabCSS += "bg-mapselectedfill";
    detailTab = <Comments />;
  }

  function setDetailView(e, detailView){
    e.stopPropagation();
    store.setDetailView(detailView);
  }

  function closeDetailView(e){
    e.stopPropagation();
    store.setSelectedMap(null);
  }

  function handleToggleEdit(e){
    e.stopPropagation();
    setEditActive(true);
  }


  function handleUpdateTitle(e){
    e.stopPropagation();
    store.updateMapTitle(e.target.value);
    setEditActive(false);
  }

  function handleKeyPress(e) {
    e.stopPropagation();
    if (e.code === "Enter") {
      handleUpdateTitle(e);
    }
  }


  let titleElement = mapDetails ? <p className="text-2xl font-bold" onDoubleClick={handleToggleEdit}>{mapDetails.title}</p> : <></>
  if(editActive){
    titleElement = <input 
      id="inputNewUsername" 
      className="w-[350px] h-[35px] rounded-lg shadow-lg bg-transparent outline-none border-solid border pborder-lightgrey text-base mx-2 pl-2" 
      type="text" 
      defaultValue={mapDetails ? mapDetails.title : ""} 
      autoFocus
      onBlur={handleUpdateTitle}
      onKeyDown={handleKeyPress}
      ></input>
  }


  if(store.detailView !== DetailView.NONE){
    return (
      <div className="w-[300px] h-[550px] border-solid border flex flex-col bg-brownshade-700">
        <div className="h-12 flex items-center px-2 gap-4">
          <img src={closeIcon} alt="" onClick={closeDetailView}></img>
          {titleElement}
        </div>

        <div className="h-[1px] bg-black"></div>

        <div className="flex">
          <p className={propertyTabCSS} onClick={(e) => setDetailView(e, DetailView.PROPERTIES)}>Properties</p>
          <div className="w-[1px] bg-black"></div>
          <p className={commentTabCSS} onClick={(e) => setDetailView(e, DetailView.COMMENTS)}>Comments</p>
        </div>

        <div className="h-[1px] bg-black"></div>

        {detailTab}

      </div>
    );
  }
  return (
    <></>
  )
}
