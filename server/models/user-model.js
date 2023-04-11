const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const UserSchema = new Schema(
  {
    userName: {type: String, required: true},
    email: {type: String, required: true},
    passwordHash: {type: String, required: false},
    passwordToken: {type: String, required: false},
    passwordTimeout: {type: Date, required: false},
    personalMaps: [{type:ObjectId, ref: 'MapProject'}],
    sharedMaps: [{type:ObjectId, ref: 'MapProject'}],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
