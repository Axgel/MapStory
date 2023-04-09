import React, { useContext } from "react";
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
import { CurrentModal } from "../enums";

import { GlobalStoreContext } from '../store'
import AuthContext from "../auth";


export default function EditToolbar() {
  const { store } = useContext(GlobalStoreContext);
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  function handleExitMap(){
    navigate("/home");
  }

  function setCurrentModal(e, currentModal){
    console.log("Asd")
    store.setCurrentModal(currentModal);
  }

  return (
    <div className="flex border-solid border bg-modalbgfill justify-between">
      <div className="flex">
        <img className="w-[30px] h-[30px] pt-3.5 px-1" src={closeIcon} alt="" onClick={handleExitMap}></img>
        <div className="bg-filebuttonfill text-white px-8 text-lg	font-semibold rounded p-1 m-3 flex items-center">
          File
        </div>

        <div className="w-[1px] bg-black"></div>

        <div className="flex items-center">
          <p className="font-bold px-3">Borders - United States 1989</p>

          <div className="w-[1px] bg-black h-full"></div>

          <div className="flex gap-4 px-3">
            <img src={UndoIcon} alt=""></img>
            <img src={RedoIcon} alt=""></img>
          </div>

          <div className="w-[1px] bg-black h-full"></div>

          <div className="flex gap-4 px-3">
            <img src={AddVertexIcon} alt=""></img>
            <img src={EditVertexIcon} alt=""></img>
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
        <div className="bg-filebuttonfill text-white px-8 text-lg	font-semibold rounded p-1 m-3 flex items-center" onClick={(e) => setCurrentModal(e, CurrentModal.SHARE_MAP)}>
          Share
        </div>
        <div className="bg-filebuttonfill text-white px-8 text-lg	font-semibold rounded p-1 m-3 flex items-center" onClick={(e) => setCurrentModal(e, CurrentModal.EXPORT_MAP)}>
          Export
        </div>
      </div>
    </div>
  );
}