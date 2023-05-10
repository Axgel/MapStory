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
const actions = [
  // uses the default 'cancel' action
  'cancel',
  // creates a new action that has text, no click event
  { text: 'Custom text, no click' },
  // creates a new action with text and a click event
  {
    text: 'click me',
    onClick: () => {
      alert('🙋‍♂️');
    },
  },
];


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
  const [regionTransaction, setRegionTransaction] = useState(null);
  const [incTransaction, setIncTransaction] = useState(null);
  const { mapId } = useParams();

  useEffect(() => {
    ydoc = new Y.Doc();
    ymap = ydoc.getMap("regions")
    undoManager = new Y.UndoManager(ymap,  {trackedOrigins: new Set([42])})
  }, [])

  useEffect(() => {
    if(!mapItem) return;
    switch(file.currentEditMode){
      case EditMode.ADD_SUBREGION: {
        mapItem.pm.enableDraw('Polygon', {
          snappable: true,
          snapDistance: 20,
        });
        
        break;
      }
      default:
        mapItem.pm.disableDraw();
    }
    reloadLayers();
  }, [file])

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
      console.log(JSON.stringify(ymap));
      setInitLoad(-1);
    })

    auth.socket.on('others-update', (data) => {
      const {op} = data;
      const parsed = JSON.parse(op);
      const uintArray = Uint8Array.from(parsed);
      Y.applyUpdate(ydoc, uintArray, -1);
      // console.log(JSON.stringify(ymap));
      // setIncTransaction([true]);
      setInitLoad(-1);
    })

    auth.socket.on('add-region-ack', (data) => {
      const {subregionId, coords } = data;
      console.log(subregionId);
      const ymapData = new Y.Map();
      ymap.set(subregionId, ymapData);
      const yArr0 = new Y.Array();
      const yArr1 = new Y.Array();
      const yArr2 = new Y.Array();
      yArr0.push([yArr1]);
      yArr1.push([yArr2])
      ymapData.set("coords", yArr0);

      ydoc.transact(() => {
        const coordinates = JSON.parse(coords);
        console.log(coordinates, coordinates.length, coordinates[0].length, coordinates[0][0].length);
        // const yArr0 = ymapData.get("coords")
        for(let i=0; i<coordinates.length; i++){
          // const yArr1 = ymapData.get("coords").get(i);
          for(let j=0; j<coordinates[i].length; j++){
            const yArr3 = ymapData.get("coords").get(i).get(j);
            for(let k=0; k<coordinates[i][j].length; k++){
              yArr3.push([coordinates[i][j][k]]);
            }
            // yArr1.push([yArr2]);
          }
          // yArr0.push([yArr1]);
        }
        
        // ymapData.set("coords", yArr0);
        console.log(JSON.stringify(ymap));
      }, 42);

      setInitLoad(-1);
    })

    ydoc.on('update', (update, origin) => {
      console.log("updated", origin);
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
  }, [auth, ydoc]);

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
    
    mapItem.eachLayer(function (layer) {
      if(!layer._latlngs) return;
      mapItem.removeLayer(layer);
    });

    const yjsRegions = ydoc.getMap('regions').toJSON();
    const regions = {};
    const bounds = L.latLngBounds();
    for(const [subregionId, subregionData] of Object.entries(yjsRegions)){
      const coordinates = subregionData["coords"];
      if(!coordinates) continue;
      const layer = L.polygon(coordinates).addTo(mapItem);
      bounds.extend(layer.getBounds());
      regions[subregionId] = layer;
      initLayerHandlers(layer, subregionId);
    }
    mapItem.fitBounds(bounds);
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
    if(!regionTransaction) return;
    const [transaction , e] = regionTransaction;

    mapItem.removeLayer(e.layer);
    const geoJsonItem = e.layer.toGeoJSON();
    if(transaction == TransactionType.ADD_SUBREGION){
      const coords = parseMultiPolygon([geoJsonItem.geometry.coordinates]);
      const coordsStr = JSON.stringify(coords);
      auth.socket.emit("add-region", {mapId: mapId, coords: coordsStr});
    }
  
    setRegionTransaction(null);  
  }, [regionTransaction])

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
    mapItem.on('pm:create', (e) => setRegionTransaction([TransactionType.ADD_SUBREGION, e]));
  }

  function enableEditing(layer){
    if(file.currentEditMode === EditMode.EDIT_VERTEX){
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
    console.log(indexPath);
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
    console.log(indexPath);
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
      if(!ymap.get(subregionId) || !ymap.get(subregionId).get("coords")) continue;
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

  function handleRemoveLast(){
    setIncTransaction([true]);
  }

  let tmp = <></>;
  if(store.selectedMap && (store.detailView !== DetailView.NONE)){
    console.log(store.detailView)
    tmp = <div className="flex flex-col h-full sticky top-5 self-start z-10">
            <MapDetailCard mapDetails={store.selectedMap} />
          </div>
  }
  return (
    <div>
      <button onClick={handleUndo}>undo</button>
      <button onClick={handleRedo}>redo</button>
      <button onClick={handleRemoveLast}>remove last placed</button>
      <button onClick={handlePrint}>print</button>
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
