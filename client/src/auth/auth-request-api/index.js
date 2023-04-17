/*
    This is our http api for all things auth, which we use to 
    send authorization requests to our back-end API. Note we`re 
    using the Axios library for doing this, which is an easy to 
    AJAX-based library. We could (and maybe should) use Fetch, 
    which is a native (to browsers) standard, but Axios is easier
    to use when sending JSON back and forth and it`s a Promise-
    based API which helps a lot with asynchronous communication.
    
    @author McKilla Gorilla
*/

import axios from "axios";;

axios.defaults.withCredentials = true;
const api = axios.create({
  baseURL: process.env.REACT_APP_AUTH,
});

// THESE ARE ALL THE REQUESTS WE`LL BE MAKING, ALL REQUESTS HAVE A
// REQUEST METHOD (like get) AND PATH (like /register). SOME ALSO
// REQUIRE AN id SO THAT THE SERVER KNOWS ON WHICH LIST TO DO ITS
// WORK, AND SOME REQUIRE DATA, WHICH WE WE WILL FORMAT HERE, FOR WHEN
// WE NEED TO PUT THINGS INTO THE DATABASE OR IF WE HAVE SOME
// CUSTOM FILTERS FOR QUERIES

export const getLoggedIn = () => api.get(`/loggedIn/`);
export const loginUser = (email, password) => {
  return api.post(`/login/`, {
    email: email,
    password: password,
  });
};
export const logoutUser = () => api.get(`/logout/`);
export const registerUser = (userName, email, password, passwordVerify) => {
  return api.post(`/register/`, {
    userName: userName,
    email: email,
    password: password,
    passwordVerify: passwordVerify,
  });
};

export const recoveryEmail = (email) => {
  return api.post(`/recoveryEmail`, {
    email: email,
  });
};

export const recoverPassword = (
  userName,
  token,
  password,
  passwordVerify 
) => {
  return api.post(`/recoverPassword/`, {
    userName: userName,
    token: token,
    password: password,
    passwordVerify: passwordVerify,
  });
};

export const changeUsername = (userName) => {
  return api.post(`/profile/username/`, {
    userName: userName,
  });
};

export const changePassword = (
  password,
  passwordVerify 
  ) => {
  return api.post(`/profile/password/`, {
    password: password,
    passwordVerify: passwordVerify,
  });
};

const apis = {
  getLoggedIn,
  registerUser,
  loginUser,
  logoutUser,
  recoveryEmail,
  recoverPassword,
  changeUsername,
  changePassword,
};

export default apis;
