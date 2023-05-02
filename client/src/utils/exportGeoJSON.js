import React, {useEffect, useRef, useState} from 'react';
import { preBuild, simplify } from 'mapshaper-simplify';
import download from "downloadjs";

export function exportGeoJSON(subregionsArr, compressionPercent){
    //create geojson obj
    let geojson = createGeoJSON(subregionsArr);
    //compress the object with map-shaper-simplified 
    const toSimplify = preBuild(geojson);
    const simplified = simplify(toSimplify, compressionPercent) //TODO: check compression format
    //at the end download the object
    // console.log(geojson);
    download(JSON.stringify(simplified), "testing.json", "application/json");
}

export function createGeoJSON(subregions){
    let geojsonObj = {
        "type":"FeatureCollection",
        "features":[]
    };

    // subregions.forEach(element => {
    //     let subregionFeature = addSubregion(element);
    //     geojsonObj.features.push(subregionFeature);
    // });
    for(const key in subregions){
        // console.log(key)
        let subregionFeature = addSubregion(subregions[key]);
        geojsonObj.features.push(subregionFeature);
    }
    console.log(geojsonObj)
    
    //for loop through subregions of map
        //pass subregion id to addSubregion(let newFeature = addSubregion(subregionID))
        //geojsonObj.features.push({newFeature})

    return geojsonObj;
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
    
    // add properties (convert dictionary to string) format:  "GEO_ID": "0400000US01",
    // feature.properties.push()
    // let propertiesStr = "";
    // for(let key in subregion.properties){
    //     propertiesStr += key + ": " + subregion.properties[key] + ", ";
    // }
    // console.log(propertiesStr);
    feature.properties = subregion.properties;
    // console.log(feature)
    // swap the coordinates around
    // create an array of coordinates "coordinates": [[[[coordinates 1], [coordinates 2] ]]]
    // feature.geometry.coordinates.push(array of coordinates)
    // console.log(subregion.coordinates);
    const coordinates = []
    for(let i = 0; i < subregion.coordinates.length; i++){
        let coordinate = parsePolygon(subregion.coordinates[i]);
        coordinates.push(coordinate);
    }
    // console.log(coordinates)
    feature.geometry.coordinates = coordinates;
    // console.log(feature.geometry.coordinates)
    return feature;
}

function parsePolygon(coordinates){
    const regionCoords = [];
    for(let i=0; i<coordinates.length; i++){
      const newCoords = [];
      for(let j=0; j<coordinates[i].length; j++){
        newCoords.push([coordinates[i][j][1], coordinates[i][j][0]]);
      }
      regionCoords.push(newCoords);
    }
  
    return regionCoords;
  }