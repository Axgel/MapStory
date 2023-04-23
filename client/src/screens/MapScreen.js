import React, {useContext, useEffect, useState} from "react";
import { Header, EditToolbar, Map, MapProperties, MapDetailCard } from "../components";
import { useParams } from "react-router-dom";
import { GlobalStoreContext } from '../store'
import AuthContext from "../auth";
import GlobalFileContext from "../file";
const json1 = require('ot-json1');

export default function MapScreen() {
  const { auth } = useContext(AuthContext);
  const { store } = useContext(GlobalStoreContext);
  const { file } = useContext(GlobalFileContext);
  const { mapId } = useParams();
  const [socketId, setSocketId] = useState(null);

  const queue = [];
  let free = true;
  let version = 1;

  useEffect(() => {
    file.loadAllSubregions(mapId);
    store.loadMapById(mapId);
    
    if(auth.socket){
      auth.socket.emit('mapDetails', {
        mapId: mapId,
        userId: auth.user._id,
        socketId: auth.socket.id,
      })
    }

  }, [auth]);
  
  return (
    <div>
      <Header />
      <EditToolbar />
      <Map />
      {/* <div className="absolute right-0 top-[15%]  flex flex-row-reverse">
        <MapDetailCard mapDetails={store.personalMaps[0]}/>
      </div> */}
      {/* <div id="map-detail-view" className="absolute bottom-0 m-3">
        <MapProperties />
      </div> */}
      <br></br><b></b>
    </div>
  );
}
