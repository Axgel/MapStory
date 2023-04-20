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
          id: mapproject
        })
      }).catch((err) => {
        return res.status(400).json({errpr: "Map not saved"});
      })
    })
  })
}

getPersonalAndSharedMaps = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const personalMaps = await MapProject.find({ _id: { $in: user.personalMaps }}).exec();
    const sharedMaps = await MapProject.find({ _id: { $in: user.sharedMaps }}).exec();
    return res.status(200).json({
      personalMaps: personalMaps,
      sharedMaps: sharedMaps
    })
  } catch (err) {
    return res.status(400).json({
      error: 'Error occured loading personal and shared maps'
    })
  }
}

deleteMap = async (req, res) => {
  try {
    const userId = req.params.userId;
    const mapId = req.params.mapId;

    await User.updateMany({}, { $pull: {sharedMaps: mapId}}) //remove map id from user schema(shared maps[])
    await User.updateMany({}, { $pull: {personalMaps: mapId}});//remove mapId from user schema(personalmaps[])
    const mapProject = await MapProject.findById(req.params.mapId);
    await Subregion.deleteMany({ _id: { $in: mapProject.map }}); //get all subregionId -> delete subregionId object
    await MapProject.remove({_id: mapId}); //delete mapproject

    return res.status(200).json({
    })
  } catch (err) {
    return res.status(400).json({
      error: 'Error occured during deletion of map'
    })
  }
}

module.exports = {
  createSubregion,
  createMap,
  getPersonalAndSharedMaps, 
  deleteMap
};