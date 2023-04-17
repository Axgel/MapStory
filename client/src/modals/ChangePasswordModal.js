import React, { useContext, useState } from "react";
import { CurrentModal } from "../enums";

import { GlobalStoreContext } from "../store";
import AuthContext from "../auth";

export default function ChangePasswordModal(props) {
  const { store } = useContext(GlobalStoreContext);
  const { auth } = useContext(AuthContext);
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [cfmPwd, setCfmPwd] = useState('');

  function handleCloseModal(e){
    e.stopPropagation();
    store.setCurrentModal(CurrentModal.NONE);
  }

  const handleChange = (event) => {
    const target = event.target;
    switch (target.name) {
      case "old":
        setOldPwd(target.value)
        break;
      case "new":
        setNewPwd(target.value)
        break;
      case "confirm":
        setCfmPwd(target.value)
        break;
    }
  };

  function handleChangePassword(e) {
    e.stopPropagation();
    auth.changePassword(oldPwd, newPwd, cfmPwd);
    store.setCurrentModal(CurrentModal.NONE);
  }

  if(store.currentModal == CurrentModal.CHANGE_PASSWORD){
    return (
      <div className="fixed inset-x-0 inset-y-0 flex items-center justify-center">

        <div className="bg-brownshade-700 border-modalborder border-solid border rounded-lg min-w-[350px] text-left">
          <h1 className="text-xl text-center mt-4 mx-9">Change Your Password</h1>
          <h1 className="mx-6 my-1 text-start">Current Password</h1>
          <input id="changeCurPwd" className="w-[350px] h-[35px] rounded-lg shadow-lg bg-transparent outline-none border-solid border pborder-lightgrey text-base mx-6 pl-2" type="password" placeholder="Current Password" onChange={handleChange} name="old"></input>

          <h1 className="mx-6 my-1 text-start">New Password</h1>
          <input id="changeNewPwd" className="w-[350px] h-[35px] rounded-lg shadow-lg bg-transparent outline-none border-solid border pborder-lightgrey text-base mx-6 pl-2" type="password" placeholder="New Password" onChange={handleChange} name="new"></input>

          <h1 className="mx-6 my-1 text-start">Confirm New Password</h1>
          <input id="changeCfmPwd" className="w-[350px] h-[35px] rounded-lg shadow-lg bg-transparent outline-none border-solid border pborder-lightgrey text-base mx-6 pl-2" type="password" placeholder="Confirm New Pasword" onChange={handleChange} name="confirm"></input>
          <br></br><br></br>
          <div className="flex flex-row-reverse mx-3">
            <button className="bg-brownshade-800 text-white mb-3 mr-3 px-3 rounded-md border-brownshade-850" onClick={handleChangePassword}>OK</button>
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