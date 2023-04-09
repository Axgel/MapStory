import React from "react";

export default function Properties() {
  return (
    <div className="flex flex-col pl-5 pt-4 gap-2">
      <div>
        <p className="font-semibold text-base">Owner</p>
        <p className="text-sm text-publishmodalsubtext">jSmithy123</p>
      </div>

      <div>
        <p className="font-semibold text-base">Collaborators</p>
        <p className="text-sm text-publishmodalsubtext">jasmine, analog82</p>
      </div>

      <div>
        <p className="font-semibold text-base">Published</p>
        <p className="text-sm text-publishmodalsubtext">03/02/2023</p>
      </div>
    </div>
  );
}