import React, { useEffect, useState, useContext } from "react";
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';  
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';  
import GlobalFileContext from "../file";
import { EditMode } from "../enums";
import AuthContext from "../auth";
const json1 = require('ot-json1');

export default function Map() {
  const { auth } = useContext(AuthContext);
  const { file } = useContext(GlobalFileContext);
  const [mapRef, setMapRef] = useState(null);
  const [mapItem, setMapItem] = useState(null);

  // Initializes leaflet map reference
  useEffect(()=> {
    if(!mapRef) return;
    const map = L.map(mapRef, {worldCopyJump: true}).setView([39.0119, -98.4842], 5);
    const southWest = L.latLng(-89.98155760646617, -180);
    const northEast = L.latLng(89.99346179538875, 180);
    const bounds = L.latLngBounds(southWest, northEast);
    map.setMaxBounds(bounds);
    map.doubleClickZoom.disable(); 
    setMapItem(map);

    return () => {
      map.remove();
    }
  },[mapRef])

  // Load all subregions into map
  useEffect(()=>{
    if(!mapItem || !file.subregions || !auth.user) return;

    function selectRegion(subregionId){
      if(file.editRegions.includes(subregionId)){
        file.updateEditRegions(file.editRegions.filter(item => item !== subregionId));
      }
      else {
        file.updateEditRegions([...file.editRegions, subregionId]);
      }
    }

    mapItem.eachLayer(function (layer) {
      mapItem.removeLayer(layer);
    });
    
    for(const region of file.subregions) {
      const poly = L.polygon(region.coordinates).addTo(mapItem);
      poly.on('click', (e) => selectRegion(region._id));
      poly.on('pm:vertexadded', (e) => {
        const path = [...e.indexPath]
        const index = file.subregions.findIndex(subregion => subregion._id === region._id);
        path.unshift(index, 'coordinates');
        const data = [e.latlng.lat, e.latlng.lng];

        const clientOp = json1.insertOp(path, data);
        file.updateSubregions(clientOp);

        const serverOp = json1.insertOp(e.indexPath, data);
        auth.socket.emit('sendOp', {
          subregionId: region._id,
          op : serverOp,
        })
      });
      poly.on('pm:markerdragend', (e) => {
        const path = [...e.indexPath]
        let temp = e.layer.getLatLngs();
        for(const i of path) {
          temp = temp[i];
        }
        const index = file.subregions.findIndex(subregion => subregion._id === region._id);
        path.unshift(index, 'coordinates');
        const newVal = [temp.lat, temp.lng];

        let oldVal = file.subregions;
        for(const i of path) {
          oldVal = oldVal[i];
        }

        const clientOp = json1.replaceOp(path, oldVal, newVal);
        file.updateSubregions(clientOp);

        const serverOp = json1.replaceOp(e.indexPath, oldVal, newVal);
        auth.socket.emit('sendOp', {
          subregionId: region._id,
          op : serverOp,
        })
      })
      if (file.editRegions.includes(region._id)) {
        poly.setStyle({ fillColor: 'red'});
        poly.pm.disable();
        if(file.currentEditMode === EditMode.EDIT_VERTEX){
          poly.pm.enable({
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
    }
  }, [auth, mapItem, file])

  function addVertexValidate(e){
    return true;
  }

  function moveVertexValidate(e){
    return true;
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