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
import { parsePolygon, parseMultiPolygon } from "../utils/geojsonParser";
import * as turf from '@turf/turf';
import { union } from 'turf5'
import jsTPS from "../common/jsTPS";
import api from "../file/file-request-api";


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
  const [clearingUndoRedo, setClearingUndoRedo] = useState(false);

  useEffect(() => {
    if(!mapItem) return;

    if(file.editChangeType === EditMode.UNDO_REDO){
      switch(file.editModeAction){
        case EditMode.UNDO: {
          handleUndo();
          return;
        }
        case EditMode.REDO: {
          handleRedo();
          return;
        }
      }
    }
    else if(file.editChangeType === EditMode.EDIT_TOOLBAR){
      mapItem.pm.disableDraw();
      if(editRegionId) reloadLayers([editRegionId]);  
      switch(file.currentEditMode) {
        case EditMode.EDIT_VERTEX: {
          // if(!editRegionId) break;
          // reloadLayers([editRegionId]);     
          break; 
        }
        case EditMode.ADD_SUBREGION: {
          mapItem.pm.enableDraw('Polygon', {
            snappable: true,
            snapDistance: 20,
            continueDrawing: true,
            finishOn: "contextmenu"            
          })
        break;
        }
        case EditMode.REMOVE_SUBREGION: {
          if(editRegionId) setStaleBridgeId(editRegionId)
          break;
        }
        case EditMode.VIEW: {
          break;
        }
        default:
          // mapItem.pm.disableDraw();
          if(editRegionId){
            subregionLayerMap[editRegionId].pm.disable();
          }
      }
    }
  }, [file])

  useEffect(() => {
    // init yjs items
    ydoc = new Y.Doc();
    ymap = ydoc.getMap("regions")
    undoManager = new Y.UndoManager(ymap,  {trackedOrigins: new Set([42])})
    tps = new jsTPS();
    store.loadMapById(mapId);
  }, [])

  // useEffect(() => {
  //   if(!mapItem) return;
  //   switch(file.currentEditMode){
  //     case EditMode.ADD_SUBREGION: {
  //       mapItem.pm.enableDraw('Polygon', {
  //         snappable: true,
  //         snapDistance: 20,
  //         finishOn: 'contextmenu'
  //       });
  //       break;
  //     }
  //     case EditMode.SPLIT_SUBREGION: {
  //       mapItem.pm.enableDraw('Line', {
  //         snappable: true,
  //         snapDistance: 20,
  //         finishOn: 'contextmenu'
  //       });
  //       break;
  //     }
  //     default:
  //       mapItem.pm.disableDraw();
  //   }
  //   reloadLayers();
  // }, [file])


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

    mapItem.eachLayer(function (layer) {
      mapItem.removeLayer(layer);
    });
    
    const yjsRegions = ydoc.getMap('regions').toJSON();
    const regions = {};
    const bounds = L.latLngBounds();
    for(const [subregionId, subregionData] of Object.entries(yjsRegions)){
      if(subregionData["isStale"]) continue;
      const coordinates = subregionData["coords"];
      const layer = L.polygon(coordinates).addTo(mapItem);
      bounds.extend(layer.getBounds());
      regions[subregionId] = layer;
      initLayerHandlers(layer, subregionId);
    }
    mapItem.on('pm:create', (e) => setTransaction([EditMode.ADD_OR_SPLIT_SUBREGION, e]));
    if(bounds.isValid()) {
      mapItem.fitBounds(bounds);
    }
    setInitLoad(1);
    setSubregionLayerMap(regions);
  }, [mapItem, initLoad])


  useEffect(() => {
    if (!auth.user || !auth.socket) return;
    auth.socket.emit('openProject', {mapId: mapId})

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
        //console.log(JSON.stringify(ymap));
        setStaleSubregionIds(subregionIds);
      } 
    })

    return () => {
      auth.socket.emit('closeProject', {
        mapId: mapId,
      });
      auth.socket.removeAllListeners();
    }
  }, [auth]);


  useEffect(() => {
    if(!staleBridgeId) return;
    // layer clicked, change color, enable/disable editing
    if(file.currentEditMode === EditMode.REMOVE_SUBREGION) {
      if(editRegionId) {
        disableLayer(editRegionId);
        setEditRegionId(null);
      } else {
        applyRemoveSubregion(staleBridgeId);
      }
    } else {
      if(editRegionId === staleBridgeId){
        // already click, change selected subregion back to normal
        disableLayer(editRegionId);
        setEditRegionId(null);
      } else {
        // set current one to clicked
        if(editRegionId) disableLayer(editRegionId);
        enableLayer(staleBridgeId);
        setEditRegionId(staleBridgeId);
      }
    }
        
    setStaleBridgeId(null);
  }, [staleBridgeId])

  useEffect(() => {
    if(!transaction) return;
    let transactionType, e, subregionId;
    // create a vertex transaction

    // if(!regionTransaction) return;
    // const e = regionTransaction;
    // mapItem.removeLayer(e.layer);
    // const geoJsonItem = e.layer.toGeoJSON();
    // console.log(geoJsonItem)
    // console.log(file.currentEditMode);
    // if(file.currentEditMode === EditMode.ADD_SUBREGION) {
    //   const coords = parseMultiPolygon([geoJsonItem.geometry.coordinates]);
    //   const coordsStr = JSON.stringify(coords);
    //   auth.socket.emit("add-region", {mapId: mapId, coords: coordsStr});
    // } else if (file.currentEditMode === EditMode.SPLIT_SUBREGION) {
    //   console.log(editRegions);
    //   for(const property in editRegions) {
    //     const region = editRegions[property].toGeoJSON();
    //     const split = polygonSlice(region, geoJsonItem);
    //     for(const temp of split) {
    //       console.log(temp.geometry);
    //       if(temp.geometry.type === "MultiPolygon") {
    //         console.log("Multipolgyon");
    //         const coords = parseMultiPolygon(temp.geometry.coordinates);
    //         const coordsStr = JSON.stringify(coords);
    //         auth.socket.emit("add-region", {mapId: mapId, coords: coordsStr});
    //       } else if (temp.geometry.type === "Polygon") {
    //         console.log("Polgyon");
    //         const coords = parsePolygon(temp.geometry.coordinates);
    //         const coordsStr = JSON.stringify(coords);
    //         auth.socket.emit("add-region", {mapId: mapId, coords: coordsStr});
    //       }
    //     }
    //   }
    // }
    switch(transaction[0]){
      case EditMode.ADD_VERTEX:
      case EditMode.MOVE_VERTEX:
      case EditMode.REMOVE_VERTEX:
        [transactionType, e, subregionId] = transaction;
        const trans = CreateVertexTransaction(transactionType, e, subregionId);
        trans.splice(1, 0, mapId);
        applyVertexTransaction(trans);
        break;
      case EditMode.ADD_OR_SPLIT_SUBREGION:
        [transactionType, e] = transaction;
        mapItem.removeLayer(e.layer);
        const geoJsonItem = e.layer.toGeoJSON();
        geoJsonItem.geometry.coordinates[0].pop();
        // console.log(geoJsonItem);
        if(file.currentEditMode === EditMode.ADD_SUBREGION){
          applyAddSubregion(geoJsonItem);
        }
        break;
    }

    setTransaction(null);
  }, [transaction])

  // function polygonSlice(poly, line) {
  //   if (poly.geometry.type === 'MultiPolygon') {
  //     const polygons = poly.geometry.coordinates.map((c) => turf.polygon(c));
  
  //     let larger = [];
  //     let smaller = [];
  
  //     //keep the larger parts of the polygon together
  //     for (const p of polygons) {
  //       const slices = polygonSlice(p, line);

  //       if(slices.length === 0) {
  //         continue;
  //       } else if (slices.length === 1) {
  //         larger.push(...slices);
  //       } else {
  //         const [largest, ...rest] = slices.sort((a, b) => turf.area(b) - turf.area(a));
  //         larger.push(largest);
  //         smaller.push(...rest);
  //       }
  //     }

  //     const multi = turf.combine(turf.featureCollection(larger)).features;
  
  //     return [...smaller, ...multi];
  //   }
  
  //   const polyAsLine = turf.polygonToLine(poly);
  //   const unionedLines = union(polyAsLine, line);
  //   const polygonized = turf.polygonize(unionedLines);
  //   return polygonized.features.filter((ea) => {
  //     const point = turf.pointOnFeature(ea);
  //     const isInPoly = turf.booleanPointInPolygon(point.geometry.coordinates, poly.geometry);
  //     return isInPoly;
  //   });
  // }

  useEffect(() => {
    if(!staleSubregionIds) return;

    reloadLayers([...staleSubregionIds]);
    setStaleSubregionIds(null);
  }, [staleSubregionIds])

  useEffect(() => {
    if(!clearingUndoRedo) return;
    const changeType = file.editChangeType === EditMode.UNDO_REDO ?  EditMode.NONE : file.editChangeType;
    const hasUndo = tps.undoStack.length > 0;
    const hasRedo = tps.redoStack.length > 0;
    file.clearUndoRedo(changeType, hasUndo, hasRedo);
    setClearingUndoRedo(false);
  }, [clearingUndoRedo]);

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
      if(subregionLayerMap[subregionId]){
        const oldLayer = subregionLayerMap[subregionId];
        mapItem.removeLayer(oldLayer);
        const ymap = ydoc.getMap("regions");
        if(!ymap.get(subregionId) || !ymap.get(subregionId).get("coords")) continue;
        if(ymap.get(subregionId).get("isStale")) continue;
      }

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



  function applyVertexTransaction(data){
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
  
    tps.addTransaction([subregionId]);
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
    //console.log(subregionId, indexPath, newCoords, JSON.stringify(ymap));
    
    tps.addTransaction([subregionId]);
    ydoc.transact(() => {
      coords2.delete(k, 1);
      coords2.insert(k, [newCoords]);
      undoManager.stopCapturing()
    }, 42);
  }

  function applyVertexRemove(subregionId, indexPath, newCoords){
    const [i,j,k] = indexPath;
    const ymap = ydoc.getMap("regions");
    const coords = ymap.get(subregionId, Y.Map).get("coords", Y.Array);
    const coords2 = coords.get(i).get(j);
    
    tps.addTransaction([subregionId]);
    ydoc.transact(() => {
      coords2.delete(k, 1);
      undoManager.stopCapturing();
    }, 42);
  }

  async function applyAddSubregion(geoJsonItem){
    const coords = parseMultiPolygon([geoJsonItem.geometry.coordinates]);
    //console.log(coords);
    const response = await api.createSubregion(mapId, coords);
    if(response.status === 201) {
      const subregionId = response.data.subregion._id;
      const coords = response.data.subregion.coordinates;

      // initNewLayer(subregionId, coords);
      tps.addTransaction([subregionId]);
      ydoc.transact(() => {
        const ymapData = new Y.Map();
        const yArr0 = new Y.Array();
        const yArr1 = new Y.Array()
        const yArr2 = new Y.Array();

        for(let i=0; i<coords.length; i++){
          for(let j=0; j<coords[i].length; j++){
            // const yArr3 = ymapData.get("coords").get(i).get(j);
            for(let k=0; k<coords[i][j].length; k++){
              yArr2.push([coords[i][j][k]]);
            }
          }
        }
        yArr1.push([yArr2]);
        yArr0.push([yArr1]);
        ymapData.set("coords", yArr0);
        const pMap = new Y.Map();
        ymapData.set("properties", pMap);
        ymapData.set("isStale", false);
        ymap.set(subregionId, ymapData);
      }, 42);
    }
  }

  function applyRemoveSubregion(subregionId) {
    const ymap = ydoc.getMap("regions");
    const ySubregion = ymap.get(subregionId, Y.Map);
    tps.addTransaction([subregionId]);
    ydoc.transact(() => {
      ySubregion.set("isStale", true);
      undoManager.stopCapturing();
    }, 42);
  }

  function initNewLayer(subregionId, coords){
    const regions = {...subregionLayerMap};
    const layer = L.polygon(coords).addTo(mapItem);
    regions[subregionId] = layer;
    initLayerHandlers(layer, subregionId);
    setSubregionLayerMap(regions);
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
    let subregionIds = [];
    if(tps.undoStack.length === undoManager.undoStack.length){
      // grab subregion from undoStack
      subregionIds = tps.undoPeek();
    } else if(tps.undoStack.length > undoManager.undoStack.length) {
      // move item to redostack // is an undo op
      subregionIds = tps.undoTransaction();
    } else {
      // move item to undo stack, is an redo op
      subregionIds = tps.redoTransaction();
    }
    if(undoManager.undoStack.length !== tps.undoStack.length || undoManager.redoStack.length !== tps.redoStack.length) {
      console.log("Mismatched Stacks")
      console.log(undoManager.undoStack)
      console.log(tps.undoStack);
      console.log(undoManager.redoStack);
      console.log(tps.redoStack);
    } else {
      //console.log("Matching Stacks")
      setClearingUndoRedo(true);
      return subregionIds;
    }
  }

  function handleInitMapLoad(e) {
    setMapRef(e);
  }

  let tmp = <></>;
  if(store.selectedMap && (store.detailView !== DetailView.NONE)){
    tmp = <div className="w-[300px] h-[600px] flex flex-col gap-5 sticky top-5 self-start">
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
