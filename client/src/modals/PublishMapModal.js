import React, { useContext } from "react";
import { CurrentModal } from "../enums";

import { GlobalStoreContext } from "../store";
import AuthContext from "../auth";

export default function PublishMapModal(props) {
  const { store } = useContext(GlobalStoreContext);
  const { auth } = useContext(AuthContext);

  const mapInfo = store.selectedMap;

  const collaboratorsUsernames = [];
  if(store.collaborators){
    store.collaborators.forEach(collaborator => {
      collaboratorsUsernames.push(collaborator.userName)
    }); 
  }

  let titleElement = mapInfo ? <p className="mb-2 text-publishmodalsubtext">{mapInfo.title}</p> : <></>; 
  let ownerElement = mapInfo ? <p className="mb-2 text-publishmodalsubtext">{mapInfo.ownerName}</p> : <></>; 
  let collaboratorElement = mapInfo ? <p className="mb-2 text-publishmodalsubtext">{(mapInfo.collaborators.length === 0) ? "There are no collaborators for this map" : collaboratorsUsernames.join(", ")}</p> : <></>; 
  let tagElement = mapInfo ? <p className="mb-4 text-publishmodalsubtext">{(mapInfo.tags.length === 0) ? "There are currently no tags for this map" : mapInfo.tags.join(", ")}</p> : <></>;
  let messageElement = mapInfo ? <h1 className="mx-6 my-2 ">Are you sure you want to publish '{mapInfo.title}'. This action cannot be undone.</h1> : <></>;

  function handleCloseModal(e){
    e.stopPropagation();
    store.setCurrentModal(CurrentModal.NONE);
  }

  function handlePublishMap(e){
    e.stopPropagation();
    store.publishMapByMarkedId();
  }

  if(store.currentModal === CurrentModal.PUBLISH_MAP){
    return (
      <div className="fixed inset-x-0 inset-y-0 flex items-center justify-center z-50">
        <div className="bg-brownshade-700 border-modalborder border-solid border rounded-lg w-96 text-center">
          <h1 className="text-xl mt-4 mb-4 mx-9">Publishing Map</h1>
          <h1 className="">Map Name</h1>
          {titleElement}
          <h1 className="">Owner</h1>
          {ownerElement}
          <h1 className="">Collaborators</h1>
          {collaboratorElement}
          <h1 className="">Tags</h1>
          {tagElement}
          {messageElement}
          <h1 className="mx-6 my-2 ">*You will no longer be able to edit this map.</h1>
          <div className="flex flex-row-reverse">
            <button className="bg-brownshade-800 text-white mb-3 mr-3 px-3 rounded-md border-brownshade-850" onClick={handlePublishMap}>OK</button>
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
