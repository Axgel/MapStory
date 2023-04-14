import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jsTPS from "../common/jsTPS";
import api from "./file-request-api";
import AuthContext from "../auth";
import { tempData } from "../data/tempData";
import { GlobalFileActionType } from "../enums";
import GlobalStoreContext from "../store";

export const GlobalFileContext = createContext({});
console.log("create GlobalFileContext");


const tps = new jsTPS();

function GlobalFileContextProvider(props) {
  const { auth } = useContext(AuthContext);
  const { store } = useContext(GlobalStoreContext);

  const [file, setFile] = useState({
    subregions: []
  });

  const navigate = useNavigate();

  const fileReducer = (action) => {
    const { type, payload } = action;
    switch (type) {
      case GlobalFileActionType.LOAD_SUBREGIONS: {
        return setFile({
          ...file,
          subregions: payload.subregions
        })
      }
      default:
        return file;
    }
  };

  file.loadAllSubregions = function(){
    async function asyncLoadAllSubregions(){
      if(store.openedMap){
        let response = await api.getAllSubregions(store.openedMap._id);
        if(response.status === 200){
          fileReducer({
            type: GlobalFileActionType.LOAD_SUBREGIONS,
            payload: {subregions: response.data.subregions}
          })
        }
      }
    }
  
    asyncLoadAllSubregions();
  }


  return (
    <GlobalFileContext.Provider value={{ file }}>
      {props.children}
    </GlobalFileContext.Provider>
  );
}

export default GlobalFileContext;
export { GlobalFileContextProvider };
