import React, { useContext } from "react";
import { GlobalStoreContext } from "../store";
import AuthContext from "../auth";
import closeIcon from "../assets/closeIcon.png";

export default function CollaboratorCard(props) {
  const { store } = useContext(GlobalStoreContext);
  const { auth } = useContext(AuthContext);
  const { collaborator, access } = props;

  function handleRemoveCollaborator(e){
    e.stopPropagation();
    store.removeCollaborator(collaborator.email);
  }

  let removeCollabIcon = <></>;

  if((auth.user && store.selectedMapOwner) && (auth.user.email === store.selectedMapOwner.email && collaborator.email !== store.selectedMapOwner.email)){
    removeCollabIcon = <img id="removeCollab" className="w-[25px] h-[25px]" src={closeIcon} alt="" onClick={handleRemoveCollaborator}></img>;
  }
  
  // console.log(auth.user.email, store.selectedMapOwner.email);
  // if(auth.user && store.selectedMapOwner && auth.user.email !== store.selectedMapOwner.email){
  //   removeCollabIcon = <></>;
  // }
  // if((store.selectedMapOwner && auth.user) && (collaborator.email === store.selectedMapOwner.email || auth.user.email !== store.selectedMapOwner.email)){
  //   removeCollabIcon = <></>;
  // }


  return (
    <div className="flex items-center gap-5">
    <div id="collabCard" className="w-[280px] h-[40px] rounded-lg shadow-lg bg-white outline-none border-none px-4 my-1 text-lg flex justify-between items-center">
      <div className="flex flex-col items-start">
        <p id="collabUsername" className="text-sm">{ collaborator.userName }</p>
        <p id="collabEmail" className="text-lightgrey text-xs">{ collaborator.email }</p>
      </div>
      <div>
        <p className="text-base text-lightgrey">{access}</p>
      </div>
    </div> 
      {removeCollabIcon}
    </div>
  );
}