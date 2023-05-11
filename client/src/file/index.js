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
    // add, move, remove
    editModeOptions: [true, true, true],
    editModeAction: EditMode.NONE,
    editChangeType: EditMode.NONE,
    editToolbarBridge: EditMode.NONE,
    hasUndo: false,
    hasRedo: false,
  })
  
  const fileReducer = (action) => {
    const { type, payload } = action;
    switch (type) {
      case GlobalFileActionType.SET_EDIT_MODE: {
        return setFile({
          ...file,
          currentEditMode: payload.currentEditMode,
          editChangeType: payload.editChangeType
        })
      }
      case GlobalFileActionType.SET_EDIT_MODE_OPTION: {
        return setFile({
          ...file, 
          editModeOptions: payload.editModeOption,
          editChangeType: payload.editChangeType
        })
      }
      case GlobalFileActionType.SET_EDIT_MODE_ACTION: {
        return setFile({
          ...file, 
          editModeAction: payload.editModeAction,
          editChangeType: payload.editChangeType
        })
      }
      case GlobalFileActionType.SET_UNDO_REDO_ACCESS: {
        return setFile({
          ...file, 
          editModeAction: payload.editModeAction,
          editChangeType: payload.editChangeType,
          hasUndo: payload.hasUndo,
          hasRedo: payload.hasRedo
        })
      }
      case GlobalFileActionType.RESET_DEFAULT: {
        return setFile({
          ...file, 
          currentEditMode: EditMode.NONE,
          editModeOptions: [true, true, true],
          editModeAction: EditMode.NONE,
          editChangeType: EditMode.NONE,
          hasUndo: false,
          hasRedo: false,
          editToolbarBridge: EditMode.NONE
        })
      }
      case GlobalFileActionType.SET_EDIT_TOOLBAR_BRIDGE: {
        return setFile({
          ...file,
          editToolbarBridge: payload.editToolbarBridge
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
      payload: {currentEditMode: currentEditMode, editChangeType: EditMode.EDIT_TOOLBAR}
    })
  }

  file.setCurrentEditModeOption = function(editModeOption){
    const arr = [...file.editModeOptions];
    arr[editModeOption] = !arr[editModeOption];
    fileReducer({
      type: GlobalFileActionType.SET_EDIT_MODE_OPTION,
      payload: {editModeOption: arr, editChangeType: EditMode.EDIT_TOOLBAR}
    })
  }

  file.setEditToolbarBridge = function (editMode){
    fileReducer({
      type: GlobalFileActionType.SET_EDIT_TOOLBAR_BRIDGE,
      payload: {editToolbarBridge: editMode}
    })
  }

  file.handleMerge = function() {
    fileReducer({
      type: GlobalFileActionType.SET_EDIT_MODE_ACTION,
      payload: {editModeAction: EditMode.MERGING, editChangeType: EditMode.EDIT_TOOLBAR}
    })
  }

  file.finishAction = function() {
    fileReducer({
      type: GlobalFileActionType.SET_EDIT_MODE_ACTION,
      payload: {editModeAction: EditMode.NONE, editChangeType: EditMode.EDIT_TOOLBAR}
    })
  }

  file.handleUndo = function() {
    fileReducer({
      type: GlobalFileActionType.SET_EDIT_MODE_ACTION,
      payload: {editModeAction: EditMode.UNDO,  editChangeType: EditMode.UNDO_REDO}
    })
  }

  file.handleRedo = function() {
    fileReducer({
      type: GlobalFileActionType.SET_EDIT_MODE_ACTION,
      payload: {editModeAction: EditMode.REDO, editChangeType: EditMode.UNDO_REDO}
    })
  }

  file.clearUndoRedo = function(changeType, hasUndo, hasRedo) {
    fileReducer({
      type: GlobalFileActionType.SET_UNDO_REDO_ACCESS,
      payload: {editModeAction: EditMode.NONE, editChangeType: changeType, hasUndo: hasUndo, hasRedo: hasRedo}
    })
  }
  
  file.resetDefault = function() {
    fileReducer({
      type: GlobalFileActionType.RESET_DEFAULT,
      payload: null
    })
  }
  return (
    <GlobalFileContext.Provider value={{ file }}>
      {props.children}
    </GlobalFileContext.Provider>
  );
}

export default GlobalFileContext;
export { GlobalFileContextProvider };
