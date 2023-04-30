import React, { useContext } from "react";
import downvoteOutlineIcon from '../assets/downvoteOutlineIcon.png'
import upvoteOutlineIcon from '../assets/upvoteOutlineIcon.png'
import { CurrentModal } from "../enums";
import { useNavigate } from "react-router-dom";
import { GlobalStoreContext } from '../store'
import AuthContext from "../auth";


export default function MapCard(props) {
  const { store } = useContext(GlobalStoreContext);
  const { auth } = useContext(AuthContext);
  const { mapDetails } = props;
  const navigate = useNavigate();


  let publishButtonCSS = 'border-solid border rounded-lg text-center px-6 py-2 bg-publishfill hover:bg-opacity-50 ';
  let deleteButtonCSS = 'border-solid border rounded-lg text-center px-6 py-2 bg-deletefill hover:bg-opacity-50 ';
  let forkButtonCSS = 'border-solid border rounded-lg text-center px-6 py-2 bg-forkfill hover:bg-opacity-50 ';
  let publishedWrapper = <p className="text-xs text-red-500">Not Published</p>;

  if(mapDetails.isPublished){
    publishButtonCSS += 'hidden '
    publishedWrapper = <p className="text-xs text-green-500">Published: {mapDetails.publishedDate}</p>;
  }
  if(!auth || mapDetails.owner !== auth.user._id){
    deleteButtonCSS += 'hidden '
    publishButtonCSS += 'hidden '
  }

  let mapCardWrapper = "h-[85px] border-solid rounded-lg border flex justify-between "  
  if(store.selectedMap && store.selectedMap._id === mapDetails._id){
    mapCardWrapper += "bg-mapselectedfill"
  } else {
    mapCardWrapper += "bg-brownshade-700"
  }

  function setSelectedMap(e){
    e.stopPropagation();
    if(store.selectedMap && (store.selectedMap._id === mapDetails._id)){
      store.setSelectedMap(null);
    }
    else{
      store.setSelectedMap(mapDetails);
    }
  }

  function handleOpenMap(e){
    e.stopPropagation();
    store.loadMapById(mapDetails._id);
    navigate(`/map/${mapDetails._id}`);
  }

  function setMapProjectAction(e, currentModal){
    e.stopPropagation();
    store.setMapProjectAction(currentModal, mapDetails._id);
  }

  return (
    <div className={mapCardWrapper} onClick={setSelectedMap} onDoubleClick={handleOpenMap}>
      <div className="flex">
        {/* Section for upvote/downvote */}
        <div className="flex flex-col justify-center px-2">
          <div className="flex items-center gap-2">
            <img src={upvoteOutlineIcon} alt=""></img>
            <p>{mapDetails.upvotes.length}</p>
          </div>
          <div className="flex items-center gap-2">
            <img src={downvoteOutlineIcon} alt=""></img>
            <p>{mapDetails.downvotes.length}</p>
          </div>
        </div>

        {/* Section for map details */}
        <div className="flex flex-col px-8 justify-center">
          <p className="text-xl font-bold max-w-3xl text-ellipsis overflow-hidden">{mapDetails.title}</p>
          <p className="text-sm">By: {mapDetails.ownerName}</p>
          {publishedWrapper}
        </div>
      </div>

      {/* Section for publish, delete, fork buttons */}
      <div className="flex px-8 gap-4 items-center cursor-pointer">
        <div id="publishBtn" className={publishButtonCSS} onClick={(e) => setMapProjectAction(e, CurrentModal.PUBLISH_MAP)}>
          Publish
        </div>

        <div id="deleteBtn" className={deleteButtonCSS} onClick={(e) => setMapProjectAction(e, CurrentModal.DELETE_MAP)}>
          Delete
        </div>

        <div id="forkBtn" className={forkButtonCSS} onClick={(e) => setMapProjectAction(e, CurrentModal.FORK_MAP)}>
          Fork
        </div>
      </div>
    </div>
  );
}
