import React from "react";

export default function PublishMapModal(props) {
  return (
    <div className="bg-brownshade-700 border-modalborder border-solid border rounded-lg w-96 text-right">
      <h1 className="text-xl text-center mt-4 mb-4 mx-9">{props.title}</h1>
      <h1 className="text-center ">Map Name</h1>
      <p className="text-center mb-2 text-publishmodalsubtext">{props.mapTitle}</p>
      <h1 className="text-center">Owner</h1>
      <p className="text-center mb-2 text-publishmodalsubtext">{props.owner}</p>
      <h1 className="text-center">Collaborators</h1>
      <p className="text-center mb-2 text-publishmodalsubtext">{props.collaborators}</p>
      <h1 className="text-center">Tags</h1>
      <p className="text-center mb-4 text-publishmodalsubtext">{props.tags}</p>
      <h1 className="mx-6 my-2 text-center"> {props.message} </h1>
      <div classname="flex">
        <button className="bg-brownshade-800 text-white mb-3 mr-3 px-3 rounded-md border-brownshade-850">Cancel</button>
        <button className="bg-brownshade-800 text-white mb-3 mr-3 px-3 rounded-md border-brownshade-850">OK</button>
      </div>
      
    </div>
  );
}
