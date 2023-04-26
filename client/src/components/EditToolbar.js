import React, { useContext, useState } from "react";
import UndoIcon from "../assets/UndoIcon.png"
import RedoIcon from "../assets/RedoIcon.png"
import AddVertexIcon from "../assets/AddVertexIcon.png"
import EditVertexIcon from "../assets/EditVertexIcon.png"
import SplitSubregionIcon from "../assets/SplitSubregionIcon.png"
import MergeSubregionIcon from "../assets/MergeSubregionIcon.png"
import AddSubregionIcon from "../assets/AddSubregionIcon.png"
import RemoveSubregionIcon from "../assets/RemoveSubregionIcon.png"
import closeIcon from "../assets/closeIcon.png"
import { useNavigate } from "react-router-dom";
import { CurrentModal, EditMode } from "../enums";
import FileButton from "./FileButton";

import { GlobalStoreContext } from '../store'
import AuthContext from "../auth";
import GlobalFileContext from "../file";


export default function EditToolbar() {
  const { store } = useContext(GlobalStoreContext);
  const { file } = useContext(GlobalFileContext);
  const { auth } = useContext(AuthContext);
  const [editActive, setEditActive] = useState(false);

  const navigate = useNavigate();
  function handleExitMap(){
    navigate("/");
  }

  function setCurrentModal(e, currentModal){
    e.stopPropagation();
    store.setCurrentModal(currentModal);
  }

  function setCurrentEditMode(e, currentEditMode){
    e.stopPropagation();
    if(currentEditMode === file.currentEditMode){
      currentEditMode = EditMode.NONE;
    }
    file.setCurrentEditMode(currentEditMode);
  }

  function handleUpdateTitle(e){
    e.stopPropagation();
    store.updateMapTitle(e.target.value);
    setEditActive(false);
  }

  function handleKeyPress(e) {
    e.stopPropagation();
    if (e.code === "Enter") {
      handleUpdateTitle(e);
    }
  }

  function handleToggleEdit(e){
    e.stopPropagation();
    setEditActive(true);
  }

  let titleElement = store.selectedMap ?  <p id="mapTitleTB" className="font-bold px-3" onDoubleClick={handleToggleEdit}>{store.selectedMap.title}</p> : <></>

  if(editActive){
    titleElement = <input 
      id="inputNewUsername" 
      className="w-[300px] h-[35px] rounded-lg shadow-lg bg-transparent outline-none border-solid border pborder-lightgrey text-base mx-2 pl-2" 
      type="text" 
      defaultValue={store.selectedMap ? store.selectedMap.title : ""} 
      autoFocus
      onBlur={handleUpdateTitle}
      onKeyDown={handleKeyPress}
      ></input>
  }

  return (
    <div className="flex border-solid border bg-modalbgfill justify-between">
      <div className="flex">
        <img className="w-[30px] h-[30px] pt-3.5 px-1" src={closeIcon} alt="" onClick={handleExitMap}></img>
        <FileButton />


        <div className="w-[1px] bg-black"></div>

        <div className="flex items-center">
          {titleElement}

          <div className="w-[1px] bg-black h-full"></div>

          <div className="flex gap-4 px-3">
            <img src={UndoIcon} alt=""></img>
            <img src={RedoIcon} alt=""></img>
          </div>

          <div className="w-[1px] bg-black h-full"></div>

          <div className="flex gap-4 px-3">
            <img src={AddVertexIcon} onClick={(e) => setCurrentEditMode(e, EditMode.ADD_VERTEX)} alt=""></img>
            <img src={EditVertexIcon} onClick={(e) => setCurrentEditMode(e, EditMode.EDIT_VERTEX)} alt=""></img>
          </div>

          <div className="w-[1px] bg-black h-full"></div>

          <div className="flex gap-4 px-3">
            <img src={SplitSubregionIcon} alt=""></img>
            <img src={MergeSubregionIcon} alt=""></img>
            <img src={AddSubregionIcon} alt=""></img>
            <img src={RemoveSubregionIcon} alt=""></img>
          </div>
          <div className="w-[1px] bg-black h-full"></div>
        </div>
      </div>

      <div className="flex">
        <div className="w-[1px] bg-black h-full"></div>
        <div id="tagsBtn" className="bg-filebuttonfill text-white px-8 text-lg	font-semibold rounded p-1 m-3 flex items-center" onClick={(e) => setCurrentModal(e, CurrentModal.TAG)}>
          Tags
        </div>
        <div id="shareMapBtn" className="bg-filebuttonfill text-white px-8 text-lg	font-semibold rounded p-1 m-3 flex items-center" onClick={(e) => setCurrentModal(e, CurrentModal.SHARE_MAP)}>
          Share
        </div>
        <div id="exportMapBtn" className="bg-filebuttonfill text-white px-8 text-lg	font-semibold rounded p-1 m-3 flex items-center" onClick={(e) => setCurrentModal(e, CurrentModal.EXPORT_MAP)}>
          Export
        </div>
      </div>
    </div>
  );
}