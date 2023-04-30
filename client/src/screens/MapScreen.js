import React, {useContext, useEffect, useState} from "react";
import { Header, EditToolbar, Map, MapProperties, MapDetailCard } from "../components";
import { useParams } from "react-router-dom";
import { GlobalStoreContext } from '../store'
import AuthContext from "../auth";
import GlobalFileContext from "../file";
import { fileStore } from "../file/file";
import { useSyncedStore } from '@syncedstore/react';
import { getYjsValue } from "@syncedstore/core";

export default function MapScreen() {
  const { auth } = useContext(AuthContext);
  const { store } = useContext(GlobalStoreContext);
  const { file } = useContext(GlobalFileContext);
  const { mapId } = useParams();
  const fileState = useSyncedStore(fileStore);
  const refresh = getYjsValue(fileState.refresh);

  useEffect(() => {
    file.loadAllSubregionsFromDb(mapId);
    store.loadMapById(mapId);
  }, []);

  function undo(e){
    file.testUndo();
  }

  function redo(e){
    file.testRedo();
  }


  return (
    <div>
      <button onClick={undo}>undo</button>
      <button onClick={redo}>redo</button>
      <Header />
      <EditToolbar />
      <Map refresh={refresh}/>
      {/* <div className="absolute right-0 top-[15%]  flex flex-row-reverse">
        <MapDetailCard mapDetails={store.personalMaps[0]}/>
      </div> */}
      {/* <div id="map-detail-view" className="absolute bottom-0 m-3">
        <MapProperties />
      </div> */}
      <br></br><b></b>
    </div>
  );
}
