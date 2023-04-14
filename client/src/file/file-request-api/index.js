import axios from "axios";

axios.defaults.withCredentials = true;
const api = axios.create({
  baseURL: process.env.REACT_APP_FILE,
});

export const createSubregion = (type, properties, coords) => {
  return api.post(`/subregion`, {
    type: type,
    properties: properties,
    coords: coords
  })
};

const apis = {
  createSubregion
};

export default apis;
