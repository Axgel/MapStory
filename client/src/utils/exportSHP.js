import { createGeoJSON } from './exportGeoJSON'; 
import api from "./util-request-api";
const fileDownload = require('js-file-download');

export async function exportSHPDBF(mapId, compressionPercent, mapTitle){
    const geojsonObj = await createGeoJSON(mapId, compressionPercent);
    console.log(geojsonObj)
    const response = await api.exportSHPDBF(geojsonObj);
    fileDownload(response.data,mapTitle+'.zip', 'application/zip');
}