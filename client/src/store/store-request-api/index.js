import axios from 'axios'
axios.defaults.withCredentials = true;
const api = axios.create({
    baseURL: 'http://localhost:4000/api',
})


export const getDemo = () => api.get(`/demo/`)

const apis = {
    getDemo
}

export default apis
