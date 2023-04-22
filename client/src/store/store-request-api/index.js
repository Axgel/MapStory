import axios from "axios";

axios.defaults.withCredentials = true;
const api = axios.create({
  baseURL: process.env.REACT_APP_STORE,
});

export const createSubregion = (mapId, type, properties, coords) => {
  return api.post(`/subregion`, {
    mapId: mapId,
    type: type,
    properties: properties,
    coordinates: coords,
    isStale: false
  })
};

export const createMap = (user, mapTitle) => {
  return api.post('/map', {
    title: mapTitle,
    owner: user._id,
    ownerName: user.userName,
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

export const deleteMapById = (mapId) => api.delete(`/delete/${mapId}`);

export const getPublishedMaps = () => api.get(`/publishedmaps`);

export const publishMapById = (mapId) => api.put(`/publish/${mapId}`);

export const forkMapById = (mapId, userId) => api.post(`/fork/${mapId}`, {userId: userId});

export const getMapById = (mapId) => api.get(`/map/${mapId}`);

export const addCollaborator = (mapId, collaboratorEmail) => {
  return api.put(`/addCollaborators/${mapId}`, {
    collaboratorEmail: collaboratorEmail
  })
}
export const removeCollaborator = (mapId, collaboratorEmail) => {
  return api.put(`/removeCollaborators/${mapId}`, {
    collaboratorEmail: collaboratorEmail
  })
}

export const getUserById = (userId) => api.get(`/user/${userId}`);


const apis = {
  createSubregion,
  createMap, 
  deleteMapById,
  getPersonalAndSharedMaps,
  updateMapTitle,
  addTags, 
  deleteTags,
  getPublishedMaps,
  updateMapTitle,
  publishMapById, 
  forkMapById,
  getMapById,
  addCollaborator,
  removeCollaborator,
  getUserById
};

export default apis;
