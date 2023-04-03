const Demo = require("../models/demo-model");

getDemo = async (req, res) => {
  await Demo.find({}, (err, items) => {
    if (err) {
      return res.status(400).json({ success: false, error: err });
    }
    if (!items.length) {
      return res.status(404).json({ success: false, error: `items not found` });
    }
    return res.status(200).json({ success: true, data: items });
  }).catch((err) => console.log(err));
};

writeDemo = async (req, res) => {
  if(!req.body || !req.body.name) {
    return res.sendStatus(400);
  } else {
    const demoItem = new Demo(req.body);

    demoItem
      .save()
      .then(() => {
        console.log("New item added to database successfully!");
        return res.status(200).json({
          success: true,
        });
      })
      .catch((error) => {
        console.error("Error adding new item to database:", error);
        return res.status(404).json({
          success: false,
        });
      });
  }
};

module.exports = {
  getDemo,
  writeDemo,
};