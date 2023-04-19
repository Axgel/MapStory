import React, {useEffect, useRef, useState} from 'react';
import { createGeoJSON } from './exportGeoJSON'; 
// import convert from 'geojson2shp';
// import * as shp from 'shp-write';


export async function exportSHPDBF(subregionsArr, compressionPercent){
    //convert from schema into shp and dbf
    //call createGeojson
    const geojsonObj = createGeoJSON(subregionsArr, compressionPercent);
    //simplify
    //use library
    // shp.download(geojsonObj);
    //download
    //return shp and dbf file(array with a shp file and a dbf file)
}