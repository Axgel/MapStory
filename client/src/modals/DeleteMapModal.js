import React from "react";

export default function DeleteMapModal(props) {
  return (
    <div className="bg-brownshade-700 border-modalborder border-solid border rounded-lg w-96 text-right">
      <h1 className="text-xl text-center mt-4 mb-2 mx-9">{props.title}</h1>
      <h1 className="mx-6 my-2 text-center"> {props.message} </h1>
      <div classname="flex">
        <button className="bg-brownshade-800 text-white mb-3 mr-3 px-3 rounded-md border-brownshade-850">Cancel</button>
        <button className="bg-brownshade-800 text-white mb-3 mr-3 px-3 rounded-md border-brownshade-850">OK</button>
      </div>
      
    </div>
  );
}
