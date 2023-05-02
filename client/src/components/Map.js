import React, { useEffect, useState, useContext } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import GlobalFileContext from "../file";
import { EditMode } from "../enums";
import AuthContext from "../auth";
import { useParams } from "react-router-dom";
import GlobalStoreContext from "../store";
import * as Y from 'yjs';

const coords = {
  "1": [[
    [35.005881, -87.984916],
    [35.005881, -88.984916],
    [34.005881, -88.984916],
    [34.005881, -87.984916],
  ]],
  "2" : [[
    [37.000674, -90.538593],
    [37.000674, -91.538593],
    [36.000674, -91.538593],
    [36.000674, -90.538593],
  ]]
}


export default function Map() {
  const { auth } = useContext(AuthContext);
  const { file } = useContext(GlobalFileContext);
  const { store } = useContext(GlobalStoreContext);
  const [mapRef, setMapRef] = useState(null);
  const [mapItem, setMapItem] = useState(null);
  const { mapId } = useParams();
  // load subregions once
  const [initLoad, setInitLoad] = useState(false);


  function handleInitMapLoad(e) {
    setMapRef(e);
  }
  
  return (
    <>
      <div
        className="w-full h-[700px] z-10"
        id="map"
        ref={handleInitMapLoad}
      ></div>
    </>
  );
}
