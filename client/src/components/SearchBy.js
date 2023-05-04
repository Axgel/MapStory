import React, { useState, useContext } from "react";
import GlobalStoreContext from "../store";

export default function SearchBy() {
  const { store } = useContext(GlobalStoreContext);

  const [searchByDD, setSearchByDD] = useState('Search By:');
  const [searchValue, setSearchValue] = useState("");

  function toggleSearchByDD(e){
    e.stopPropagation();
    document.getElementById("search-by-dd").classList.toggle("hidden");
  }

  function selectSearchBy(e, value){
    setSearchByDD(value);
    toggleSearchByDD(e);
    store.setSearchBy(searchByDD);
  }

  function handleOnChange(e){
    if (e.target.value == "") {
      store.setSearchValue("");
    }
    setSearchValue(e.target.value);
  }

  function handleOnKeyDown(e){
    if (e.key == "Enter") {
      store.setSearchValue(searchValue);
    }
  }

  return (
    <div className="flex gap-x-4 px-8">
      <div className="cursor-pointer ">
        <div className="w-[100px] h-[50px] rounded-lg shadow-lg bg-white flex flex-col justify-center items-center hover:bg-dropdownhover" onClick={toggleSearchByDD}>
          {searchByDD}
        </div>
        <div id="search-by-dd" className="absolute w-[100px] rounded-lg mt-1 bg-white hidden">
          <p onClick={(e) => selectSearchBy(e, 'Title')} className="text-center py-3 hover:bg-dropdownhover rounded-tl-lg rounded-tr-lg">Title</p>
          <p onClick={(e) => selectSearchBy(e, 'Tags')} className="text-center py-3 hover:bg-dropdownhover">Tags</p>
          <p onClick={(e) => selectSearchBy(e, 'User')} className="text-center py-3 hover:bg-dropdownhover rounded-bl-lg rounded-br-lg">User</p>
        </div>
      </div>

      <input className="w-[400px] h-[50px] rounded-lg shadow-lg bg-white outline-none border-none pl-4 text-lg" type="text" onChange={handleOnChange} onKeyDown={handleOnKeyDown}></input>

    </div>
  );
}
