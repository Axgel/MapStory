import React, {useContext, useEffect} from "react";
import { Header, EditToolbar, Map, MapProperties, MapDetailCard } from "../components";

import { GlobalStoreContext } from '../store'
import AuthContext from "../auth";
import GlobalFileContext from "../file";

export default function MapScreen() {
  const { store } = useContext(GlobalStoreContext);
  const { file } = useContext(GlobalFileContext);

  useEffect(() => {
    file.loadAllSubregions();
  }, [])
  
  return (
    <div>
      <Header />
      <EditToolbar />
      <Map />
      <div className="absolute right-0 top-[15%]  flex flex-row-reverse">
        <MapDetailCard mapDetails={store.personalMaps[0]}/>
      </div>
      {/* <div id="map-detail-view" className="absolute bottom-0 m-3">
        <MapProperties />
      </div> */}
      <br></br><b></b>
    </div>
  );
}
