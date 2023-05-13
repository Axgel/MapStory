import React, {useContext, useEffect, useState} from "react";
import { Header, EditToolbar, Map, MapDetailCard } from "../components";
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';  
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import { useParams } from "react-router-dom";
import { GlobalStoreContext } from '../store'
import AuthContext from "../auth";
import GlobalFileContext from "../file";
import { CreateVertexTransaction } from "../transactions";
import { DetailView , EditMode, YdocOp } from "../enums";
import * as Y from 'yjs';
import { convertGeojsonToInternalFormat, parseMultiPolygon, parsePolygon } from "../utils/geojsonParser";
import * as turf from '@turf/turf';
import * as turfHelpers from '@turf/helpers'
import newUnion from '@turf/union';
import { union } from 'turf5'
import jsTPS from "../common/jsTPS";
import api from "../file/file-request-api";
import arrowright from '../assets/arrowright.png'
import arrowleft from '../assets/arrowleft.png'
import closeIcon from "../assets/closeIcon.png"

let ydoc = new Y.Doc({ autoLoad: true });
let ymap = ydoc.getMap("regions");
let undoManager = new Y.UndoManager(ymap, {trackedOrigins: new Set([YdocOp.OP])})
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
  const [splitRegionId, setSplitRegionId] = useState(null);
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
      if(file.currentEditMode !== EditMode.SPLIT_SUBREGION && file.currentEditMode !== EditMode.SLICE_SUBREGION) clearSplitRegionId();
      switch(file.currentEditMode) {
        case EditMode.EDIT_VERTEX: {
          // if(!editRegionId) break;
          // reloadLayers([editRegionId]);     
          break; 
        }
        case EditMode.ADD_SUBREGION: {
          setMapPropOpen(false);
          mapItem.pm.enableDraw('Polygon', {
            snappable: true,
            snapDistance: 20,
            continueDrawing: true,
            finishOn: "contextmenu"            
          })
          if(editRegionId) setStaleBridgeId(editRegionId);
        break;
        }
        case EditMode.REMOVE_SUBREGION: {
          setMapPropOpen(false);
          if(editRegionId) setStaleBridgeId(editRegionId)
          break;
        }
        case EditMode.MERGE_SUBREGION: {
          setMapPropOpen(false);
          if(file.editModeAction === EditMode.MERGING){
            applyMergeSubregion();
            setMergeRegionId([]);
            file.finishAction();
            break;
          }
          if(editRegionId) setStaleBridgeId(editRegionId);
          break;
        }
        case EditMode.SPLIT_SUBREGION: {
          setMapPropOpen(false);
          if(file.editModeAction === EditMode.SEPARATING){
            applySeparateSubregion();
            setSplitRegionId(null);
            file.finishAction();
            break;
          }
          if(editRegionId) setStaleBridgeId(editRegionId);
          break;
        }
        case EditMode.SLICE_SUBREGION: {
          setMapPropOpen(false);
          mapItem.pm.enableDraw('Line', {
            snappable: true,
            snapDistance: 20,
            finishOn: "contextmenu"            
          })
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
    undoManager = new Y.UndoManager(ymap,  {trackedOrigins: new Set([YdocOp.OP])})
    tps = new jsTPS();
    store.loadMapById(mapId);
  }, [])

  useEffect(() => {
    if(file.currentEditMode !== EditMode.MERGE_SUBREGION) {
      if (file.editToolbarBridge !== EditMode.NONE) file.setEditToolbarBridge(EditMode.NONE);
      return;
    }
    if(mergeRegionId.length === 2){
      file.setEditToolbarBridge(EditMode.MERGE_READY);
    } else {
      file.setEditToolbarBridge(EditMode.NONE);
    }
  }, [mergeRegionId]);

  useEffect(() => {
    //clearing bridge when not in split/slice
    if(file.currentEditMode !== EditMode.SPLIT_SUBREGION && file.currentEditMode !== EditMode.SLICE_SUBREGION) {
      if (file.editToolbarBridge !== EditMode.NONE) file.setEditToolbarBridge(EditMode.NONE);
      return;
    }

    if(splitRegionId){
      const ymap = ydoc.getMap("regions");
      const ySubregion = ymap.get(splitRegionId);
      if(ySubregion && ySubregion.get("coords").toJSON().length > 1) {
        file.setEditToolbarBridge(EditMode.SPLIT_READY);
      } else {
        file.setEditToolbarBridge(EditMode.SLICE_READY);
      }
    } else {
      if(file.currentEditMode === EditMode.SLICE_SUBREGION) {
        file.resetSliceBridge();
      } else {
        file.setEditToolbarBridge(EditMode.NONE);
      }
    }
  }, [splitRegionId]);

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

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mapItem);
    
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
    mapItem.on('pm:create', (e) => setTransaction([EditMode.ADD_OR_SLICE_SUBREGION, e]));
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
      Y.applyUpdate(ydoc, uintArray, YdocOp.NO_OP);
      setInitLoad(-1);
    })

    auth.socket.on('others-update', (data) => {
      const {subregionIds, op} = data;
      const parsed = JSON.parse(op);
      const uintArray = Uint8Array.from(parsed);
      Y.applyUpdate(ydoc, uintArray, YdocOp.NO_OP);
      setStaleSubregionIds(subregionIds);
    })

    ydoc.on('update', (update, origin) => {
      switch(origin) {
        case YdocOp.NO_OP:
          //inital load + remote changes
          break;
        case YdocOp.OP:
          //vertex + subregion
          const { subregionIds, opType } = getTPSMetadata();
          sendOp(subregionIds, opType, update);
          break;
        default:
          //undo manager
          if(typeof origin === 'object') {
            const { subregionIds, opType } = getTPSMetadata();
            sendOp(subregionIds, opType, update);
          } else {
            //property
            const subregionIds = [origin];
            const opType = YdocOp.PROPERTY;
            sendOp(subregionIds, opType, update);
          }
      }
    })

    function sendOp(subregionIds, opType, update) {
      const arr = Array.from(update);
      const op = JSON.stringify(arr);
      auth.socket.emit('op', {mapId: mapId, subregionIds: subregionIds, opType: opType, op: op});
      setStaleSubregionIds(subregionIds);
    }

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
    if(file.currentEditMode === EditMode.ADD_SUBREGION) {
      if(editRegionId) {
        disableLayer(editRegionId);
        setEditRegionId(null);
      }
    } else if(file.currentEditMode === EditMode.REMOVE_SUBREGION) {
      if(editRegionId) {
        disableLayer(editRegionId);
        setEditRegionId(null);
      } else {
        applyRemoveSubregion(staleBridgeId);
      }
    } else if(file.currentEditMode === EditMode.MERGE_SUBREGION) {
      if(editRegionId){
        setMergeRegionId([editRegionId]);
        setEditRegionId(null);
      } else {
        setRegionsToMerge(staleBridgeId);
      }
    } else if(file.currentEditMode === EditMode.SPLIT_SUBREGION) {
      if(editRegionId) {
        setEditRegionId(null);
      }
      setRegionToSplit(staleBridgeId);
    } else if(file.currentEditMode === EditMode.SLICE_SUBREGION) {
      return;
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
    switch(transaction[0]){
      case EditMode.ADD_VERTEX:
      case EditMode.MOVE_VERTEX:
      case EditMode.REMOVE_VERTEX:
        [transactionType, e, subregionId] = transaction;
        const trans = CreateVertexTransaction(transactionType, e, subregionId);
        trans.splice(1, 0, mapId);
        applyVertexTransaction(trans);
        break;
      case EditMode.ADD_OR_SLICE_SUBREGION:
        [transactionType, e] = transaction;
        mapItem.removeLayer(e.layer);
        const geoJsonItem = e.layer.toGeoJSON();
        if(file.currentEditMode === EditMode.ADD_SUBREGION){
          //geoJsonItem.geometry.coordinates[0].pop();
          applyAddSubregion(geoJsonItem);
        } else {
          applySliceSubregion(geoJsonItem);
        }
        break;
    }

    setTransaction(null);
  }, [transaction])

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
        if(!ymap.get(subregionId) || !ymap.get(subregionId).get("coords") || ymap.get(subregionId).get("isStale")) {
          if (editRegionId === subregionId) setEditRegionId(null);
          if (mergeRegionId.includes(subregionId)) setMergeRegionId([]);
          if (splitRegionId === subregionId) setSplitRegionId(null);
          continue
        }
      }

      const coords = ymap.get(subregionId).get("coords").toJSON();
      const newLayer = L.polygon(coords).addTo(mapItem);
      initLayerHandlers(newLayer, subregionId);
      newSubregionLayerMap[subregionId] = newLayer;
      
      if(editRegionId === subregionId){
        newLayer.setStyle({fillColor: 'red'});
        enableEditing(newLayer);
      }

      if(mergeRegionId.includes(subregionId)){
        newLayer.setStyle({fillColor: 'red'});
      }

      if(splitRegionId === subregionId){
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
  
    tps.addTransaction([subregionId], YdocOp.VERTEX);
    ydoc.transact(() => {
      coords2.insert(k, [newCoords]);
      undoManager.stopCapturing();
    }, YdocOp.OP);
  }

  function applyVertexMove(subregionId, indexPath, newCoords){
    const [i,j,k] = indexPath
    const ymap = ydoc.getMap("regions");
    const coords = ymap.get(subregionId, Y.Map).get("coords", Y.Array);
    const coords2 = coords.get(i).get(j);
    //console.log(subregionId, indexPath, newCoords, JSON.stringify(ymap));
    
    tps.addTransaction([subregionId], YdocOp.VERTEX);
    ydoc.transact(() => {
      coords2.delete(k, 1);
      coords2.insert(k, [newCoords]);
      undoManager.stopCapturing()
    }, YdocOp.OP);
  }

  function applyVertexRemove(subregionId, indexPath, newCoords){
    const [i,j,k] = indexPath;
    const ymap = ydoc.getMap("regions");
    const coords = ymap.get(subregionId, Y.Map).get("coords", Y.Array);
    const coords2 = coords.get(i).get(j);
    
    tps.addTransaction([subregionId], YdocOp.VERTEX);
    ydoc.transact(() => {
      coords2.delete(k, 1);
      undoManager.stopCapturing();
    }, YdocOp.OP);
  }

  async function applyAddSubregion(geoJsonItem){
    const coords = parseMultiPolygon([geoJsonItem.geometry.coordinates], 0);
    const response = await api.createSubregion(mapId, coords);
    if(response.status === 201) {
      const subregionId = response.data.subregion._id;
      const coords = response.data.subregion.coordinates;

      tps.addTransaction([subregionId], YdocOp.SUBREGION);
      ydoc.transact(() => {
        addSubregionToYDoc(subregionId, coords);
        undoManager.stopCapturing();
      }, YdocOp.OP);
    }
  }

  function addSubregionToYDoc(subregionId, coords) {
    const ymap = ydoc.getMap("regions");
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
  }

  function applyRemoveSubregion(subregionId) {
    const ymap = ydoc.getMap("regions");
    const ySubregion = ymap.get(subregionId, Y.Map);
    tps.addTransaction([subregionId], YdocOp.SUBREGION);
    ydoc.transact(() => {
      ySubregion.set("isStale", true);
      undoManager.stopCapturing();
    }, YdocOp.OP);
  }

  async function createSubregions(subregions) {
    const asyncSubregions = [];
    for(let i=0; i< subregions.length; i++){
      const coords = subregions[i];
      asyncSubregions.push(await api.createSubregion(mapId, coords));
    }
    const addedRegions = await Promise.all(asyncSubregions);
    const arr = {}
    for(const response of addedRegions) {
      if(response.status === 201) {
        const subregionId = response.data.subregion._id;
        const coords = response.data.subregion.coordinates;
        arr[subregionId] = coords;
      }
    }
    return arr;
  }    

  
  async function applySliceSubregion(geoJsonItem) {
    const ymap = ydoc.getMap("regions");
    const ySubregion = ymap.get(splitRegionId, Y.Map);
    const subregion = turfHelpers.multiPolygon(ySubregion.get("coords").toJSON());

    const split = polygonSlice(subregion, turf.flip(geoJsonItem));
    const arr = [];
    for(const temp of split) {
      if(temp.geometry.type === "MultiPolygon") {
        console.log("Multipolgyon From Split!");
      } else if (temp.geometry.type === "Polygon") {
        // const coords = [temp.geometry.coordinates]
        const coords = parseMultiPolygon([temp.geometry.coordinates], 2);
        arr.push(coords);
      }
    }
    const coordsMap = await createSubregions(arr);
    tps.addTransaction([splitRegionId, ...Object.keys(coordsMap)], YdocOp.SUBREGION);
    ydoc.transact(() => {
      ySubregion.set("isStale", true);
      for(const [subregionId, coordinates] of Object.entries(coordsMap)){
        addSubregionToYDoc(subregionId, coordinates);
      }
      undoManager.stopCapturing();
    }, YdocOp.OP);
  }

  function polygonSlice(poly, line) {
    if (poly.geometry.type === 'MultiPolygon') {
      const fakeGeoJSON = {
        features: [poly]
      }
      const internalData = convertGeojsonToInternalFormat(fakeGeoJSON, 3);
      const tmpCoords = internalData[0]["coords"];
      const polygons = tmpCoords.map((c) => turf.polygon(c));
  
      const arr = [];
      for (const p of polygons) {
        const slices = polygonSlice(p, line);
        arr.push(...slices);
      }
      return arr;
    }

    const polyAsLine = turf.polygonToLine(poly);
    const unionedLines = union(polyAsLine, line);
    const polygonized = turf.polygonize(unionedLines);
    return polygonized.features.filter((ea) => {
      const point = turf.pointOnFeature(ea);
      const isInPoly = turf.booleanPointInPolygon(point.geometry.coordinates, poly.geometry);
      return isInPoly;
    });
  }

  async function applySeparateSubregion(){
    const ymap = ydoc.getMap("regions");
    const ySubregion = ymap.get(splitRegionId, Y.Map);
    const temp = ySubregion.get("coords").toJSON();
    const coordsArr = temp.map((coords) => [coords]);
    const coordsMap = await createSubregions(coordsArr);
    tps.addTransaction([splitRegionId, ...Object.keys(coordsMap)], YdocOp.SUBREGION);
    ydoc.transact(() => {
      ySubregion.set("isStale", true);
      for(const [subregionId, coordinates] of Object.entries(coordsMap)){
        addSubregionToYDoc(subregionId, coordinates);
      }
      undoManager.stopCapturing();
    }, YdocOp.OP);
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
    const internalData = convertGeojsonToInternalFormat(fakeGeoJSON, 2);
    const tmpCoords = internalData[0]["coords"];

    const response = await api.createSubregion(mapId, tmpCoords);
    if(response.status === 201) {
      const subregionId = response.data.subregion._id;
      const coords = response.data.subregion.coordinates;

      tps.addTransaction([subregionId, mergeRegionId[0], mergeRegionId[1]], YdocOp.SUBREGION);
      ydoc.transact(() => {
        ySubregion11.set("isStale", true);
        ySubregion22.set("isStale", true);
        addSubregionToYDoc(subregionId, coords);
        undoManager.stopCapturing();
      }, YdocOp.OP);
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

  function setRegionToSplit(subregionId){
    if(splitRegionId === subregionId) {
      subregionLayerMap[splitRegionId].setStyle({ fillColor: '#3387FF'});
      setSplitRegionId(null);
    } else {
      if(splitRegionId) subregionLayerMap[splitRegionId].setStyle({ fillColor: '#3387FF'});
      subregionLayerMap[subregionId].setStyle({ fillColor: 'red'})
      setSplitRegionId(subregionId);
    }
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
    if(mergeRegionId.length === 0) return;
    for(const subregionId of mergeRegionId) {
      const layer = subregionLayerMap[subregionId];
      if(layer) layer.setStyle({ fillColor: '#3387FF'});
    }
    setMergeRegionId([]);
  }

  function clearSplitRegionId() {
    if(!splitRegionId) return
    const region = subregionLayerMap[splitRegionId]
    if (region) region.setStyle({ fillColor: '#3387FF'});
    setSplitRegionId(null);
  }

  function getTPSMetadata(){
    let metadata = {};
    if(tps.undoStack.length === undoManager.undoStack.length){
      // grab subregion from undoStack
      metadata = tps.undoPeek();
    } else if(tps.undoStack.length > undoManager.undoStack.length) {
      // move item to redostack // is an undo op
      metadata = tps.undoTransaction();
    } else {
      // move item to undo stack, is an redo op
      metadata = tps.redoTransaction();
    }
    if(undoManager.undoStack.length !== tps.undoStack.length || undoManager.redoStack.length !== tps.redoStack.length) {
      console.log("Mismatched Stacks")
      console.log(undoManager.undoStack)
      console.log(tps.undoStack);
      console.log(undoManager.redoStack);
      console.log(tps.redoStack);
    } else {
      setClearingUndoRedo(true);
      return metadata;
    }
  }

  function handleInitMapLoad(e) {
    setMapRef(e);
  }

  let tmp = <></>;
  if(store.selectedMap && (store.detailView !== DetailView.NONE)){
    tmp = <div className="w-[300px] min-h-[400px] h-full sticky top-5 self-start">
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
      undoManager.stopCapturing();
    }, editRegionId)
    handleEditProp(newTextKey, newTextValue);
  }

  function handleDeletePropEdit(){
    const ymap = ydoc.getMap("regions");
    const props = ymap.get(editRegionId, Y.Map).get("properties", Y.Map);
    const newTextKey = document.getElementById("inputPropTextKey").value
    // const newTextValue = document.getElementById("inputPropTextValue").value

    ydoc.transact(() => {
      props.delete(newTextKey);
      undoManager.stopCapturing();
    }, editRegionId)
    handleNewEditProp();
  }

  let mapProps =
    <div className="w-[300px] min-h-[400px] h-full sticky top-5 self-start">
      <div className="border-solid h-full rounded-lg border flex flex-col bg-brownshade-700">
        <div className="h-12 flex items-center px-2 gap-4 ">
          <img src={arrowleft} className="w-[30px] h-[30px]" alt="" onClick={handleMapProp}></img>
          Region Properties
        </div>
        <div className="h-[1px] bg-black"></div>
      </div>
    </div>
  if(mapPropOpen){
    if(editRegionId){
      let tmpProperties = {};
      try{
        tmpProperties = ydoc.getMap('regions').get(editRegionId).get('properties').toJSON();
      } catch (e){
        tmpProperties = {};
      }

      let editPropInput =
        <div>
          <h1 className="mx-6 my-1 text-start">Key:</h1>
          <input id="inputPropTextKey" className="ml-6 w-[240px] h-[25px] rounded-lg shadow-lg bg-transparent outline-none border-solid border pborder-lightgrey text-base mb-[5px]" type="text" defaultValue={propEdit[0]} key={propEditKeyRefresh} disabled={propEdit[0] == "" ? false : true}></input>
          <h1 className="mx-6 my-1 text-start">Value:</h1>
          <input id="inputPropTextValue" className="ml-6 w-[240px] h-[25px] rounded-lg shadow-lg bg-transparent outline-none border-solid border pborder-lightgrey text-base mb-[5px]" type="text" defaultValue={propEdit[1]} key={propEdit}></input>

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
      <div className="w-[300px] min-h-[400px] h-full sticky top-5 self-start">
        <div className="border-solid h-full rounded-lg border flex flex-col bg-brownshade-700">
          <div className="h-12 flex items-center px-2 gap-4 ">
            <img src={arrowleft} className="w-[30px] h-[30px]" alt="" onClick={handleMapProp}></img>
            Region Properties
          </div>
          <div className="h-[1px] bg-black"></div>

          {editPropInput}

        <div className="flex flex-col overflow-y-auto">
          {
            Object.keys(tmpProperties).map((k, index) => ( 
              <div className="bg-modalbgfill hover:bg-white">
                <div onClick={(e) => handleEditProp(k, tmpProperties[k])} key={index} className="flex gap-[16px] justify-between items-center px-3.5 py-2 ">
                  <p className="text-sm font-extrabold break-all">{k}</p>
                  <p className="border-none bg-transparent outline-none text-sm break-all">{tmpProperties[k]}</p>
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
    <>
      {/* <div className="w-[20px] min-h-[400px] h-full sticky top-5 self-start">
        <div className="border-solid h-full rounded-lg border flex flex-col bg-brownshade-700">
        </div>
      </div> */}
            <img onClick={handleMapProp} className="absolute w-[30px] h-[30px] z-50 mt-[100px]" src={arrowright}></img>
    </>
  }


  return (
    <div className="flex flex-col h-screen">
      <Header /> 
      <EditToolbar />
      {/* <Map/> */}
      <div className="flex grow min-h-[400px]">
        <div>
          {mapProps}
        </div>
        <div className="w-full min-h-[400px] h-full z-0 overflow-hidden" id="map" ref={handleInitMapLoad}>
        </div>
        <div>
          {tmp}
        </div>
      </div>      
    </div>
  );
}
