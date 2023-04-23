const User = require("../models/user-model");
const Subregion = require("../models/subregion-model");
const MapProject = require("../models/mapproject-model");
const json1 = require('ot-json1');

getAllSubregions = async (req, res) => {
  try{
    const subregions = await Subregion.find({ mapId: req.params.mapId }).exec();
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