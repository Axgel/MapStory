import React, {useContext} from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../auth";
import { CurrentModal } from "../enums";

export default function LogInForm() {
  const { auth } = useContext(AuthContext);

  function handleSubmit(event){
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (event.nativeEvent.submitter.name === "Log In"){
      auth.loginUser(
        formData.get('email'),
        formData.get('pwd')
      )
    }else {
      auth.setCurrentModal(CurrentModal.FORGOT_PASSWORD, "")
    }
  }

  return (
    <div className="border-none border-2 border-opacity-50	blur w-[600px]">
      <form onSubmit={handleSubmit} className="h-60 flex justify-center gap-10">

        <div className="flex flex-col items-center justify-center gap-6">
          <div>
            <label htmlFor="email">Email: </label><br></br>
            <input id="loginEmail" className="border-solid border-brownshade-600 border-2 bg-black bg-opacity-15 outline-none h-12 w-80" type="text" name="email"></input>
          </div>

          <div>
            <label htmlFor="pwd">Password: </label><br></br>
            <input id="loginPwd" className="border-solid border-brownshade-600 border-2 bg-black bg-opacity-15 outline-none h-12 w-80" type="password" name="pwd"></input>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-6 mt-4">
          <button id="loginButton" type="submit" className="h-12 w-[150px] bg-brownshade-500" name = "Log In" >Log In</button>
          <button type="submit" className="h-12 w-[150px] bg-brownshade-500" name = "Forgot Password">Forgot Password</button>
        </div>
      </form>
    </div>
  );
}
