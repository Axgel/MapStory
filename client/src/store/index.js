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
    publishedMaps: [],
    personalMaps: [],
    sharedMaps: [],
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
          currentModal: CurrentModal.NONE,
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
          currentModal: payload.currentModal,
          personalMaps: payload.personalMaps,
          sharedMaps: payload.sharedMaps,
          selectedMap: payload.selectedMap
        })
      }
      case GlobalStoreActionType.LOAD_ALL_MAPS: {
        return setStore({
          ...store,
          currentModal: CurrentModal.NONE,
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

  store.loadMapById = async function(mapId) {
    const response = await api.getMapById(mapId);
    if(response.status === 200){
      store.setSelectedMap(response.data.map);
    }
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

  store.parseFileUpload = async function(files, mapTitle) {
    let geojsonFile = await convertToGeojson(files);
    let subregions = await convertGeojsonToInternalFormat(geojsonFile);
    let response = await api.createMap(auth.user, mapTitle);
    if(response.status === 201){
      console.log("asd");
      await store.createMapSubregions(subregions, response.data.map._id);
      storeReducer({
        type: GlobalStoreActionType.SET_SELECTED_MAP,
        payload: {
          selectedMap: response.data.map,
          detailView: DetailView.NONE
        }
      })
      navigate(`/map/${response.data.map._id}`);
    }
  }

  store.createMapSubregions = async function(subregions, mapId){
    const asyncSubregions = [];
    for(let i=0; i<subregions.length; i++){
      asyncSubregions.push(api.createSubregion(mapId, subregions[i].type, subregions[i].properties, subregions[i].coords));
    }
    const addedRegions = await Promise.all(asyncSubregions);      
    for(const region of addedRegions){
      if(region.status !== 201){
        console.log("failed to create all subregions");
        return;
      }
    }
  }

  store.loadPersonalAndSharedMaps = async function(currentModal){
    let personalMaps = [];
    let sharedMaps = [];
    let selectedMap = null;
    if(!auth.loggedIn) return;

    let response = await api.getPersonalAndSharedMaps(auth.user._id);     
    if(response.status === 200){
      personalMaps = response.data.personalMaps;
      sharedMaps = response.data.sharedMaps;

      if (store.selectedMap){
        for (const map of personalMaps){
          if (map._id === store.selectedMap._id){
            selectedMap = map
            break;
          }
        }
      }
    }
    
    storeReducer({
      type: GlobalStoreActionType.LOAD_PERSONAL_AND_SHARED_MAPS,
      payload: {personalMaps: personalMaps, sharedMaps: sharedMaps, selectedMap: selectedMap, currentModal: currentModal},
    });
  }



  store.loadAllMaps = async function(){
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
    response = await api.getPublishedMaps();
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
      store.loadPersonalAndSharedMaps(CurrentModal.NONE);
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
    let response = await api.forkMapById(store.mapIdMarkedForAction, auth.user._id);
    if(response.status === 201){
      storeReducer({
        type: GlobalStoreActionType.MAP_ACTION,
        payload: null
      })

      store.loadPersonalAndSharedMaps(CurrentModal.NONE);
    }
  }

  store.deleteMapByMarkedId = async function(){
    if(store.mapIdMarkedForAction == null) return;
    let response = await api.deleteMapById(store.mapIdMarkedForAction);  
    if(response.status === 200){
      storeReducer({
        type: GlobalStoreActionType.MAP_ACTION,
        payload: null
      });
      store.loadAllMaps();
    }
  }


  store.addTags = async function(newTag){
    let response = await api.addTags(store.selectedMap._id, newTag);
    if(response.status === 200){
      store.loadPersonalAndSharedMaps(CurrentModal.TAG);
    }
  }

  store.deleteTags = async function(tag){
    let response = await api.deleteTags(store.selectedMap._id, tag);
    if(response.status === 200){
      store.loadPersonalAndSharedMaps(CurrentModal.TAG);
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
