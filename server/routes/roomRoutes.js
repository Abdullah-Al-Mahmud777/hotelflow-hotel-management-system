const express = require("express");
const {
  getRooms,
  createRoom,
} = require("../controllers/roomController");

const router = express.Router();

router.route("/")
  .get(getRooms)
  .post(createRoom); // ✅ POST enabled

module.exports = router;
