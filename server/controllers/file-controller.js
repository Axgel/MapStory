const User = require("../models/user-model");
const Subregion = require("../models/subregion-model");
const MapProject = require("../models/mapproject-model");
//const json1 = require('ot-json1');
const json0 = require('ot-json0');
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

    const subregionJson = subregion.toJSON();
    const tmpSubregionObj = {};
    tmpSubregionObj[subregion._id] = subregionJson;
    const newSubregionJson = json0.type.apply(tmpSubregionObj, op);

    await Subregion.findOneAndUpdate(
      { _id: subregionId},
      newSubregionJson[subregionId],
      {new: true}
    );

    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}




module.exports = {
  getAllSubregions
};