const validateRoom = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "Request body missing or empty" });
  }

  const { name, price, description } = req.body;
  if (!name || !price || !description) {
    return res.status(400).json({ message: "name, price, description are required" });
  }

  next();
};

module.exports = validateRoom;
