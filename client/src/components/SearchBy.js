import React, { useState } from "react";

export default function SearchBy() {
  const [searchByDD, setSearchByDD] = useState(false);


  function toggleSearchByDD(e){
    e.stopPropagation();
    document.getElementById("search-by-dd").classList.toggle("hidden");
  }

  return (
    <div className="flex gap-x-4 px-8">
      <div className="cursor-pointer ">
        <div className="w-[100px] h-[50px] rounded-lg shadow-lg bg-white flex flex-col justify-center items-center hover:bg-dropdownhover" onClick={toggleSearchByDD}>
          Search By:
        </div>
        <div id="search-by-dd" className="absolute w-[100px] rounded-lg mt-1 bg-white hidden">
          <p onClick={toggleSearchByDD} className="text-center py-3 hover:bg-dropdownhover rounded-tl-lg rounded-tr-lg">Item 1</p>
          <p onClick={toggleSearchByDD} className="text-center py-3 hover:bg-dropdownhover">Item 2</p>
          <p onClick={toggleSearchByDD} className="text-center py-3 hover:bg-dropdownhover rounded-bl-lg rounded-br-lg">Item 3</p>
        </div>
      </div>

      <input className="w-[400px] h-[50px] rounded-lg shadow-lg bg-white outline-none border-none pl-4 text-lg" type="text"></input>

    </div>
  );
}
