import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jsTPS from "../common/jsTPS";
import api from "./file-request-api";
import AuthContext from "../auth";
import { tempData } from "../data/tempData";
import { GlobalFileActionType } from "../enums";
import GlobalStoreContext from "../store";
import { EditMode } from "../enums";

export const GlobalFileContext = createContext({});
console.log("create GlobalFileContext");

const tps = new jsTPS();

function GlobalFileContextProvider(props) {
  const { auth } = useContext(AuthContext);
  const { store } = useContext(GlobalStoreContext);

  const [file, setFile] = useState({
    subregions: [],
    currentEditMode: EditMode.NONE,
    editRegions: [],
  });

  const navigate = useNavigate();

  const fileReducer = (action) => {
    const { type, payload } = action;
    switch (type) {
      case GlobalFileActionType.LOAD_SUBREGIONS: {
        return setFile({
          ...file,
          subregions: payload.subregions,
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
      default:
        return file;
    }
  };

  file.setCurrentEditMode = function(currentEditMode){
    fileReducer({
      type: GlobalFileActionType.SET_EDIT_MODE,
      payload: {currentEditMode: currentEditMode}
    })
  }

  file.updateEditRegions = function(newEditRegions){
    fileReducer({
      type: GlobalFileActionType.UPDATE_EDIT_REGIONS,
      payload: {editRegions: newEditRegions}
    })
  }

  file.loadAllSubregions = async function(mapId) {
    let response = await api.getAllSubregions(mapId);
    if(response.status === 200){
      fileReducer({
        type: GlobalFileActionType.LOAD_SUBREGIONS,
        payload: {subregions: response.data.subregions}
      })
    }
  }

  file.updateSubregionTest = function(subregionId){
    const copySubregions = file.subregions;
    for(let i=0; i<file.subregions.length; i++){
      if(file.subregions[i]._id === subregionId){
        copySubregions[i].coordinates[0][0][3] = [-92.538593,37.050674];
        fileReducer({
          type: GlobalFileActionType.LOAD_SUBREGIONS,
          payload: {subregions: copySubregions}
        })
      }
    }
  }


  return (
    <GlobalFileContext.Provider value={{ file }}>
      {props.children}
    </GlobalFileContext.Provider>
  );
}

export default GlobalFileContext;
export { GlobalFileContextProvider };
