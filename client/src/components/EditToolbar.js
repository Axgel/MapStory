import React, { useContext, useState } from "react";
import UndoIcon from "../assets/UndoIcon.png"
import RedoIcon from "../assets/RedoIcon.png"
import AddVertexIcon from "../assets/AddVertexIcon.png"
import EditVertexIcon from "../assets/EditVertexIcon.png"
import SplitSubregionIcon from "../assets/SplitSubregionIcon.png"
import MergeSubregionIcon from "../assets/MergeSubregionIcon.png"
import AddSubregionIcon from "../assets/AddSubregionIcon.png"
import RemoveSubregionIcon from "../assets/RemoveSubregionIcon.png"
import downvoteOutlineIcon from '../assets/downvoteOutlineIcon.png'
import upvoteOutlineIcon from '../assets/upvoteOutlineIcon.png'
import closeIcon from "../assets/closeIcon.png"
import downvoteFilledIcon from "../assets/downvoteFilledIcon.png"
import upvoteFilledIcon from "../assets/upvoteFilledIcon.png"
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
  const [editActive, setEditActive] = useState(false); //for editing title
  const [editTool, setEditTool] = useState(0);
  
  const navigate = useNavigate();
  function handleExitMap(){
    navigate("/");
  }
  
  function setCurrentModal(e, currentModal){
    e.stopPropagation();
    store.setCurrentModal(currentModal);
  }
  
  function setCurrentEditMode(e, currentEditMode, iconNum){
    e.stopPropagation();
    if(currentEditMode === file.currentEditMode){
      currentEditMode = EditMode.NONE;
    }
    else {
      toggleEditIcon(editTool)
      setEditTool(iconNum)
    }
    toggleEditIcon(iconNum)
    file.setCurrentEditMode(currentEditMode);
  }

  function toggleEditIcon(iconNum){
    switch(iconNum) {
      case 1: //add vertex
        document.getElementById("add-vertex").classList.toggle("bg-mapselectedfill");
        break;
      case 2: //edit vertex
        document.getElementById("edit-vertex").classList.toggle("bg-mapselectedfill");
        break;
      case 3: //split subregion
        document.getElementById("split-subregion").classList.toggle("bg-mapselectedfill");
        break;
      case 4: //merge subregion
        document.getElementById("merge-subregion").classList.toggle("bg-mapselectedfill");
        break;
      case 5: //add subregion
        document.getElementById("add-subregion").classList.toggle("bg-mapselectedfill");
        break;
      case 6: //remove subregion
        document.getElementById("remove-subregion").classList.toggle("bg-mapselectedfill");
        break;
      default:
        // code block
    }
  }
  
  function handleUndo() {
    file.handleUndo();
  }
  
  function handleRedo() {
    file.handleRedo();
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
  
  let titleElement = store.selectedMap ?  <p id="mapTitleTB" className="font-bold px-3" onDoubleClick={handleToggleEdit}>{store.selectedMap.title}</p> : <></>;
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
  let editingTools = (file.currentEditMode === EditMode.VIEW) ? <></> :
  <>
      <div className="w-[1px] bg-black h-full"></div>

      <div className="flex gap-2 px-3">
        <img className="w-[25px] h-[25px] px-2 py-2 hover:bg-mapselectedfill" src={UndoIcon} onClick={handleUndo} alt=""></img>
        <img className="w-[25px] h-[25px] px-2 py-2 hover:bg-mapselectedfill" src={RedoIcon} onClick={handleRedo} alt=""></img>
      </div>

      <div className="w-[1px] bg-black h-full"></div>

      <div className="flex gap-2 px-3">
        <img id="add-vertex" className="w-[30px] h-[30px] px-1 py-1 hover:bg-mapselectedfill" src={AddVertexIcon} onClick={(e) => setCurrentEditMode(e, EditMode.ADD_VERTEX, 1)} alt=""></img>
        <img id="edit-vertex" className="w-[30px] h-[30px] px-1 py-1 hover:bg-mapselectedfill" src={EditVertexIcon} onClick={(e) => setCurrentEditMode(e, EditMode.EDIT_VERTEX, 2)} alt=""></img>
      </div>

      <div className="w-[1px] bg-black h-full"></div>

      <div className="flex gap-2 px-3">
        <img id="split-subregion" className="w-[30px] h-[30px] px-1 py-1 hover:bg-mapselectedfill" src={SplitSubregionIcon} onClick={(e) => setCurrentEditMode(e, EditMode.SPLIT_SUBREGION, 3)} alt=""></img>
        <img id="merge-subregion" className="w-[30px] h-[30px] px-1 py-1 hover:bg-mapselectedfill" src={MergeSubregionIcon} onClick={(e) => setCurrentEditMode(e, EditMode.MERGE_SUBREGION, 4)} alt=""></img>
        <img id="add-subregion" className="w-[30px] h-[30px] px-1 py-1 hover:bg-mapselectedfill" src={AddSubregionIcon} onClick={(e) => setCurrentEditMode(e, EditMode.ADD_SUBREGION, 5)} alt=""></img>
        <img id="remove-subregion" className="w-[25px] h-[25px] px-[6px] py-[6px] hover:bg-mapselectedfill" src={RemoveSubregionIcon} onClick={(e) => setCurrentEditMode(e, EditMode.REMOVE_SUBREGION, 6)} alt=""></img>
      </div>
      <div className="w-[1px] bg-black h-full"></div>
    </>;

  //------------------------------VOTING -------------------------------------
  function handleDownvote(e){
    e.stopPropagation();
    store.updateVotes(store.selectedMap, 0);
  }

  function handleUpvote(e){
    e.stopPropagation();
    store.updateVotes(store.selectedMap, 1);
  }
  
  let upvoteImg = upvoteOutlineIcon;
  if(store.selectedMap && auth.user && store.selectedMap.upvotes.includes(auth.user._id)) 
    upvoteImg = upvoteFilledIcon;
  let downvoteImg = downvoteOutlineIcon;
  if(store.selectedMap && auth.user && store.selectedMap.downvotes.includes(auth.user._id)) 
    downvoteImg = downvoteFilledIcon ;

  let numUpvotes = 0;
  let numDownvotes = 0;
  if(store.selectedMap !== null){
    numUpvotes = store.selectedMap.upvotes.length;
    numDownvotes = store.selectedMap.downvotes.length;
  }

  let voting = (file.currentEditMode === EditMode.VIEW) ?
    <>
      <div className="w-[1px] bg-black h-full"></div>

      <div className="flex gap-4 px-3 py-2 items-center">
        <img className="w-8 h-8" src={upvoteImg} onClick={handleUpvote} alt=""></img>
        <p className="font-bold">{numUpvotes}</p>
        <img className="w-8 h-8" src={downvoteImg} onClick={handleDownvote} alt=""></img>
        <p className="font-bold pr-3">{numDownvotes}</p>
      </div>
    </>
    :<></>;
  //--------------------------------------------------------------------------------------
  let exportClassName = "bg-filebuttonfill text-white px-8 text-lg	font-semibold rounded p-1 m-3 flex items-center hover:bg-opacity-50";
  let shareClassName = exportClassName;
  if(!auth.loggedIn){
    shareClassName += "cursor-not-allowed opacity-30";
  }

  return (
    <div className="flex border-solid border bg-modalbgfill justify-between">
      <div className="flex">
        <img className="w-[30px] h-[30px] pt-3.5 px-1" src={closeIcon} alt="" onClick={handleExitMap}></img>
        <FileButton />

        <div className="w-[1px] bg-black"></div>

        <div className="flex items-center">
          {titleElement}
          {editingTools}
        </div>
      </div>

      <div className="flex">
        {voting}
        <div className="w-[1px] bg-black h-full"></div>
        <div id="shareMapBtn" className={shareClassName} onClick={(e) => setCurrentModal(e, CurrentModal.SHARE_MAP)}>
          Share
        </div>
        <div id="exportMapBtn" className={exportClassName} onClick={(e) => setCurrentModal(e, CurrentModal.EXPORT_MAP)}>
          Export
        </div>
      </div>
    </div>
  );
}