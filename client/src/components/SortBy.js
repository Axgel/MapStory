import React, { useState } from "react";

export default function SortBy() {
  const [sortByDD, setSortByDD] = useState('Sort By:');

  function toggleSortByDD(e){
    e.stopPropagation();
    document.getElementById("sort-by-dd").classList.toggle("hidden");
  }

  function selectSortBy(e, value){
    setSortByDD(value)
    toggleSortByDD(e);
  }

  return (
    <div className="cursor-pointer">
      <div className="w-[100px] h-[50px] rounded-lg shadow-lg bg-white flex justify-center items-center" onClick={toggleSortByDD}>
        {sortByDD}
      </div>
      <div id="sort-by-dd" className="absolute w-[100px] rounded-lg mt-1 bg-white hidden z-10">
        <p onClick={(e) => selectSortBy(e, "Name")} className="text-center py-3 hover:bg-dropdownhover rounded-tl-lg rounded-tr-lg">Name</p>
        <p onClick={(e) => selectSortBy(e, "Upvote")} className="text-center py-3 hover:bg-dropdownhover">Upvote</p>
        <p onClick={(e) => selectSortBy(e, "Downvote")} className="text-center py-3 hover:bg-dropdownhover rounded-bl-lg rounded-br-lg">Downvote</p>
      </div>
    </div>
  );
}
