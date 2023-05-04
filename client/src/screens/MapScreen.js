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
import { TransactionType } from "../enums";
import * as Y from 'yjs';


console.log(1);
let ydoc = new Y.Doc({ autoLoad: true });
let ymap = ydoc.getMap("regions");
let undoManager = new Y.UndoManager(ymap, {trackedOrigins: new Set([42])})

export default function MapScreen() {
  const { auth } = useContext(AuthContext);
  const { store } = useContext(GlobalStoreContext);
  const { file } = useContext(GlobalFileContext);
  const [mapRef, setMapRef] = useState(null);
  const [mapItem, setMapItem] = useState(null);
  const [initLoad, setInitLoad] = useState(0);
  const [loadedRegions, setLoadedRegions] = useState({});
  const [editRegions, setEditRegions] = useState({});
  const [staleBridge, setStaleBridge] = useState(null);
  const [vertexTransaction, setVertexTransaction] = useState(null);
  const [incTransaction, setIncTransaction] = useState(null);
  const { mapId } = useParams();

  useEffect(() => {
    ydoc = new Y.Doc();
    ymap = ydoc.getMap("regions")
    undoManager = new Y.UndoManager(ymap,  {trackedOrigins: new Set([42])})
  }, [])

  useEffect(() => {
    if (!auth.user || !auth.socket) return;
    auth.socket.emit('openProject', {
        mapId: mapId,
    })
  }, [auth])

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
      const {op} = data;
      const parsed = JSON.parse(op);
      const uintArray = Uint8Array.from(parsed);
      Y.applyUpdate(ydoc, uintArray, -1);
      setIncTransaction([true]);
    })

    ydoc.on('update', (update, origin) => {
      if(origin !== -1){
        const arr = Array.from(update);
        const op = JSON.stringify(arr);
        auth.socket.emit('op', {mapId: mapId, op: op});
      } 
    })

    undoManager.on('stack-item-popped', event => {
      // restore the current cursor location on the stack-item
      setIncTransaction([true]);
    })

    return () => {
      auth.socket.emit('closeProject', {
        mapId: mapId,
      });
    }
  }, [auth]);

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
    for(const [subregionId, subregionData] of Object.entries(yjsRegions)){
      const coordinates = subregionData["coords"];
      const layer = L.polygon(coordinates).addTo(mapItem);
      regions[subregionId] = layer;
      initLayerHandlers(layer, subregionId);
    }

    setInitLoad(1);
    setLoadedRegions(regions);
  }, [mapItem, initLoad])

  useEffect(() => {
    if(!staleBridge) return;
    // layer clicked, change color, enable/disable editing
    const subregionId = staleBridge;

    console.log(editRegions);
    if(editRegions[subregionId]){
      editRegions[subregionId].setStyle({ fillColor: '#A4BFEA'}); 
      editRegions[subregionId].pm.disable();

      const newEditRegions = {...editRegions};
      delete newEditRegions[subregionId];  
      setEditRegions(newEditRegions);
    } else {
      const layer = loadedRegions[subregionId];
      layer.setStyle({fillColor: 'red'});
      enableEditing(layer);

      const newEditRegions = {...editRegions};
      newEditRegions[subregionId] = layer;
      setEditRegions(newEditRegions);
    }
    
    setStaleBridge(null);
  }, [staleBridge])

  useEffect(() => {
    if(!vertexTransaction) return;
    // create a vertex transaction
    const [transaction, e, subregionId] = vertexTransaction;
    const trans = CreateVertexTransaction(transaction, e, subregionId);
    trans.splice(1, 0, mapId);
    applyTransaction(trans);

    setVertexTransaction(null);
  }, [vertexTransaction])


  useEffect(() => {
    if(!incTransaction) return;

    reloadLayers()
   
    setIncTransaction(null);
  }, [incTransaction]);


  function initLayerHandlers(layer, subregionId){
    layer.on('click', (e) => setStaleBridge(subregionId));
    layer.on('pm:vertexadded', (e) => setVertexTransaction([TransactionType.ADD_VERTEX, e, subregionId]));
    layer.on('pm:markerdragend', (e) => setVertexTransaction([TransactionType.MOVE_VERTEX, e, subregionId]));
    layer.on('pm:vertexremoved', (e) => setVertexTransaction([TransactionType.REMOVE_VERTEX, e, subregionId]));
  }

  function enableEditing(layer){
    layer.pm.enable({
      removeLayerBelowMinVertexCount: false,
      limitMarkersToCount: 5,
      draggable: false,
      addVertexOn: 'click',
      removeVertexOn: 'click',
      // addVertexValidation: file.addVertexValidate,
      // moveVertexValidation: file.editVertexValidate,
      // removeVertexValidation: file.editVertexValidate,
      hideMiddleMarkers: false
    })
  }

  function applyTransaction(data){
    const [transaction, mapId, subregionId, indexPath, newCoords] = data;
    switch(transaction){
      case TransactionType.ADD_VERTEX:
        applyVertexAdd(subregionId, indexPath, newCoords);
        break;
      case TransactionType.MOVE_VERTEX:
        applyVertexMove(subregionId, indexPath, newCoords);
        break;
      case TransactionType.REMOVE_VERTEX:
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
    }, 42);
  }

  function applyVertexRemove(subregionId, indexPath, newCoords){
    const [i,j,k] = indexPath;
    const ymap = ydoc.getMap("regions");
    const coords = ymap.get(subregionId).get("coords");
    const coords2 = coords.get(i).get(j);

    ydoc.transact(() => {
      coords2.delete(k, 1);
      undoManager.stopCapturing();
    }, 42);
    // reloadLayer(subregionId);
  }

  function reloadLayers(){
    // remove old layer
    const newLoadedRegions = {};
    const newEditRegions = {};
    for(const [subregionId,v] of Object.entries(loadedRegions)){
      const oldLayer = loadedRegions[subregionId];
      mapItem.removeLayer(oldLayer);    
      const ymap = ydoc.getMap("regions");
      const coords = ymap.get(subregionId).get("coords").toJSON();
      const newLayer = L.polygon(coords).addTo(mapItem);
      initLayerHandlers(newLayer, subregionId);
      newLoadedRegions[subregionId] = newLayer;
      
      if(editRegions[subregionId]){
        const oldLayer2 = editRegions[subregionId];
        mapItem.removeLayer(oldLayer2);
        newLayer.setStyle({fillColor: 'red'});
        enableEditing(newLayer);
        newEditRegions[subregionId] = newLayer; 
      }
    }
    // add new layer
    // refresh states to hold new layer
    setLoadedRegions(newLoadedRegions);
    setEditRegions(newEditRegions);
  }

  function handleInitMapLoad(e) {
    setMapRef(e);
  }

  function handleUndo(){
    undoManager.undo();
  }

  function handleRedo(){
    undoManager.redo();
  }

  function handlePrint(){
    console.log(undoManager.undoStack.length, undoManager.redoStack.length);
    console.log(JSON.stringify(ymap));
  }


  return (
    <div>
      <button onClick={handleUndo}>undo</button>
      <button onClick={handleRedo}>redo</button>
      <button onClick={handlePrint}>print</button>
      <Header /> 
      <EditToolbar />
      {/* <Map/> */}
      <div
        className="w-full h-[700px] z-10"
        id="map"
        ref={handleInitMapLoad}
      ></div>

      {/* <Map /> */}
      {/* <div className="absolute right-0 top-[15%]  flex flex-row-reverse">
        <MapDetailCard mapDetails={store.personalMaps[0]}/>
      </div> */}
      {/* <div id="map-detail-view" className="absolute bottom-0 m-3">
        <MapProperties />
      </div> */}
      <br></br><b></b>
    </div>
  );
}
