import { createGeoJSON } from './exportGeoJSON'; 
import api from "./util-request-api";
const fileDownload = require('js-file-download');

export async function exportSHPDBF(mapId, compressionPercent){
    const geojsonObj = await createGeoJSON(mapId, compressionPercent);
    const response = await api.exportSHPDBF(geojsonObj);
    fileDownload(response.data, 'file.zip', 'application/zip');
}