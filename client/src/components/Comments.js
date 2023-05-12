import React, { useContext, useEffect } from "react";
import paperPlaneIcon from "../assets/paperPlaneIcon.png"
import AuthContext from "../auth";
import { GlobalStoreContext } from "../store";

export default function Comments(props) {
  //display comments
  const { auth } = useContext(AuthContext);
  const { store } = useContext(GlobalStoreContext);

  let commentCard = <></>;
  if(store.selectedMap && store.comments){
    commentCard = store.comments.map((comment, index) => {
      return <div key={index}>
                <p className="font-semibold text-base">{comment.username}</p>
                <p className="text-sm text-publishmodalsubtext">{comment.comment}</p>
             </div>;
    })
  }

  function handleComment(e){
    e.stopPropagation();
    let comment = document.getElementById("input_comment").value;
    document.getElementById("input_comment").value = "";
    //if comment not empty and just blank
    store.addComment(comment);
  }

  function handleKeyPress(e) {
    e.stopPropagation();
    if (e.code === "Enter") {
      handleComment(e);
    }
  }

  return (
    <div>
    <div id="commentView" className="flex flex-col pl-5 pr-2 py-3 gap-2">
      <div id="commentCards" className="mb-3 pb-8">{commentCard}</div>
    </div>
      {auth.loggedIn ?
        <div className="absolute bottom-2 left-3">
          <input id="input_comment" onKeyDown={handleKeyPress} className="w-[230px] h-[35px] rounded-lg shadow-lg bg-white outline-none border-none pl-2 text-base" type="text"></input>
          <img id="submit_comment" className="h-[35px] absolute bottom-0" src={paperPlaneIcon} onClick={handleComment} alt=""></img>
        </div> : <></>
      }
    </div>
  );
}