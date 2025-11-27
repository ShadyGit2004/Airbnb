const express = require("express");
const router = express.Router({mergeParams : true});
const wrapAsync = require("../utils/wrapAsync.js");
const {validateListing, checkPasswordTimestamp, isLoggedIn, isOwner, travellingStatus, hostingStatus} = require("../middleware.js");
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const maxSize = 1 * 1024 * 1024;
const upload = multer({ storage , limits: { fileSize: maxSize },
    fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },});

const listingController = require("../controllers/listings.js");

router.route("/")
.get(travellingStatus, wrapAsync(listingController.indexPage))
// .post(isLoggedIn, upload.array('listing[images]', 5), validateListing, wrapAsync(listingController.createListing));
.post(isLoggedIn, checkPasswordTimestamp, upload.array('listing[images]', 5), wrapAsync(listingController.createListing));

router.get("/new", isLoggedIn, checkPasswordTimestamp, hostingStatus, listingController.renderNewForm);

router.route("/:id")
.get(travellingStatus, wrapAsync(listingController.showListing))
// .patch(isLoggedIn, isOwner, upload.array('listing[images]', 5), validateListing, wrapAsync(listingController.updateListing))
.patch(isLoggedIn, checkPasswordTimestamp, isOwner, hostingStatus, upload.array('listing[images]', 5), wrapAsync(listingController.updateListing))
.delete(isLoggedIn, checkPasswordTimestamp, isOwner, hostingStatus, wrapAsync(listingController.destroyListing));

router.get("/:id/isAvailable", isLoggedIn, checkPasswordTimestamp, isOwner, listingController.toggleIsAvailable);

router.patch("/:id/image/:imgId", isLoggedIn, checkPasswordTimestamp, isOwner, upload.array('listing[images]', 5), wrapAsync(listingController.updateListingImages));

router.get("/:id/edit", isLoggedIn, checkPasswordTimestamp, isOwner, hostingStatus, wrapAsync(listingController.renderEditForm));


module.exports = router;