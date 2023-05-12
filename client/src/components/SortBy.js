import React, { useContext, useState } from "react";
import GlobalStoreContext from "../store";

export default function SortBy() {
  const { store } = useContext(GlobalStoreContext);

  const [sortByDD, setSortByDD] = useState('Sort By:');

  function toggleSortByDD(e){
    e.stopPropagation();
    document.getElementById("sort-by-dd").classList.toggle("hidden");
  }

  function selectSortBy(e, value){
    setSortByDD(value);
    toggleSortByDD(e);
    store.setSortBy(value);
  }

  return (
    <div className="cursor-default">
      <div className="w-[100px] h-[50px] rounded-lg shadow-lg bg-white flex justify-center items-center hover:bg-dropdownhover" onClick={toggleSortByDD}>
        {sortByDD}
      </div>
      <div id="sort-by-dd" className="absolute w-[100px] rounded-lg mt-1 bg-white hidden z-10">
        <p onClick={(e) => selectSortBy(e, "A to Z")} className="text-center py-3 hover:bg-dropdownhover rounded-tl-lg rounded-tr-lg">A to Z</p>
        <p onClick={(e) => selectSortBy(e, "Upvote")} className="text-center py-3 hover:bg-dropdownhover">Upvote</p>
        <p onClick={(e) => selectSortBy(e, "Downvote")} className="text-center py-3 hover:bg-dropdownhover rounded-bl-lg rounded-br-lg">Downvote</p>
      </div>
    </div>
  );
}
