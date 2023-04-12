import React, {useEffect, useRef, useState} from 'react'
import { open } from 'shapefile';
import { preBuild, simplify } from 'mapshaper-simplify'

export async function parseFileUpload(e) {
    const { files } = e.target;

    let fileOne = files[0]
    let fileTwo;
    if(files.length > 1) {
        fileTwo = files[1]
    }

    let geoJSONFile;
    if(fileOne.name.split('.').pop() === "shp") {
        if(fileTwo && (fileTwo.name.split('.').pop() === "dbf")) {
            console.log("SHP_DBF")
            geoJSONFile = await parseSHPDBF(fileOne, fileTwo);
        } else {
            console.log("SHP")
            geoJSONFile = await parseSHP(fileOne);
        }
    } else if((fileOne.name.split('.').pop() === "dbf") && (fileTwo.name.split('.').pop() === "shp")) {
        console.log("DBF_SHP")
        geoJSONFile = await parseSHPDBF(fileTwo, fileOne);
    } else if(fileOne.name.split('.').pop() === "json") {
        console.log("GEO")
        geoJSONFile = await parseGEO(fileOne);
    }

    for(let i=0; i<geoJSONFile.features.length; i++){
        geoJSONFile.features[i].properties.GEN_ID = i;
    }

    let idealNumPoints = 50000;
    let simplifyPercentage = idealNumPoints/JSON.stringify(geoJSONFile).length;
    console.log(JSON.stringify(geoJSONFile).length);
    console.log(simplifyPercentage);
    if(simplifyPercentage >= 1)
        return geoJSONFile;
    // const simplifiedFile = await simplifyGeoJSON(geoJSONFile, simplifyPercentage);
    // return simplifiedFile;
    return geoJSONFile;
}

async function simplifyGeoJSON(file, simplifyPercentage) {
    return new Promise((resolve, reject) => {
        const dataset = preBuild(file);
        const simplified = simplify(dataset, simplifyPercentage)
        resolve(simplified);
    });
}

async function parseSHP(file) {
    return new Promise((resolve, reject) => {
        const featureList = [];
        const fileReader = new FileReader();
        
        fileReader.readAsArrayBuffer(file);
        
        fileReader.onload = e => {
            const content = e.target.result;
            open(content).then(source => source.read().then(function log(result) {
                if (result.done) {
                    const content = { type: "FeatureCollection", features: featureList}
                    resolve(content);
                    //resolve(rearrangeData(content));
                    return;
                }
                featureList.push(result.value);
                return source.read().then(log);
            })).catch(error => console.error(error.stack))
        }
    });
}

async function parseSHPDBF(fileOne, fileTwo) {
    return new Promise((resolve, reject) => {
        const fileReaderOne = new FileReader();
        const fileReaderTwo = new FileReader();

        fileReaderOne.readAsArrayBuffer(fileOne);
        fileReaderTwo.readAsArrayBuffer(fileTwo);
        
        let shapeFile;
        let databaseFile;
        
        fileReaderOne.onload = e => {
            shapeFile = e.target.result;
            if (shapeFile && databaseFile) {
                resolve(parseSHPDBFHelper(shapeFile, databaseFile));
            }
        }

        fileReaderTwo.onload = e => {
            databaseFile = e.target.result;
            if (shapeFile && databaseFile) {
                resolve(parseSHPDBFHelper(shapeFile, databaseFile));
            }
        }
    });
}

async function parseSHPDBFHelper(shp, dbf)  {
    const featureList = [];
    return open(shp, dbf).then(source => source.read().then(function log(result) {
        if (result.done) {
            const content = { type: "FeatureCollection", features: featureList}
            return content;
        }
        featureList.push(result.value);
        return source.read().then(log);
    })).catch(error => console.error(error.stack))
}

async function parseGEO(file) {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();

        fileReader.readAsText(file, "UTF-8");
        fileReader.onload = e => {
            const content = e.target.result;
            resolve (JSON.parse(content));
            // resolve (rearrangeData(JSON.parse(content)));
        };
    });
}

// returns list of features swapping coordinates
// function rearrangeData(jsonFile){
//     const featuresList = jsonFile.features;
//     for(const feat of featuresList){
//         swapCoords(feat.geometry.coordinates);
//     }
//     return featuresList;
// }

// function swapCoords(arr){
//     if(arr.length == 2 && !Array.isArray(arr[0])){
//         [arr[0], arr[1]] = [arr[1], arr[0]];
//         return;
//     }
//     if(!Array.isArray(arr)) return;

//     for(const item of arr){
//         swapCoords(item);
//     }
// }
