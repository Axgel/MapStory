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
      subregionsDict[subregion._id] = subregion;
    }
    return res.status(200).json({
      subregions: subregionsDict
    })
    
  } catch (err) {
    console.log(err);
    return false;
  }
}




module.exports = {
  getAllSubregions
};