import React, { useContext, useState } from "react";
import { CurrentModal } from "../enums";
import { exportSHPDBF } from "../utils/exportSHP";
import{exportGeoJSON} from "../utils/exportGeoJSON";
import { GlobalStoreContext } from "../store";

export default function ExportMapModal() {
  const { store } = useContext(GlobalStoreContext);

  const [fileType, setFileType] = useState("GeoJSON");
  const [simplifyPercent, setSimplifyPercent] = useState(50);

  function handleExport(e){
    let compression = document.getElementById("compression").value;
    compression = compression/100;
    if (fileType === "GeoJSON")
      exportGeoJSON(store.selectedMap._id, compression, store.selectedMap.title);
    else
      exportSHPDBF(store.selectedMap._id, compression, store.selectedMap.title);
    store.setCurrentModal(CurrentModal.NONE);
    setSimplifyPercent(50);
  }

  function handleCloseModal(e){
    e.stopPropagation();
    setSimplifyPercent(50);
    store.setCurrentModal(CurrentModal.NONE);
  }

  function toggleFileTypeDD(e){
    e.stopPropagation();
    document.getElementById("file-type-dd").classList.toggle("hidden");
  }

  function selectFileType(e, name){
    setFileType(name);
    toggleFileTypeDD(e);
  }

  function compressionOnChange(e){
    setSimplifyPercent(document.getElementById("compression").value);
  }


  if(store.currentModal === CurrentModal.EXPORT_MAP){
    return (
      <div className="fixed inset-x-0 inset-y-0 flex items-center justify-center mx-2 z-50">
        <div className="bg-brownshade-700 border-modalborder border-solid border rounded-lg min-w-[450px] max-w-md text-center mx-12">
          <h1 className="text-xl mt-4 mb-4 mx-12 text-ellipsis overflow-hidden">Export '{store.selectedMap.title}'</h1>

          <div className="flex justify-between items-center mx-12 mb-3 min-w-[360px]">
            <p>File Type</p>
            <div className="flex flex-col">
              <div id="fileTypeSelect" className="w-[100px] h-[50px] rounded-lg shadow-lg bg-white flex justify-center items-center" onClick={toggleFileTypeDD}>
                {fileType}
              </div>
              <div id="file-type-dd" className="absolute mt-[53px] w-[100px] rounded-lg bg-white hidden z-10">
                <p id="shpFile" onClick={(e) => selectFileType(e, "SHP/DBF")} className="text-center py-3 hover:bg-dropdownhover rounded-tl-lg rounded-tr-lg">SHP/DBF</p>
                <p id="geojsonFile" onClick={(e) => selectFileType(e, "GeoJSON")} className="text-center py-3 hover:bg-dropdownhover rounded-tl-lg rounded-tr-lg">GeoJSON</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mx-12 mb-3 min-w-[360px] gap-5">
            <p>Simplification %</p>
            <input
              type="range"
              className="transparent h-1.5 w-full cursor-pointer appearance-none rounded-lg border-transparent bg-neutral-200"
              min="0"
              max="100"
              id="compression"
              onChange={compressionOnChange} />
          </div>
          
          <div className="flex justify-between items-center mx-12 mb-3 min-w-[360px] gap-5">
            <p className="text-left">0%: No simplification<br/>100%: Total Simplification</p>
            <p>Simplification: {simplifyPercent}%</p>
          </div>



          <div className="flex flex-row-reverse mx-12 gap-3 mt-7">
            <button id="okBtn" className="bg-brownshade-800 text-white mb-3 px-3 py-1.5 rounded-md border-brownshade-850" onClick={handleExport}>OK</button>
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
