import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';  
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import jsTPS from "../common/jsTPS";
import api from "./file-request-api";
import AuthContext from "../auth";
import { GlobalFileActionType } from "../enums";
import GlobalStoreContext from "../store";
import { EditMode } from "../enums";
import { Test_Transaction } from "../transactions";
import { createVertexOperationPath } from "../utils/Map/CreateOperationPath";
import * as Y from 'yjs'

export const GlobalFileContext = createContext({});
console.log("create GlobalFileContext");

const tps = new jsTPS();

function GlobalFileContextProvider(props) {
  const { auth } = useContext(AuthContext);
  const { store } = useContext(GlobalStoreContext);
  const navigate = useNavigate();

  const [file, setFile] = useState({
    currentEditMode: EditMode.NONE,
    editRegions: {},
  })
  
  const fileReducer = (action) => {
    const { type, payload } = action;
    switch (type) {
      case GlobalFileActionType.LOAD_SUBREGIONS: {
        return setFile({
          ...file,
          currentEditMode: EditMode.NONE,
          editRegions: [],
        })
      }
      case GlobalFileActionType.SET_EDIT_MODE: {
        return setFile({
          ...file,
          currentEditMode: payload.currentEditMode
        })
      }
      case GlobalFileActionType.UPDATE_EDIT_REGIONS: {
        return setFile({
          ...file,
          editRegions: payload.editRegions
        })
      }
      case GlobalFileActionType.REFRESH: {
        return setFile({
          ...file
        })
      }
      case GlobalFileActionType.UPDATE_SUBREGIONS: {
        return setFile({
          ...file,
          subregions: payload.subregions
        })
      }
      default:
        return file;
    }
  };
  
  file.initMapContainer = function(mapRef) {
    const map = L.map(mapRef, {worldCopyJump: true}).setView([39.0119, -98.4842], 5);
    const southWest = L.latLng(-89.98155760646617, -180);
    const northEast = L.latLng(89.99346179538875, 180);
    const bounds = L.latLngBounds(southWest, northEast);
    map.setMaxBounds(bounds);
    map.doubleClickZoom.disable(); 

    return map;
  }

  file.setCurrentEditMode = function(currentEditMode) {
    fileReducer({
      type: GlobalFileActionType.SET_EDIT_MODE,
      payload: {currentEditMode: currentEditMode}
    })
  }



  file.handleUndo = function() {
  }

  file.handleRedo = function() {
  }
  
  return (
    <GlobalFileContext.Provider value={{ file }}>
      {props.children}
    </GlobalFileContext.Provider>
  );
}

export default GlobalFileContext;
export { GlobalFileContextProvider };
