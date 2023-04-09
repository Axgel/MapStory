import React, {useContext} from "react";
import { Header, EditToolbar, Map, MapProperties, MapDetailCard } from "../components";

import { GlobalStoreContext } from '../store'
import AuthContext from "../auth";

export default function MapScreen() {
  const { store } = useContext(GlobalStoreContext);

  return (
    <div>
      <Header />
      <EditToolbar />
      <Map />
      <MapDetailCard mapDetails={store.allMaps[0]}/>
      <br></br><br></br>
      <MapProperties />
      <br></br><b></b>
    </div>
  );
}
