import React from "react";

export default function Map() {
  return (
    <div className="rounded-lg border-solid w-11/12 flex">
      {/* voting */}
      <div className="w-2/12 ml-3 my-3">
        <div>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12.781 2.375c-.381-.475-1.181-.475-1.562 0l-8 10A1.001 1.001 0 0 0 4 14h4v7a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-7h4a1.001 1.001 0 0 0 .781-1.625l-8-10zM15 12h-1v8h-4v-8H6.081L12 4.601L17.919 12H15z"/>
            </svg> Upvotes
            <br/>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="currentColor" d="M20.901 10.566A1.001 1.001 0 0 0 20 10h-4V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v7H4a1.001 1.001 0 0 0-.781 1.625l8 10a1 1 0 0 0 1.562 0l8-10c.24-.301.286-.712.12-1.059zM12 19.399L6.081 12H10V4h4v8h3.919L12 19.399z"/>
            </svg> Downvotes
        </div>
      </div >
      {/* title, author, published date */}
      <div className="w-6/12 my-3">
        <div className="font-bold text-xl"> 
            Map title
        </div>
        <div>
            By: 
        </div>
        <div className= "">
            Published:
        </div>
      </div >
      {/* publish, delete, fork */}
      <div className="w-4/12 flex justify-end items-center">
        <div className="p-2 m-3 w-2/12 bg-green-500 border-solid border-2 rounded-lg text-center">
            Publish
        </div>
        <div className="p-2 m-3 w-2/12 bg-red-500 border-solid border-2 rounded-lg text-center">
            Delete
        </div>
        <div className="p-2 m-3 mr-6 w-2/12 bg-yellow-500 border-solid border-2 rounded-lg text-center">
            Fork
        </div>
      </div>
    </div>
  );
}
