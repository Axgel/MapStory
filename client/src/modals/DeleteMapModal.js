import React, { useContext } from "react";
import { CurrentModal } from "../enums";
import { useNavigate } from "react-router-dom";
import { GlobalStoreContext } from "../store";
import AuthContext from "../auth";

export default function DeleteMapModal(props) {
  const { store } = useContext(GlobalStoreContext);
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  const mapInfo = store.mapMarkedForAction;
  let titleElement = mapInfo ? <h1 className="text-xl text-center mt-4 mb-2 mx-9 text-ellipsis overflow-hidden">{mapInfo.title}</h1> : <></>;
  let message = mapInfo ? <h1 className="mx-6 my-2 text-center text-ellipsis overflow-hidden"> Are you sure you want to permanently delete '{mapInfo.title}'? </h1> : <></>;

  function handleCloseModal(e){
    e.stopPropagation();
    store.setCurrentModal(CurrentModal.NONE);
  }

  function handleDeleteMap(e){
    e.stopPropagation();
    store.deleteMapByMarkedId();
    navigate("/");
  }

  if(store.currentModal === CurrentModal.DELETE_MAP){
    return (
      <div className="fixed inset-x-0 inset-y-0 flex items-center justify-center z-50">

        <div className="bg-brownshade-700 border-modalborder border-solid border rounded-lg w-96 text-right">
          <h1 className="text-xl text-center mt-4 mb-2 mx-9">Deleting Map</h1>
          {titleElement}
          {message}
          <h1 className="mx-6 my-2 text-center"> *This action cannot be undone.</h1><br></br><br></br>
          <div className="flex flex-row-reverse mx-3">
            <button className="bg-brownshade-800 text-white mb-3 mr-3 px-3 rounded-md border-brownshade-850" onClick={handleDeleteMap}>OK</button>
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
