import axios from "axios";

axios.defaults.withCredentials = true;
const api = axios.create({
  baseURL: process.env.REACT_APP_FILE,
});

export const getAllSubregions = (mapId) => api.get(`/subregion/${mapId}`);
export const createSubregion = (mapId, coordinates) => {
  return api.post(`/subregion`, {
    mapId: mapId,
    type: "MultiPolygon",
    properties: {},
    coordinates: coordinates,
    isStale: false
  })
}


const apis = {
  getAllSubregions,
  createSubregion
};

export default apis;
