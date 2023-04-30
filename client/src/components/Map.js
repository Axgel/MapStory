import React, { useEffect, useState, useContext } from "react";
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';  
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import GlobalFileContext from "../file";
import { EditMode } from "../enums";
import AuthContext from "../auth";
import { useParams } from "react-router-dom";
import GlobalStoreContext from "../store";

export default function Map() {
  const { auth } = useContext(AuthContext);
  const { file } = useContext(GlobalFileContext);
  const { store } = useContext(GlobalStoreContext);
  const [mapRef, setMapRef] = useState(null);
  const [mapItem, setMapItem] = useState(null);
  const { mapId } = useParams();

  // Initializes leaflet map reference
  useEffect(() => {
    if(!mapRef) return;
    const map = file.initMapContainer(mapRef);
    setMapItem(map);
    return () => map.remove();
  },[mapRef])

  // Load all subregions into map
  useEffect(()=>{
    if(!auth.user || !mapItem ) return;

    auth.socket.on('resync-op', (data) => {
      console.log('resync-happened');
      file.clearEverything(data.version);
      file.loadAllSubregionsFromDb(mapId);
      store.loadMapById(mapId);
      file.loadAllRegionsToMap(mapItem);
    })


    mapItem.eachLayer(function (layer) {
      mapItem.removeLayer(layer);
    });
    
    file.loadAllRegionsToMap(mapItem);
  }, [auth, file, mapItem])


  // get div of screen on page load to add map to
  function handleInitMapLoad(e){
    setMapRef(e);
  }

  return (
    <div className="w-full h-[700px] z-10" id="map" ref={handleInitMapLoad}>
    </div>
  );
}