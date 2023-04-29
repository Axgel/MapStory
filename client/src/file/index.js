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
const json1 = require('ot-json1');

export const GlobalFileContext = createContext({});
console.log("create GlobalFileContext");

const tps = new jsTPS();
let version = 1;


function GlobalFileContextProvider(props) {
  const { auth } = useContext(AuthContext);
  const { store } = useContext(GlobalStoreContext);
  const navigate = useNavigate();
  
  const [isFree, setIsFree] = useState([true]);
  // const [version, setVersion] = useState(1);
  const [queue, setQueue] = useState([]);   
  const [tmpSendOp, setTmpSendOp] = useState(null);

  const [file, setFile] = useState({
    subregions: {},
    currentEditMode: EditMode.NONE,
    editRegions: {},
  });
  
  useEffect(() => {
    if(!tmpSendOp || !auth.user) return;
    
    file.updateSubregions(tmpSendOp.op);
    // file.sendOp({
    //   mapId: tmpSendOp.mapId,
    //   subregionId: tmpSendOp.subregionId
    // })
    setTmpSendOp(null);
  }, [tmpSendOp])

  useEffect(() => {
    if(!queue.length || !isFree[0]) return;

    file.sendOp({
      mapId: queue[0].mapId,
      subregionId: queue[0].subregionId,
      op: queue[0].op
    })

    setIsFree([false]);

  }, [isFree, queue])

  useEffect(() => {
    if(!auth.user || !auth.socket) return;

    auth.socket.on('version', (data) => {
      if(data.version) {
        // setVersion(data.version);
        version = data.version
      }
    }); 

    auth.socket.on('owner-ack', (data) => {
      console.log(`owner: ${data.serverVersion}`);
      // setVersion((prev) => (prev + 1));
      version += 1;
      console.log("owner: ", version);
      const tmpQueue = [...queue];
      setQueue(tmpQueue.slice(1));
      setIsFree([true]);
    })
  
    auth.socket.on('others-ack', (data) => {
      const {serverVersion, op} = data
      console.log(`others: ${serverVersion}`);
      if(!queue.length) {
        file.updateSubregions(op);
      } else {
        console.log(queue, op);
        let composed = queue[0].op;
        for(let i=1; i< queue.length; i++){
          composed = json1.type.compose(composed, queue[i].op);
        }
        const newServerOp = json1.type.transform(op, composed, "left");
        
        // const newQueue = queue.map(ops => ({...ops, op: json1.type.transform(ops.op, op, "right")}));
        const newQueue = [];
        for(const ops of queue){
          let tmpOp = ops.op;
          tmpOp = json1.type.transform(tmpOp, op, "right");
          newQueue.push({op: tmpOp, mapId: ops.mapId, subregionid: ops.subregionId});
        }
        console.log(newQueue);
        setQueue(newQueue);
        file.updateSubregions(newServerOp);
      }
      // setVersion((prev) => (prev + 1));
      version += 1;
      console.log("others: ", version);
      setIsFree([true]);
    });

    return () => {
      auth.socket.removeAllListeners();
    }

  }, [auth, file, queue])
  
  file.sendOp = function(msg){
    if(!queue.length || !isFree[0]) return;

    auth.socket.emit('sendOp', {
      mapId: msg.mapId,
      subregionId: msg.subregionId,
      op : msg.op,
      version : version
    })
  }

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

  file.updateSubregions = function(op) {
    const newSubregions = json1.type.apply(file.subregions, op);    
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
    const data = [e.latlng.lat, e.latlng.lng];
    const path = createVertexOperationPath(subregionId, e.indexPath);
    
    const op = json1.insertOp(path, data);
    setQueue((prev) => ([...prev, {mapId: file.subregions[subregionId].mapId, subregionId: subregionId, op: op}]));
    const transaction = new Test_Transaction(file, subregionId, op);
    tps.addTransaction(transaction);
  }

  file.handleMarkerDragEnd = function(e, subregionId) {
    if(!e.indexPath) return;
    let indexPath = e.indexPath;
    let temp = e.layer.getLatLngs();
    for(const i of indexPath) {
      temp = temp[i];
    }
    const newVal = [temp.lat, temp.lng];
    
    let oldVal = file.subregions[subregionId].coordinates;
    for(const i of indexPath) {
      oldVal = oldVal[i];
    }
  
    const oldVal2 = [oldVal[0], oldVal[1]];
    console.log(oldVal2, newVal);
    const path = createVertexOperationPath(subregionId, indexPath);

    const op = json1.replaceOp(path, oldVal2, newVal);
    setQueue((prev) => ([...prev, {mapId: file.subregions[subregionId].mapId, subregionId: subregionId, op: op}]));
    const transaction = new Test_Transaction(file, subregionId, op);
    tps.addTransaction(transaction);
  }

  file.handleVertexRemoved = function(e, subregionId) {
    const data = [e.marker._latlng.lat, e.marker._latlng.lng];
    const path = createVertexOperationPath(subregionId, e.indexPath);
    const op = json1.removeOp(path, data);

    setQueue((prev) => ([...prev, {mapId: file.subregions[subregionId].mapId, subregionId: subregionId, op: op}]));
    const transaction = new Test_Transaction(file, subregionId, op);
    tps.addTransaction(transaction);
  }

  file.sendOpMiddleware = function(subregionId, op) {
    setTmpSendOp({
      mapId: file.subregions[subregionId].mapId,
      subregionId: subregionId,
      op : op
    });
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
