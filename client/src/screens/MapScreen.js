import React, {useContext, useEffect, useState} from "react";
import { Header, EditToolbar, Map, MapProperties, MapDetailCard } from "../components";
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';  
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import { useParams } from "react-router-dom";
import { GlobalStoreContext } from '../store'
import AuthContext from "../auth";
import GlobalFileContext from "../file";
import { CreateVertexTransaction } from "../transactions";
import { DetailView , EditMode } from "../enums";
import * as Y from 'yjs';
import { parseMultiPolygon } from "../utils/geojsonParser";
import jsTPS from "../common/jsTPS";

let ydoc = new Y.Doc({ autoLoad: true });
let ymap = ydoc.getMap("regions");
let undoManager = new Y.UndoManager(ymap, {trackedOrigins: new Set([42])})
let tps = new jsTPS();

export default function MapScreen() {
  const { auth } = useContext(AuthContext);
  const { store } = useContext(GlobalStoreContext);
  const { file } = useContext(GlobalFileContext);
  const [mapRef, setMapRef] = useState(null);
  const [mapItem, setMapItem] = useState(null);
  const { mapId } = useParams();

  const [initLoad, setInitLoad] = useState(1);
  const [subregionLayerMap, setSubregionLayerMap] = useState({});
  const [transaction, setTransaction] = useState(null);
  const [staleBridgeId, setStaleBridgeId] = useState(null);
  const [mergeRegionId, setMergeRegionId] = useState([]);
  const [editRegionId, setEditRegionId] = useState(null);
  const [staleSubregionIds, setStaleSubregionIds] = useState(null);

  useEffect(() => {
    if(!mapItem) return;
    switch(file.currentEditMode){
      case EditMode.EDIT_VERTEX: {
        reloadLayers([editRegionId]);     
        break; 
      }
      case EditMode.ADD_SUBREGION: {
        break;
      }
      default:
        mapItem.pm.disableDraw();
        subregionLayerMap[editRegionId].pm.disable();
    }

    switch(file.editModeAction){
      case EditMode.UNDO: {
        handleUndo();
        file.clearUndoRedo();
        break;
      }
      case EditMode.REDO: {
        handleRedo();
        file.clearUndoRedo();
        break;
      }
    }
  }, [file])

  useEffect(() => {
    // init yjs items
    ydoc = new Y.Doc();
    ymap = ydoc.getMap("regions")
    undoManager = new Y.UndoManager(ymap,  {trackedOrigins: new Set([42])})
  }, [])

  useEffect(() => {
    // connect to server backend
    if (!auth.user || !auth.socket) return;
    auth.socket.emit('openProject', {mapId: mapId,})
  }, [auth, ydoc])

  useEffect(() => {
    // load map container
    if (!mapRef) return;
    const map = file.initMapContainer(mapRef);
    setMapItem(map);
    return () => {
      map.remove();
    }
  }, [mapRef]);

  useEffect(() => {
    // init subregion load once
    if(!mapItem || initLoad >= 0) return;
    
    const yjsRegions = ydoc.getMap('regions').toJSON();
    const regions = {};
    const bounds = L.latLngBounds();
    for(const [subregionId, subregionData] of Object.entries(yjsRegions)){
      if(subregionData["stale"]) continue;
      const coordinates = subregionData["coords"];
      const layer = L.polygon(coordinates).addTo(mapItem);
      bounds.extend(layer.getBounds());
      regions[subregionId] = layer;
      initLayerHandlers(layer, subregionId);
    }
    mapItem.fitBounds(bounds);
    setInitLoad(1);
    setSubregionLayerMap(regions);
  }, [mapItem, initLoad])


  useEffect(() => {
    if (!auth.user || !auth.socket) return;
    // init map project open
    auth.socket.on('sync', (data) => {
      const parsed = JSON.parse(data);
      const uintArray = Uint8Array.from(parsed);
      Y.applyUpdate(ydoc, uintArray, -1);
      setInitLoad(-1);
    })

    auth.socket.on('others-update', (data) => {
      const {subregionIds, op} = data;
      const parsed = JSON.parse(op);
      const uintArray = Uint8Array.from(parsed);
      Y.applyUpdate(ydoc, uintArray, -1);
      setStaleSubregionIds(subregionIds);
    })

    ydoc.on('update', (update, origin) => {
      if(origin !== -1){
        const subregionIds = getTPSSubregionId();
        const arr = Array.from(update);
        const op = JSON.stringify(arr);
        auth.socket.emit('op', {mapId: mapId, subregionIds: subregionIds, op: op});
      } 
    })

    undoManager.on('stack-item-added', event => {
      // if(event.origin == 42){
      //   tps.addTransaction
      // }
      console.log(event.origin, 1);
    })

    undoManager.on('stack-item-popped', event => {
      console.log(event, 2);
    })

    return () => {
      auth.socket.emit('closeProject', {
        mapId: mapId,
      });
    }
  }, [auth, ydoc]);


  useEffect(() => {
    if(!staleBridgeId) return;
    // layer clicked, change color, enable/disable editing
    if(editRegionId == staleBridgeId){
      // already click, change selected subregion back to normal
      disableLayer(editRegionId);
      setEditRegionId(null);
    } else {
      // set current one to clicked
      if(editRegionId) disableLayer(editRegionId);
      enableLayer(staleBridgeId);
      setEditRegionId(staleBridgeId);
    }
        
    setStaleBridgeId(null);
  }, [staleBridgeId])

  useEffect(() => {
    if(!transaction) return;
    // create a vertex transaction
    switch(transaction[0]){
      case EditMode.ADD_VERTEX:
      case EditMode.MOVE_VERTEX:
      case EditMode.REMOVE_VERTEX:
        const [transactionType, e, subregionId] = transaction;
        const trans = CreateVertexTransaction(transactionType, e, subregionId);
        trans.splice(1, 0, mapId);
        applyTransaction(trans);
        break;
    }

    setTransaction(null);
  }, [transaction])

  useEffect(() => {
    if(!staleSubregionIds) return;

    // console.log(subregionLayerMap, tmpItem);
    reloadLayers([...staleSubregionIds]);
    setStaleSubregionIds(null);
  }, [staleSubregionIds])


  function disableLayer(subregionId){
    subregionLayerMap[subregionId].setStyle({ fillColor: '#3387FF'});
    subregionLayerMap[subregionId].pm.disable();
  }

  function enableLayer(subregionId){
    subregionLayerMap[subregionId].setStyle({ fillColor: 'red'})
    enableEditing(subregionLayerMap[subregionId]);
  }

  function reloadLayers(subregionIds){
    const newSubregionLayerMap = {...subregionLayerMap};
    console.log(subregionLayerMap, subregionIds);
    for(const subregionId of subregionIds){
      // console.log(subregionId)
      const oldLayer = subregionLayerMap[subregionId];
      mapItem.removeLayer(oldLayer);
      const ymap = ydoc.getMap("regions");
      if(!ymap.get(subregionId) || !ymap.get(subregionId).get("coords")) continue;
      if(ymap.get(subregionId).get("stale")) continue;

      const coords = ymap.get(subregionId).get("coords").toJSON();
      const newLayer = L.polygon(coords).addTo(mapItem);
      initLayerHandlers(newLayer, subregionId);
      newSubregionLayerMap[subregionId] = newLayer;
      
      if(subregionId === editRegionId){
        newLayer.setStyle({fillColor: 'red'});
        enableEditing(newLayer);
      }
    }

    setSubregionLayerMap(newSubregionLayerMap);
  }


  function initLayerHandlers(layer, subregionId){
    layer.on('click', (e) => setStaleBridgeId(subregionId));
    layer.on('pm:vertexadded', (e) => setTransaction([EditMode.ADD_VERTEX, e, subregionId]));
    layer.on('pm:markerdragend', (e) => setTransaction([EditMode.MOVE_VERTEX, e, subregionId]));
    layer.on('pm:vertexremoved', (e) => setTransaction([EditMode.REMOVE_VERTEX, e, subregionId]));
    mapItem.on('pm:create', (e) => setTransaction([EditMode.ADD_SUBREGION, e]));
  }

  function enableEditing(layer){
    if(file.currentEditMode !== EditMode.EDIT_VERTEX) return;
    layer.pm.enable({
      removeLayerBelowMinVertexCount: false,
      limitMarkersToCount: 5,
      draggable: false,
      addVertexOn: 'click',
      removeVertexOn: 'click',
      addVertexValidation: addVertexValidate,
      moveVertexValidation: moveVertexValidate,
      removeVertexValidation: removeVertexValidate,
      hideMiddleMarkers: !file.editModeOptions[0]
    })
  }



  function applyTransaction(data){
    const [transactionType, mapId, subregionId, indexPath, newCoords] = data;
    switch(transactionType){
      case EditMode.ADD_VERTEX:
        applyVertexAdd(subregionId, indexPath, newCoords);
        break;
      case EditMode.MOVE_VERTEX:
        applyVertexMove(subregionId, indexPath, newCoords);
        break;
      case EditMode.REMOVE_VERTEX:
        applyVertexRemove(subregionId, indexPath, newCoords);
        break;
    }
  }

  function applyVertexAdd(subregionId, indexPath, newCoords){
    const [i,j,k] = indexPath;
    const ymap = ydoc.getMap("regions");
    const coords = ymap.get(subregionId, Y.Map).get("coords", Y.Array);
    const coords2 = coords.get(i).get(j);
  
    ydoc.transact(() => {
      coords2.insert(k, [newCoords]);
      undoManager.stopCapturing()
      tps.addTransaction([subregionId]);
    }, 42);
  }

  function applyVertexMove(subregionId, indexPath, newCoords){
    const [i,j,k] = indexPath
    const ymap = ydoc.getMap("regions");
    const coords = ymap.get(subregionId, Y.Map).get("coords", Y.Array);
    const coords2 = coords.get(i).get(j);
  
    ydoc.transact(() => {
      coords2.delete(k, 1);
      coords2.insert(k, [newCoords]);
      undoManager.stopCapturing()
      tps.addTransaction([subregionId]);
    }, 42);
  }

  function applyVertexRemove(subregionId, indexPath, newCoords){
    const [i,j,k] = indexPath;
    const ymap = ydoc.getMap("regions");
    const coords = ymap.get(subregionId, Y.Map).get("coords", Y.Array);
    const coords2 = coords.get(i).get(j);

    ydoc.transact(() => {
      coords2.delete(k, 1);
      undoManager.stopCapturing();
      tps.addTransaction([subregionId])
    }, 42);
  }


  function addVertexValidate(){
    return file.editModeOptions[0];
  }

  function moveVertexValidate(){
    return file.editModeOptions[1];
  }

  function removeVertexValidate(){
    return file.editModeOptions[2];
  }

  function handleUndo(){
    undoManager.undo();
  }

  function handleRedo(){
    undoManager.redo();
  }

  function getTPSSubregionId(){
    if(tps.undoStack.length == undoManager.undoStack.length){
      // grab subregion from undoStacl
      return tps.undoPeek();
    }
    else if(tps.undoStack.length > undoManager.undoStack.length){
      // move item to redostack // is an undo op
      const subregionIds = tps.undoTransaction();
      return subregionIds;
    } else {
      // move item to undo stack, is an redo op
      const subregionIds = tps.redoTransaction();
      return subregionIds;
    }
  }

  function handleInitMapLoad(e) {
    setMapRef(e);
  }

  let tmp = <></>;
  if(store.selectedMap && (store.detailView !== DetailView.NONE)){
    tmp = <div className="flex flex-col h-full sticky top-5 self-start z-10">
            <MapDetailCard mapDetails={store.selectedMap} />
          </div>
  }
  return (
    <div>
      <Header /> 
      <EditToolbar />
      {/* <Map/> */}
      <div className="flex">
        <div className="w-full h-[775px] z-0" id="map" ref={handleInitMapLoad}>
        </div>
        <div>
          {tmp}
        </div>
      </div>      
      <br></br><b></b>
    </div>
  );
}
