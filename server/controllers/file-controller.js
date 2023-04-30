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

saveSubregions = async (req, res) => {
  const subregions = JSON.parse(req.body['subregionsStr']);
  
  
  const asyncSaves = [];
  for(const [subregionId, subregion] of  Object.entries(subregions)){
    const updatedSubregion = {
      properties: subregion['properties'],
      coordinates: subregion['coordinates']
    }
    asyncSaves.push(Subregion.findOneAndUpdate({_id: subregionId}, updatedSubregion));
  }
  await Promise.all(asyncSaves);

  return true;
}



module.exports = {
  getAllSubregions,
  saveSubregions
};