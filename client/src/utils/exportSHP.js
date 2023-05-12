import { createGeoJSON} from './exportGeoJSON'; 
import {convertGeojsonToInternalFormat} from './geojsonParser';
import { parsePolygon } from "../utils/geojsonParser";
import api from "./util-request-api";
const fileDownload = require('js-file-download');

export async function exportSHPDBF(mapId, compressionPercent, mapTitle){
    const tempJsonObj = await createGeoJSON(mapId, compressionPercent);
    const poly = convertGeojsonToInternalFormat(tempJsonObj, 1);
    let subregionArray = [];
    for (const subregion of poly){
        let temp = addSubregion(subregion)
        subregionArray.push(temp)
    };
    const geojsonObj = {
        "type":"FeatureCollection",
        "features": subregionArray
    };
    const response = await api.exportSHPDBF(geojsonObj);
    fileDownload(response.data,mapTitle+'.zip', 'application/zip');
}


function addSubregion(subregion){ //convert from subregion schema into GEOJSON format
    let feature = {
        "type": "Feature", 
        "properties": {}, 
        "geometry": {
            "type": "MultiPolygon",
            "coordinates": []
        }
    }
    feature.properties = subregion.properties;

    const coordinates = []
    for(let i = 0; i < subregion.coords.length; i++){
        let coordinate = parsePolygon(subregion.coords[i], 0);
        coordinates.push(coordinate);
    }
    feature.geometry.coordinates = coordinates;
    return feature;
}