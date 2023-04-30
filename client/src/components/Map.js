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
import { fileStore } from "../file/file";
import { useSyncedStore } from '@syncedstore/react';
import { getYjsValue } from "@syncedstore/core";


export default function Map(props) {
  const { auth } = useContext(AuthContext);
  const { file } = useContext(GlobalFileContext);
  const { store } = useContext(GlobalStoreContext);
  const [mapRef, setMapRef] = useState(null);
  const [mapItem, setMapItem] = useState(null);
  const { mapId } = useParams();
  const fileState = useSyncedStore(fileStore);
  const {refresh} = props;


  // Initializes leaflet map reference
  let refreshDiv = <p></p>;
  for(const item of fileState.refresh){
    refreshDiv = <p></p>;
  }
  useEffect(() => {
    if(!mapRef) return;
    const map = file.initMapContainer(mapRef);
    setMapItem(map);
    return () => map.remove();
  },[mapRef])

  // Load all subregions into map
  useEffect(()=>{
    if(!mapItem ) return;
    console.log("refreshing");
    mapItem.eachLayer(function (layer) {
      mapItem.removeLayer(layer);
    });
    
    file.loadAllRegionsToMap(mapItem);
  }, [refreshDiv, mapItem, file])


  // get div of screen on page load to add map to
  function handleInitMapLoad(e){
    setMapRef(e);
  }

  return (
    <>
      <div className="w-full h-[700px] z-10" id="map" ref={handleInitMapLoad}>
      </div>
      {refreshDiv}
    </>
  );
}