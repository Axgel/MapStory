const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SubregionSchema = new Schema(
    {
        properties: {type: Map, of: String},
        coordinates: { any: Object },
    },
    { timestamps: true },
)

module.exports = mongoose.model('Subregion', SubregionSchema)