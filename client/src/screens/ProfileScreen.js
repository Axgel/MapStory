import React from "react";
import { Header } from "../components";
import EditIcon from "../assets/EditIcon.png";

export default function ProfileScreen() {
  return (
    <div>
      <Header />
      <div className="border-none border-2 border-opacity-50	blur w-[600px] pl-8 pt-20 h-auto flex flex-col justify-center gap-10">

        <div className="flex gap-4 items-center border-solid border-modalborder border-opacity-60 bg-modalbgfill px-3.5 ">
          <p className="text-2xl">Email&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>
          <div className="w-px h-[70px] bg-modalborder border-opacity-60"></div>
          <div>
            <label htmlFor="email"></label>
            <input className="border-none bg-transparent outline-none h-12 w-[420px] text-xl" type="email" name="email" defaultValue="john.smith@gmail.com"></input>
          </div>
        </div>

        <div className="flex gap-4 items-center border-solid border-modalborder border-opacity-60 bg-modalbgfill px-3.5 ">
          <p className="text-2xl">Username</p>
          <div className="w-px h-[70px] bg-modalborder border-opacity-60"></div>
          <div>
            <label htmlFor="username"></label>
            <input className="border-none bg-transparent outline-none h-12 w-[370px] text-xl" type="text" name="username" defaultValue="jSmith123"></input>
          </div>
          <img className="" src={EditIcon} alt=""></img>
        </div>

        <div className="flex gap-4 items-center border-solid border-modalborder border-opacity-60 bg-modalbgfill px-3.5 ">
          <p className="text-2xl">Password&nbsp;</p>
          <div className="w-px h-[70px] bg-modalborder border-opacity-60"></div>
          <div>
            <label htmlFor="pwd"></label>
            <input className="border-none bg-transparent outline-none h-12 w-[370px] text-xl" type="password" defaultValue="jSmith123" name="pwd"></input>
          </div>
          <img className="" src={EditIcon} alt=""></img>
        </div>

    </div>
    </div>
  );
}