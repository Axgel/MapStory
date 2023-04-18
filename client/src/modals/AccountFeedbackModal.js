import React, {useContext} from "react";
import { CurrentModal } from "../enums";

import { GlobalStoreContext } from "../store";
import AuthContext from "../auth";

export default function AccountFeedbackModal(props) {
  const { store } = useContext(GlobalStoreContext);
  const { auth } = useContext(AuthContext);
  
  function handleCloseModal(e){
    e.stopPropagation();
    auth.setCurrentModal(CurrentModal.NONE, "");
  }

  if(auth.currentModal == CurrentModal.ACCOUNT_FEEDBACK){
    return (
      <div className="fixed inset-x-0 inset-y-0 flex items-center justify-center">
        <div className="bg-brownshade-700 border-modalborder border-solid border rounded-lg w-80 text-center">
          <h1 className="text-lg text-center mt-16 mb-12 mx-9">{auth.error}</h1>
          <button className="bg-brownshade-800 text-white mb-3 px-3 rounded-md border-brownshade-850" onClick={handleCloseModal}>OK</button>
        </div>
      </div>
    );
  }

  return (
    <></>
  )
}
