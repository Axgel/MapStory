const User = require("../models/user-model");
const Subregion = require("../models/subregion-model");
const MapProject = require("../models/mapproject-model");

getAllSubregions = async (req, res) => {
  try{
    const subregions = await Subregion.find({ mapId: req.params.mapId }).exec();

    const subregionsDict = {};

    for(const subregion of subregions){
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
    console.log(subregions);
    
    if(!subregions || subregions.length == 0) return false;

    const subregionsDict = {};

    for(const subregion of subregions){
      subregionsDict[subregion._id] = {};
      subregionsDict[subregion._id]["coords"] = subregion.coordinates; 
      const propArr = [];
      if(subregion.properties){
        for(const [k,v] of subregion.properties){
          propArr.push(k);
          propArr.push(v);
        }
      }

      subregionsDict[subregion._id]["properties"] = subregion.propArr; 
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



module.exports = {
  getAllSubregions
};