import React, {useContext} from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../auth";

export default function LogInForm() {
  const { auth } = useContext(AuthContext);

  function handleLogIn(e){
    e.stopPropagation();
    const email = document.getElementById("loginEmail").value;
    const pwd = document.getElementById("loginPwd").value;
    auth.loginUser(email, pwd);
  }

  function handleForgotPassword(e){
    e.stopPropagation();
    auth.recoveryEmail(document.getElementById("loginEmail").value);
  }

  return (
    <div className="border-none border-2 border-opacity-50	blur w-[600px]">
      <div className="h-60 flex justify-center gap-10">

        <div className="flex flex-col items-center justify-center gap-6">
          <div>
            <label htmlFor="email">Email: </label><br></br>
            <input id="loginEmail" className="border-solid border-brownshade-600 border-2 bg-black bg-opacity-15 outline-none h-12 w-80" type="text" name="email" required></input>
          </div>

          <div>
            <label htmlFor="pwd">Password: </label><br></br>
            <input id="loginPwd" className="border-solid border-brownshade-600 border-2 bg-black bg-opacity-15 outline-none h-12 w-80" type="password" name="pwd" required></input>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-6 mt-4">
          <button onClick={handleLogIn} className="h-12 w-[150px] bg-brownshade-500" name = "Log In" >Log In</button>
          <button onClick={handleForgotPassword} className="h-12 w-[150px] bg-brownshade-500" name = "Forgot Password">Forgot Password</button>
        </div>
      </div>
    </div>
  );
}
