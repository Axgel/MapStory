import React, { useEffect, useState, useContext } from "react";
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';  
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';  
import usastates from '../data/usastates.json'
import { GlobalStoreContext } from '../store'
import GlobalFileContext from "../file";
import { EditMode } from "../enums";
import AuthContext from "../auth";

export default function Map() {
  const { store } = useContext(GlobalStoreContext);
  const { auth } = useContext(AuthContext);
  const { file } = useContext(GlobalFileContext);
  const [mapRef, setMapRef] = useState("");
  const [mapItem, setMapItem] = useState(null);
  const [tmpRegion, setTmpRegion] = useState(null);

  // Initializes leaflet map reference
  useEffect(()=> {
    if(!mapRef) return;

    const map = L.map(mapRef, {worldCopyJump: true}).setView([39.0119, -98.4842], 5);
    const southWest = L.latLng(-89.98155760646617, -180);
    const northEast = L.latLng(89.99346179538875, 180);
    const bounds = L.latLngBounds(southWest, northEast);
    map.setMaxBounds(bounds);
    setMapItem(map);

    return () => {
      map.remove();
    }
  },[mapRef])

  // Load all subregions into map
  useEffect(()=>{
    if(!mapItem || !file.subregions) return;
    if(file.loadedRegionOnce) return;
    // remove all preexisting layers
    
    mapItem.eachLayer(function (layer) {
      mapItem.removeLayer(layer);
    });
    
    let tmp = false;
    // Add all new subregion layers
    for(const region of file.subregions){
      const poly = L.polygon(region.coordinates).addTo(mapItem);
      poly.on('click', selectRegion)
      tmp = true;
    }

    if(tmp){
      file.setLoadedRegionOnce(true);
    }

  }, [mapItem, file])

  useEffect(() => {
    if(!tmpRegion || !file) return;

    if(file.editRegions.includes(tmpRegion)){
      tmpRegion.setStyle({ fillColor: '#3387FF'});
      tmpRegion.pm.disable();
      file.updateEditRegions(file.editRegions.filter(item => item != tmpRegion));
    }
    else {
      file.updateEditRegions([...file.editRegions, tmpRegion]);
    }
    
    setTmpRegion(null);
  }, [tmpRegion])

  useEffect(() => {
    for(const region of file.editRegions){
      region.setStyle({ fillColor: 'red'});
      region.pm.disable();
      if(file.currentEditMode == EditMode.EDIT_VERTEX){
        region.pm.enable({
          limitMarkersToCount: 10,
          draggable: false,
          // removeVertexOn: 'click',
          // removeVertexValidation: store.removeVertexValidate,
          addVertexOn: 'click',
          addVertexValidation: addVertexValidate,
          moveVertexValidation: moveVertexValidate,
        }) 
      }
    }
  }, [file])


  function addVertexValidate(e){
    console.log(e.event.latlng);

    auth.socket.emit('message', {
      msg: e.event.latlng,
      id: `${auth.socket.id}${Math.random()}`,
      socketId: auth.socket.id
    })

    return true;
  }

  function moveVertexValidate(e){
    console.log(e);


    return true;
  }

  function selectRegion(e){
    setTmpRegion(e.target);
  }

  // get div of screen on page load to add map to
  function handleInitMapLoad(e){
    setMapRef(e);
  }

  return (
    <div className="w-full h-[700px] z-10" id="map" ref={handleInitMapLoad}>
    </div>
  );
}