const express = require("express");
const router = express.Router({mergeParams : true});

const wrapAsync = require("../utils/wrapAsync.js");
const {checkPasswordTimestamp, isLoggedIn, validateBooking} = require("../middleware.js");

const bookController = require("../controllers/booking.js");

router.route("/")
.get(isLoggedIn, checkPasswordTimestamp, wrapAsync(bookController.bookListingConfirm))
.post(isLoggedIn, checkPasswordTimestamp, wrapAsync(bookController.bookListing));

// router.post("/create-order", isLoggedIn, wrapAsync(bookController.bookListing));

router.delete("/cancel/:bookingId", isLoggedIn, checkPasswordTimestamp, wrapAsync(bookController.cancelListing));

router.post("/create-order", isLoggedIn, checkPasswordTimestamp, wrapAsync(bookController.createOrder));
router.post("/verify-payment", isLoggedIn, checkPasswordTimestamp, wrapAsync(bookController.verifyPayment));

module.exports = router;