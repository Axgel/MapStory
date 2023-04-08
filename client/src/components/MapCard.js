import React from "react";
import downvoteOutlineIcon from '../assets/downvoteOutlineIcon.png'
import upvoteOutlineIcon from '../assets/upvoteOutlineIcon.png'

export default function MapCard() {
  return (
    <div className="h-[85px] bg-brownshade-700 border-solid rounded-lg border flex justify-between">
      <div className="flex">
        {/* Section for upvote/downvote */}
        <div className="flex flex-col justify-center px-2">
          <div className="flex items-center gap-2">
            <img src={upvoteOutlineIcon} alt=""></img>
            <p>589</p>
          </div>
          <div className="flex items-center gap-2">
            <img src={downvoteOutlineIcon} alt=""></img>
            <p>589</p>
          </div>
        </div>

        {/* Section for map details */}
        <div className="flex flex-col px-8 justify-center">
          <p className="text-2xl font-bold">Australia 1982</p>
          <p className="text-sm">By: jSmithy123</p>
          <p className="text-xs">Published: 03/02/2023</p>
        </div>
      </div>

      {/* Section for publish, delete, fork buttons */}
      <div className="flex px-8 gap-4 items-center">
        <div className="border-solid border rounded-lg text-center px-6 py-2 bg-publishfill">
          Publish
        </div>

        <div className="border-solid border rounded-lg text-center px-6 py-2 bg-deletefill">
          Delete
        </div>

        <div className="border-solid border rounded-lg text-center px-6 py-2 bg-forkfill">
          Fork
        </div>
      </div>
    </div>
  );
}
