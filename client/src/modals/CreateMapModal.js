import React, {useContext} from "react";
import { CurrentModal } from "../enums";

import { GlobalStoreContext } from "../store";
import AuthContext from "../auth";

export default function CreateMapModal(props) {
  const { store } = useContext(GlobalStoreContext);
  const { auth } = useContext(AuthContext);

  function handleCloseModal(e){
    e.stopPropagation();
    store.setCurrentModal(CurrentModal.NONE);
  }

  function handleFileSubmit(e){
    store.parseFileUpload(e);
  }

  if(store.currentModal == CurrentModal.CREATE_MAP){
    return (
      <div className="fixed inset-x-0 inset-y-0 flex items-center justify-center">
        <div className="bg-brownshade-700 border-modalborder border-solid border rounded-lg w-96 text-center">
          <h1 className="text-xl mt-4 mb-4 mx-9">Upload File</h1>
          <input className="py-4" id="fileUpload" type="file" accept=".shp, .dbf, .json" onChange={handleFileSubmit} multiple/>
          <div className="flex flex-row-reverse">
            <button className="bg-brownshade-800 text-white mb-3 mr-3 px-3 rounded-md border-brownshade-850" onClick={handleCloseModal}>OK</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <></>
  )
}