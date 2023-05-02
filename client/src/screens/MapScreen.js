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
  // const [ydoc, setYdoc] = useState(null);

  const { mapId } = useParams();
  
  useEffect(() => {
    ydoc = new Y.Doc();
  }, []);


  useEffect(() => {
    if (!auth.user || !auth.socket) return;
    // init map project open
    auth.socket.emit('openProject', {
        mapId: mapId,
    })

    return () => {
      auth.socket.emit('closeProject');
    }
  }, [auth]);

  useEffect(() => {
    if(!incTransaction) return;
    // sync received data to current doc
    applyTransaction(incTransaction);
    setIncTransaction(null);
  }, [incTransaction])

  useEffect(() => {
    if(!auth.user || !auth.socket) return;

    auth.socket.on('sync', (data) => {
      const obj = JSON.parse(data);
      let uarr = Uint8Array.from(obj);
      Y.applyUpdate(ydoc, uarr);
      setInitLoad(-1);
    })

    auth.socket.on('update', (data) => {
      // apply transaction
      setIncTransaction(data);
    })
    
    return () => {
      auth.socket.removeAllListeners();
    }
  }, [auth])


  useEffect(() => {
    // load map container
    if (!mapRef) return;
    const map = file.initMapContainer(mapRef);
    setMapItem(map);
    return () => map.remove();
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
    auth.socket.emit('op', trans);

    setVertexTransaction(null);
  }, [vertexTransaction])


  function reloadLayer(subregionId){
    // remove old layer
    const oldLayer = loadedRegions[subregionId];
    mapItem.removeLayer(oldLayer);    
    // add new layer
    const ymap = ydoc.getMap("regions");
    const coords = ymap.get(subregionId).get("coords").toJSON();
    const newLayer = L.polygon(coords).addTo(mapItem);
    initLayerHandlers(newLayer, subregionId);
    // refresh states to hold new layer
    const newLoadedRegions = {...loadedRegions};
    newLoadedRegions[subregionId] = newLayer;
    setLoadedRegions(newLoadedRegions);

    if(editRegions[subregionId]){
      newLayer.setStyle({fillColor: 'red'});
      enableEditing(newLayer);
      const newEditRegions = {...editRegions};
      newEditRegions[subregionId] = newLayer; 
      setEditRegions(newEditRegions);
    }
  }

  function initLayerHandlers(layer, subregionId){
    layer.on('click', (e) => handleClickLayer(subregionId));
    layer.on('pm:vertexadded', (e) => handleVertexAdded(e, subregionId));
    layer.on('pm:markerdragend', (e) => handleMarkerDragEnd(e, subregionId));
    layer.on('pm:vertexremoved', (e) => handleVertexRemoved(e, subregionId));
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

  function handleClickLayer(subregionId){
    setStaleBridge(subregionId);
  }

  function handleVertexAdded(e, subregionId){
    setVertexTransaction([TransactionType.ADD_VERTEX, e, subregionId]);
  }

  function handleMarkerDragEnd(e, subregionId){
    setVertexTransaction([TransactionType.MOVE_VERTEX, e, subregionId]);
  }

  function handleVertexRemoved(e, subregionId){
    setVertexTransaction([TransactionType.REMOVE_VERTEX, e, subregionId]);
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
    const [i,j] = indexPath;
    const ymap = ydoc.getMap("regions");
    const coords = ymap.get(subregionId).get("coords");
    coords.get(i).splice(j, 0, newCoords);
    reloadLayer(subregionId);
  }

  function applyVertexMove(subregionId, indexPath, newCoords){
    const [i,j] = indexPath
    const ymap = ydoc.getMap("regions");
    const coords = ymap.get(subregionId).get("coords");
    coords.get(i)[j] = newCoords;
    reloadLayer(subregionId);
  }

  function applyVertexRemove(subregionId, indexPath, newCoords){
    const [i,j] = indexPath;
    const ymap = ydoc.getMap("regions");
    const coords = ymap.get(subregionId).get("coords");
    coords.get(i).splice(j, 1);
    reloadLayer(subregionId);
  }

  function handleInitMapLoad(e) {
    setMapRef(e);
  }

  return (
    <div>
      <br></br>
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
