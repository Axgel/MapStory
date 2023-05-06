import React, { useContext } from "react";
import downvoteOutlineIcon from '../assets/downvoteOutlineIcon.png'
import upvoteOutlineIcon from '../assets/upvoteOutlineIcon.png'
import downvoteFilledIcon from "../assets/downvoteFilledIcon.png"
import upvoteFilledIcon from "../assets/upvoteFilledIcon.png"
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
  if(!auth.loggedIn) {
    publishButtonCSS += 'hidden '
    deleteButtonCSS += 'hidden '
    forkButtonCSS += 'hidden '
  } else if (mapDetails.owner !== auth.user._id) {
    deleteButtonCSS += 'hidden '
    publishButtonCSS += 'hidden '
  }

  let mapCardWrapper = "h-[85px] border-solid rounded-lg border flex justify-between "  
  if(store.selectedMap && store.selectedMap._id === mapDetails._id){
    mapCardWrapper += "bg-mapselectedfill"
  } else {
    mapCardWrapper += "bg-brownshade-700 hover:bg-mapselectedfill hover:bg-opacity-40"
  }

  function setSelectedMap(e){
    e.stopPropagation();
    console.log("doubleclicked")
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
    store.setMapProjectAction(currentModal, mapDetails);
  }

  let upvoteImg = (auth.loggedIn && mapDetails.upvotes.includes(auth.user._id)) ? upvoteFilledIcon : upvoteOutlineIcon;
  let downvoteImg = (auth.loggedIn && mapDetails.downvotes.includes(auth.user._id)) ? downvoteFilledIcon : downvoteOutlineIcon;

  let voteCSS = "w-8 h-8 p-0.5 "
  voteCSS += (auth.loggedIn && mapDetails.isPublished) ? "hover:w-9 hover:h-9 hover:p-0" : ""


  function handleDownvote(e){
    e.stopPropagation();
    if(!auth.loggedIn || !mapDetails.isPublished) return;
    store.updateVotes(mapDetails, 0);
  }
  
  function handleUpvote(e){
    e.stopPropagation();
    if(!auth.loggedIn || !mapDetails.isPublished) return;
    store.updateVotes(mapDetails, 1);
  }

  return (
    <div className={mapCardWrapper} onClick={setSelectedMap} onDoubleClick={handleOpenMap}>
      <div className="flex">
        {/* Section for upvote/downvote */}
        <div id="votingInfo" className="flex flex-col justify-center px-2">
          <div className="flex items-center gap-2">
            <img className={voteCSS} id="upvoteIcon" src={upvoteImg} onClick={handleUpvote} alt=""></img>
            <p id="upvoteCount">{mapDetails.isPublished ? mapDetails.upvotes.length : "-"}</p>
          </div>
          <div className="flex items-center gap-2">
            <img className={voteCSS} id="downvoteIcon" src={downvoteImg} onClick={handleDownvote} alt=""></img>
            <p id="downvoteCount">{mapDetails.isPublished ? mapDetails.downvotes.length : "-"}</p>
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
      <div className="flex px-8 gap-4 items-center cursor-default">
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
