import React, { useContext } from "react";
import { CurrentModal } from "../enums";

import { GlobalStoreContext } from "../store";
import AuthContext from "../auth";

export default function ForkMapModal(props) {
  const { store } = useContext(GlobalStoreContext);
  const { auth } = useContext(AuthContext);

  const mapInfo = store.selectedMap;

  const collaboratorsUsernames = [];
  store.collaborators.forEach(collaborator => {
    collaboratorsUsernames.push(collaborator.userName)
  }); 

  let titleElement = mapInfo ? <p className="mb-2 text-publishmodalsubtext">{mapInfo.title}</p> : <></>; 
  let ownerElement = mapInfo ? <p className="mb-2 text-publishmodalsubtext">{mapInfo.ownerName}</p> : <></>; 
  let collaboratorElement = mapInfo ? <p className="mb-2 text-publishmodalsubtext">{(mapInfo.collaborators.length === 0) ? "N/A" : collaboratorsUsernames.join(", ")}</p> : <></>; 
  let tagElement = mapInfo ? <p className="mb-4 text-publishmodalsubtext">{(mapInfo.tags.length === 0) ? "N/A" : mapInfo.tags.join(", ")}</p> : <></>;
  let messageElement = mapInfo ? 
    <h1 className="mx-6 my-2 "> 
      Are you sure you want to fork the map '{mapInfo.title}'? The new map will be titled 'Copy of {mapInfo.title}'
    </h1> : <></>;

  function handleCloseModal(e){
    e.stopPropagation();
    store.setCurrentModal(CurrentModal.NONE);
  }

  function handleForkMap(e){
    e.stopPropagation();
    store.forkMapByMarkedId();
  }

  if(store.currentModal == CurrentModal.FORK_MAP){
    return (
      <div className="fixed inset-x-0 inset-y-0 flex items-center justify-center z-50">
        <div className="bg-brownshade-700 border-modalborder border-solid border rounded-lg w-96 text-center">
          <h1 className="text-xl mt-4 mb-4 mx-9">FORKING MAP</h1>
          <h1 className="">Map Name</h1>
          {titleElement}
          <h1 className="">Owner</h1>
          {ownerElement}
          <h1 className="">Collaborators</h1>
          {collaboratorElement}
          <h1 className="">Tags</h1>
          {tagElement}
          {messageElement}
          <h1 className="mx-6 my-2 "> *The current collaborators of this map will not be shared in the new map. </h1>
          <div className="flex flex-row-reverse">
            <button className="bg-brownshade-800 text-white mb-3 mr-3 px-3 rounded-md border-brownshade-850" onClick={handleForkMap}>OK</button>
            <button className="bg-brownshade-800 text-white mb-3 mr-3 px-3 rounded-md border-brownshade-850" onClick={handleCloseModal}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <></>
  );
}
