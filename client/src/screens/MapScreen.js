import React from "react";
import { Header, EditToolbar, Map, MapProperties, MapDetailCard } from "../components";

export default function MapScreen() {
  return (
    <div>
      <Header />
      <EditToolbar />
      <Map />
      <MapDetailCard />
      <br></br><br></br>
      <MapProperties />
      <br></br><b></b>
    </div>
  );
}
