import React, {useContext, useState} from "react";
import { CurrentModal } from "../enums";

import { GlobalStoreContext } from "../store";
import AuthContext from "../auth";

export default function CreateMapModal(props) {
  const { store } = useContext(GlobalStoreContext);
  const { auth } = useContext(AuthContext);
  const [mapFile, setMapFile] = useState(null);
  const [errMsg, setErrMsg] = useState('');

  function handleCloseModal(e){
    e.stopPropagation();
    store.setCurrentModal(CurrentModal.NONE);   
    setErrMsg(""); 
  }

  function handleUploadFile(e){
    e.stopPropagation();
    const { files } = e.target;
    setMapFile(files);    
  }

  function handleSubmitFile(e){
    e.stopPropagation();
    const mapTitle = document.getElementById("upload-map-title").value;
    if(!mapTitle){
      setErrMsg('Map title cannot be empty');
      return;
    }
    if(!mapFile){
      setErrMsg('Please upload a shp/dbf combo or geojson file');
      return;
    }
    if(mapFile.length === 1){
      if(mapFile[0].name.split('.').pop() === "dbf"){
        setErrMsg('Please upload a shp/dbf combo or geojson file');
        return;
      }
    }else if (mapFile.length === 2){
      if(mapFile[0].name.split('.').pop() === "json" || mapFile[1].name.split('.').pop() === "json"){
        setErrMsg('Please upload a shp/dbf combo or geojson file');
        return;
      }
    } else if(mapFile.length > 2){
      setErrMsg('Please upload a shp/dbf combo or geojson file');
      return;
    } 
    store.parseFileUpload(mapFile, document.getElementById("upload-map-title").value);

    setErrMsg("");
    setMapFile(null);
  }

  if(store.currentModal === CurrentModal.CREATE_MAP){
    return (
      <div className="fixed inset-x-0 inset-y-0 flex items-center justify-center z-50">
        <div className="bg-brownshade-700 border-modalborder border-solid border rounded-lg w-96 text-center">
          <h1 className="text-xl mt-4 mb-4 mx-9">Upload File</h1>
          <h1 className="mx-6 my-1 text-start">Map Title</h1>
          <input id="upload-map-title" className="w-[325px] h-[35px] rounded-lg shadow-lg bg-transparent outline-none border-solid border pborder-lightgrey text-base" type="text" defaultValue='Untitled'/>
          <input className="py-4" id="fileUpload" type="file" accept=".shp, .dbf, .json" onChange={handleUploadFile} multiple/>
          <p className="mx-6 mb-4 text-red-600">{errMsg}</p>
          <div className="flex flex-row-reverse">
            <button id="uploadFileBtn" className="bg-brownshade-800 text-white mb-3 mr-3 px-3 rounded-md border-brownshade-850" onClick={handleSubmitFile}>Create Map</button>
            <button id="cancelFileUpload" className="bg-brownshade-800 text-white mb-3 mr-3 px-3 rounded-md border-brownshade-850" onClick={handleCloseModal}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <></>
  )
}
