import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jsTPS from "../common/jsTPS";
import api from "./store-request-api";
import AuthContext from "../auth";
import GlobalFileContext from "../file";
import { GlobalStoreActionType, ViewMode, DetailView, CurrentModal } from "../enums";
import { tempData } from "../data/tempData";
import { convertToGeojson } from "../utils/geojsonConverter";
import { convertGeojsonToInternalFormat } from "../utils/geojsonParser";

export const GlobalStoreContext = createContext({});
console.log("create GlobalStoreContext");


const tps = new jsTPS();

function GlobalStoreContextProvider(props) {
  const { auth } = useContext(AuthContext);
  const [store, setStore] = useState({
    currentModal: CurrentModal.NONE,
    viewMode: ViewMode.PERSONAL,
    detailView: DetailView.NONE, 
    allMaps: tempData,
    selectedMap: null,
    openedMap: null,
  });

  const navigate = useNavigate();

  const storeReducer = (action) => {
    const { type, payload } = action;
    switch (type) {
      case GlobalStoreActionType.SET_VIEW_MODE: {
        return setStore({
          ...store,
          viewMode: payload.viewMode
        })
      }
      case GlobalStoreActionType.SET_SELECTED_MAP: {
        return setStore({
          ...store,
          selectedMap: payload.selectedMap,
          detailView: payload.detailView
        })
      }
      case GlobalStoreActionType.SET_DETAIL_VIEW: {
        return setStore({
          ...store,
          detailView: payload.detailView
        })
      }
      case GlobalStoreActionType.SET_CURRENT_MODAL: {
        return setStore({
          ...store,
          currentModal: payload.currentModal
        })
      }
      case GlobalStoreActionType.SET_OPENED_MAP: {
        return setStore({
          ...store,
          openedMap: payload.openedMap,
          currentModal: payload.currentModal
        })
      }
      default:
        return store;
    }
  };


  // Sets the view mode to personal, shared, published
  store.setViewMode = function (viewMode) {
    storeReducer({
      type: GlobalStoreActionType.SET_VIEW_MODE,
      payload: {viewMode: viewMode},
    });
  }

  store.setSelectedMap = function (mapId) {
    const detailView = (mapId) ? DetailView.PROPERTIES : DetailView.NONE;
    storeReducer({
      type: GlobalStoreActionType.SET_SELECTED_MAP,
      payload: {selectedMap: mapId, detailView: detailView},
    });
  }

  store.setDetailView = function (detailView) {
    storeReducer({
      type: GlobalStoreActionType.SET_DETAIL_VIEW,
      payload: {detailView: detailView},
    });
  }

  store.setCurrentModal = function (currentModal){
    storeReducer({
      type: GlobalStoreActionType.SET_CURRENT_MODAL,
      payload: {currentModal: currentModal},
    });
  }

  store.parseFileUpload = async function(files) {
    let geojsonFile = await convertToGeojson(files);
    let subregions = await convertGeojsonToInternalFormat(geojsonFile);
    let subregionIds = await store.createMapSubregions(subregions);
    let response = await api.createMap(subregionIds, auth.user._id);  
    if(response.status === 201){

      storeReducer({
        type: GlobalStoreActionType.SET_OPENED_MAP,
        payload: {openedMap: response.id, currentModal: CurrentModal.NONE},
      });
    }

    navigate("/map");
  }


  store.createMapSubregions = function(subregions){
    async function asyncCreateMapSubregions() {
      const asyncSubregions = [];
      for(let i=0; i<subregions.length; i++){
        asyncSubregions.push(api.createSubregion(subregions[i].type, subregions[i].properties, subregions[i].coords));
      }
      const addedRegions = await Promise.all(asyncSubregions);
      const ids = [];
      
      for(const region of addedRegions){
        if(region.status !== 201){
          console.log("failed to create all subregions");
          return;
        }
        ids.push(region.data.id);
      }
      return ids;
    }

    return asyncCreateMapSubregions();
  }


  return (
    <GlobalStoreContext.Provider value={{ store }}>
      {props.children}
    </GlobalStoreContext.Provider>
  );
}

export default GlobalStoreContext;
export { GlobalStoreContextProvider };
