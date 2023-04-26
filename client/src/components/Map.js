import React, { useEffect, useState, useContext } from "react";
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';  
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import GlobalFileContext from "../file";
import { EditMode } from "../enums";
import AuthContext from "../auth";
import { useParams } from "react-router-dom";
const json1 = require('ot-json1');

export default function Map() {
  const { auth } = useContext(AuthContext);
  const { file } = useContext(GlobalFileContext);
  const [mapRef, setMapRef] = useState(null);
  const [mapItem, setMapItem] = useState(null);
  const [version, setVersion] = useState(1);
  const { mapId } = useParams();

  // Initializes leaflet map reference
  useEffect(()=> {
    if(!mapRef) return;
    const map = L.map(mapRef, {worldCopyJump: true}).setView([39.0119, -98.4842], 5);
    const southWest = L.latLng(-89.98155760646617, -180);
    const northEast = L.latLng(89.99346179538875, 180);
    const bounds = L.latLngBounds(southWest, northEast);
    map.setMaxBounds(bounds);
    map.doubleClickZoom.disable(); 
    setMapItem(map);

    return () => {
      map.remove();
    }
  },[mapRef])

  // Load all subregions into map
  useEffect(()=>{
    if(!auth.user || !file.subregions || !mapItem ) return;
    auth.socket.on('version', function(data){
      if(data.version) {
        setVersion(data.version)
      }
    }); 

    auth.socket.on('owner-ack', function(data){
      setVersion(version + 1)
      // const {subregionId, op} = data;
      // console.log(subregionId, op)
    }); 

    auth.socket.on('others-ack', function(data){
      setVersion(version + 1);
      const {subregionId, op} = data;
      file.updateSubregions(subregionId, op);
    });

    function selectRegion(subregionId){
      if(file.editRegions.includes(subregionId)){
        file.updateEditRegions(file.editRegions.filter(item => item !== subregionId));
      }
      else {
        file.updateEditRegions([...file.editRegions, subregionId]);
      }
    }

    mapItem.eachLayer(function (layer) {
      mapItem.removeLayer(layer);
    });
    
    for(const region of file.subregions) {
      const poly = L.polygon(region.coordinates).addTo(mapItem);
      const subregionId = region._id
      poly.on('click', (e) => selectRegion(subregionId));
      poly.on('pm:vertexadded', (e) => {
        const data = [e.latlng.lat, e.latlng.lng];

        const op = json1.insertOp(e.indexPath, data);
        file.updateSubregions(subregionId, op);

        auth.socket.emit('sendOp', {
          mapId: mapId,
          subregionId: subregionId,
          op : op,
          version : version
        })
      });
      poly.on('pm:markerdragend', (e) => {
        if(e.indexPath) {
          const path = e.indexPath;
          let temp = e.layer.getLatLngs();
          for(const i of path) {
            temp = temp[i];
          }
          const newVal = [temp.lat, temp.lng];

          const index = file.subregions.findIndex(subregion => subregion._id === subregionId);
          let oldVal = file.subregions[index].coordinates;
          for(const i of path) {
            oldVal = oldVal[i];
          }

          const op = json1.replaceOp(path, oldVal, newVal);
          file.updateSubregions(subregionId, op);

          auth.socket.emit('sendOp', {
            mapId: mapId,
            subregionId: subregionId,
            op : op,
            version : version
          })
        }
      });
      poly.on('pm:vertexremoved', (e) => {
        const data = [e.marker._latlng.lat, e.marker._latlng.lng];

        const op = json1.removeOp(e.indexPath, data);
        file.updateSubregions(subregionId, op);

        auth.socket.emit('sendOp', {
          mapId: mapId,
          subregionId: subregionId,
          op : op,
          version : version
        })
      })
      if (file.editRegions.includes(region._id)) {
        poly.setStyle({ fillColor: 'red'});   
        if(file.currentEditMode === EditMode.ADD_VERTEX || file.currentEditMode === EditMode.EDIT_VERTEX) {
          poly.pm.enable({
            removeLayerBelowMinVertexCount: false,
            limitMarkersToCount: 5,
            draggable: false,
            addVertexOn: 'click',
            removeVertexOn: 'click',
            addVertexValidation: addVertexValidate,
            moveVertexValidation: editVertexValidate,
            removeVertexValidation: editVertexValidate,
            hideMiddleMarkers: file.currentEditMode === EditMode.EDIT_VERTEX
          })
        }
      }
    }
    return () => {
      auth.socket.removeAllListeners();
    }
  }, [auth, file, mapItem, version])

  function addVertexValidate(e){
    return file.currentEditMode === EditMode.ADD_VERTEX;
  }

  function editVertexValidate(e){
    return file.currentEditMode === EditMode.EDIT_VERTEX;
  }

  // get div of screen on page load to add map to
  function handleInitMapLoad(e){
    setMapRef(e);
  }

  return (
    <div className="w-full h-[700px] z-10" id="map" ref={handleInitMapLoad}>
    </div>
  );
}