import React from "react";

export default function ResetPasswordForm() {
  return (
    <div className="border-none border-2 border-opacity-50	blur w-[600px] pl-8">
      <h1 className="text-white text-6xl my-16">
        Reset Password
      </h1>
      <form className="h-auto flex flex-col justify-center gap-10">

        <div className="flex gap-4 items-center border-solid border-modalborder border-opacity-60 bg-modalbgfill px-3.5 ">
          <p className="text-2xl">Password</p>
          <div className="w-px h-[70px] bg-modalborder border-opacity-60"></div>
          <div>
            <label htmlFor="pwd"></label>
            <input className="border-none bg-transparent outline-none h-12 w-[420px] text-xl" type="password" name="pwd" required></input>
          </div>
        </div>

        <div className="flex gap-4 items-center border-solid border-modalborder border-opacity-60 bg-modalbgfill px-3.5 ">
          <p className="text-2xl">Confirm Password</p>
          <div className="w-px h-[70px] bg-modalborder border-opacity-60"></div>
          <div>
            <label htmlFor="pwd"></label>
            <input className="border-none bg-transparent outline-none h-12 w-[330px] text-xl" type="password" name="pwd" required></input>
          </div>
        </div>
        
        <input type="submit" className="h-16 w-[150px] bg-brownshade-500 mt-10" value="Confirm"></input>
      </form>
    </div>
  );
}