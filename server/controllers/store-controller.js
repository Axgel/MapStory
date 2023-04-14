const User = require("../models/user-model");
const Subregion = require("../models/subregion-model");
const MapProject = require("../models/mapproject-model");

createSubregion = (req, res) => {
  const body = req.body;

  if(!body) {
    return res.status(400).json({
      success: false,
      error: 'You must provide a subregion',
    })
  };

  const subregion = new Subregion(body);

  subregion.save().then((sub) => {
    return res.status(201).json({
      id: sub._id
    })
  }).catch((err) => {
    return res.status(400).json({error: 'Error occured while trying to save'})
  })
}

createMap = (req, res) => {
  const body = req.body;

  if(!body){
    return res.status(400).json({
      success: false,
      error: 'Invalid Map'
    })
  };

  const mapproject = new MapProject(body);

  User.findOne({ _id: req.userId}, (err, user) => {
    user.personalMaps.push(mapproject._id);
    user.save().then(() => {
      mapproject.save().then((map) => {
        return res.status(201).json({
          id: map._id
        })
      }).catch((err) => {
        return res.status(400).json({errpr: "Map not saved"});
      })
    })
  })
}

module.exports = {
  createSubregion,
  createMap
};