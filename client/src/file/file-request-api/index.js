import axios from "axios";

axios.defaults.withCredentials = true;
const api = axios.create({
  baseURL: process.env.REACT_APP_FILE,
});

export const getAllSubregions = (mapId) => api.get(`/subregion/${mapId}`);


const apis = {
  getAllSubregions,
};

export default apis;
