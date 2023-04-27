import React, {useContext} from "react";
import { GlobalStoreContext } from '../store'

export default function Properties() {
  const { store } = useContext(GlobalStoreContext);
  const mapInfo = store.selectedMap;
  
  //get usernames of all collaborators
  const collaboratorsUsernames = [];
  store.collaborators.forEach(collaborator => {
    collaboratorsUsernames.push(collaborator.userName)
  });  
  

  return (
    <div className="flex flex-col pl-5 pt-4 gap-2">
      <div>
        <p className="font-semibold text-base">Owner</p>
        <p className="text-sm text-publishmodalsubtext">{mapInfo.ownerName}</p>
      </div>

      <div>
        <p className="font-semibold text-base">Collaborators</p>
        <p className="text-sm text-publishmodalsubtext">{(mapInfo.collaborators.length === 0) ? "No Collaborators" : collaboratorsUsernames.join(", ")}</p>
      </div>

      <div>
        <p className="font-semibold text-base">Published</p>
        <p className="text-sm text-publishmodalsubtext">{(mapInfo.isPublished) ? mapInfo.publishedDate : "Map Not Published"}</p>
      </div>
    </div>
  );
}