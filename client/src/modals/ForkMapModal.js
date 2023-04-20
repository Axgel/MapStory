import React, { useContext } from "react";
import { CurrentModal } from "../enums";

import { GlobalStoreContext } from "../store";
import AuthContext from "../auth";

export default function ForkMapModal(props) {
  const { store } = useContext(GlobalStoreContext);
  const { auth } = useContext(AuthContext);

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
      <div className="fixed inset-x-0 inset-y-0 flex items-center justify-center">
        <div className="bg-brownshade-700 border-modalborder border-solid border rounded-lg w-96 text-center">
          <h1 className="text-xl mt-4 mb-4 mx-9">FORKING MAP</h1>
          <h1 className="">Map Name</h1>
          <p className="mb-2 text-publishmodalsubtext">{props.mapTitle}</p>
          <h1 className="">Owner</h1>
          <p className="mb-2 text-publishmodalsubtext">{props.owner}</p>
          <h1 className="">Collaborators</h1>
          <p className="mb-2 text-publishmodalsubtext">{props.collaborators}</p>
          <h1 className="">Tags</h1>
          <p className="mb-4 text-publishmodalsubtext">{props.tags}</p>
          <h1 className="mx-6 my-2 "> {props.message} </h1>
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
