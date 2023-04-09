import React, { useContext } from "react";
import { CurrentModal } from "../enums";
import { CollaboratorCard } from "../components";

import { GlobalStoreContext } from "../store";
import AuthContext from "../auth";

export default function ShareMapModal() {
  const { store } = useContext(GlobalStoreContext);
  const { auth } = useContext(AuthContext);

  function handleCloseModal(e){
    e.stopPropagation();
    store.setCurrentModal(CurrentModal.NONE);
  }

  if(store.currentModal == CurrentModal.SHARE_MAP){
    return (
      <div className="fixed inset-x-0 inset-y-0 flex items-center justify-center mx-2">
        <div className="bg-brownshade-700 border-modalborder border-solid border rounded-lg min-w-[450px] max-w-md text-center mx-12">
          <h1 className="text-xl mt-4 mb-4 mx-12">Share 'Borders - United States 1989'</h1>
          <div className="flex justify-between mx-12 mb-3 min-w-[360px]">
            <input className="w-[220px] h-[35px] rounded-lg shadow-lg bg-white outline-none border-none pl-4 text-lg" type="text" placeholder="Add Collaborators"></input>
            <button className="bg-brownshade-800 text-white px-3 py-2 rounded-md border-brownshade-850" onClick={handleCloseModal}>ADD</button>
          </div>

          <p className="text-lightgrey text-left mx-12">People with access:</p>

          <div className="flex flex-col items-start mx-12 mb-5">
            <CollaboratorCard />
            <CollaboratorCard />
            <CollaboratorCard />
          </div>


          <div className="flex flex-row-reverse mx-12 gap-3">
            <button className="bg-brownshade-800 text-white mb-3 px-3 py-1.5 rounded-md border-brownshade-850" onClick={handleCloseModal}>OK</button>
            <button className="bg-brownshade-800 text-white mb-3 px-3 py-1.5 rounded-md border-brownshade-850" onClick={handleCloseModal}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <></>
  );
}