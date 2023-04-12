getTest = async (req, res) => {
  return res.status(200).json({ success: true, data: true});
}

module.exports = {
  getTest
};