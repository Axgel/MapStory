import axios from "axios";;

axios.defaults.withCredentials = true;
const api = axios.create({
  baseURL: process.env.REACT_APP_UTIL,
});

export const exportSHPDBF = (geojson) =>{
    return api.post(`/exportSHPDBF`,{
        geojson: geojson,
    },{
        responseType: 'blob'
    });
};

const apis = {
    exportSHPDBF
};

export default apis;