import React, { useContext, useState, useEffect } from "react";
import { CurrentModal } from "../enums";

import { GlobalStoreContext } from "../store";
import AuthContext from "../auth";

export default function ForgotPasswordModal() {
  const { store } = useContext(GlobalStoreContext);
  const { auth } = useContext(AuthContext);
  const [email, setEmail] = useState('');

  function handleCloseModal(e){
    e.stopPropagation();
    auth.setCurrentModal(CurrentModal.NONE);
  }

  const handleChange = (event) => {
    setEmail(event.target.value);
  };

  function handleRecoverPassword(e) {
    e.stopPropagation();
    if(email.length == 0){
      auth.setCurrentModal(CurrentModal.NONE, '');
      return;
    }
    
    auth.recoveryEmail(email);
    auth.setCurrentModal(CurrentModal.ACCOUNT_FEEDBACK, 'You will receive an email shortly.');
  }
  
  if(auth.currentModal == CurrentModal.FORGOT_PASSWORD){
    return (
      <div className="fixed inset-x-0 inset-y-0 flex items-center justify-center z-50">

        <div className="bg-brownshade-700 border-modalborder border-solid border rounded-lg min-w-[350px] text-left">
          <h1 className="text-xl text-center mt-4 mx-9">Recover Your Password</h1>
          <h1 className="mx-6 my-1 text-start">Email</h1>
          <input className="w-[350px] h-[35px] rounded-lg shadow-lg bg-transparent outline-none border-solid border pborder-lightgrey text-base mx-6 pl-2" type="email" onChange={handleChange}></input>
          <br></br><br></br>
          <div className="flex flex-row-reverse mx-3">
            <button className="bg-brownshade-800 text-white mb-3 mr-3 px-3 rounded-md border-brownshade-850" onClick={handleRecoverPassword}>OK</button>
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
