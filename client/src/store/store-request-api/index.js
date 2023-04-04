import axios from "axios";

axios.defaults.withCredentials = true;
const api = axios.create({
  baseURL: process.env.REACT_APP_STORE,
});

export const getDemo = () => api.get(`/demo/`);
export const writeDemo = (name) => api.post(`/demo/`, { name: name });

const apis = {
  getDemo,
  writeDemo,
};

export default apis;
