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

import { fileStore, connect, disconnect } from "./file";
import { useSyncedStore } from '@syncedstore/react';
import { boxed, getYjsValue } from "@syncedstore/core";
import * as Y from 'yjs'

export const GlobalFileContext = createContext({});
console.log("create GlobalFileContext");

const tps = new jsTPS();


function GlobalFileContextProvider(props) {
  const { auth } = useContext(AuthContext);
  const { store } = useContext(GlobalStoreContext);
  const navigate = useNavigate();
  
  const [file, setFile] = useState({
    currentEditMode: EditMode.NONE,
    editRegions: {},
  });

  const fileState = useSyncedStore(fileStore);
  const ydoc = getYjsValue(fileState);
  const fileStateSubregions = ydoc.getMap('subregions');
  const refresh = ydoc.getArray('refresh');

  const [undoManager] = useState(() => {
    console.log("ran once");
    return new Y.UndoManager(fileStateSubregions, {
      trackedOrigins: new Set([42])
    })
  });

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    }
  }, [])

  undoManager.on('stack-item-added', event => {
    console.log(undoManager.undoStack.length);
  })
  
  undoManager.on('stack-item-popped', event => {
    console.log(event);
  })


  const fileReducer = (action) => {
    const { type, payload } = action;
    switch (type) {
      case GlobalFileActionType.LOAD_SUBREGIONS: {
        return setFile({
          ...file,
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
      case GlobalFileActionType.REFRESH: {
        return setFile({
          ...file
        })
      }
      default:
        return file;
    }
  };

  file.loadAllSubregionsFromDb = async function(mapId) {
    let response = await api.getAllSubregions(mapId);
    if(response.status === 200){
      for(const [key, value] of Object.entries(response.data.subregions)){
        if(fileStateSubregions.has(key)){
          ydoc.transact(() => {
            fileStateSubregions.delete(key);
          })
        }
        fileStateSubregions.set(key, value);
        
      }
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
    console.log("s");
    fileReducer({
      type: GlobalFileActionType.UPDATE_EDIT_REGIONS,
      payload: {editRegions: newEditRegions}
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
    if(Object.keys(fileStateSubregions).length == 0) return;
    for(const subregion of fileStateSubregions){
      const region = subregion[1];
      if(!region || Object.keys(region).length == 0) continue;
      const layer = L.polygon(region.coordinates).addTo(mapItem);
      file.initLayerHandlers(layer, region._id);
      if(file.editRegions[region._id]){
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

    const [i,j,k] = e.indexPath;
    const newVal = [e.latlng.lat, e.latlng.lng];

    const newSubregion = JSON.parse(JSON.stringify(fileStateSubregions.get(subregionId)));
    newSubregion["coordinates"][i][j].splice(k, 0, newVal);

    ydoc.transact(() => {
      fileStateSubregions.set(subregionId, newSubregion);
      undoManager.stopCapturing();
    }, 42)   

    return;

  }

  file.handleMarkerDragEnd = function(e, subregionId) {
    const [i,j,k] = e.indexPath;
    let temp = e.layer.getLatLngs()[i][j][k];
    const newVal = [temp.lat, temp.lng];
    
    // fileStateSubregions.get(subregionId)["coordinates"][i][j][k] = newVal;
    // fileStateSubregions.get(subregionId)["coordinates"][i][j][k] = [36, -88];
    const newSubregion = JSON.parse(JSON.stringify(fileStateSubregions.get(subregionId)));
    newSubregion["coordinates"][i][j][k] = newVal;

    ydoc.transact(() => {
      console.log(JSON.stringify(refresh));
      // refresh.insert(0, ['a']);
      fileStateSubregions.set(subregionId, newSubregion);
      undoManager.stopCapturing();
    }, 42)
  }

  file.handleVertexRemoved = function(e, subregionId) {
    const [i,j,k] = e.indexPath;
    const newVal =  [e.marker._latlng.lat, e.marker._latlng.lng];
    
    const newSubregion = JSON.parse(JSON.stringify(fileStateSubregions.get(subregionId)));
    newSubregion["coordinates"][i][j].splice(k, 1);

    ydoc.transact(() => {
      fileStateSubregions.set(subregionId, newSubregion);
      undoManager.stopCapturing();
    }, 42)

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
    console.log("undo");
    undoManager.undo();
  }

  file.handleRedo = function() {
    undoManager.redo();
  }

  file.reset = function() {
    const ids = [];
    for(const subregion of fileStateSubregions){
      const region = subregion[1];
      if(!region || Object.keys(region).length == 0) continue;
      ids.push(region._id);
    }

    for(const id of ids){
      fileStateSubregions.delete(id);
    }
  }
  
  file.save = async function(){
    const response = await api.saveSubregions(JSON.stringify(fileStateSubregions));
    console.log(response);
  }

  file.printStackLen = function(){
    console.log("Undostack: ", undoManager.undoStack.length);
    console.log("Redostack: ", undoManager.redoStack.length);
    console.log(JSON.stringify(fileStateSubregions));
    console.log(JSON.stringify(refresh));
  }

  return (
    <GlobalFileContext.Provider value={{ file }}>
      {props.children}
    </GlobalFileContext.Provider>
  );
}

export default GlobalFileContext;
export { GlobalFileContextProvider };
