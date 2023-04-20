import React, { useEffect, useState, useContext } from "react";
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css';
import usastates from '../data/usastates.json'
import { GlobalStoreContext } from '../store'
import GlobalFileContext from "../file";

export default function Map() {
  const { store } = useContext(GlobalStoreContext);
  const { file } = useContext(GlobalFileContext);
  const [mapRef, setMapRef] = useState("");
  const [mapItem, setMapItem] = useState(null);
  

  // Initializes leaflet map reference
  useEffect(()=> {
    if(!mapRef) return;

    const map = L.map(mapRef, {worldCopyJump: true}).setView([39.0119, -98.4842], 5);
    const southWest = L.latLng(-89.98155760646617, -180);
    const northEast = L.latLng(89.99346179538875, 180);
    const bounds = L.latLngBounds(southWest, northEast);
    map.setMaxBounds(bounds);
    setMapItem(map);
  },[mapRef])

  // Load all subregions into map
  useEffect(()=>{
    if(!mapItem || !file.subregions) return;

    // remove all preexisting layers
    mapItem.eachLayer(function (layer) {
      mapItem.removeLayer(layer);
    });

    // Add all new subregion layers
    for(const region of file.subregions){
      const poly = L.polygon(region.coordinates).addTo(mapItem);
      poly.on('click', function(e){
        console.log(e);
      })
    }
  }, [mapItem, file])


  // get div of screen on page load to add map to
  function handleInitMapLoad(e){
    setMapRef(e);
  }

  return (
    <div className="w-full h-[700px]" id="map" ref={handleInitMapLoad}>
    </div>
  );
}