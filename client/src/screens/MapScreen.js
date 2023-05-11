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
import * as turfHelpers from '@turf/helpers'
import newUnion from '@turf/union';
import { union } from 'turf5'
import jsTPS from "../common/jsTPS";
import api from "../file/file-request-api";
import { convertGeojsonToInternalFormat, convertGeojsonToInternalFormatNoSwap } from "../utils/geojsonParser";
import arrowright from '../assets/arrowright.png'
import arrowleft from '../assets/arrowleft.png'
import closeIcon from "../assets/closeIcon.png"

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
  const [mapPropOpen, setMapPropOpen] = useState(false);
  const [propEdit, setPropEdit] = useState(["",""]);
  const [propEditKeyRefresh, setPropEditKeyRefresh] = useState([""]);

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
      if(file.currentEditMode !== EditMode.MERGE_SUBREGION) clearMergeRegionIds();

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
        case EditMode.MERGE_SUBREGION: {
          if(file.editModeAction === EditMode.MERGING){
            applyMergeSubregion();
            setMergeRegionId([]);
            file.finishAction();
            break;
          }
          if(editRegionId) setStaleBridgeId(editRegionId);
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

  useEffect(() => {
    if(mergeRegionId.length === 2){
      file.setEditToolbarBridge(EditMode.MERGE_READY);
    } else {
      file.setEditToolbarBridge(EditMode.NONE);
    }
  }, [mergeRegionId])
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
    } else if(file.currentEditMode === EditMode.MERGE_SUBREGION){
      if(editRegionId){
        setMergeRegionId([editRegionId]);
        setEditRegionId(null);
      } else {
        setRegionsToMerge(staleBridgeId);
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
    setPropEdit(["",""]);
    setPropEditKeyRefresh(["c"]);
  }, [editRegionId])

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

      if(mergeRegionId.includes(subregionId)){
        newLayer.setStyle({fillColor: 'red'});
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
    console.log(coords);
    const response = await api.createSubregion(mapId, coords);
    if(response.status === 201) {
      const subregionId = response.data.subregion._id;
      const coords = response.data.subregion.coordinates;

      tps.addTransaction([subregionId]);
      ydoc.transact(() => {
        const ymapData = new Y.Map();
        
        const yArr0 = new Y.Array();
        for(let i=0; i<coords.length; i++){
          const yArr1 = new Y.Array()
          for(let j=0; j<coords[i].length; j++){
            const yArr2 = new Y.Array();
            for(let k=0; k<coords[i][j].length; k++){
              yArr2.push([coords[i][j][k]]);
            }
            yArr1.push([yArr2]);
          }
          yArr0.push([yArr1]);
        }
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

  async function applyMergeSubregion(){
    const ymap = ydoc.getMap("regions");
    const ySubregion1 = ymap.get(mergeRegionId[0], Y.Map).get("coords").toJSON();
    const ySubregion2 = ymap.get(mergeRegionId[1], Y.Map).get("coords").toJSON();

    const ySubregion11 = ymap.get(mergeRegionId[0], Y.Map);
    const ySubregion22 = ymap.get(mergeRegionId[1], Y.Map);


    const newLayer = newUnion(turfHelpers.multiPolygon(ySubregion1), turfHelpers.multiPolygon(ySubregion2));
    const fakeGeoJSON = {
      features: [newLayer]
    }
    const internalData = await convertGeojsonToInternalFormatNoSwap(fakeGeoJSON);
    const tmpCoords = internalData[0]["coords"];

    const response = await api.createSubregion(mapId, tmpCoords);
    if(response.status === 201) {
      const subregionId = response.data.subregion._id;
      const coords = response.data.subregion.coordinates;
      console.log(coords);
      tps.addTransaction([subregionId, mergeRegionId[0], mergeRegionId[1]]);
      ydoc.transact(() => {
        ySubregion11.set("isStale", true);
        ySubregion22.set("isStale", true);

        const ymapData = new Y.Map();
        
        const yArr0 = new Y.Array();
        for(let i=0; i<coords.length; i++){
          const yArr1 = new Y.Array()
          for(let j=0; j<coords[i].length; j++){
            const yArr2 = new Y.Array();
            for(let k=0; k<coords[i][j].length; k++){
              yArr2.push([coords[i][j][k]]);
            }
            yArr1.push([yArr2]);
          }
          yArr0.push([yArr1]);
        }
        ymapData.set("coords", yArr0);
        const pMap = new Y.Map();
        ymapData.set("properties", pMap);
        ymapData.set("isStale", false);
        ymap.set(subregionId, ymapData);
        console.log(ymap.get(subregionId).toJSON());
        undoManager.stopCapturing();
      }, 42);
    }
  }

  function setRegionsToMerge(subregionId){
    if(mergeRegionId.length === 0){
      addRegionToMerge(subregionId);
    } else if (mergeRegionId.length === 1){
      if(mergeRegionId[0] === subregionId) removeRegionToMerge(0);
      else addRegionToMerge(subregionId);
    } else {
      if(mergeRegionId[0] === subregionId) removeRegionToMerge(0);
      else if(mergeRegionId[1] === subregionId) removeRegionToMerge(1);
      else {
        removeAndAddRegionToMerge(subregionId);
      }
    }
  }

  function addRegionToMerge(subregionId){
    subregionLayerMap[subregionId].setStyle({ fillColor: 'red'})
    setMergeRegionId([...mergeRegionId, subregionId]);
  }

  function removeRegionToMerge(idx){
    const subregionId = mergeRegionId[idx];
    subregionLayerMap[subregionId].setStyle({ fillColor: '#3387FF'});
    const newMergeRegionId = [...mergeRegionId];
    if(idx === 0){
      newMergeRegionId.shift();
    } else if (idx === 1){
      newMergeRegionId.pop();
    }

    setMergeRegionId(newMergeRegionId);
  }
  function removeAndAddRegionToMerge(subregionId){
    subregionLayerMap[mergeRegionId[0]].setStyle({ fillColor: '#3387FF'});
    const newMergeRegionId = [...mergeRegionId];
    newMergeRegionId.shift();
    subregionLayerMap[subregionId].setStyle({ fillColor: 'red'})
    setMergeRegionId([...newMergeRegionId, subregionId]);
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

  function clearMergeRegionIds(){
    if(mergeRegionId.length !== 2) return;
    subregionLayerMap[mergeRegionId[0]].setStyle({ fillColor: '#3387FF'});
    subregionLayerMap[mergeRegionId[1]].setStyle({ fillColor: '#3387FF'});
    setMergeRegionId([]);
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
    tmp = <div className="w-[300px] min-h-[400px] h-screen sticky top-5 self-start">
            <MapDetailCard mapDetails={store.selectedMap} />
          </div>
  }

  function handleMapProp(){
    setMapPropOpen(!mapPropOpen);
  }

  function handleEditProp(k,v){
    if(store.selectedMap.isPublished) return;
    setPropEdit([k,v]);
    setPropEditKeyRefresh(["a"]);

    document.getElementById("inputPropTextKey").value = k
    document.getElementById("inputPropTextValue").value = v
  }

  function handleNewEditProp(){
    setPropEdit(["",""]);
    setPropEditKeyRefresh(["b"]);

    document.getElementById("inputPropTextKey").value = ""
    document.getElementById("inputPropTextValue").value = ""
  }

  function handleSavePropEdit(){
    const ymap = ydoc.getMap("regions");
    const props = ymap.get(editRegionId, Y.Map).get("properties", Y.Map);
    const newTextKey = document.getElementById("inputPropTextKey").value
    const newTextValue = document.getElementById("inputPropTextValue").value

    ydoc.transact(() => {
      props.set(newTextKey, newTextValue)
    }, 99)
    handleEditProp(newTextKey, newTextValue);
  }

  function handleDeletePropEdit(){
    const ymap = ydoc.getMap("regions");
    const props = ymap.get(editRegionId, Y.Map).get("properties", Y.Map);
    const newTextKey = document.getElementById("inputPropTextKey").value
    // const newTextValue = document.getElementById("inputPropTextValue").value

    ydoc.transact(() => {
      props.delete(newTextKey);
    }, 99)
    handleNewEditProp();
  }

  let mapProps = <></>
  if(mapPropOpen){
    if(editRegionId){
      const tmpProperties = ydoc.getMap('regions').get(editRegionId).get('properties').toJSON();


      let editPropInput =
        <div>
          <h1 className="mx-6 my-1 text-start">Key:</h1>
          <input id="inputPropTextKey" className="w-[250px] h-[25px] rounded-lg shadow-lg bg-transparent outline-none border-solid border pborder-lightgrey text-base mx-6 pl-2 mb-[5px]" type="text" defaultValue={propEdit[0]} key={propEditKeyRefresh} disabled={propEdit[0] == "" ? false : true}></input>
          <h1 className="mx-6 my-1 text-start">Value:</h1>
          <input id="inputPropTextValue" className="w-[250px] h-[25px] rounded-lg shadow-lg bg-transparent outline-none border-solid border pborder-lightgrey text-base mx-6 pl-2 mb-[5px]" type="text" defaultValue={propEdit[1]} key={propEdit}></input>

          <div className="flex mx-6 justify-around mb-2">
            <div className="border-solid border rounded-lg text-center px-3 py-1 bg-publishfill hover:bg-opacity-50" onClick={handleSavePropEdit}>
              Save
            </div>
            <div className="border-solid border rounded-lg text-center px-3 py-1 bg-deletefill hover:bg-opacity-50" onClick={handleDeletePropEdit}>
              Delete
            </div>
            <div className="border-solid border rounded-lg text-center px-3 py-1 bg-forkfill hover:bg-opacity-50" onClick={handleNewEditProp}>
              Clear
            </div>
          </div>

          <div className="h-[1px] bg-black"></div>
        </div>
      
      if(store.selectedMap.isPublished){
        editPropInput = <></>;
      }

      mapProps = 
      <div className="w-[300px] min-h-[400px] h-screen sticky top-5 self-start">
        <div className="border-solid h-full rounded-lg border flex flex-col bg-brownshade-700 overflow-scroll	">
          <div className="h-12 flex items-center px-2 gap-4 ">
            <img src={arrowleft} className="w-[30px] h-[30px]" alt="" onClick={handleMapProp}></img>
            Region Properties
          </div>
          <div className="h-[1px] bg-black"></div>

          {editPropInput}

        <div className="flex flex-col overflow-scroll">
          {
            Object.keys(tmpProperties).map((k, index) => ( 
              <div className="bg-modalbgfill hover:bg-white">
                <div onClick={(e) => handleEditProp(k, tmpProperties[k])} key={index} className="flex justify-between items-center px-3.5 py-2 ">
                  <p className="text-sm font-extrabold">{k}</p>
                  <p className="border-none bg-transparent outline-none text-sm">{tmpProperties[k]}</p>
                </div>
                <div className="h-[1px] bg-modalborder border-opacity-60"></div>
              </div>
            ))
          }
        </div>
        </div>
      </div>
    }
  } else {
    mapProps = 
    <div className="min-h-[400px] h-screen absolute z-40 flex flex-col pt-[100px] px-[10px]">
      <img onClick={handleMapProp} className="w-[30px] h-[30px]" src={arrowright}></img>
    </div>
  }


  return (
    <div>
      <Header /> 
      <EditToolbar />
      {/* <Map/> */}
      <div className="flex">
        <div>
          {mapProps}
        </div>
        <div className="w-full min-h-[400px] h-screen z-0" id="map" ref={handleInitMapLoad}>
        </div>
        <div>
          {tmp}
        </div>
      </div>      
      <br></br>
    </div>
  );
}
