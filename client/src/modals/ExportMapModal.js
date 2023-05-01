import React, { useContext } from "react";
import { CurrentModal } from "../enums";
import GlobalFileContext from "../file";
import { exportSHPDBF } from "../utils/exportSHP";
import{exportGeoJSON} from "../utils/exportGeoJSON";
import { GlobalStoreContext } from "../store";
import AuthContext from "../auth";

export default function ExportMapModal() {
  const { store } = useContext(GlobalStoreContext);
  const { auth } = useContext(AuthContext);
  const { file } = useContext(GlobalFileContext);

  function handleExport(e){
    let compression = document.getElementById("compression").value
    if (document.getElementById("fileType").value.toLowerCase() === "geojson"){
      exportGeoJSON(file.subregions, compression);
    }
    if (document.getElementById("fileType").value.toLowerCase() === "shp"){
      exportSHPDBF(file.subregions, compression);
    }
    store.setCurrentModal(CurrentModal.NONE);
  }

  function handleCloseModal(e){
    e.stopPropagation();
    store.setCurrentModal(CurrentModal.NONE);
  }

  if(store.currentModal === CurrentModal.EXPORT_MAP){
    return (
      <div className="fixed inset-x-0 inset-y-0 flex items-center justify-center mx-2 z-50">
        <div className="bg-brownshade-700 border-modalborder border-solid border rounded-lg min-w-[450px] max-w-md text-center mx-12">
          <h1 className="text-xl mt-4 mb-4 mx-12">Export '{store.selectedMap.title}'</h1>

          <div className="flex justify-between items-center mx-12 mb-3 min-w-[360px]">
            <p>File Type</p>
            <input id="fileType" className="w-[100px] h-[35px] rounded-lg shadow-lg bg-white outline-none border-none pl-4 text-lg" type="text" placeholder="geojson/shp"></input>
          </div>

          <div className="flex justify-between items-center mx-12 mb-3 min-w-[360px]">
            <p>Compression %</p>
            <input id="compression" className="w-[100px] h-[35px] rounded-lg shadow-lg bg-white outline-none border-none pl-4 text-lg" type="text" placeholder="-"></input>
          </div>



          <div className="flex flex-row-reverse mx-12 gap-3 mt-7">
            <button className="bg-brownshade-800 text-white mb-3 px-3 py-1.5 rounded-md border-brownshade-850" onClick={handleExport}>OK</button>
            <button className="bg-brownshade-800 text-white mb-3 px-3 py-1.5 rounded-md border-brownshade-850" onClick={handleCloseModal}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <></>
  );
}
