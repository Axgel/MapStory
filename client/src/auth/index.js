import React, { createContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "./auth-request-api";
import { AuthActionType, CurrentModal } from "../enums";
import socketIO from 'socket.io-client';


const AuthContext = createContext();

function AuthContextProvider(props) {
  const [auth, setAuth] = useState({
    currentModal: CurrentModal.NONE,
    user: null,
    loggedIn: false,
    error: "",
    socket: null,
  });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    auth.getLoggedIn();
  }, []);

  const authReducer = (action) => {
    const { type, payload } = action;
    switch (type) {
      case AuthActionType.SET_CURRENT_MODAL: {
        return setAuth({
          ...auth,
          currentModal: payload.currentModal,
          error: payload.error
        })
      }
      case AuthActionType.GET_LOGGED_IN: {
        return setAuth({
          ...auth,
          user: payload.user,
          loggedIn: payload.loggedIn,
          socket: payload.socket
        });
      }
      case AuthActionType.LOGIN_USER: {
        return setAuth({
          ...auth,
          user: payload.user,
          loggedIn: payload.loggedIn,
          error: payload.error
        });
      }
      case AuthActionType.LOGOUT_USER: {
        return setAuth({
          ...auth,
          user: null,
          loggedIn: false,
        });
      }
      case AuthActionType.REGISTER_USER: {
        return setAuth({
          ...auth,
          user: payload.user,
          loggedIn: payload.loggedIn,
        });
      }
      case AuthActionType.CHANGE_USERNAME: {
        return setAuth({
          ...auth,
          user: payload.user,
        });
      }
      case AuthActionType.CHANGE_PASSWORD: {
        return setAuth({
          ...auth,
        });
      }
      default:
        return auth;
    }
  };

  auth.setCurrentModal = function(modal, err){
    authReducer({
      type: AuthActionType.SET_CURRENT_MODAL,
      payload: {
        currentModal: modal,
        error: err
      }
    })
  }
  
  auth.getLoggedIn = async function () {
    try {
      const response = await api.getLoggedIn();
      if (response.status === 200) {
        authReducer({
          type: AuthActionType.GET_LOGGED_IN,
          payload: {
            loggedIn: response.data.loggedIn,
            user: response.data.user,
            socket: null
          }
        })
      }
    } catch (err) {
      auth.setCurrentModal(CurrentModal.ACCOUNT_FEEDBACK, err.response.data.errorMessage);
    }
  };

  auth.registerUser = async function (userName, email, password, passwordVerify){
    try {
      const response = await api.registerUser(userName, email, password, passwordVerify);
      if(response.status === 200){
        authReducer({
          type: AuthActionType.REGISTER_USER,
          payload: {
            loggedIn: false,
            user: null
          }
        })
        navigate("/");
      }
    } catch (err) {
      auth.setCurrentModal(CurrentModal.ACCOUNT_FEEDBACK, err.response.data.errorMessage);
    }
  };

  auth.loginUser = async function (email, password) {
    try {
      const response = await api.loginUser(email, password);
      if (response.status === 200) {
        authReducer({
          type: AuthActionType.LOGIN_USER,
          payload: {
            loggedIn: true,
            user: response.data.user
          }
        })
      } 
    } catch (err) {
      auth.setCurrentModal(CurrentModal.ACCOUNT_FEEDBACK, err.response.data.errorMessage);
    }
  };

  auth.logoutUser = async function () {
    try {
      const response = await api.logoutUser();
      if(response.status === 200){
        authReducer({
          type: AuthActionType.LOGOUT_USER,
          payload: null
        })
        navigate("/");
      }
    } catch (err) {
      auth.setCurrentModal(CurrentModal.ACCOUNT_FEEDBACK, err.response.data.errorMessage);
    }
  };

  auth.changeUsername = async function (userName) {
    try {
      const response = await api.changeUsername(auth.user.email, userName);
      if (response.status === 200) {
        authReducer({
          type: AuthActionType.CHANGE_USERNAME,
          payload: {
            user: response.data.user
          }
        })
      }
    } catch (err) {
      auth.setCurrentModal(CurrentModal.ACCOUNT_FEEDBACK, err.response.data.errorMessage);
    }
  };

  auth.changePassword = async function (oldPwd, newPwd, cfmPwd) {
    try {
      const response = await api.changePassword(auth.user.email, oldPwd, newPwd, cfmPwd);
      if(response.status === 200){
        authReducer({
          type: AuthActionType.CHANGE_PASSWORD,
          payload: null
        })
        auth.setCurrentModal(CurrentModal.ACCOUNT_FEEDBACK, "Password has been updated!");
      }
    } catch (err) {
      auth.setCurrentModal(CurrentModal.ACCOUNT_FEEDBACK, "Incorrect password entered");
    }
  }

  auth.recoveryEmail = async function (email) {
    let error = "";
    let response; 
    try {
      response = await api.recoveryEmail(email);
    } catch (err) {
      error = err.response.data.errorMessage;
      console.log(error)
    }

    if(response && response.status === 200){
      navigate("/");
    }
  };

  auth.recoverPassword = async function (password, passwordVerify) {
    let error = "";
    let response;
    
    
    try {
      const userName = searchParams.get("userName");
      const token = searchParams.get("token");
      response = await api.recoverPassword(userName, token, password, passwordVerify);
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
