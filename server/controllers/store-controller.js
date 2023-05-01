const User = require("../models/user-model");
const Subregion = require("../models/subregion-model");
const MapProject = require("../models/mapproject-model");
const Comment = require("../models/comment-model");

createSubregion = (req, res) => {
  const body = req.body;

  if(!body.mapId || !body) {
    return res.status(400).json({
      success: false,
      error: 'You must provide a subregion',
    })
  };

  const subregion = new Subregion(body);

  subregion.save().then(() => {
    return res.status(201).json({
      message: "New subregion created"
    })
  }).catch((err) => {
    return res.status(400).json({error: 'Error occured while trying to save'})
  })
}

createMap = (req, res) => {
  const body = req.body;

  if(!body.owner || !body){
    return res.status(400).json({
      success: false,
      error: 'Invalid Map'
    })
  };

  const mapproject = new MapProject(body);
  User.findOne({ _id: body.owner}, (err, user) => {
    user.personalMaps.push(mapproject._id);
    user.save().then(() => {
      mapproject.save().then((map) => {
        return res.status(201).json({
          map: mapproject
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

addTags = async(req,res) =>{
  try{
    const body = req.body;

    if(!body){
      return res.status(400).json({
        success: false,
        error: 'You must provide a tag to input the tag'
      })
    }
    
    MapProject.findOne({ _id: req.params.mapId}, (err, map) => {
      if(err){
        return res.status(404).json({
          error: 'Map project not found'
        })
      }
      if (map.tags.includes(body.tag)) {
        return res.status(400).json({
          message: "Duplicate Tag"
        })
      }
      map.tags.push(body.tag)
      map.save().then(() => {
        return res.status(200).json({
          message: "Map project tag updated"
       })
      })
    })

  } catch(err) {
    return res.status(400).json({
      error: 'Error occured updating tags'
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
    await Subregion.deleteMany({ mapId: mapId }); //get all subregionId -> delete subregionId object
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
    const user = await User.findById(req.body.userId);
    const mapProject = await MapProject.findById(req.params.mapId); //mapproject to duplicate

    // create a copy of the map
    const newMapProject = new MapProject({
      title: `Copy of ${mapProject.title}`,
      owner: user._id,
      ownerName: user.userName,
      collaborators: [],
      upvotes: [],
      downvotes: [],
      tags: [],
      isPublished: false,
      publishedDate: Date.now()
    })

    await User.findOne({_id: user._id}, (err, user) => {
      user.personalMaps.push(newMapProject._id);
      user.save().then(() => {
        newMapProject.save();
      })
    })
    
    const oldSubregions = await Subregion.find({ mapId: req.params.mapId }).exec();
    for(const region of oldSubregions){
      const newSubregion = new Subregion({
        mapId: newMapProject._id,
        type: region.type,
        properties: region.properties,
        coordinates: region.coordinates,
        isStale: false
      });

      await newSubregion.save();
    }
    
    return res.status(201).json({
      message: "Forked map project"
    })
  } catch (err) {
    return res.status(400).json({
      error: 'Error occured during forking of map'
    })
  }
}

deleteTags = async(req,res) =>{
  try{
    const body = req.body;
    MapProject.findOne({ _id: req.params.mapId}, (err, map) => {
      if(err){
        return res.status(404).json({
          error: 'Map project not found'
        })
      }

      let temp = map.tags.filter(tag => tag !== body.tag)
      map.tags = temp
      
      map.save().then(() => {
        return res.status(200).json({
          message: "Map project tag updated"
        })
      })
    })

  } catch(err) {
    return res.status(400).json({
      error: 'Error occured updating tags'
    })
  }
}

getMapById = async(req,res) => {
  try{
    MapProject.findOne({ _id: req.params.mapId}, (err, map) => {
      return res.status(200).json({
        map: map
      })
    })
  } catch(err){
    return res.status(400).json({
      error: 'Unable to find map'
    })
  }
}

addCollaborators = async(req, res) => {
  try{
    const body = req.body;

    if(!body){
      return res.status(400).json({
        success: false,
        error: 'You must provide a collaborator to add'
      })
    }

    const collaborator = await User.findOne({ email : body.collaboratorEmail }); 
    const map = await MapProject.findOne({ _id: req.params.mapId }); 
    
    if (map.collaborators.includes(collaborator._id)) {
      return res.status(400).json({
        error: "Collaborator already added"
      })
    }

    map.collaborators.push(collaborator._id);
    await map.save();

    if(collaborator.sharedMaps.includes(map._id)){
      return res.status(400).json({
        error: "Map already added to user"
      })
    }

    collaborator.sharedMaps.push(map._id);
    await collaborator.save();

    return res.status(200).json({
      message: "Collaborator added"
    })

  } catch(err){
    return res.status(400).json({
      error: 'Unable to add collaborator'
    })
  }
}

removeCollaborators = async(req, res) => {
  try{
    const body = req.body;

    if(!body){
      return res.status(400).json({
        success: false,
        error: 'You must provide a collaborator to add'
      })
    }

    const collaborator = await User.findOne({ email : body.collaboratorEmail });   
    const map = await MapProject.findOne({ _id: req.params.mapId }); 

    if (!map.collaborators.includes(collaborator._id)) {
      return res.status(400).json({
        error: "Collaborator not added to map"
      })
    }

    let temp = map.collaborators.filter(userId => userId.toString() !== collaborator._id.toString());
    map.collaborators = temp
    await map.save();

    if(!collaborator.sharedMaps.includes(map._id)){
      return res.status(400).json({
        error: "User doesnt have shared map"
      })
    }

    temp = collaborator.sharedMaps.filter(mapId => mapId.toString() !== map._id.toString());
    collaborator.sharedMaps = temp;
    await collaborator.save();

    return res.status(200).json({
      message: "Collaborator removed"
    })

  } catch(err){
    return res.status(400).json({
      error: 'Unable to add collaborator'
    })
  }
}


getUserById = async(req,res) => {
  try{
    User.findOne({ _id: req.params.userId}, (err, user) => {
      return res.status(200).json({
        user: user 
      })
    })
  } catch(err){
    return res.status(400).json({
      error: 'Unable to find map'
    })
  }
}

updateVote = async(req,res) =>{
  try{
    const body = req.body; //voteType: 0=downvote, 1=upvote; value: 0=remove, 1=add
    if(body.value === 0){//removing
      if(body.voteType === 0)
        await MapProject.updateOne({_id: req.params.mapId}, {$pull: {"downvotes": body.userId}});
      else
        await MapProject.updateOne({_id: req.params.mapId}, {$pull: {"upvotes": body.userId}});
    } else{ //adding
      await MapProject.updateOne({_id: req.params.mapId}, {$pull: {"upvotes": body.userId}});
      await MapProject.updateOne({_id: req.params.mapId}, {$pull: {"downvotes": body.userId}});
      if(body.voteType === 0)
        await MapProject.updateOne({_id: req.params.mapId}, {$push: {"downvotes": body.userId}})
      else
        await MapProject.updateOne({_id: req.params.mapId}, {$push: {"upvotes": body.userId}})
    }
    
    return res.status(200).json({
      message: "Map project voting updated"
    })
  } catch(err) {
    return res.status(400).json({
      error: 'Error occured when updating the voting'
    })
  }
}

getComments = async(req, res) => {
  try{
    const { mapId } = req.params;
    if(!mapId){
      return res.status(400).json({
        error: 'No selected map'
      })
    }
    const map = await MapProject.findById(mapId);
    if(!map) {
      return res.status(400).json({
        error: 'Unable to find map'
      })
    }
    const comments = await Comment.find({ mapId: map._id });
    const newComments = [];
    for(const comment of comments) {
      const user = await User.findById(comment.userId);
      const newComment = {
        mapId: comment.mapId,
        userId: comment.userId,
        comment: comment.comment,
        username: user.userName
      }
      newComments.push(newComment);
    }
    return res.status(200).json({
      "comments": newComments
    })
  } catch(err) {
    console.log(err);
    return res.status(400).json({
      error: 'Error occured getting comment'
    })
  }
}

addComment = async(req, res) =>{
  try{
    const { mapId } = req.params;
    const { userId, comment } = req.body;
    if(!comment){
      return res.status(400).json({
        error: 'You must provide a comment to input'
      })
    }
    const map = await MapProject.findById(mapId);
    console.log(map);
    if(!map) {
      return res.status(400).json({
        error: 'Unable to find map'
      })
    }
    const user = await User.findById(userId);
    console.log(user);
    if(!user) {
      return res.status(400).json({
        error: 'Unable to find user'
      })
    }
    //create the comment 
    const newComment = new Comment({
      mapId: map._id,
      userId: user._id,
      comment: comment
    });
    await newComment.save();
    const retComment = {
      mapId: map._id,
      userId: user._id,
      comment: comment,
      username: user.userName
    }
    return res.status(200).json({
      "comment": retComment
    })

  } catch(err) {
    console.log(err);
    return res.status(400).json({
      error: 'Error occured adding comment'
    })
  }
}

module.exports = {
  createSubregion,
  createMap,
  getPersonalAndSharedMaps,
  updateMapTitle,
  addTags,
  deleteTags,
  getPublishedMaps,
  updateMapTitle,
  publishMap, 
  deleteMap, 
  forkMap,
  getMapById,
  addCollaborators,
  removeCollaborators,
  getUserById,
  updateVote, 
  getComments,
  addComment
};