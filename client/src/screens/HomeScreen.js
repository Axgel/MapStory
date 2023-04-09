import React, { useContext } from "react";
import { MapCard, Header, NavBar, MapDetailCard } from "../components";
import { useNavigate } from "react-router-dom";

import { GlobalStoreContext } from "../store";
import AuthContext from "../auth";

export default function HomeScreen() {
  const { store } = useContext(GlobalStoreContext);
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  let mapDetailCard = <div></div>;
  if (store.selectedMap) {
    let selectedMap;
    for(let i=0; i<store.allMaps.length; i++){
      if(store.allMaps[i].id == store.selectedMap){
        selectedMap = store.allMaps[i];
        break;
      }
    }

    mapDetailCard = (
      <div className="w-[300px] flex flex-col gap-5 mt-16 pr-10 sticky top-5 self-start">
        <MapDetailCard mapDetails={selectedMap} />
      </div>
    );
  }

  function handleCreateMap(e){
    navigate("/map");
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
            <p className="text-3xl font-bold">Maps</p>
            <p className="w-[100px] px-5 py-2 border-solid bg-periwinkle inline rounded-lg border ml-auto" onClick={handleCreateMap}>
              + Create Map
            </p>
          </div>

          {store.allMaps.map((map, index) => {
            return <MapCard key={index} mapDetails={map} />;
          })}
        </div>
        
        {mapDetailCard}

      </div>
    </div>
  );
}
