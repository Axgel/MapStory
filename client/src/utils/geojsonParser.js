//opcode: 0 -- swap coords, remove duplicate end point
//opcode: 1 -- swap coords, add duplicate end point
//opcode: 2 -- no swap coords, remove duplicate end point
//opcode: 3 -- no swap coords, add duplicate end point
export function convertGeojsonToInternalFormat(geojson, opcode) {
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
        region.coords = [parsePolygon(geometry.coordinates, opcode)];
        region.type = "MultiPolygon";
        break;
      case "MultiPolygon":
        region.coords = parseMultiPolygon(geometry.coordinates, opcode);
        region.type = "MultiPolygon";
        break
      default:
        break;
    }
    regionObjs.push(region);
  }

  return regionObjs;
}

export function parsePolygon(coordinates, opcode){
  const regionCoords = [];
  for(let i=0; i<coordinates.length; i++){
    const newCoords = [];
    for(let j=0; j<coordinates[i].length; j++){
      if(opcode - 2 < 0) {
        newCoords.push([coordinates[i][j][1], coordinates[i][j][0]]);
      } else {
        newCoords.push([coordinates[i][j][0], coordinates[i][j][1]]);
      }
    }
    const first = newCoords[0];
    const last = newCoords[newCoords.length - 1];
    if((opcode % 2) === 0) {
      if(JSON.stringify(first) === JSON.stringify(last)) newCoords.pop();
    } else {
      if(JSON.stringify(first) !== JSON.stringify(last)) {
        newCoords.push([...first]);
      } else {
        console.log("bug with parse assumption");
      }
    }
    regionCoords.push(newCoords);
  }
  return regionCoords;
}

export function parseMultiPolygon(coordinates, opcode){
  const regionCoords = [];
  for(let i=0; i<coordinates.length; i++){
    regionCoords.push(parsePolygon(coordinates[i], opcode));    
  }
  return regionCoords;
}