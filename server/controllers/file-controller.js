const User = require("../models/user-model");
const Subregion = require("../models/subregion-model");
const MapProject = require("../models/mapproject-model");
const json1 = require('ot-json1');

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

updateSubregions = async (subregionId, op) => {
  try{
    const subregion = await Subregion.findOne({ _id: subregionId});
    if(!subregion) return false;
    const coordinates = subregion.coordinates;
    const newDoc = json1.type.apply(coordinates, op);
    subregion.coordinates = newDoc;
    await subregion.save();
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}




module.exports = {
  getAllSubregions
};