const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId;

const SubregionSchema = new Schema(
    {
        mapId: {type: ObjectId, ref: 'MapProject'}, 
        type: {type: String, required: true},
        properties: {type: Map, of: String},
        coordinates: {type: Schema.Types.Mixed},
        isStale: {type: Boolean, required: true}
    },
    { timestamps: true },
)

module.exports = mongoose.model('Subregion', SubregionSchema)