import React, {useContext} from "react";
import { Header, EditToolbar, Map, MapProperties, MapDetailCard } from "../components";

import { GlobalStoreContext } from '../store'
import AuthContext from "../auth";

export default function MapScreen() {
  const { store } = useContext(GlobalStoreContext);
  
  return (
    <div>
      <Header />
      <EditToolbar />
      <Map />
      <div className="absolute right-0 top-[15%]  flex flex-row-reverse">
        <MapDetailCard mapDetails={store.allMaps[0]}/>
      </div>
      <div id="map-detail-view" className="absolute bottom-0 m-3">
        <MapProperties />
      </div>
      <br></br><b></b>
    </div>
  );
}
