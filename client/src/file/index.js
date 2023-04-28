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

function GlobalFileContextProvider(props) {
  const { auth } = useContext(AuthContext);
  const { store } = useContext(GlobalStoreContext);
  const navigate = useNavigate();
  
  const [queue, setQueue] = useState([]);   
  const [tmpSendOp, setTmpSendOp] = useState(null);
  const [file, setFile] = useState({
    version: 1,
    free: true,
    subregions: {},
    currentEditMode: EditMode.NONE,
    editRegions: {},
  });
  
  useEffect(() => {
    if(!tmpSendOp || !auth.user) return;
    /* STEP 4: This useeffect is basically called everytime an edit is done to the map
      It first makes the local changes in the call incrementVersionAndUpdateSubregions call
      We want to increment the local version because we performed the edit localy 
      and is already rendered on the screen. However, because this useEffect is only called whenever
      we set the state for tmpSendOp, when we make the incrementVersionAndUpdateSubregions call, it wont actually be
      pasing the updated version state to the server which is fine because in order for the server to emit the message to all the other users,
      the local client needs to be on the same version.
      We then emit the message with the operation. Remember this is still all happening on User A. User A can now see the updated
      edit map region on the screen, but User B has not yet received that change.
    */
    file.incrementVersionAndUpdateSubregions(tmpSendOp.op);
    auth.socket.emit('sendOp', {
      mapId: tmpSendOp.mapId,
      subregionId: tmpSendOp.subregionId,
      op : tmpSendOp.op,
      version : file.version
    })
    setTmpSendOp(null);
  }, [tmpSendOp])

  useEffect(() => {
    if(!auth.user) return;
    
    auth.socket.on('version', (data) => {
      if(data.version) {
        file.setVersion(data.version)
      }
    }); 

    /* STEP 5: (interchangeable with Step 6): The server acks the local changes
      Because the server and User A are now on the same version, you can clear the queue
      There might be an issue with waiting for an ack and the user adding more edits 
      (so maybe removed items in the queue only up to server version)
    */
    auth.socket.on('owner-ack', (data) => {
      // console.log(file.version, data.serverVersion);
      setQueue([]);
    })
  
    /* STEP 6: All other users receive the change */
    auth.socket.on('others-ack', (data) => {
      const {serverVersion, op} = data;

      /* STEP 7: If the server is ahead of the local client (in this case lets say user B),
        we need to properly transform the operations.
        At this stage, user B could have some map edit changes LOCALLY that were not yet recognized by the server.
        Thus these local changes are stored in User B's queue but not yet acknowledged by the server.
        Because of this, to update User B's local client, some transforming might need to happen

        We make a call to transformOps which will convert User A's changes and make it fit with User B's changes
        Now that we have a new transformed operation, we need to apply it through the applyOps call.
        applyOps is similar to incrementVersionAndUpd... but the version that we want to send to the state is that of the server, which means
        that the current state will be synced with server instead of simply adding 1 to the version.
      */
      if(serverVersion > file.version){
        // console.log(`packet outdated -> serverVersion: ${serverVersion} | localVersion: ${file.version}`);
        const transformedOps = file.transformOps(queue, op);
        file.applyOps(file.subregions, transformedOps, serverVersion);
        setQueue([]);
      }
    });

    return () => {
      auth.socket.removeAllListeners();
    }

  }, [auth, file, queue])
  
  file.applyOps = function(subregions, ops, serverVersion){
    const newSubregions = json1.type.apply(subregions, ops);

    fileReducer({
      type: GlobalFileActionType.INCREMENT_VERSION_AND_UPDATE_SUBREGIONS,
      payload: {subregions: newSubregions, version: serverVersion}
    })
  }
  
  file.transformOps = function(opsQueue, serverOp, currentVersion) {
    let transformedOp = serverOp;
    for(const { version: queuedVersion, op: queuedOp } of opsQueue){
      if (queuedVersion > currentVersion) {
        transformedOp = json1.type.compose(transformedOp, queuedOp);
      } else {
        transformedOp = json1.type.transform(transformedOp, queuedOp, "left");
      }
    }
    return transformedOp;
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
      case GlobalFileActionType.SET_VERSION: {
        return setFile({
          ...file,
          version: payload.version
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

  file.setVersion = function(version) {
    fileReducer({
      type: GlobalFileActionType.SET_VERSION,
      payload: {version: version}
    })
  }

  file.incrementVersion = function() {
    file.setVersion(file.version + 1);
  }

  file.incrementVersionAndUpdateSubregions = function(op) {
    const newSubregions = json1.type.apply(file.subregions, op);
    
    fileReducer({
      type: GlobalFileActionType.INCREMENT_VERSION_AND_UPDATE_SUBREGIONS,
      payload: {subregions: newSubregions, version: file.version + 1}
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
    
    /* STEP 1: User A adds a vertex to subregion 1
      Append the current local version and operation that was performed to the queue
      The queue will store the local changes that has not yet been confirmed by the server
    */
    setQueue([...queue, {version: file.version, op: op}]);
    const transaction = new Test_Transaction(file, subregionId, op);
    /* STEP 2: Create the transaction and add it to the tps
      When the transaction is added, it will call the doTransaction() (based in the jstps api) function, which performs
      the doTransaction function in the Test_Transaction file. The doTransaction function in this case will make a call
      to file.sendOpToServer()
    */
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

    const path = createVertexOperationPath(subregionId, indexPath);

    const op = json1.replaceOp(path, oldVal, newVal);
    setQueue([...queue, {version: file.version, op: op}]);
    const transaction = new Test_Transaction(file, subregionId, op);
    tps.addTransaction(transaction);
  }

  file.handleVertexRemoved = function(e, subregionId) {
    const data = [e.marker._latlng.lat, e.marker._latlng.lng];
    const path = createVertexOperationPath(subregionId, e.indexPath);
    const op = json1.removeOp(path, data);

    setQueue([...queue, {version: file.version, op: op}]);
    const transaction = new Test_Transaction(file, subregionId, op);
    tps.addTransaction(transaction);
  }

  file.sendOpToServer = function(subregionId, op) {
    /* STEP 3: Transaction has been added to the transaction stack
      Now we want to update the tmpSendOp state with proper info including the operation
      which will rerender and be able to grab the fresh data getting rid of the stale data
      when it was originally stored in the transaction stack
    */
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
