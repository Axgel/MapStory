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
const json1 = require('ot-json1');

export const GlobalFileContext = createContext({});
console.log("create GlobalFileContext");

const tps = new jsTPS();

function GlobalFileContextProvider(props) {
  const { auth } = useContext(AuthContext);
  const { store } = useContext(GlobalStoreContext);

  const [file, setFile] = useState({
    version: 1,
    subregions: {},
    currentEditMode: EditMode.NONE,
    editRegions: {},
  });

  const navigate = useNavigate();

  const fileReducer = (action) => {
    const { type, payload } = action;
    switch (type) {
      case GlobalFileActionType.SET_VERSION: {
        return setFile({
          ...file,
          version: payload.version
        })
      }
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
      case GlobalFileActionType.INCREMENT_VERSION_AND_UPDATE_SUBREGIONS: {
        return setFile({
          ...file, 
          version: payload.version,
          subregions: payload.subregions
        })
      }
      default:
        return file;
    }
  };
  
  file.setVersion = function(version){
    fileReducer({
      type: GlobalFileActionType.SET_VERSION,
      payload: {version: version}
    })
  }

  file.initMapContainer = function(mapRef){
    const map = L.map(mapRef, {worldCopyJump: true}).setView([39.0119, -98.4842], 5);
    const southWest = L.latLng(-89.98155760646617, -180);
    const northEast = L.latLng(89.99346179538875, 180);
    const bounds = L.latLngBounds(southWest, northEast);
    map.setMaxBounds(bounds);
    map.doubleClickZoom.disable(); 

    return map;
  }

  file.setCurrentEditMode = function(currentEditMode){
    fileReducer({
      type: GlobalFileActionType.SET_EDIT_MODE,
      payload: {currentEditMode: currentEditMode}
    })
  }

  file.loadAllSubregions = async function(mapId) {
    let response = await api.getAllSubregions(mapId);
    if(response.status === 200){
      fileReducer({
        type: GlobalFileActionType.LOAD_SUBREGIONS,
        payload: {subregions: response.data.subregions}
      })
    }
  }

  file.updateSubregions = function(subregionId, op){
    const newSubregions = file.subregions;
    const coordinates = newSubregions[subregionId].coordinates;
    newSubregions[subregionId].coordinates = json1.type.apply(coordinates, op);
    
    fileReducer({
      type: GlobalFileActionType.UPDATE_SUBREGIONS,
      payload: {subregions: newSubregions}
    })
  }

  file.incrementVersionAndUpdateSubregions = function(subregionId, op){
    const newSubregions = file.subregions;
    const coordinates = newSubregions[subregionId].coordinates;
    newSubregions[subregionId].coordinates = json1.type.apply(coordinates, op);
    
    fileReducer({
      type: GlobalFileActionType.INCREMENT_VERSION_AND_UPDATE_SUBREGIONS,
      payload: {subregions: newSubregions, version: file.version+1}
    })
  }

  file.loadAllRegionsToMap = function(mapItem){
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

  file.enableLayerOptions = function(layer){
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

  file.initLayerHandlers = function(layer, subregionId){
    layer.on('click', (e) => file.handleClickLayer(e, subregionId));
    layer.on('pm:vertexadded', (e) => file.handleVertexAdded(e, subregionId));
    layer.on('pm:markerdragend', (e) => file.handleMarkerDragEnd(e, subregionId));
    layer.on('pm:vertexremoved', (e) => file.handleVertexRemoved(e, subregionId));
  }

  file.handleClickLayer = function(e, subregionId){
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

  file.handleVertexAdded = function(e, subregionId){
    if(!auth.user) return;
    const data = [e.latlng.lat, e.latlng.lng];
    const op = json1.insertOp(e.indexPath, data);
    file.updateSubregions(subregionId, op);

    auth.socket.emit('sendOp', {
      mapId: file.subregions[subregionId].mapId,
      subregionId: subregionId,
      op : op,
      version : file.version
    })
  }

  file.handleMarkerDragEnd = function(e, subregionId){
    if(!e.indexPath) return;
    const path = e.indexPath;
    let temp = e.layer.getLatLngs();
    for(const i of path) {
      temp = temp[i];
    }
    const newVal = [temp.lat, temp.lng];

    
    let oldVal = file.subregions[subregionId].coordinates;
    for(const i of path) {
      oldVal = oldVal[i];
    }

    const op = json1.replaceOp(path, oldVal, newVal);
    file.updateSubregions(subregionId, op);

    auth.socket.emit('sendOp', {
      mapId: file.subregions[subregionId].mapId,
      subregionId: subregionId,
      op : op,
      version : file.version
    })
  }

  file.handleVertexRemoved = function(e, subregionId){
    const data = [e.marker._latlng.lat, e.marker._latlng.lng];
    const op = json1.removeOp(e.indexPath, data);
    file.updateSubregions(subregionId, op);

    auth.socket.emit('sendOp', {
      mapId: file.subregions[subregionId].mapId,
      subregionId: subregionId,
      op : op,
      version : file.version
    })
  }

  file.addVertexValidate = function(e){
    return file.currentEditMode === EditMode.ADD_VERTEX;
  }

  file.editVertexValidate = function(e){
    return file.currentEditMode === EditMode.EDIT_VERTEX;
  }

  file.updateEditRegions = function(newEditRegions){
    fileReducer({
      type: GlobalFileActionType.UPDATE_EDIT_REGIONS,
      payload: {editRegions: newEditRegions}
    })
  }

  return (
    <GlobalFileContext.Provider value={{ file }}>
      {props.children}
    </GlobalFileContext.Provider>
  );
}

export default GlobalFileContext;
export { GlobalFileContextProvider };
