const User = require("../models/user-model");
const Subregion = require("../models/subregion-model");
const MapProject = require("../models/mapproject-model");

getAllSubregions = async (req, res) => {
  try{
    const mapProject = await MapProject.findById(req.params.mapId);
    const subregions = await Subregion.find({ _id: { $in: mapProject.map}}).exec();
    return res.status(200).json({
      subregions: subregions
    })
  } catch (err) {
    return res.status(400).json({
      error: 'Error occured loading subregions'
    })
  }
}


module.exports = {
  getAllSubregions
};