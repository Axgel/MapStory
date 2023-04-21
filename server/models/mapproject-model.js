const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const MapProjectSchema = new Schema(
  {
    title: {type: String, required: true},
    owner: {type: ObjectId, ref: 'User'},
    ownerName: {type: String, required: true},
    collaborators: [{type: ObjectId, ref: 'User'}],
    upvotes: [{type: ObjectId, ref: 'User'}],
    downvotes: [{type: ObjectId, ref: 'User'}],
    comments: [{type: ObjectId, ref: 'Comment'}],
    tags: [{type: String, required: false}],
    isPublished: {type: Boolean, required: true},
    publishedDate: {type: Date, required: true}
  },
  { timestamps: true }
);

module.exports = mongoose.model('MapProject', MapProjectSchema)