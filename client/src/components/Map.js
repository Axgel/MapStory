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

export default function Map() {
  const { auth } = useContext(AuthContext);
  const { file } = useContext(GlobalFileContext);
  const { store } = useContext(GlobalStoreContext);
  const [mapRef, setMapRef] = useState(null);
  const [mapItem, setMapItem] = useState(null);
  const { mapId } = useParams();
  const [editRegions, setEditRegions] = useState({});
  const [tmpEditRegions, setTmpEditRegions] = useState({});

  // need these two lines below to refresh component
  const fileState = useSyncedStore(fileStore);
  const fileStateSubregions = getYjsValue(fileState.subregions);
  const refresh = getYjsValue(fileState.refresh);

  useEffect(() => {
    if(!mapRef) return;
    const map = file.initMapContainer(mapRef);
    setMapItem(map);
    return () => map.remove();
  },[mapRef])

  // useEffect(() => {
  //   if(!tmpEditRegions || Object.keys(tmpEditRegions).length == 0) return;

  //   const subregionId = tmpEditRegions["subregionId"];
  //   const eTarget = tmpEditRegions["eTarget"];

  //   let newEditRegions = editRegions;
  //   if(editRegions[subregionId]){
  //     eTarget.setStyle({ fillColor: '#A4BFEA'});  
  //     delete newEditRegions[subregionId];
  //   } else {
  //     newEditRegions[subregionId] = eTarget;
  //   }
  //   console.log(newEditRegions)
  //   setEditRegions(newEditRegions);

  //   for (const [key, layer] of Object.entries(editRegions)) {
  //     mapItem.removeLayer(layer);
  //     initLayerHandlers(layer, key);
  //     layer.setStyle({ fillColor: 'red'});   
  //     if(file.currentEditMode === EditMode.ADD_VERTEX || file.currentEditMode === EditMode.EDIT_VERTEX) {
  //       file.enableLayerOptions(layer);
  //     }
  //   }

  //   setTmpEditRegions(null);
  // }, [tmpEditRegions])

  // useEffect(() => {
    
  //   console.log(editRegions);
  //   // const keys = Object.keys(editRegions);
  //   // console.log(keys);
  //   // for (const [key, value] of Object.entries(editRegions)) {
  //   //   console.log("as");
  //   //   console.log(key, value);
  //   // }

  //   // if(editRegions[region._id]){
  //   //   layer.setStyle({ fillColor: 'red'});   
  //   //   if(file.currentEditMode === EditMode.ADD_VERTEX || file.currentEditMode === EditMode.EDIT_VERTEX) {
  //   //     file.enableLayerOptions(layer);
  //   //   }
  //   // }

  // }, [editRegions])

  // function initLayerHandlers(layer, subregionId) {
  //   layer.on('click', (e) => handleClickLayer(e, subregionId));
  //   layer.on('pm:vertexadded', (e) => file.handleVertexAdded(e, subregionId));
  //   layer.on('pm:markerdragend', (e) => file.handleMarkerDragEnd(e, subregionId));
  //   layer.on('pm:vertexremoved', (e) => file.handleVertexRemoved(e, subregionId));
  // }

  // function handleClickLayer(e, subregionId) {
  //   setTmpEditRegions({"subregionId":subregionId, "eTarget":e.target});
  // }



  if(mapItem){
    mapItem.eachLayer(function (layer){
      mapItem.removeLayer(layer);
    })

    file.loadAllRegionsToMap(mapItem)

    // if(Object.keys(fileStateSubregions).length == 0) return;
    // for(const subregion of fileStateSubregions){
    //   const region = subregion[1];
    //   if(!region || Object.keys(region).length == 0) continue;
    //   const layer = L.polygon(region.coordinates).addTo(mapItem);
    //   initLayerHandlers(layer, region._id);
    //   if(file.editRegions[region._id]){
    //     layer.setStyle({ fillColor: 'red'});   
    //     if(file.currentEditMode === EditMode.ADD_VERTEX || file.currentEditMode === EditMode.EDIT_VERTEX) {
    //       file.enableLayerOptions(layer);
    //     }
    //   }
    // }


  }
  console.log("outside refresh");

  // Load all subregions into map
  // useEffect(()=>{
  //   if(!mapItem ) return;
  //   console.log("refreshing");
  //   mapItem.eachLayer(function (layer) {
  //     mapItem.removeLayer(layer);
  //   });
    
  //   file.loadAllRegionsToMap(mapItem);
  // }, [mapItem, file])


  // get div of screen on page load to add map to
  function handleInitMapLoad(e){
    setMapRef(e);
  }

  return (
    <>
      <div className="w-full h-[700px] z-10" id="map" ref={handleInitMapLoad}>
      </div>
      <p>{JSON.stringify(refresh)}</p>
    </>
  );
}