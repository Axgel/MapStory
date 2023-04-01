import axios from "axios";
import config from "../../config.json"

axios.defaults.withCredentials = true;
const api = axios.create({
  baseURL: config[config.ENVIRONMENT].store,
});

export const getDemo = () => api.get(`/demo/`);
export const writeDemo = (name) => api.post(`/demo/`, { name: name });

const apis = {
  getDemo,
  writeDemo,
};

export default apis;
