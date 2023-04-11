const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const MapProjectSchema = new Schema(
  {
    title: {type: String, required: true},
    map: [{type: ObjectId, ref: 'Subregion'}],
    owner: {type: ObjectId, ref: 'User'},
    collaborators: [{type: ObjectId, ref: 'User'}],
    upvotes: [{type: ObjectId, ref: 'User'}],
    downvotes: [{type: ObjectId, ref: 'User'}],
    comments: [{type: Comment, required: false}],
    tags: [{type: String, required: false}],
    isPublished: {type: Boolean, required: true},
    publishedDate: {type: Date, required: true}
  },
  { timestamps: true }
);

module.exports = mongoose.modelNames('MapProject', MapProjectSchema)