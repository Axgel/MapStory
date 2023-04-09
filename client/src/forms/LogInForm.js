import React from "react";
import { useNavigate } from "react-router-dom";

export default function LogInForm() {
  const navigate = useNavigate();

  function handleLogIn(){
    navigate("/home")
  }

  function handleRecoverPassword(){
    navigate("/recover")
  }

  return (
    <div className="border-none border-2 border-opacity-50	blur w-[600px]">
      <form className="h-60 flex justify-center gap-10">

        <div className="flex flex-col items-center justify-center gap-6">
          <div>
            <label htmlFor="email">Email: </label><br></br>
            <input className="border-solid border-brownshade-600 border-2 bg-black bg-opacity-15 outline-none h-12 w-80" type="text" name="email" required></input>
          </div>

          <div>
            <label htmlFor="pwd">Password: </label><br></br>
            <input className="border-solid border-brownshade-600 border-2 bg-black bg-opacity-15 outline-none h-12 w-80" type="password" name="pwd" required></input>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-6 mt-4">
          <input onClick={handleLogIn} type="submit" className="h-12 w-[150px] bg-brownshade-500" value="Log In"></input>
          <input onClick={handleRecoverPassword} type="submit" className="h-12 w-[150px] bg-brownshade-500" value="Forgot Password"></input>
        </div>
      </form>
    </div>
  );
}
