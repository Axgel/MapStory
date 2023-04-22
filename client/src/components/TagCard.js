import React, { useContext } from "react";
import { GlobalStoreContext } from "../store";
import closeIcon from "../assets/closeIcon.png";

export default function TagCard(props) {
  const { store } = useContext(GlobalStoreContext);

  function handleDeleteTags(e){
    e.stopPropagation();
    let tag = document.getElementById("displayed_tag").innerHTML
    store.deleteTags(props.tag)
  }


  return (
    <div className="flex items-center gap-5">
      <div className="w-auto h-[25px] rounded-lg shadow-lg bg-white outline-none border-none px-2 text-lg flex justify-between items-center gap-3">
        <p id="displayed_tag" className="text-sm">{props.tag}</p>
        <img id="removeTagBtn" className="w-[15px] h-[15px]" src={closeIcon} alt="" onClick={handleDeleteTags}></img>
      </div>
    </div>

  );
}