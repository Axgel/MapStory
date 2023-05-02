import React, { useContext, useEffect } from "react";
import { MapCard, Header, NavBar, MapDetailCard } from "../components";
import { useNavigate } from "react-router-dom";
import { CurrentModal } from "../enums";
import { GlobalStoreContext } from "../store";
import AuthContext from "../auth";
import { ViewMode, DetailView } from "../enums";

export default function HomeScreen() {
  const { store } = useContext(GlobalStoreContext);
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    store.loadAllMaps();
  }, [])

  let mapCards = <></>
  if(store.viewMode === ViewMode.PERSONAL && store.personalMaps) {
      mapCards = store.personalMaps.map((map, index) => {
        return <MapCard key={index} mapDetails={map} />;
      })
  } else if(store.viewMode === ViewMode.SHARED && store.sharedMaps) {
      mapCards = store.sharedMaps.map((map, index) => {
        return <MapCard key={index} mapDetails={map} />;
      })
  } else if(store.viewMode === ViewMode.PUBLISHED && store.publishedMaps) {
    mapCards = store.publishedMaps.map((map, index) => {
      return <MapCard key={index} mapDetails={map} />;
      })
  }

  function setCurrentModal(e, currentModal){
    e.stopPropagation();
    store.setCurrentModal(currentModal);
  }

  return (
    <div>
      <Header />
      <NavBar />
      {/* <div className="flex flex-row-reverse px-10 mt-8 min-w-[900px]">
        
      </div> */}

      <div className="flex mt-8">
        <div className="px-10 flex flex-col gap-5 min-w-max flex-grow pb-5">
          <div className="flex justify-between">
            <p id="mapsid" className="text-3xl font-bold">Maps</p>
            <p id="createMapBtn" className="w-[100px] px-5 py-2 border-solid bg-periwinkle inline rounded-lg border ml-auto" onClick={(e) => setCurrentModal(e, CurrentModal.CREATE_MAP)}>
              + Create Map
            </p>
          </div>

          {mapCards}
        </div>
        
        {store.selectedMap && (store.detailView !== DetailView.NONE) ?
        <div className="w-[300px] flex flex-col gap-5 mt-16 pr-10 sticky top-5 self-start">
          <MapDetailCard mapDetails={store.selectedMap} />
        </div> : 
        <></>}

      </div>
    </div>
  );
}
