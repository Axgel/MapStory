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
import { DetailView } from "../enums";
import * as Y from 'yjs';

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
  }, [])

  useEffect(() => {
    if (!auth.user || !auth.socket) return;
    // init map project open
    auth.socket.emit('openProject', {
        mapId: mapId,
    })

    ydoc.on('update', (update, origin) => {
      if(origin[0]) {
        const arr = Array.from(update);
        const op = JSON.stringify(arr);
        auth.socket.emit('op', {mapId: mapId, subregionId: origin[1], op: op});
      }
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

  // useEffect(() => {
  //   ydoc = new Y.Doc();

  //   ydoc.on('update', (update, origin) => {
  //     if(origin[0]) {
  //       const arr = Array.from(update);
  //       const op = JSON.stringify(arr);
  //       auth.socket.emit('op', {mapId: mapId, subregionId: origin[1], op: op});
  //     }
  //   })

  //   return () => {
  //     ydoc.destroy();
  //   }
  // }, [auth]);

  useEffect(() => {
    if(!auth.user || !auth.socket) return;

    auth.socket.on('sync', (data) => {
      const parsed = JSON.parse(data);
      const uintArray = Uint8Array.from(parsed);
      Y.applyUpdate(ydoc, uintArray, [false]);
      setInitLoad(-1);
    })

    auth.socket.on('owner-update', (data) => {
    })

    auth.socket.on('others-update', (data) => {
      const {subregionId, op} = data;
      const parsed = JSON.parse(op);
      const uintArray = Uint8Array.from(parsed);
      Y.applyUpdate(ydoc, uintArray, [false]);
      setIncTransaction(subregionId);
    })
    
    return () => {
      auth.socket.removeAllListeners();
    }
  }, [auth])

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
    reloadLayer(incTransaction);
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
    const [i,j] = indexPath;
    const ymap = ydoc.getMap("regions");
    const coords = ymap.get(subregionId).get("coords");
    const newData = JSON.parse(JSON.stringify(coords.get(i)));
    newData.splice(j, 0, newCoords);
    ydoc.transact(() => {
      coords.delete(i, 1);
      coords.insert(i, [newData]);
    }, [true, subregionId]);
    reloadLayer(subregionId);
    //coords.get(i).splice(j, 0, newCoords);
  }

  function applyVertexMove(subregionId, indexPath, newCoords){
    const [i,j] = indexPath
    const ymap = ydoc.getMap("regions");
    const coords = ymap.get(subregionId).get("coords");
    const newData = JSON.parse(JSON.stringify(coords.get(i)));
    newData[j] = newCoords;
    ydoc.transact(() => {
      coords.delete(i, 1);
      coords.insert(i, [newData]);
    }, [true, subregionId]);
    reloadLayer(subregionId);
    //coords.get(i)[j] = newCoords;
  }

  function applyVertexRemove(subregionId, indexPath, newCoords){
    const [i,j] = indexPath;
    const ymap = ydoc.getMap("regions");
    const coords = ymap.get(subregionId).get("coords");
    const newData = JSON.parse(JSON.stringify(coords.get(i)));
    newData.splice(j, 1);
    ydoc.transact(() => {
      coords.delete(i, 1);
      coords.insert(i, [newData]);
    }, [true, subregionId]);
    reloadLayer(subregionId);
    //coords.get(i).splice(j, 1);
  }

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

  function handleInitMapLoad(e) {
    setMapRef(e);
  }

  return (
    <div>
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
        <MapDetailCard mapDetails={store.selectedMap}/>
      </div> */}
      {/* <div id="map-detail-view" className="absolute bottom-0 m-3">
        <MapProperties />
      </div> */}
      {/* {store.selectedMap && (store.detailView !== DetailView.NONE) ?
        <div className="w-[300px] flex flex-col gap-5 mt-16 pr-10 sticky top-5 self-start">
          <MapDetailCard mapDetails={store.selectedMap} />
        </div> : 
        <></>} */}
      <br></br><b></b>
    </div>
  );
}
