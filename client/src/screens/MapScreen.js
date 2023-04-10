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
      {/* <Map /> */}
      <div className="flex flex-row-reverse">
        <MapDetailCard mapDetails={store.allMaps[0]}/>
      </div>
      <div id="map-detail-view" className="m-3">
        <MapProperties />
      </div>
      <br></br><b></b>
    </div>
  );
}
