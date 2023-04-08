import React from "react";
import ViewModeButtons from "./ViewModeButtons";
import SearchBy from "./SearchBy";
import SortBy from "./SortBy";

export default function NavBar() {
  return (
    <div className="flex justify-between px-10 py-4 min-w-[1036px]">
      <ViewModeButtons />
      <SearchBy />
      <SortBy />      
    </div>
  );
}
