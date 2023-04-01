const Demo = require("../models/demo-model");

getDemo = async (req, res) => {
  return res.status(200).json({
    message: "test"
  })
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

writeDemo = (req, res) => {
  const body = req.body;
  console.log(body);

  const demoItem = new Demo(body);

  demoItem
    .save()
    .then(() => {
      console.log("New item added to database successfully!");
    })
    .catch((error) => {
      console.error("Error adding new item to database:", error);
    });

  return res.status(200).json({
    success: true,
  });
};
module.exports = {
  getDemo,
  writeDemo,
};
