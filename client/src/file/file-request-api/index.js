import axios from "axios";

axios.defaults.withCredentials = true;
const api = axios.create({
  baseURL: process.env.REACT_APP_FILE,
});

export const getFile = () => api.get(`/file/`);

const apis = {
  getFile,
};

export default apis;
