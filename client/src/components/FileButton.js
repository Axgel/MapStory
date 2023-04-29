import React, { useContext } from "react";
import { DetailView, EditMode } from "../enums";

import { GlobalStoreContext } from "../store";
import AuthContext from "../auth";
import GlobalFileContext from "../file";

export default function FileButton() {
  const { store } = useContext(GlobalStoreContext);
  const { file } = useContext(GlobalFileContext);
  const { auth } = useContext(AuthContext);
  

  function toggleFileByDD(e){
    e.stopPropagation();
    document.getElementById("file-by-dd").classList.toggle("hidden");
  }

  function toggleModeByDD(e){
    e.stopPropagation();
    document.getElementById("view-by-dd").classList.toggle("hidden");
  }

  function setDetailView(e, detailView){
    e.stopPropagation();
    store.setDetailView(detailView);
  }

  function toggleViewingMode(e){
    e.stopPropagation();
    document.getElementById("file-by-dd").classList.toggle("hidden");
    //set EditMode === VIEW
    file.setCurrentEditMode(EditMode.VIEW);
  }



  return (
    <div className="cursor-pointer m-3 z-50">
      <div className="bg-filebuttonfill text-white px-8 text-lg	font-semibold rounded flex items-start p-1" onClick={toggleFileByDD}>
        File
      </div>
      <div id="file-by-dd" className="absolute w-[150px] bg-modalbgfill hidden shadow-md">
          <div className="flex">
            <p onClick={toggleFileByDD} className="py-1 px-3 w-[150px] hover:bg-dropdownhover rounded-tl-lg rounded-tr-lg hover:bg-opacity-80" onMouseEnter={toggleModeByDD} onMouseLeave={toggleModeByDD}>Mode</p>

            <div id="view-by-dd" className="absolute ml-[100%] w-[150px] bg-modalbgfill shadow-md hidden">
              <p onClick={toggleViewingMode} className="py-1 px-3 hover:bg-dropdownhover rounded-tl-lg rounded-tr-lg hover:bg-opacity-80" onMouseLeave={toggleModeByDD}>Viewing Mode</p>
              <p onClick={toggleFileByDD} className="py-1 px-3 hover:bg-dropdownhover rounded-tl-lg rounded-tr-lg hover:bg-opacity-80" onMouseLeave={toggleModeByDD}>Editing Mode</p>
            </div>

          </div>
          <p onClick={toggleFileByDD} className="py-1 px-3 hover:bg-dropdownhover rounded-tl-lg rounded-tr-lg hover:bg-opacity-80">Tags</p>
          <div className="h-px bg-lightgrey bg-opacity-30"></div>
          <p className="py-1 px-3 hover:bg-dropdownhover rounded-tl-lg rounded-tr-lg hover:bg-opacity-80" onClick={(e) => setDetailView(e, DetailView.PROPERTIES)}>Properties</p>
          <p className="py-1 px-3 hover:bg-dropdownhover rounded-tl-lg rounded-tr-lg hover:bg-opacity-80" onClick={(e) => setDetailView(e, DetailView.COMMENTS)}>Comments</p>
          <div className="h-px bg-lightgrey bg-opacity-30"></div>
          <p onClick={toggleFileByDD} className="py-1 px-3 hover:bg-dropdownhover rounded-tl-lg rounded-tr-lg hover:bg-opacity-80">Fork</p>
          <p onClick={toggleFileByDD} className="py-1 px-3 hover:bg-dropdownhover rounded-tl-lg rounded-tr-lg hover:bg-opacity-80">Publish</p>
          <p onClick={toggleFileByDD} className="py-1 px-3 hover:bg-dropdownhover rounded-tl-lg rounded-tr-lg hover:bg-opacity-80">Delete</p>
          <div className="h-px bg-lightgrey bg-opacity-30"></div>
          <p onClick={toggleFileByDD} className="py-1 px-3 hover:bg-dropdownhover rounded-tl-lg rounded-tr-lg hover:bg-opacity-80">Save</p>
      </div>
    </div>
  );
}