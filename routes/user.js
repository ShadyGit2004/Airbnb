const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });
const {travellingStatus, hostingStatus, saveRedirectUrl, checkPasswordTimestamp, isLoggedIn, isLoggedOut, validPassword, validSignupPassword, validEmail, validUsername} = require("../middleware.js");

const userController = require("../controllers/users.js");

router.route("/signup")
.get(isLoggedOut, userController.renderSignUpForm)
.post(isLoggedOut, validUsername, validEmail, validSignupPassword, wrapAsync(userController.signup));

router.route("/login")
.get(isLoggedOut, userController.renderLoginForm)
.post(isLoggedOut, saveRedirectUrl, 
    passport.authenticate("local", {
    failureRedirect : "/login",
    failureFlash : true,
}), wrapAsync(userController.login));

// LOGOUT
router.get("/logout", userController.logout);


router.get("/hosting", isLoggedIn, userController.getHosting);
// router.get("/travelling", isLoggedIn, userController.getTravelling);

router.post("/listings/add-to-wishlists/:id", isLoggedIn, checkPasswordTimestamp, wrapAsync(userController.addToWishlists));
router.get("/my-wishlists",isLoggedIn, checkPasswordTimestamp, travellingStatus, wrapAsync(userController.wishlists));
router.get("/my-trips", isLoggedIn, checkPasswordTimestamp, travellingStatus, wrapAsync(userController.trips));
router.get("/my-listings", isLoggedIn, checkPasswordTimestamp, hostingStatus, wrapAsync(userController.myListings));
router.get("/my-listings-reservations", isLoggedIn, checkPasswordTimestamp, hostingStatus, wrapAsync(userController.listingsReservations));

router.get("/account", isLoggedIn, checkPasswordTimestamp,  userController.renderAccountPage);
router.get("/account/personal-info", isLoggedIn, checkPasswordTimestamp, userController.renderPersonalInfoPage);
router.get("/account/login-security", isLoggedIn, checkPasswordTimestamp, userController.renderLoginAndSecurity);
router.get("/account/language-currency", isLoggedIn, checkPasswordTimestamp, userController.renderLanguageAndCurrency);
router.patch("/account/username/:id", isLoggedIn, checkPasswordTimestamp, validUsername, wrapAsync(userController.updateUsername));
router.patch("/account/email/:id", isLoggedIn, checkPasswordTimestamp, validEmail, wrapAsync(userController.updateEmail));
router.patch("/account/personal-info/:id", isLoggedIn, checkPasswordTimestamp, wrapAsync(userController.updatePersonalInfo));
router.get("/account/profile/:id", isLoggedIn, checkPasswordTimestamp, userController.renderProfilePage); 

router.route("/account/profile/:id/edit")
.get( isLoggedIn, checkPasswordTimestamp, userController.renderEditProfilePage)
.post( isLoggedIn, checkPasswordTimestamp, upload.single("profileImg"), wrapAsync(userController.updateProfile));

router.get("/users/show/:id", isLoggedIn, checkPasswordTimestamp, travellingStatus, wrapAsync(userController.showUser));

router.get("/message-host/:id", isLoggedIn, checkPasswordTimestamp, travellingStatus, wrapAsync(userController.messageHostPage));
router.post("/message-host/:userId/:hostId", isLoggedIn, checkPasswordTimestamp, wrapAsync(userController.messageHost));

router.post("/account/change-password",  isLoggedIn, checkPasswordTimestamp, validPassword, wrapAsync(userController.changePassword))

router.delete("/account/delete/:id",  isLoggedIn, checkPasswordTimestamp, wrapAsync(userController.destroyUser));



module.exports = router;


// mhuje y rotes ko thik krna h azeeb se bna rkhe h y sb