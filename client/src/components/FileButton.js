import React, { useContext } from "react";
import { CurrentModal, DetailView, EditMode } from "../enums";

import { GlobalStoreContext } from "../store";
import AuthContext from "../auth";
import GlobalFileContext from "../file";

export default function FileButton() {
  const { store } = useContext(GlobalStoreContext);
  const { file } = useContext(GlobalFileContext);
  const { auth } = useContext(AuthContext);
  

  function toggleFileByDD(e){
    e.stopPropagation();
    document.getElementById("file-by-dd").classList.toggle("hidden");
  }

  function toggleModeByDD(e){
    e.stopPropagation();
    document.getElementById("view-by-dd").classList.toggle("hidden");
  }

  function setDetailView(e, detailView){
    // e.stopPropagation();
    if(detailView === DetailView.COMMENTS && (!store.selectedMap || !store.selectedMap.isPublished)) return;
    toggleFileByDD(e);
    store.setDetailView(detailView);
  }

  function toggleViewingMode(e){
    toggleFileByDD(e);
    file.setCurrentEditMode(EditMode.VIEW);
  }

  function toggleEditingMode(e){
    if(!auth.loggedIn || !store.selectedMap || store.selectedMap.isPublished) return
    toggleFileByDD(e);
    file.setCurrentEditMode(EditMode.NONE);
  }

  function setMapProjectAction(e, currentModal){
    // e.stopPropagation();
    switch(currentModal) {
      case(CurrentModal.FORK_MAP):
        if(!auth.loggedIn) return;
        break
      case(CurrentModal.PUBLISH_MAP):
        if(!auth.loggedIn || !store.selectedMap || store.selectedMap.isPublished || auth.user._id !== store.selectedMap.owner) return
        break
      case(CurrentModal.DELETE_MAP):
        if(!auth.loggedIn || !store.selectedMap || auth.user._id !== store.selectedMap.owner) return;
        break
    }

    toggleFileByDD(e)
    store.setMapProjectAction(currentModal, store.selectedMap);
  }

  //TODO: set tags modal
  function setCurrentModal(e, currentModal){
    if(!auth.loggedIn || !store.selectedMap || auth.user._id !== store.selectedMap.owner) return;
    toggleFileByDD(e);
    store.setCurrentModal(currentModal);
  }

  let baseAccessClass = "py-1 px-3 hover:bg-dropdownhover rounded-tl-lg rounded-tr-lg "
  let guestNonAccessClass = baseAccessClass + (auth.loggedIn ? "hover:bg-opacity-80" : "cursor-not-allowed opacity-30");
  let collabNonAccessClass = baseAccessClass + (auth.loggedIn && store.selectedMap && auth.user._id === store.selectedMap.owner ? "hover:bg-opacity-80" : "cursor-not-allowed opacity-30");
  let publishedAccessClass = baseAccessClass + (auth.loggedIn && store.selectedMap && !store.selectedMap.isPublished ? "hover:bg-opacity-80" : "cursor-not-allowed opacity-30")
  let publishedNonAccessClass = baseAccessClass + (store.selectedMap && store.selectedMap.isPublished ? "hover:bg-opacity-80" : "cursor-not-allowed opacity-30")
  let publishedCollabNonAccessClass = baseAccessClass + (auth.loggedIn && store.selectedMap && !store.selectedMap.isPublished && auth.user._id === store.selectedMap.owner ? "hover:bg-opacity-80" : "cursor-not-allowed opacity-30")
  return (
    <div className="cursor-default m-3 z-50">
      <div id="mapFileBtn" className="bg-filebuttonfill text-white px-8 text-lg	font-semibold rounded flex items-start p-1" onClick={toggleFileByDD}>
        File
      </div>
      <div id="file-by-dd" className="absolute w-[150px] bg-modalbgfill hidden shadow-md">
          <div className="flex">
            <p onClick={toggleFileByDD} className="py-1 px-3 w-[150px] hover:bg-dropdownhover rounded-tl-lg rounded-tr-lg hover:bg-opacity-80" onMouseEnter={toggleModeByDD} onMouseLeave={toggleModeByDD}>Mode</p>

            <div id="view-by-dd" className="absolute ml-[100%] w-[150px] bg-modalbgfill shadow-md hidden">
              <p onClick={toggleViewingMode} className="py-1 px-3 hover:bg-dropdownhover rounded-tl-lg rounded-tr-lg hover:bg-opacity-80" onMouseLeave={toggleModeByDD}>Viewing Mode</p>
              <p onClick={toggleEditingMode} className={publishedAccessClass} onMouseLeave={toggleModeByDD}>Editing Mode</p>
            </div>

          </div>
          <p id="tagsBtn" className={collabNonAccessClass} onClick={(e) => setCurrentModal(e, CurrentModal.TAG)}>Tags</p>
          <div className="h-px bg-lightgrey bg-opacity-30"></div>
          <p className="py-1 px-3 hover:bg-dropdownhover rounded-tl-lg rounded-tr-lg hover:bg-opacity-80" onClick={(e) => setDetailView(e, DetailView.PROPERTIES)}>Properties</p>
          <p className={publishedNonAccessClass} onClick={(e) => setDetailView(e, DetailView.COMMENTS)}>Comments</p>
          <div className="h-px bg-lightgrey bg-opacity-30"></div>
          <p id="forkBtn" className={guestNonAccessClass} onClick={(e) => setMapProjectAction(e, CurrentModal.FORK_MAP)}>Fork</p>
          <p id="publishBtn" className={publishedCollabNonAccessClass} onClick={(e) => setMapProjectAction(e, CurrentModal.PUBLISH_MAP)}>Publish</p>
          <p id="deleteBtn" className={collabNonAccessClass} onClick={(e) => setMapProjectAction(e, CurrentModal.DELETE_MAP)}>Delete</p>
          <div className="h-px bg-lightgrey bg-opacity-30"></div>
          <p onClick={toggleFileByDD} className={guestNonAccessClass}>Save</p>
      </div>
    </div>
  );
}