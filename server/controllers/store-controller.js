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

getPublishedMaps = async(req,res) => {
  try {
    const publishedMaps = await MapProject.find({ isPublished: true}).exec();
    console.log(publishedMaps);
    return res.status(200).json({
      publishedMaps: publishedMaps
    })
  } catch (err) {
    return res.status(400).json({
      error: 'Error occured loading published maps'
    })
  }
}

updateMapTitle = async(req,res) =>{
  try{
    const body = req.body;

    if(!body){
      return res.status(400).json({
        success: false,
        error: 'You must provide a title to update'
      })
    }

    MapProject.findOne({ _id: req.params.mapId}, (err, map) => {
      if(err){
        return res.status(404).json({
          error: 'Map project not found'
        })
      }

      map.title = body.title;
      map.save().then(() => {
        return res.status(200).json({
          message: "Map project title updated"
        })
      })
    })

  } catch(err) {
    return res.status(400).json({
      error: 'Error occured updating map title'
    })
  }
}

publishMap = async(req,res) =>{
  try{
    MapProject.findOne({ _id: req.params.mapId}, (err, map) => {
      if(err){
        return res.status(404).json({
          error: 'Map project not found'
        })
      }

      map.isPublished = true;
      map.save().then(() => {
        return res.status(200).json({
          message: "Map project published"
        })
      })
    })

  } catch(err) {
    return res.status(400).json({
      error: 'Error occured published map'
    })
  }
}


deleteMap = async (req, res) => {
  try {
    const mapId = req.params.mapId;
    await User.updateMany({}, { $pull: {sharedMaps: mapId}}) //remove map id from user schema(shared maps[])
    await User.updateMany({}, { $pull: {personalMaps: mapId}});//remove mapId from user schema(personalmaps[])
    const mapProject = await MapProject.findById(req.params.mapId);
    await Subregion.deleteMany({ _id: { $in: mapProject.map }}); //get all subregionId -> delete subregionId object
    await MapProject.remove({_id: mapId}); //delete mapproject

    return res.status(200).json({
      message: "Map project deleted"
    })
  } catch (err) {
    return res.status(400).json({
      error: 'Error occured during deletion of map'
    })
  }
}

forkMap = async (req, res) => {
  try {
    console.log(req.body)
    const user = await User.findById(req.body.userId);
    const mapProject = await MapProject.findById(req.params.mapId); //mapproject to duplicate

    //create a copy of all the subregions
    const newSubregions = [];
    // console.log(mapProject.map)
    for(let index in mapProject.map){
      //find subregion with that id
      let subregion = await Subregion.findOne({ _id: mapProject.map[index] });
      const newSubregion = new Subregion({
        type: subregion.type,
        properties: subregion.properties,
        coordinates: subregion.coordinates,
      });
      newSubregions.push(newSubregion._id);
      newSubregion.save();
    }
    console.log(user);

    const forkedProject = new MapProject({
      title: mapProject.title,
      map: newSubregions,
      owner: user._id,
      ownerName: user.userName,
      collaborators: [],
      upvotes: [],
      downvotes: [],
      comments: [],
      tags: [],
      isPublished: false,
      publishedDate: Date.now()
    });
    console.log(forkedProject)

    User.findOne({ _id: user._id}, (err, user) => {
      user.personalMaps.push(forkedProject._id);
      user.save().then(() => {
        forkedProject.save().then((map) => {
          return res.status(201).json({
            id: forkedProject
          })
        }).catch((err) => {
          return res.status(400).json({errpr: "Map not saved"});
        })
      })
    })
  } catch (err) {
    return res.status(400).json({
      error: 'Error occured during forking of map'
    })
  }
}

module.exports = {
  createSubregion,
  createMap,
  getPersonalAndSharedMaps, 
  getPublishedMaps, 
  updateMapTitle,
  publishMap, 
  deleteMap, 
  forkMap
};