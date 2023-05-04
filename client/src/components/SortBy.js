import React from "react";

export default function SortBy() {

  function toggleSortByDD(e){
    e.stopPropagation();
    document.getElementById("sort-by-dd").classList.toggle("hidden");
  }

  return (
    <div className="cursor-default">
      <div className="w-[100px] h-[50px] rounded-lg shadow-lg bg-white flex justify-center items-center hover:bg-dropdownhover" onClick={toggleSortByDD}>
        Sort By:
      </div>
      <div id="sort-by-dd" className="absolute w-[100px] rounded-lg mt-1 bg-white hidden z-10">
          <p onClick={toggleSortByDD} className="text-center py-3 hover:bg-dropdownhover rounded-tl-lg rounded-tr-lg">Item 1</p>
          <p onClick={toggleSortByDD} className="text-center py-3 hover:bg-dropdownhover">Item 2</p>
          <p onClick={toggleSortByDD} className="text-center py-3 hover:bg-dropdownhover rounded-bl-lg rounded-br-lg">Item 3</p>
        </div>
    </div>
  );
}
