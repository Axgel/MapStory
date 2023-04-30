import React, { useContext, useEffect } from "react";
import paperPlaneIcon from "../assets/paperPlaneIcon.png"

import { GlobalStoreContext } from "../store";

export default function Comments(props) {
  //display comments
  const { store } = useContext(GlobalStoreContext);

  // useEffect(() => {
  //   store.loadCommentsByMap();
  // }, [])

  let commentCard = <></>;
  if(store.selectedMap && store.comments){
    commentCard = store.comments.map((comment, index) => {
      return <div>
                <p className="font-semibold text-base">comment.username</p>
                <p className="text-sm text-publishmodalsubtext">comment.comment</p>
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

  return (
    <div className="flex flex-col pl-5 pt-4 gap-2">
      {commentCard}
      {/* <div>
        <p className="font-semibold text-base">janeD43</p>
        <p className="text-sm text-publishmodalsubtext">This is such a useful map for my history class!</p>
      </div>

      <div>
        <p className="font-semibold text-base">janeD43</p>
        <p className="text-sm text-publishmodalsubtext">I plan on making an extension of this app soon!</p>
      </div> */}
      <div className="absolute bottom-2 left-3">
        <input id="input_comment" className="w-[230px] h-[35px] rounded-lg shadow-lg bg-white outline-none border-none pl-2 text-base" type="text"></input>
        <img className="h-[35px] absolute bottom-0" src={paperPlaneIcon} onClick={handleComment} alt=""></img>
      </div>
    </div>
  );
}