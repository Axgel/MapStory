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
  const [ydoc] = useState(() => getYjsValue(fileState));
  const [fileStateSubregions] = useState(() => ydoc.getMap('subregions'));
  const fileStateRefresh = getYjsValue(fileState.refresh);
  // const undoManager = new Y.UndoManager(array)
  const [undoManager] = useState(() => {
    console.log("ran once");
    return new Y.UndoManager(fileStateSubregions)
  });


  undoManager.on('stack-item-added', event => {
    console.log(event);
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
    return;
  }

  file.handleMarkerDragEnd = function(e, subregionId) {
    const [i,j,k] = e.indexPath;
    let temp = e.layer.getLatLngs()[i][j][k];
    const newVal = [temp.lat, temp.lng];

    // fileStateSubregions.get(subregionId)["coordinates"][i][j][k] = newVal;
    const newSubregion = fileStateSubregions.get(subregionId);
    newSubregion["coordinates"][i][j][k] = [36, -88];
    fileStateSubregions.delete(subregionId);
    fileStateSubregions.set(subregionId, newSubregion);
    fileStateRefresh.insert(0, ['a']);
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
    console.log(JSON.stringify(fileStateSubregions))
    console.log("undo");
    undoManager.undo();
    fileStateRefresh.insert(0, ['a']);
    console.log(JSON.stringify(fileStateSubregions))
  }

  file.handleRedo = function() {
    undoManager.redo();
  }

  return (
    <GlobalFileContext.Provider value={{ file }}>
      {props.children}
    </GlobalFileContext.Provider>
  );
}

export default GlobalFileContext;
export { GlobalFileContextProvider };
