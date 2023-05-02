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
import useWebSocket from 'react-use-websocket';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket'
import { syncedStore, getYjsDoc } from "@syncedstore/core";
import { WebrtcProvider } from 'y-webrtc'
import { useSyncedStore } from "@syncedstore/react";

const coords = {
  "1": [[
    [35.005881, -87.984916],
    [35.005881, -88.984916],
    [34.005881, -88.984916],
    [34.005881, -87.984916],
  ]],
  "2" : [[
    [37.000674, -90.538593],
    [37.000674, -91.538593],
    [36.000674, -91.538593],
    [36.000674, -90.538593],
  ]]
}
const WS_URL = 'ws://localhost:4000';
const request = {
  id: "1",
};
const fileStateOut = syncedStore({ tmp: 'text' });
const ydoc = getYjsDoc(fileStateOut);
const provider = new WebrtcProvider('room-name', ydoc, { signaling: ['ws://localhost:4000'] })
provider.connect();
// ydoc.on('update', () => {
//   console.log("hgi");
// })

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
  const { mapId } = useParams();
  
  const fileState = useSyncedStore(fileStateOut);

  const [ws, setWs] = useState(null);
  const [wsP, setWsP] = useState(null);
  const [text, setText] = useState("");

  // useEffect(() => {
  //   const wsClient = new WebSocket(WS_URL);
  //   wsClient.onopen = () => {
  //     setWs(wsClient);
  //     console.log("sending to ws");
  //     wsClient.send("sync")
  //   }

  //   wsClient.onclose = () => console.log('ws closed');

  //   return () => {
  //     wsClient.close();
  //   }
  // }, [])

  

  // useEffect(() => {
  //   if(!ws) return;

  //   ws.onmessage = (evt) => {
  //     if(evt.data === "ydoc"){
  //       const provider = new WebrtcProvider('room-name', ydoc, { signaling: ['ws://localhost:4000'] })
  //       provider.connect();
  //       // const provider = new WebsocketProvider(WS_URL, 'room-name', doc)
  //       setWsP(provider);
  //     }
  //   }
  // }, [ws])

  // useEffect(() => {
  //   if(!wsP) return;

  //   wsP.on('peers', event => {
  //     // setText(ytext.toString());
  //     console.log('peers');
  //     console.log(event);
  //   })

  //   wsP.on('synced', event => {
  //     console.log("syncing");
  //     console.log(event);
  //   })

  // }, [wsP])


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
    
    const regions = {};
    for(const [subregionId, coordinates] of Object.entries(coords)){
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
      editRegions[subregionId].disable();

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
    console.log(editRegions)
  }, [editRegions])

  function reloadLayer(subregionId){
    // remove old layer
    const oldLayer = loadedRegions[subregionId];
    mapItem.remove(oldLayer);    
    // add new layer
    const newLayer = L.polygon(coords[subregionId]).addTo(mapItem);
    initLayerHandlers(newLayer, subregionId);
    // refresh states to hold new layer
    const newLoadedRegions = {...loadedRegions};
    newLoadedRegions[subregionId] = newLayer;
    setLoadedRegions(newLoadedRegions);

    if(editRegions[subregionId]){
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
    // handle vertex added to layer
  }

  function handleMarkerDragEnd(e, subregionId){

    // handle vertex move
  }

  function handleVertexRemoved(e, subregionId){
    // handle vertex removed from layer
  }


  function initLoadData(e){
    setInitLoad(-1);
  }

  function addItem(e){
    fileState.tmp.insert(0, 'abc');
  }

  function deleteItem(e){
    fileState.tmp.delete(0, 1);
  }

  function printAll(e){
    console.log(JSON.stringify(fileState.tmp));
  }

  function handleInitMapLoad(e) {
    setMapRef(e);
  }

  return (
    <div>
      <button>undo</button>
      <button>redo</button>
      <button onClick={addItem}>add item to ymap</button>
      <button onClick={deleteItem}>delete item from ymap</button>
      <button onClick={initLoadData}>initLoad</button>
      <button onClick={printAll}>print</button>
      <br></br>
      <Header /> 
      <EditToolbar />
      {JSON.stringify(fileState.tmp)}
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
