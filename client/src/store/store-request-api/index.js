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

export const createMap = (subregionIds, owner) => {
  return api.post('/map', {
    title: "Untitled",
    map: subregionIds,
    owner: owner._id,
    ownerName: owner.userName,
    collaborators: [],
    upvotes: [],
    downvotes: [],
    comments: [],
    tags: [],
    isPublished: false,
    publishedDate: Date.now()
  })
}

export const updateMapTitle = (mapId, newTitle) => {
  return api.put(`/title/${mapId}`, {
    title: newTitle
  })
}


export const getPersonalAndSharedMaps = (userId) => api.get(`/ownermaps/${userId}`);
export const addTags = (mapId, tag) => {
  return api.put(`/addTags/${mapId}`,{
    tag: tag
  })
}

export const deleteTags = (mapId, tag) => {
  return api.put(`/deleteTags/${mapId}`,{
    tag: tag
  })
}

export const publishMapById = (mapId) => {
  return api.put(`/publish/${mapId}`)
}

export const deleteMapById = (mapId) => api.delete(`/delete/${mapId}`);

export const getAllPublishedMaps = () => api.get(`/publishedmaps`);

export const publishMapById = (mapId) => api.put(`/publish/${mapId}`);

export const forkMapById = (mapId) => api.post(`/fork/${mapId}`);

const apis = {
  createSubregion,
  createMap, 
  deleteMapById,
  getPersonalAndSharedMaps,
  updateMapTitle,
  addTags, 
  deleteTags,
  getAllPublishedMaps,
  updateMapTitle,
  publishMapById
};

export default apis;
