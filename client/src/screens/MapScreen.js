import React, {useContext, useEffect} from "react";
import { Header, EditToolbar, Map, MapProperties, MapDetailCard } from "../components";
import { useParams } from "react-router-dom";
import { GlobalStoreContext } from '../store'
import AuthContext from "../auth";
import GlobalFileContext from "../file";
const json1 = require('ot-json1');

export default function MapScreen() {
  const { auth } = useContext(AuthContext);
  const { store } = useContext(GlobalStoreContext);
  const { file } = useContext(GlobalFileContext);
  const { mapId } = useParams();

  const queue = [];
  let free = true;
  let version = 1;

  useEffect(() => {
    file.loadAllSubregions(mapId);
    store.loadMapById(mapId);
  }, []);

  useEffect(() => {
    // if (file.subregions.length === 0) return;
    if (!auth.user) return;
    const userId = auth.user._id;
    const baseURL = process.env.REACT_APP_FILE;
    const evtSource = new EventSource(baseURL + '/connect/' + userId + "/" + mapId, { withCredentials: true });
    console.log(evtSource.readyState)
    // const subregion = file.subregions[0]
    // const doc = json1.type.create(subregion)
    // console.log(doc)
    // const op = json1.replaceOp(["properties", "NAME"], "ALABAMA", "TEST_STATE");
    // console.log(json1.type.apply(doc, op));

    evtSource.onmessage = function(event) {
      const parsedData = JSON.parse(event.data);
      console.log(parsedData)
    }

    evtSource.onerror = () => {
      console.log("eventsource error");
      evtSource.close();
    }
  }, [auth]);


  
  return (
    <div>
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
