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
import { DetailView , EditMode, TransactionType } from "../enums";
import * as Y from 'yjs';
import { parseMultiPolygon } from "../utils/geojsonParser";

let ydoc = new Y.Doc({ autoLoad: true });
let ymap = ydoc.getMap("regions");
let undoManager = new Y.UndoManager(ymap, {trackedOrigins: new Set([42])})

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
  }, [auth])

  useEffect(() => {
    // load map container
    if (!mapRef) return;
    const map = file.initMapContainer(mapRef);
    file.initMapControls(map);
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
      const {op} = data;
      const parsed = JSON.parse(op);
      const uintArray = Uint8Array.from(parsed);
      Y.applyUpdate(ydoc, uintArray, -1);
    })

    ydoc.on('update', (update, origin) => {
      if(origin !== -1){
        const arr = Array.from(update);
        const op = JSON.stringify(arr);
        auth.socket.emit('op', {mapId: mapId, op: op});
      } 
    })

    // undoManager.on('stack-item-popped', event => {
    //   setIncTransaction([true]);
    // })

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
    for(const subregionId of subregionIds){
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
        enableLayer(subregionId);
      }
    }

    setSubregionLayerMap(newSubregionLayerMap);
  }


  function initLayerHandlers(layer, subregionId){
    layer.on('click', (e) => setStaleBridgeId(subregionId));
    layer.on('pm:vertexadded', (e) => setTransaction([TransactionType.ADD_VERTEX, e, subregionId]));
    layer.on('pm:markerdragend', (e) => setTransaction([TransactionType.MOVE_VERTEX, e, subregionId]));
    layer.on('pm:vertexremoved', (e) => setTransaction([TransactionType.REMOVE_VERTEX, e, subregionId]));
    mapItem.on('pm:create', (e) => setTransaction([TransactionType.ADD_SUBREGION, e]));
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





  function addVertexValidate(){
    return file.editModeOptions[0];
  }

  function moveVertexValidate(){
    return file.editModeOptions[1];
  }

  function removeVertexValidate(){
    return file.editModeOptions[2];
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
