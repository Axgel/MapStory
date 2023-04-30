import React, {useContext, useEffect, useState} from "react";
import { Header, EditToolbar, Map, MapProperties, MapDetailCard } from "../components";
import { useParams } from "react-router-dom";
import { GlobalStoreContext } from '../store'
import AuthContext from "../auth";
import GlobalFileContext from "../file";
import { fileStore, connect, disconnect } from "../file/file";
import { useSyncedStore } from '@syncedstore/react';
import { getYjsValue } from "@syncedstore/core";
import * as Y from 'yjs'

export default function MapScreen() {
  const { auth } = useContext(AuthContext);
  const { store } = useContext(GlobalStoreContext);
  const { file } = useContext(GlobalFileContext);
  const { mapId } = useParams();
  const [items, setItems] = useState([]);
  const fileState = useSyncedStore(fileStore);
  const ydoc = getYjsValue(fileState);
  const array = ydoc.getArray('items');
  // const undoManager = new Y.UndoManager(array)
  const [undoManager] = useState(() => new Y.UndoManager(array));

  function handleClick(e){
    array.insert(0, ["kk"]);
    undoManager.stopCapturing()
    console.log(JSON.stringify(array));
  }

  function pop(e){
    array.delete(0);
    console.log(JSON.stringify(array));
  }

  function undo(e){
    undoManager.undo();
    console.log(JSON.stringify(array));
  }

  function redo(e){
    undoManager.redo();
    console.log(JSON.stringify(array));
  }



  return (
    <div>
      <button onClick={handleClick}>asdasdas</button>
      <button onClick={connect}>connect</button>
      <button onClick={disconnect}>disconnect</button>
      <button onClick={undo}>undo</button>
      <button onClick={redo}>redo</button>
      <button onClick={pop}>pop</button>
      <br></br>
      
        {array.map((item, i) => {
          return (
            <p key={i}>{item}</p>
          );
        })}
      
      <Header />
      <EditToolbar />
      <Map />
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
