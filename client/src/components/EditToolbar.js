import React from "react";
import UndoIcon from "../assets/UndoIcon.png"
import RedoIcon from "../assets/RedoIcon.png"
import AddVertexIcon from "../assets/AddVertexIcon.png"
import EditVertexIcon from "../assets/EditVertexIcon.png"
import SplitSubregionIcon from "../assets/SplitSubregionIcon.png"
import MergeSubregionIcon from "../assets/MergeSubregionIcon.png"
import AddSubregionIcon from "../assets/AddSubregionIcon.png"
import RemoveSubregionIcon from "../assets/RemoveSubregionIcon.png"


export default function EditToolbar() {
  return (
    <div className="flex border-solid border bg-modalbgfill justify-between">
      <div className="flex">
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
        <div className="bg-filebuttonfill text-white px-8 text-lg	font-semibold rounded p-1 m-3 flex items-center">
          Share
        </div>
        <div className="bg-filebuttonfill text-white px-8 text-lg	font-semibold rounded p-1 m-3 flex items-center">
          Export
        </div>
      </div>
    </div>
  );
}