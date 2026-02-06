const express = require("express");
const router = express.Router();

const {
  createBooking,
  getAllBookings,
  getMyBookings,
  cancelBooking
} = require("../controllers/bookcontroller");

const auth = require("../middlewares/auth.middleware");
const checkBooking = require("../middlewares/checkBooking.middleware");

router.post("/", auth, checkBooking, createBooking);
router.get("/", auth, getAllBookings);
router.get("/my", auth, getMyBookings);
router.delete("/:id", auth, cancelBooking);

module.exports = router;
     