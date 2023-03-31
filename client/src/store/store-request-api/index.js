import axios from "axios";
axios.defaults.withCredentials = true;
const api = axios.create({
  baseURL: 'http://54.91.211.222:4000/api',
});

export const getDemo = () => api.get(`/demo/`);
export const writeDemo = (name) => api.post(`/demo/`, { name: name });

const apis = {
  getDemo,
  writeDemo,
};

export default apis;
