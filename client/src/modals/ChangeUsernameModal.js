import React, { useContext, useState } from "react";
import { CurrentModal } from "../enums";

import { GlobalStoreContext } from "../store";
import AuthContext from "../auth";

export default function ChangeUsernameModal(props) {
  const { store } = useContext(GlobalStoreContext);
  const { auth } = useContext(AuthContext);
  const [username, setUsername] = useState('');

  function handleCloseModal(e){
    e.stopPropagation();
    store.setCurrentModal(CurrentModal.NONE);
  }

  const handleChange = (event) => {
    setUsername(event.target.value);
  };

  function handleChangeUsername(e) {
    e.stopPropagation();
    auth.changeUsername(username);
    store.setCurrentModal(CurrentModal.NONE);
  }
  
  if(store.currentModal == CurrentModal.CHANGE_USERNAME){
    return (
      <div className="fixed inset-x-0 inset-y-0 flex items-center justify-center">

        <div className="bg-brownshade-700 border-modalborder border-solid border rounded-lg min-w-[350px] text-left">
          <h1 className="text-xl text-center mt-4 mx-9">Change Your Username</h1>
          <h1 className="mx-6 my-1 text-start">Username</h1>
          <input className="w-[350px] h-[35px] rounded-lg shadow-lg bg-transparent outline-none border-solid border pborder-lightgrey text-base mx-6 pl-2" type="text" placeholder="Username" onChange={handleChange}></input>
          <br></br><br></br>
          <div className="flex flex-row-reverse mx-3">
            <button className="bg-brownshade-800 text-white mb-3 mr-3 px-3 rounded-md border-brownshade-850" onClick={handleChangeUsername}>OK</button>
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
