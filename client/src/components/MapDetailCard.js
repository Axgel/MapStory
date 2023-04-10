import React, {useContext} from "react";
import closeIcon from "../assets/closeIcon.png"
import Properties from "./Properties";
import Comments from "./Comments";
import { DetailView } from "../enums";

import { GlobalStoreContext } from '../store'
import AuthContext from "../auth";

export default function MapDetailCard(props) {
  const { store } = useContext(GlobalStoreContext);
  const { auth } = useContext(AuthContext);
  const { mapDetails } = props;

  let propertyTabCSS = "px-9 py-2.5 font-semibold ";
  let commentTabCSS = "px-9 py-2.5 font-semibold ";
  let detailTab;

  if(store.detailView == DetailView.PROPERTIES){
    // add to properties, show properties
    propertyTabCSS += "bg-mapselectedfill";
    detailTab = <Properties />;

  } else if(store.detailView == DetailView.COMMENTS){
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

  if(store.detailView != DetailView.NONE){
    return (
      <div className="w-[300px] h-[550px] border-solid border flex flex-col bg-brownshade-700">
        <div className="h-12 flex items-center px-2 gap-10">
          <img src={closeIcon} alt="" onClick={closeDetailView}></img>
          <p className="text-2xl font-bold">{mapDetails.title}</p>
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
