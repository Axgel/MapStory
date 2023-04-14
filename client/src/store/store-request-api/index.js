import axios from "axios";

axios.defaults.withCredentials = true;
const api = axios.create({
  baseURL: process.env.REACT_APP_STORE,
});

export const createSubregion = (type, properties, coords) => {
  return api.post(`/subregion`, {
    type: type,
    properties: properties,
    coordinates: coords
  })
};

export const createMap = (subregionIds, ownerId) => {
  return api.post('/map', {
    title: "Untitled",
    map: subregionIds,
    owner: ownerId,
    collaborators: [],
    upvotes: [],
    downvotes: [],
    comments: [],
    tags: [],
    isPublished: false,
    publishedDate: Date.now()
  })
}

export const getPersonalAndSharedMaps = () => api.get('/ownermaps');

const apis = {
  createSubregion,
  createMap,
  getPersonalAndSharedMaps
};

export default apis;
