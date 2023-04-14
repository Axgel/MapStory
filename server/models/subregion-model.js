const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SubregionSchema = new Schema(
    {
        type: {type: String, required: true},
        properties: {type: Map, of: String},
        coordinates: { type: Schema.Types.Mixed},
    },
    { timestamps: true },
)

module.exports = mongoose.model('Subregion', SubregionSchema)