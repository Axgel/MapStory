import React, { useContext, useState, useEffect } from "react";
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

  
  useEffect(() => {
    if(!store.selectedMap) return
    if (store.selectedMap.isPublished) file.setCurrentEditMode(EditMode.VIEW);
  }, [store])
  
  const navigate = useNavigate();
  function handleExitMap(){
    file.resetDefault();
    navigate("/");
  }
  
  function setCurrentModal(e, currentModal){
    e.stopPropagation();
    if(currentModal === CurrentModal.SHARE_MAP && (!auth.loggedIn || !store.selectedMap || auth.user._id !== store.selectedMap.owner)) return;
    store.setCurrentModal(currentModal);
  }
  
  function setCurrentEditMode(e, currentEditMode){
    e.stopPropagation();
    if(currentEditMode === file.currentEditMode){
      currentEditMode = EditMode.NONE;
    }
    file.setCurrentEditMode(currentEditMode);
  }

  function setCurrentEditModeOption(option){
    if (file.currentEditMode !== EditMode.EDIT_VERTEX) return
    file.setCurrentEditModeOption(option); 
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
    if(auth.loggedIn){
      e.stopPropagation();
      setEditActive(true);
    }
  }

  const toggledOnClass = "bg-mapselectedfill"
  const toggledOffClass = "hover:bg-mapselectedfill hover:bg-opacity-50"
  const disabledClass = "cursor-not-allowed opacity-30"

  let baseIconClass = "w-[30px] h-[30px] px-1 py-1 rounded-md " + toggledOffClass;
  let baseTextClass = "text-lg py-1 px-2 rounded-md " + disabledClass;

  let editVertexClass = baseIconClass;
  let addVertexClass = baseTextClass;
  let moveVertexClass = baseTextClass;
  let removeVertexClass = baseTextClass;
  let splitSubregionClass = baseIconClass;
  let mergeSubregionClass = baseIconClass;
  let addSubregionClass = baseIconClass;
  let removeSubregionClass = "w-[25px] h-[25px] px-[6px] py-[6px] rounded-md " + toggledOffClass;
  switch(file.currentEditMode) {
    case(EditMode.EDIT_VERTEX):
      editVertexClass = editVertexClass.replace(toggledOffClass, toggledOnClass);
      addVertexClass = addVertexClass.replace(disabledClass, (file.editModeOptions[0] ? toggledOnClass : toggledOffClass));
      moveVertexClass = moveVertexClass.replace(disabledClass, (file.editModeOptions[1] ? toggledOnClass : toggledOffClass));
      removeVertexClass = removeVertexClass.replace(disabledClass, (file.editModeOptions[2] ? toggledOnClass : toggledOffClass));
      break
    case(EditMode.SPLIT_SUBREGION):
      splitSubregionClass = splitSubregionClass.replace(toggledOffClass, toggledOnClass);
      break
    case(EditMode.MERGE_SUBREGION):
      mergeSubregionClass = mergeSubregionClass.replace(toggledOffClass, toggledOnClass);
      break
    case(EditMode.ADD_SUBREGION):
      addSubregionClass = addSubregionClass.replace(toggledOffClass, toggledOnClass);
      break
    case(EditMode.REMOVE_SUBREGION):
      removeSubregionClass = removeSubregionClass.replace(toggledOffClass, toggledOnClass);
      break
  }

  //EDITING TITLE ----------------------------------------------------------------------
  
  let titleElement = store.selectedMap ?  <p id="mapTitleTB" className="font-bold px-3 text-ellipsis overflow-hidden max-w-[250px]" onDoubleClick={handleToggleEdit}>{store.selectedMap.title}</p> : <></>;
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
        <img className="w-[30px] h-[30px] px-1 py-1 rounded-md hover:bg-mapselectedfill hover:bg-opacity-50" src={UndoIcon} onClick={handleUndo} alt=""></img>
        <img className="w-[30px] h-[30px] px-1 py-1 rounded-md hover:bg-mapselectedfill hover:bg-opacity-50" src={RedoIcon} onClick={handleRedo} alt=""></img>
      </div>

      <div className="w-[1px] bg-black h-full"></div>

      <div className="flex gap-4 px-2">
        <img id="editVertex" className={editVertexClass} src={EditVertexIcon} onClick={(e) => setCurrentEditMode(e, EditMode.EDIT_VERTEX)} alt=""></img>
        <div id="add-vertex" className={addVertexClass} onClick={(e) => setCurrentEditModeOption(0)}>Add</div>
        <div id="move-vertex" className={moveVertexClass} onClick={(e) => setCurrentEditModeOption(1)}>Move</div>
        <div id="remove-vertex" className={removeVertexClass} onClick={(e) => setCurrentEditModeOption(2)}>Remove</div>
      </div>

      <div className="w-[1px] bg-black h-full"></div>

      <div className="flex gap-4 px-3">
        <img id="split-subregion" className={splitSubregionClass} onClick={(e) => setCurrentEditMode(e, EditMode.SPLIT_SUBREGION)} src={SplitSubregionIcon} alt=""></img>
        <img id="merge-subregion" className={mergeSubregionClass} onClick={(e) => setCurrentEditMode(e, EditMode.MERGE_SUBREGION)} src={MergeSubregionIcon} alt=""></img>
        <img id="add-subregion" className={addSubregionClass}  src={AddSubregionIcon} onClick={(e) => setCurrentEditMode(e, EditMode.ADD_SUBREGION)} alt=""></img>
        <img id="remove-subregion" className={removeSubregionClass} src={RemoveSubregionIcon} onClick={(e) => setCurrentEditMode(e, EditMode.REMOVE_SUBREGION)} alt=""></img>
      </div>
      
      <div className="w-[1px] bg-black h-full"></div>
    </>;

  //------------------------------VOTING -------------------------------------
  function handleDownvote(e){
    e.stopPropagation();
    if(!auth.loggedIn || !store.selectedMap || !store.selectedMap.isPublished) return;
    store.updateVotes(store.selectedMap, 0);
  }

  function handleUpvote(e){
    e.stopPropagation();
    if(!auth.loggedIn || !store.selectedMap || !store.selectedMap.isPublished) return;
    store.updateVotes(store.selectedMap, 1);
  }
  

  let upvoteImg = (auth.user && store.selectedMap && store.selectedMap.upvotes.includes(auth.user._id)) ? upvoteFilledIcon : upvoteOutlineIcon;
  let downvoteImg = (auth.user && store.selectedMap && store.selectedMap.downvotes.includes(auth.user._id)) ? downvoteFilledIcon : downvoteOutlineIcon;

  let numUpvotes = (store.selectedMap && store.selectedMap.isPublished) ? store.selectedMap.upvotes.length : "-";
  let numDownvotes = (store.selectedMap && store.selectedMap.isPublished) ? store.selectedMap.downvotes.length : "-";
  
  let voteCSS = "w-8 h-8 p-0.5 "
  voteCSS += (auth.loggedIn && store.selectedMap && store.selectedMap.isPublished) ? "hover:w-9 hover:h-9 hover:p-0" : "cursor-not-allowed opacity-30"

  let voting = (file.currentEditMode === EditMode.VIEW) ?
    <>
      <div className="w-[1px] bg-black h-full"></div>

      <div className="flex gap-4 px-3 py-2 items-center">
        <img className={voteCSS} src={upvoteImg} onClick={handleUpvote} alt=""></img>
        <p className="font-bold">{numUpvotes}</p>
        <img className={voteCSS} src={downvoteImg} onClick={handleDownvote} alt=""></img>
        <p className="font-bold pr-3">{numDownvotes}</p>
      </div>
    </>
    :<></>;
  //--------------------------------------------------------------------------------------
  let fileButtonClass = "bg-filebuttonfill text-white px-8 text-lg	font-semibold rounded p-1 m-3 flex items-center ";
  let exportClassName = fileButtonClass + "hover:bg-opacity-50";
  let shareClassName = fileButtonClass
  shareClassName += ((auth.loggedIn && store.selectedMap && auth.user._id === store.selectedMap.owner) ? "hover:bg-opacity-50" : "cursor-not-allowed opacity-30");
  return (
    <div className="flex-none h-16 flex border-solid border bg-modalbgfill justify-between">
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