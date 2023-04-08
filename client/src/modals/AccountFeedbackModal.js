import React from "react";

export default function AccountFeedbackModal(props) {
  return (
    <div className="bg-brownshade-700 border-modalborder border-solid border rounded-lg w-80 text-center">
      <h1 className="text-lg text-center mt-16 mb-12 mx-9">{props.feedback}</h1>
      <button className="bg-brownshade-800 text-white mb-3 px-3 rounded-md border-brownshade-850">OK</button>
    </div>
  );
}
