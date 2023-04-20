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
    publishedMaps: null,
    personalMaps: null,
    sharedMaps: null,
    selectedMap: null,
    mapIdMarkedForAction: null
  });

  const navigate = useNavigate();

  const storeReducer = (action) => {
    const { type, payload } = action;
    switch (type) {
      case GlobalStoreActionType.SET_VIEW_MODE: {
        return setStore({
          ...store,
          selectedMap: null,
          detailView: DetailView.NONE,
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
      case GlobalStoreActionType.LOAD_PERSONAL_AND_SHARED_MAPS: {
        return setStore({
          ...store,
          personalMaps: payload.personalMaps,
          sharedMaps: payload.sharedMaps
        })
      }
      case GlobalStoreActionType.LOAD_ALL_MAPS: {
        return setStore({
          ...store,
          publishedMaps: payload.publishedMaps,
          sharedMaps: payload.sharedMaps,
          personalMaps: payload.personalMaps
        })
      }
      case GlobalStoreActionType.SET_MAP_PROJECT_ACTION: {
        return setStore({
          ...store,
          currentModal: payload.currentModal,
          mapIdMarkedForAction: payload.mapIdMarkedForAction
        })
      }
      case GlobalStoreActionType.MAP_ACTION: {
        return setStore({
          ...store,
          currentModal: CurrentModal.NONE,
          mapIdMarkedForAction: null,
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

  store.setSelectedMap = function (map) {
    const detailView = (map) ? DetailView.PROPERTIES : DetailView.NONE;
    storeReducer({
      type: GlobalStoreActionType.SET_SELECTED_MAP,
      payload: {selectedMap: map, detailView: detailView},
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
    let response = await api.createMap(subregionIds, auth.user);  
    if(response.status === 201){
      // storeReducer({
      //   type: GlobalStoreActionType.SET_OPENED_MAP,
      //   payload: {openedMap: response.data.id, currentModal: CurrentModal.NONE},
      // });
      store.setCurrentModal(CurrentModal.NONE);
      navigate(`/map/${response.data.id._id}`);
    }
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

  store.loadPersonalAndSharedMaps = function(){
    async function asyncLoadPersonalAndSharedMaps(){
      let personalMaps = [];
      let sharedMaps = [];
      if(auth.loggedIn){
        let response = await api.getPersonalAndSharedMaps(auth.user._id);     
        if(response.status === 200){
          personalMaps = response.data.personalMaps;
          sharedMaps = response.data.sharedMaps;
        }
      }

      storeReducer({
        type: GlobalStoreActionType.LOAD_PERSONAL_AND_SHARED_MAPS,
        payload: {personalMaps: personalMaps, sharedMaps: sharedMaps},
      });
    }

    asyncLoadPersonalAndSharedMaps();
  }

  store.loadAllMaps = async function(){
    // load all published maps

    let personalMaps = [];
    let sharedMaps = [];
    let response;

    if(auth.loggedIn){
      response = await api.getPersonalAndSharedMaps(auth.user._id);
      if(response.status === 200){
        personalMaps = response.data.personalMaps;
        sharedMaps = response.data.sharedMaps;
      }
    }
    response = await api.getAllPublishedMaps();
    if(response.status === 200){
      storeReducer({
        type: GlobalStoreActionType.LOAD_ALL_MAPS,
        payload: {publishedMaps: response.data.publishedMaps, personalMaps: personalMaps, sharedMaps: sharedMaps}
       });
    }
  }

  store.updateMapTitle = async function(newTitle){
    let response = await api.updateMapTitle(store.selectedMap._id, newTitle);
    if(response.status === 200){
      store.loadPersonalAndSharedMaps();
    }
  }

  store.setMapProjectAction = function(currentModal, mapId){
    storeReducer({
      type: GlobalStoreActionType.SET_MAP_PROJECT_ACTION,
      payload: {
        currentModal: currentModal,
        mapIdMarkedForAction: mapId
      }
    })
  }

  store.publishMapByMarkedId = async function(){
    if(store.mapIdMarkedForAction == null) return;

    let response = await api.publishMapById(store.mapIdMarkedForAction);
    if(response.status === 200){
      storeReducer({
        type: GlobalStoreActionType.MAP_ACTION,
        payload: null
      })

      store.loadAllMaps();
    }
  }

  store.forkMapByMarkedId = async function(){
    if(store.mapIdMarkedForAction == null) return;

    let response = await api.forkMapById(store.mapIdMarkedForAction);
    if(response.status === 200){
      storeReducer({
        type: GlobalStoreActionType.MAP_ACTION,
        payload: null
      })

      store.loadPersonalAndSharedMaps();
    }
  }


  return (
    <GlobalStoreContext.Provider value={{ store }}>
      {props.children}
    </GlobalStoreContext.Provider>
  );
}

export default GlobalStoreContext;
export { GlobalStoreContextProvider };
