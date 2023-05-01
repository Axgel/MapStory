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
import { Test_Transaction } from "../transactions";
import { createVertexOperationPath } from "../utils/Map/CreateOperationPath";
import * as Y from 'yjs'

export const GlobalFileContext = createContext({});
console.log("create GlobalFileContext");

const tps = new jsTPS();

function GlobalFileContextProvider(props) {
  const { auth } = useContext(AuthContext);
  const { store } = useContext(GlobalStoreContext);
  const navigate = useNavigate();
  const [sync, setSync] = useState(false);
  const [ydoc, setYdoc] = useState(null);
  const [fileStateSubregions, setFileStateSubregions] = useState(null);
  const [undoManager, setUndoManager] = useState(null);
  const [update, setUpdate] = useState(null);

  const [file, setFile] = useState({
    currentEditMode: EditMode.NONE,
    editRegions: {},
  })
  
  useEffect(() => {
    const ydoc = new Y.Doc();
    const fileStateSubregions2 = ydoc.getMap('state');
    setYdoc(ydoc);
    setFileStateSubregions(fileStateSubregions2);
    setUndoManager(new Y.UndoManager(fileStateSubregions2, {trackedOrigins: new Set([42])}));
  }, []);


  useEffect(() => {
    if(!auth.user || !auth.socket) return;

    auth.socket.on('sync', (data) => {
      const obj = JSON.parse(data);
      const ymap = ydoc.getMap("state");
      let uarr = Uint8Array.from(obj);
      Y.applyUpdate(ydoc, uarr);

      const subregions = {};
      const tmpItems = ymap.toJSON();
      for(const [k,v] of Object.entries(tmpItems)){
        subregions[k] = v;
      }

      fileReducer({
        type: GlobalFileActionType.UPDATE_SUBREGIONS,
        payload: {subregions: subregions}
      })
      setSync(true);
    }); 

    auth.socket.on('update', (data) => {
      console.log("item received");
      const obj = JSON.parse(data);
      const ymap = ydoc.getMap("state");
      let uarr = Uint8Array.from(obj);
      Y.applyUpdate(ydoc, uarr);
      const subregions = {};
      const tmpItems = ymap.toJSON();
      for(const [k,v] of Object.entries(tmpItems)){
        subregions[k] = v;
      }

      fileReducer({
        type: GlobalFileActionType.UPDATE_SUBREGIONS,
        payload: {subregions: subregions}
      })

    })


    return () => {
      auth.socket.removeAllListeners();
    }

  }, [auth, file, ydoc])

  file.reloadYDoc = () => {
    const ydoc = new Y.Doc();
    setYdoc(ydoc);
    setUndoManager(new Y.UndoManager(ydoc.getMap("state"), {trackedOrigins: new Set([42])}));
  }

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
      case GlobalFileActionType.UPDATE_SUBREGIONS: {
        return setFile({
          ...file,
          subregions: payload.subregions
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
    for(const subregionId in file.subregions){
      const region = file.subregions[subregionId];
      // console.log(JSON.parse(region));
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

  file.saveToCollabEdit = function(newSubregion, subregionId){
    const ydocEdit = new Y.Doc();
    const ymapEdit = ydocEdit.getMap('state');

    for(const [k,v] of Object.entries(file.subregions)){
      if(subregionId == k) ymapEdit.set(subregionId, newSubregion);
      else ymapEdit.set(k, v);
    }
    
    let uState = Y.encodeStateAsUpdate(ydocEdit);
    let uState2 = Uint8Array.from(uState);
    
    ydoc.transact(() => {
      Y.applyUpdate(ydoc, uState2);
    })   

    const ymap = ydoc.getMap('state');
    const tmpItems = ymap.toJSON();
    for(const [k, v] of Object.entries(tmpItems)){
      ymap.set(k, v);
    }


    let state = Y.encodeStateAsUpdate(ydoc);
    let arr = Array.from(state);
    // let obj = {
      //   state: arr
      // };

    let str = JSON.stringify(arr);
    if(!store.selectedMap._id) return;
    auth.socket.emit('op', {obj: str, mapId: store.selectedMap._id});

    return;
  }

  file.handleVertexAdded = function(e, subregionId) {
    const [i,j,k] = e.indexPath;
    const newSubregion = file.subregions[subregionId];
    const newVal = [e.latlng.lat, e.latlng.lng];
    newSubregion["coordinates"][i][j].splice(k, 0, newVal);

    file.saveToCollabEdit(newSubregion, subregionId);

    return;

  }

  file.handleMarkerDragEnd = function(e, subregionId) {
    console.log("marker dragged");
    const newSubregion = file.subregions[subregionId];
    const [i,j,k] = e.indexPath;
    let temp = e.layer.getLatLngs()[i][j][k];
    const newVal = [temp.lat, temp.lng];

    newSubregion["coordinates"][i][j][k] = newVal;
    console.log(newVal);

    file.saveToCollabEdit(newSubregion, subregionId);

    return;
  }

  file.handleVertexRemoved = function(e, subregionId) {
    const [i,j,k] = e.indexPath;
    const newSubregion = file.subregions[subregionId];
    const newVal =  [e.marker._latlng.lat, e.marker._latlng.lng];
    newSubregion["coordinates"][i][j].splice(k, 1);

    file.saveToCollabEdit(newSubregion, subregionId);

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
    console.log(undoManager.undo.length);
    undoManager.undo();
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
