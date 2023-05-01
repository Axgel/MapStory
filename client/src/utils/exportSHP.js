import { createGeoJSON } from './exportGeoJSON'; 
import api from "./util-request-api"
import { preBuild, simplify } from 'mapshaper-simplify';
const fileDownload = require('js-file-download');

export async function exportSHPDBF(subregionsArr, compressionPercent){
    const geojsonObj = createGeoJSON(subregionsArr, compressionPercent);
    const toSimplify = preBuild(geojsonObj);
    const simplified = simplify(toSimplify, compressionPercent)
    const response = await api.exportSHPDBF(simplified);
    fileDownload(response.data, 'file.zip', 'application/zip');
}