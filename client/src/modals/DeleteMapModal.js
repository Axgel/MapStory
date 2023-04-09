import React, { useContext } from "react";
import { CurrentModal } from "../enums";

import { GlobalStoreContext } from "../store";
import AuthContext from "../auth";

export default function DeleteMapModal(props) {
  const { store } = useContext(GlobalStoreContext);
  const { auth } = useContext(AuthContext);

  function handleCloseModal(e){
    e.stopPropagation();
    store.setCurrentModal(CurrentModal.NONE);
  }
  if(store.currentModal == CurrentModal.DELETE_MAP){
    return (
      <div className="fixed inset-x-0 inset-y-0 flex items-center justify-center">

        <div className="bg-brownshade-700 border-modalborder border-solid border rounded-lg w-96 text-right">
          <h1 className="text-xl text-center mt-4 mb-2 mx-9">Deleting Map</h1>
          <h1 className="text-xl text-center mt-4 mb-2 mx-9">{props.title}</h1>
          <h1 className="mx-6 my-2 text-center"> {props.message} </h1>
          <h1 className="mx-6 my-2 text-center"> This map will be deleted. Action cannot be undone</h1><br></br><br></br>
          <div className="flex flex-row-reverse mx-3">
            <button className="bg-brownshade-800 text-white mb-3 mr-3 px-3 rounded-md border-brownshade-850" onClick={handleCloseModal}>Cancel</button>
            <button className="bg-brownshade-800 text-white mb-3 mr-3 px-3 rounded-md border-brownshade-850" onClick={handleCloseModal}>OK</button>
          </div>
          
        </div>
      </div>
    );
  }

  return (
    <></>
  );
}
