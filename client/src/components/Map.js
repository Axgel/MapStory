import React, { useEffect, useState, useContext } from "react";
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';  
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import GlobalFileContext from "../file";
import { EditMode } from "../enums";
import AuthContext from "../auth";
import { useParams } from "react-router-dom";
const json1 = require('ot-json1');

export default function Map() {
  const { auth } = useContext(AuthContext);
  const { file } = useContext(GlobalFileContext);
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

  useEffect(() => {
    if(!auth.user) return;
    // init client version number
    auth.socket.on('version', function(data){
      if(data.version) {
        file.setVersion(data.version)
      }
    }); 
  
    auth.socket.on('owner-ack', function(data){
      console.log(file.version);
      file.incrementVersion();
    }); 
  
    auth.socket.on('others-ack', function(data){
      const { op } = data;
      console.log(file.version);
      file.incrementVersionAndUpdateSubregions(op);
    });

    return () => {
      auth.socket.removeAllListeners();
    }
  }, [auth, file])

  // Load all subregions into map
  useEffect(()=>{
    if(!auth.user || !mapItem ) return;

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