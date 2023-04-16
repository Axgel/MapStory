import React, { createContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "./auth-request-api";

const AuthContext = createContext();

// THESE ARE ALL THE TYPES OF UPDATES TO OUR AUTH STATE THAT CAN BE PROCESSED
export const AuthActionType = {
  GET_LOGGED_IN: "GET_LOGGED_IN",
  LOGIN_USER: "LOGIN_USER",
  LOGOUT_USER: "LOGOUT_USER",
  REGISTER_USER: "REGISTER_USER",
};

function AuthContextProvider(props) {
  const [auth, setAuth] = useState({
    user: null,
    loggedIn: false,
    error: ""
  });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    auth.getLoggedIn();
  }, []);

  const authReducer = (action) => {
    const { type, payload } = action;
    switch (type) {
      case AuthActionType.GET_LOGGED_IN: {
        return setAuth({
          user: payload.user,
          loggedIn: payload.loggedIn,
          error: payload.error,
        });
      }
      case AuthActionType.LOGIN_USER: {
        return setAuth({
          user: payload.user,
          loggedIn: payload.loggedIn,
          error: payload.error
        });
      }
      case AuthActionType.LOGOUT_USER: {
        return setAuth({
          user: null,
          loggedIn: false,
          error: payload.error
        });
      }
      case AuthActionType.REGISTER_USER: {
        return setAuth({
          user: payload.user,
          loggedIn: payload.loggedIn,
          error: payload.error
        });
      }
      default:
        return auth;
    }
  };

  auth.getLoggedIn = async function () {
    let loggedIn = false;
    let user = null;
    let error = "";

    try {
      const response = await api.getLoggedIn();
      if (response.status === 200) {
        loggedIn = response.data.loggedIn;
        user = response.data.user;
      }
    } catch (err) {
      error = err.response.data.errorMessage;
    }

    authReducer({
      type: AuthActionType.GET_LOGGED_IN,
      payload: {
        loggedIn: loggedIn,
        user: user,
        error: error
      }
    })
  };

  auth.registerUser = async function (userName, email, password, passwordVerify){
    let loggedIn = false;
    let user = null;
    let error = "";
    let response;

    try {
      response = await api.registerUser(userName, email, password, passwordVerify);
    } catch (err) {
      error = err.response.data.errorMessage;
    }
    
    authReducer({
      type: AuthActionType.REGISTER_USER,
      payload: {
        loggedIn: loggedIn,
        user: user,
        error: error,
      },
    });

    if (response && response.status === 200) {
      navigate("/");
    } 
  };

  auth.loginUser = async function (email, password) {
    let loggedIn = false;
    let user = null;
    let error = "";

    try {
      const response = await api.loginUser(email, password);
      if (response.status === 200) {
        loggedIn = true;
        user = response.data.user;
      }
    } catch (err) {
      error = err.response.data.errorMessage;
    }
    
    authReducer({
      type: AuthActionType.LOGIN_USER,
      payload: {
        loggedIn: loggedIn,
        user: user,
        error: error
      },
    });
    if (loggedIn){
      navigate("/");
    }
  };

  auth.logoutUser = async function () {
    let error = "";
    let response;
    try {
      response = await api.logoutUser();
    } catch (err) {
      error = err.response.data.errorMessage;
    }

    authReducer({
      type: AuthActionType.LOGOUT_USER,
      payload: {
        error: error
      },
    });

    if(response && response.status === 200){
      navigate("/");
    }
  };

  auth.recoveryEmail = async function (email) {
    let error = "";
    try {
      const response = await api.recoveryEmail(email);
      if (response.status === 200) {
        console.log("Email SENT!")
      }
    } catch (err) {
      error = err.response.data.errorMessage;
      console.log(error)
    }
  };


  auth.recoverPassword = async function (password, passwordVerify) {
    let error = "";
    let response;
    
    
    try {
      const userName = searchParams.get("userName");
      const token = searchParams.get("token");
      response = await api.recoverPassword(userName, token, password, passwordVerify);
      if (response && response.status === 200) {
        console.log("Password Resetted!")
      } 
    } catch (err) {
      console.log(err.response)
      error = err.response.errorMessage;
      console.log(error)
    }

    if (response && response.status === 200) {
      navigate('/')
    } 
  };

  return (
    <AuthContext.Provider value={{auth}}>
      {props.children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
export { AuthContextProvider };
