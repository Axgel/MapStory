export async function convertGeojsonToInternalFormat(geojson) {
  let regionObjs = [];
  
  const features = geojson.features;

  for(let i=0; i<features.length; i++){
    let region = {
      type: "",
      properties: null,
      coords: null
    };
    region["properties"] = features[i].properties;

    const geometry = features[i].geometry;
    
    switch(geometry.type){
      case "Polygon":
        region.coords = [parsePolygon(geometry.coordinates)];
        region.type = "MultiPolygon";
        break;
      case "MultiPolygon":
        region.coords = parseMultiPolygon(geometry.coordinates);
        region.type = "MultiPolygon";
        break
      default:
        break;
    }
    regionObjs.push(region);
  }

  return regionObjs;
}

export async function convertGeojsonToInternalFormatNoSwap(geojson) {
  let regionObjs = [];
  
  const features = geojson.features;

  for(let i=0; i<features.length; i++){
    let region = {
      type: "",
      properties: null,
      coords: null
    };
    region["properties"] = features[i].properties;

    const geometry = features[i].geometry;
    
    switch(geometry.type){
      case "Polygon":
        region.coords = [geometry.coordinates];
        region.type = "MultiPolygon";
        break;
      case "MultiPolygon":
        region.coords = geometry.coordinates;
        region.type = "MultiPolygon";
        break
      default:
        break;
    }
    regionObjs.push(region);
  }

  return regionObjs;
}


export function parsePolygon(coordinates){
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

export function parseMultiPolygon(coordinates){
  const regionCoords = [];
  for(let i=0; i<coordinates.length; i++){
    regionCoords.push(parsePolygon(coordinates[i]));    
  }
  return regionCoords;
}
