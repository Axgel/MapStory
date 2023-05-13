const User = require("../models/user-model");
const Subregion = require("../models/subregion-model");
const MapProject = require("../models/mapproject-model");
const Y = require("yjs");

getAllSubregions = async (req, res) => {
  try{
    const subregions = await Subregion.find({ mapId: req.params.mapId }).exec();

    const subregionsDict = {};

    for(const subregion of subregions){
      if(subregion.isStale) continue;
      subregionsDict[subregion._id] = subregion;
    }
    return res.status(200).json({
      subregions: subregionsDict
    })
  } catch (err) {
    return res.status(400).json({
      error: 'Error occured loading subregions'
    })
  }
}

createSubregion = (req, res) => {
  const body = req.body;

  if(!body.mapId || !body) {
    return res.status(400).json({
      success: false,
      error: 'You must provide a subregion',
    })
  };

  const subregion = new Subregion(body);

  subregion.save().then(() => {
    return res.status(201).json({
      subregion: subregion
    })
  }).catch((err) => {
    return res.status(400).json({error: 'Error occured while trying to save'})
  })
}

updateSubregions = async (subregionId) => {
  try{
    const subregion = await Subregion.findOne({ _id: subregionId});
    if(!subregion) return false;
    console.log("do the updating of subregions here")
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

getAllSubregionsServer = async(mapId) => {
  try {
    const subregions = await Subregion.find({ mapId: mapId });
    // console.log(subregions);
    
    if(!subregions || subregions.length == 0) return false;

    const subregionsDict = {};

    for(const subregion of subregions){
      subregionsDict[subregion._id] = {};
      subregionsDict[subregion._id]["coords"] = subregion.coordinates; 
      // const propArr = [];
      // if(subregion.properties){
      //   for(const [k,v] of subregion.properties){
      //     propArr.push(k);
      //     propArr.push(v);
      //   }
      // }

      subregionsDict[subregion._id]["properties"] = subregion.properties; 
      subregionsDict[subregion._id]["isStale"] = subregion.isStale;
    }
    return {
      subregions: subregionsDict
    }
    
  } catch (err) {
    console.log(err);
    return false;
  }
}

addSubregion = async(mapId, coords) => {
  try{
    const coordinates = JSON.parse(coords);
    
    const subregion = new Subregion({
      mapId: mapId,
      type: 'MultiPolygon',
      properties: {},
      coordinates: coordinates,
      isStale: false
    })

    console.log(subregion._id, "qwer");
    await subregion.save(); 
    return {subregionId: subregion._id}

  } catch(err){
    console.log(err);
    return false;
  }
}

saveYdoc = async(ydoc) => {
  const regionsJSON = ydoc.getMap("regions").toJSON();
  const asyncUpdateRegions = [];
  for(const [k,v] of Object.entries(regionsJSON)){
    asyncUpdateRegions.push(Subregion.findOneAndUpdate({ _id: k }, {properties: v["properties"], coordinates: v["coords"], isStale: v["isStale"]}, {new : true}));
  }

  await Promise.all(asyncUpdateRegions);
}

saveYdocSubregion = async(ydoc, metadata) => {
  const {subregionIds, opType} = metadata;
  console.log(metadata);
  const yMap = ydoc.getMap("regions");
  const asyncUpdateRegions = [];
  for(const subregionId of subregionIds) {
    const subregionJSON = yMap.get(subregionId).toJSON();
    switch(opType){
      case "Vertex":
        asyncUpdateRegions.push(Subregion.updateOne({ _id: subregionId }, {coordinates: subregionJSON["coords"]}));
        break;
      case "Subregion":
        asyncUpdateRegions.push(Subregion.updateOne({ _id: subregionId }, {isStale: subregionJSON["isStale"]}));
      case "Properties":
        asyncUpdateRegions.push(Subregion.updateOne({ _id: subregionId }, {properties: subregionJSON["properties"]}));
    }
  }
  await Promise.all(asyncUpdateRegions);
}


module.exports = {
  getAllSubregions,
  createSubregion
};