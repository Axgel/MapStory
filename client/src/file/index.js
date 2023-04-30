import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';  
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import jsTPS from "../common/jsTPS";
import api from "./file-request-api";
import AuthContext from "../auth";
import { GlobalFileActionType } from "../enums";
import GlobalStoreContext from "../store";
import { EditMode } from "../enums";
import { fileStore } from "./file";
import { useSyncedStore } from '@syncedstore/react';
import { boxed, getYjsValue } from "@syncedstore/core";


export const GlobalFileContext = createContext({});
console.log("create GlobalFileContext");

const tps = new jsTPS();


function GlobalFileContextProvider(props) {
  const { auth } = useContext(AuthContext);
  const { store } = useContext(GlobalStoreContext);
  const navigate = useNavigate();
  
  const [file, setFile] = useState({
    subregions: {},
    currentEditMode: EditMode.NONE,
    editRegions: {},
  });


  const fileReducer = (action) => {
    const { type, payload } = action;
    switch (type) {
      case GlobalFileActionType.LOAD_SUBREGIONS: {
        return setFile({
          ...file,
          subregions: payload.subregions,
          currentEditMode: EditMode.NONE,
          editRegions: [],
        })
      }
      case GlobalFileActionType.SET_EDIT_MODE: {
        return setFile({
          ...file,
          currentEditMode: payload.currentEditMode
        })
      }
      case GlobalFileActionType.UPDATE_EDIT_REGIONS: {
        return setFile({
          ...file,
          editRegions: payload.editRegions
        })
      }
      case GlobalFileActionType.UPDATE_SUBREGIONS: {
        return setFile({
          ...file,
          subregions: payload.subregions,
        })
      }
      default:
        return file;
    }
  };

  file.loadAllSubregionsFromDb = async function(mapId) {
    let response = await api.getAllSubregions(mapId);
    if(response.status === 200){
      fileReducer({
        type: GlobalFileActionType.LOAD_SUBREGIONS,
        payload: {subregions: response.data.subregions}
      })
    }
  }

  file.setCurrentEditMode = function(currentEditMode) {
    fileReducer({
      type: GlobalFileActionType.SET_EDIT_MODE,
      payload: {currentEditMode: currentEditMode}
    })
  }

  file.handleClickLayer = function(e, subregionId) {
    let newEditRegions = file.editRegions;
    if(file.editRegions[subregionId]){
      delete newEditRegions[subregionId];
    } else {
      newEditRegions[subregionId] = e.target;
    }

    fileReducer({
      type: GlobalFileActionType.UPDATE_EDIT_REGIONS,
      payload: {editRegions: newEditRegions}
    })
  }

  file.updateSubregions = function(newSubregions) {
    fileReducer({
      type: GlobalFileActionType.UPDATE_SUBREGIONS,
      payload: {subregions: newSubregions}
    })
  }

  file.initMapContainer = function(mapRef) {
    const map = L.map(mapRef, {worldCopyJump: true}).setView([39.0119, -98.4842], 5);
    const southWest = L.latLng(-89.98155760646617, -180);
    const northEast = L.latLng(89.99346179538875, 180);
    const bounds = L.latLngBounds(southWest, northEast);
    map.setMaxBounds(bounds);
    map.doubleClickZoom.disable(); 

    return map;
  }

  file.loadAllRegionsToMap = function(mapItem) {
    for(const subregionId in file.subregions){
      const region = file.subregions[subregionId];
      const layer = L.polygon(region.coordinates).addTo(mapItem);
      file.initLayerHandlers(layer, subregionId);

      if (file.editRegions[subregionId]) {
        layer.setStyle({ fillColor: 'red'});   
        if(file.currentEditMode === EditMode.ADD_VERTEX || file.currentEditMode === EditMode.EDIT_VERTEX) {
          file.enableLayerOptions(layer);
        }
      }

    }
  }

  file.initLayerHandlers = function(layer, subregionId) {
    layer.on('click', (e) => file.handleClickLayer(e, subregionId));
    layer.on('pm:vertexadded', (e) => file.handleVertexAdded(e, subregionId));
    layer.on('pm:markerdragend', (e) => file.handleMarkerDragEnd(e, subregionId));
    layer.on('pm:vertexremoved', (e) => file.handleVertexRemoved(e, subregionId));
  }

  file.handleVertexAdded = function(e, subregionId) {
    return;
  }

  file.handleMarkerDragEnd = function(e, subregionId) {
    return;
  }

  file.handleVertexRemoved = function(e, subregionId) {
    return;
  }

  file.enableLayerOptions = function(layer) {
    layer.pm.enable({
      removeLayerBelowMinVertexCount: false,
      limitMarkersToCount: 5,
      draggable: false,
      addVertexOn: 'click',
      removeVertexOn: 'click',
      addVertexValidation: file.addVertexValidate,
      moveVertexValidation: file.editVertexValidate,
      removeVertexValidation: file.editVertexValidate,
      hideMiddleMarkers: file.currentEditMode === EditMode.EDIT_VERTEX
    })
  }

  file.addVertexValidate = function(e) {
    return file.currentEditMode === EditMode.ADD_VERTEX;
  }

  file.editVertexValidate = function(e) {
    return file.currentEditMode === EditMode.EDIT_VERTEX;
  }

  file.handleUndo = function() {
    if(tps.hasTransactionToUndo()) {
      tps.undoTransaction();
    }
  }

  file.handleRedo = function() {
    if(tps.hasTransactionToRedo()) {
      tps.doTransaction();
    }
  }

  return (
    <GlobalFileContext.Provider value={{ file }}>
      {props.children}
    </GlobalFileContext.Provider>
  );
}

export default GlobalFileContext;
export { GlobalFileContextProvider };
