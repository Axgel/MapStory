import React, { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./auth-request-api";

const AuthContext = createContext();
console.log("create AuthContext: " + AuthContext);

// THESE ARE ALL THE TYPES OF UPDATES TO OUR AUTH STATE THAT CAN BE PROCESSED
export const AuthActionType = {
  GET_LOGGED_IN: "GET_LOGGED_IN",
  LOGIN_USER: "LOGIN_USER",
  LOGOUT_USER: "LOGOUT_USER",
  REGISTER_USER: "REGISTER_USER",
  GUEST_ACCESS: "GUEST_ACCESS",
};

function AuthContextProvider(props) {
  const [auth, setAuth] = useState({
    user: null,
    loggedIn: false,
    error: "",
    isGuest: false,
  });
  const history = useNavigate();

  // useEffect(() => {
  //   auth.getLoggedIn();
  // }, []);

  const authReducer = (action) => {
    const { type, payload } = action;
    switch (type) {
      case AuthActionType.GET_LOGGED_IN: {
        return setAuth({
          user: payload.user,
          loggedIn: payload.loggedIn,
          error: payload.error,
          isGuest: auth.isGuest,
        });
      }
      case AuthActionType.LOGIN_USER: {
        return setAuth({
          user: payload.user,
          loggedIn: payload.loggedIn,
          error: payload.error,
          isGuest: auth.isGuest,
        });
      }
      case AuthActionType.LOGOUT_USER: {
        return setAuth({
          user: null,
          loggedIn: false,
          error: payload.error,
          isGuest: false,
        });
      }
      case AuthActionType.REGISTER_USER: {
        return setAuth({
          user: payload.user,
          loggedIn: payload.loggedIn,
          error: payload.error,
          isGuest: auth.isGuest,
        });
      }
      case AuthActionType.GUEST_ACCESS: {
        return setAuth({
          user: auth.user,
          loggedIn: auth.loggedIn,
          error: auth.error,
          isGuest: payload,
        });
      }
      default:
        return auth;
    }
  };

  auth.getLoggedIn = async function () {
    try {
      const response = await api.getLoggedIn();
      if (response.status === 200) {
        authReducer({
          type: AuthActionType.GET_LOGGED_IN,
          payload: {
            loggedIn: response.data.loggedIn,
            user: response.data.user,
            error: "",
          },
        });
      }
    } catch (err) {
      authReducer({
        type: AuthActionType.GET_LOGGED_IN,
        payload: {
          loggedIn: false,
          user: null,
          error: auth.error,
        },
      });
    }
  };

  auth.registerUser = async function (
    userName,
    firstName,
    lastName,
    email,
    password,
    passwordVerify
  ) {
    try {
      const response = await api.registerUser(
        userName,
        firstName,
        lastName,
        email,
        password,
        passwordVerify
      );
      if (response.status === 200) {
        authReducer({
          type: AuthActionType.REGISTER_USER,
          payload: {
            loggedIn: false,
            user: null,
            error: "",
          },
        });
        history.push("/login");
      }
    } catch (err) {
      authReducer({
        type: AuthActionType.REGISTER_USER,
        payload: {
          loggedIn: false,
          user: null,
          error: err.response.data.errorMessage,
        },
      });
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
            user: response.data.user,
            error: "",
          },
        });
        history.push("/");
      }
    } catch (err) {
      authReducer({
        type: AuthActionType.LOGIN_USER,
        payload: {
          loggedIn: false,
          user: null,
          error: err.response.data.errorMessage,
        },
      });
    }
  };

  auth.logoutUser = async function () {
    try {
      const response = await api.logoutUser();
      if (response.status === 200) {
        authReducer({
          type: AuthActionType.LOGOUT_USER,
          payload: {
            error: "",
          },
        });
        history.push("/");
      }
    } catch (err) {
      // console.log(err.response.data.errorMessage)
      authReducer({
        type: AuthActionType.LOGOUT_USER,
        payload: {
          error: err.response.data.errorMessage,
        },
      });
    }
  };

  auth.getUserInitials = function () {
    let initials = "";
    if (auth.user) {
      initials += auth.user.firstName.charAt(0);
      initials += auth.user.lastName.charAt(0);
    }
    //console.log("user initials: " + initials);
    return initials;
  };

  auth.closeError = async function () {
    authReducer({
      type: AuthActionType.GET_LOGGED_IN,
      payload: {
        user: null,
        loggedIn: false,
        errorMessage: "",
      },
    });
  };

  auth.guestAccess = function () {
    authReducer({
      type: AuthActionType.GUEST_ACCESS,
      payload: true,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        auth,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
export { AuthContextProvider };
