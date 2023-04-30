import axios from "axios";

axios.defaults.withCredentials = true;
const api = axios.create({
  baseURL: process.env.REACT_APP_FILE,
});

export const getAllSubregions = (mapId) => api.get(`/subregion/${mapId}`);

export const saveSubregions = (subregionsStr) => api.put(`/savesubregion`, {
  subregionsStr: subregionsStr
}) 

const apis = {
  getAllSubregions,
  saveSubregions
};

export default apis;
