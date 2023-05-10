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
    comments: [],
    selectedMap: null,
    collaborators: [],
    selectedMapOwner: null,
    mapMarkedForAction: null,
    searchBy: "",
    searchValue: "",
    sortBy: ""
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
          detailView: payload.detailView,
          collaborators: payload.collaborators,
          selectedMapOwner: payload.selectedMapOwner,
          comments: payload.comments
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
          selectedMap: payload.selectedMap,
          collaborators: payload.collaborators,
          selectedMapOwner: payload.selectedMapOwner
        })
      }
      case GlobalStoreActionType.LOAD_ALL_MAPS: {
        return setStore({
          ...store,
          currentModal: CurrentModal.NONE,
          publishedMaps: payload.publishedMaps,
          sharedMaps: payload.sharedMaps,
          personalMaps: payload.personalMaps,
          selectedMap: payload.selectedMap,
          collaborators: payload.collaborators,
          selectedMapOwner: payload.selectedMapOwner
        })
      }
      case GlobalStoreActionType.SET_MAP_PROJECT_ACTION: {
        return setStore({
          ...store,
          currentModal: payload.currentModal,
          mapMarkedForAction: payload.mapMarkedForAction
        })
      }
      case GlobalStoreActionType.MAP_ACTION: {
        return setStore({
          ...store,
          currentModal: CurrentModal.NONE,
          mapMarkedForAction: null,
        })
      }
      case GlobalStoreActionType.ADD_COMMENTS:{
        return setStore({
          ...store,
          comments: payload.comments
        })
      }
      case GlobalStoreActionType.SET_SEARCH_VALUE:{
        return setStore({
          ...store,
          searchValue: payload.searchValue, 
          detailView: DetailView.NONE
        })
      }
      case GlobalStoreActionType.SET_SEARCH_BY:{
        return setStore({
          ...store,
          searchBy: payload.searchBy, 
          detailView: DetailView.NONE
        })
      }
      case GlobalStoreActionType.SET_SORT_BY:{
        return setStore({
          ...store,
          sortBy: payload.sortBy, 
          detailView: DetailView.NONE
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
    const map = response.data.map;
    const collaborators = await store.getAllCollaboratorsByMap(map);
    const selectedMapOwner = await store.getSelectedMapOwner(map);
    const comments = await store.getComments(map);
    if(response.status === 200){
      storeReducer({
        type: GlobalStoreActionType.SET_SELECTED_MAP,
        payload: {selectedMap: map, detailView: DetailView.NONE, collaborators: collaborators, selectedMapOwner: selectedMapOwner, comments: comments},
    });
    }
  }

  store.getSelectedMapOwner = async function(map){
    if(!map) return null;

    let response = await api.getUserById(map.owner);
    if(response.status === 200){
      return response.data.user;
    }

    return null;
  }

  store.setSelectedMap = async function (map) {
    const detailView = (map) ? DetailView.PROPERTIES : DetailView.NONE;
    const collaborators = await store.getAllCollaboratorsByMap(map);
    const selectedMapOwner = await store.getSelectedMapOwner(map);
    const comments = await store.getComments(map);
    storeReducer({
        type: GlobalStoreActionType.SET_SELECTED_MAP,
        payload: {selectedMap: map, detailView: detailView, collaborators: collaborators, selectedMapOwner: selectedMapOwner, comments: comments},
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
      await store.createMapSubregions(subregions, response.data.map._id);
      storeReducer({
        type: GlobalStoreActionType.SET_SELECTED_MAP,
        payload: {
          selectedMap: response.data.map,
          detailView: DetailView.PROPERTIES,
          collaborators: [],
          selectedMapOwner: auth.user,
          comments: []
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

  store.selectedMapInList = function(mapList){
    if(store.selectedMap){
      for(const map of mapList){
        if(map._id === store.selectedMap._id){
          return map;
        }
      }
    }

    return false;
  }

  store.loadPersonalAndSharedMaps = async function(currentModal){
    let personalMaps = [];
    let sharedMaps = [];
    let selectedMap = null;
    let collaborators = [];
    let selectedMapOwner = null;
    if(!auth.loggedIn) return;

    let response = await api.getPersonalAndSharedMaps(auth.user._id);     
    if(response.status === 200){
      personalMaps = response.data.personalMaps;
      sharedMaps = response.data.sharedMaps;

      if(store.selectedMapInList(personalMaps)){
        selectedMap = store.selectedMapInList(personalMaps);
      } else if(store.selectedMapInList(sharedMaps)){
        selectedMap = store.selectedMapInList(sharedMaps);
      }

      collaborators = await store.getAllCollaboratorsByMap(selectedMap);
      selectedMapOwner = await store.getSelectedMapOwner(selectedMap);
    }
    
    storeReducer({
      type: GlobalStoreActionType.LOAD_PERSONAL_AND_SHARED_MAPS,
      payload: {personalMaps: personalMaps, sharedMaps: sharedMaps, selectedMap: selectedMap, currentModal: currentModal, collaborators: collaborators, selectedMapOwner: selectedMapOwner},
    });
  }

  store.loadAllMaps = async function(){
    let personalMaps = [];
    let sharedMaps = [];
    let selectedMap = null;
    let collaborators = [];
    let selectedMapOwner = null;
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
      if(store.selectedMapInList(personalMaps)){
        selectedMap = store.selectedMapInList(personalMaps);
      } else if(store.selectedMapInList(sharedMaps)){
        selectedMap = store.selectedMapInList(sharedMaps);
      } else if(store.selectedMapInList(response.data.publishedMaps)){
        selectedMap = store.selectedMapInList(response.data.publishedMaps);
      }
      
      collaborators = await store.getAllCollaboratorsByMap(selectedMap);
      selectedMapOwner = await store.getSelectedMapOwner(selectedMap);

      storeReducer({
        type: GlobalStoreActionType.LOAD_ALL_MAPS,
        payload: {publishedMaps: response.data.publishedMaps, personalMaps: personalMaps, sharedMaps: sharedMaps, selectedMap: selectedMap, collaborators: collaborators, selectedMapOwner: selectedMapOwner}
       });
    }
  }

  store.updateMapTitle = async function(newTitle){
    let response = await api.updateMapTitle(store.selectedMap._id, newTitle);
    if(response.status === 200){
      store.loadPersonalAndSharedMaps(CurrentModal.NONE);
    }
  }

  store.setMapProjectAction = function(currentModal, map){
    storeReducer({
      type: GlobalStoreActionType.SET_MAP_PROJECT_ACTION,
      payload: {
        currentModal: currentModal,
        mapMarkedForAction: map
      }
    })
  }

  store.getComments = async function(map) {
    if(!map) return [];
    const response = await api.getComments(map._id);
    if(response.status === 200) {
      return response.data.comments;
    }
    return [];
  }

  store.publishMapByMarkedId = async function(){
    if(!store.mapMarkedForAction) return;

    let response = await api.publishMapById(store.mapMarkedForAction._id);
    if(response.status === 200){
      storeReducer({
        type: GlobalStoreActionType.MAP_ACTION,
        payload: null
      })

      store.loadAllMaps();
    }
  }

  store.forkMapByMarkedId = async function(){
    if(!store.mapMarkedForAction) return;
    let response = await api.forkMapById(store.mapMarkedForAction._id, auth.user._id);
    if(response.status === 201){
      storeReducer({
        type: GlobalStoreActionType.MAP_ACTION,
        payload: null
      })

      store.loadPersonalAndSharedMaps(CurrentModal.NONE);
    }
  }

  store.deleteMapByMarkedId = async function(){
    if(!store.mapMarkedForAction) return;
    let response = await api.deleteMapById(store.mapMarkedForAction._id);  
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

  store.addCollaborator = async function(collaboratorEmail){
    let response = await api.addCollaborator(store.selectedMap._id, collaboratorEmail);
    if(response.status === 200){
      store.loadPersonalAndSharedMaps(CurrentModal.SHARE_MAP);
    }
  }

  store.removeCollaborator = async function(collaboratorEmail){
    let response = await api.removeCollaborator(store.selectedMap._id, collaboratorEmail);
    if(response.status === 200){
      store.loadPersonalAndSharedMaps(CurrentModal.SHARE_MAP);
    }
  }

  store.getAllCollaboratorsByMap = async function(map){
    if(!map) return [];
    let asyncCollaborators = [];
    const collaborators = [];
    
    for(const userId of map.collaborators){
      asyncCollaborators.push(api.getUserById(userId));
    }

    asyncCollaborators = await Promise.all(asyncCollaborators)
    for(const res of asyncCollaborators){
      collaborators.push(res.data.user);
    }

    return collaborators;
  }

  store.updateVotes = async function(map, voteType){
    //voteType: 0=downvote, 1=upvote; value: 0=remove, 1=add
    let response;
    if(voteType === 0){ //downvotes
      if(map.downvotes.includes(auth.user._id))
        response = await api.updateVotesById(map._id, auth.user._id, 0, 0);
      else
        response = await api.updateVotesById(map._id, auth.user._id, 0, 1);
    } else { //upvotes
      if(map.upvotes.includes(auth.user._id))
        response = await api.updateVotesById(map._id, auth.user._id, 1, 0);
      else
        response = await api.updateVotesById(map._id, auth.user._id, 1, 1);
    }
    if(response.status === 200){
      store.loadAllMaps();
    }
  }

  store.addComment = async function (newComment) {
    const response = await api.addComment(store.selectedMap._id, auth.user._id, newComment);
    if(response.status === 201) {
      const newComments = [...store.comments, response.data.comment];
      storeReducer({
        type: GlobalStoreActionType.ADD_COMMENTS,
        payload: {comments : newComments},
      });
    }
  }
  
  store.setSearchValue = async function (searchValue) {
    storeReducer({
      type: GlobalStoreActionType.SET_SEARCH_VALUE,
      payload: { searchValue: searchValue }
    })
  }

  store.setSortBy = async function (sortByValue) {
    storeReducer({
      type: GlobalStoreActionType.SET_SORT_BY,
      payload: { sortBy: sortByValue }
    })
  }

  store.setSearchBy = async function (searchBy) {
    storeReducer({
      type: GlobalStoreActionType.SET_SEARCH_BY,
      payload: { searchBy: searchBy }
    })
  }

  return (
    <GlobalStoreContext.Provider value={{ store }}>
      {props.children}
    </GlobalStoreContext.Provider>
  );
}

export default GlobalStoreContext;
export { GlobalStoreContextProvider };
