const User = require("../models/user-model");
const Subregion = require("../models/subregion-model");

createSubregion = (req, res) => {
  const body = req.body;

  if(!body) {
    return res.status(400).json({
      success: false,
      error: 'You must provide a subregion',
    })
  };

  console.log(req);
  const subregion = new Subregion(body.type, body.properties, body.coords);

  subregion.save().then(() => {
    return res.status(201).json({
      subregion: subregion
    })
  });
}



module.exports = {
  createSubregion
};