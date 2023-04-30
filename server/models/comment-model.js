const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const CommentSchema = new Schema(
  {
    user: {type: ObjectId, ref: 'User'},
    comment: {type: String, required: true},
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', CommentSchema)