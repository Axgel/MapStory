import React, { useContext } from "react";
import { CurrentModal } from "../enums";
import { TagCard } from "../components";

import { GlobalStoreContext } from "../store";
import AuthContext from "../auth";

export default function AddTagModal() {
  const { store } = useContext(GlobalStoreContext);
  const { auth } = useContext(AuthContext);

  function handleCloseModal(e){
    e.stopPropagation();
    store.setCurrentModal(CurrentModal.NONE);
  }

  if(store.currentModal == CurrentModal.TAG){
    return (
      <div className="fixed inset-x-0 inset-y-0 flex items-center justify-center mx-2">
        <div className="bg-brownshade-700 border-modalborder border-solid border rounded-lg min-w-[450px] max-w-md text-center mx-12">
          <h1 className="text-xl mt-4 mb-4 mx-12">Add Tags 'Borders - United States 1989'</h1>
          <div className="flex justify-between mx-12 mb-3 min-w-[360px]">
            <input className="w-[220px] h-[35px] rounded-lg shadow-lg bg-white outline-none border-none pl-4 text-lg" type="text" placeholder="Add Tags"></input>
            <button className="bg-brownshade-800 text-white px-3 py-2 rounded-md border-brownshade-850" onClick={handleCloseModal}>ADD</button>
          </div>

          <p className="text-lightgrey text-left mx-12">Tags:</p>

          <div className="flex max-w-md flex-wrap items-start gap-3 mx-12 mb-2">
            <TagCard />
            <TagCard />
            <TagCard />
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
