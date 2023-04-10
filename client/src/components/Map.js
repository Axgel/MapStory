import React, { useEffect, useState } from "react";
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css';
import usastates from '../data/usastates.json'

export default function Map() {
  const [mapRef, setMapRef] = useState("");

  useEffect(()=> {
    if(mapRef){
      const map = L.map(mapRef, {worldCopyJump: true}).setView([39.0119, -98.4842], 5);
      
      // Adds the map layer background
      //'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
      const tileLayer = L.tileLayer('', {
        // edgeBufferTiles: 2,
        maxZoom: 19,
        minZoom: 3,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);
  
      const southWest = L.latLng(-89.98155760646617, -180);
      const northEast = L.latLng(89.99346179538875, 180);
      const bounds = L.latLngBounds(southWest, northEast);
      map.setMaxBounds(bounds);
      L.geoJSON(usastates).addTo(map);
    }
  
  },[mapRef])


  function handleInitMapLoad(e){
    setMapRef(e);
  }

  return (
    <div className="w-full h-[700px] z-[-1]" id="map" ref={handleInitMapLoad}>
    </div>
  );
}