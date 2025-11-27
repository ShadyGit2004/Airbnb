const ExpressError = require("./utils/expressError.js");
const {reviewSchema, generateListingSchema, bookingSchema} = require("./schema.js");
// const {listingSchema} = require("./schema.js");
const Review = require("./models/review.js");
const Listing = require("./models/listing.js");
const User = require("./models/user.js");

const { body } = require("express-validator");

// module.exports.isLoggedIn = (req, res, next) => {
//     if(!req.isAuthenticated()){
//         req.session.redirectUrl = req._parsedOriginalUrl.pathname;
//         req.flash("error", "You must be logged in");
//         return res.redirect("/login");
//     };
//     next();
// };

// module.exports.isLoggedOut = (req, res, next) => {
//     if(req.isAuthenticated()){       
//         req.flash("error", "You must be logged out first");
//         return res.redirect("/listings");
//     };
//     next();
// };

// module.exports.saveRedirectUrl = (req, res, next) => {
//     if(req.session.redirectUrl){
//         res.locals.redirectUrl = req.session.redirectUrl;
//     }
//     next();
// };

// module.exports.validateListing = (req, res, next) => {
//     let {error} = listingSchema.validate(req.body);
//     if(error){
//         let errMsg = error.details.map((el) => el.message).join(",");
//         throw new ExpressError(404, errMsg);
//     } else{
//         next();
//     }
// };

// module.exports.validateReview = (req, res, next) => {
//     let {error} = reviewSchema.validate(req.body);
//     if(error){
//         let errMsg = error.details.map((el) => el.message).join(",");
//         throw new ExpressError(404, errMsg);
//     } else{
//         next();
//     }
// };

// module.exports.isOwner = async (req, res, next) => {
//     let {id} = req.params;
//     let listing = await Listing.findById(id);
//     if(!listing){
//         req.flash("error", "Listing you requested for does not exist");
//         return res.redirect(`/listings`)
//     }else {
//         if(!listing.owner._id.equals(res.locals.currUser._id)){
//             req.flash("error", "You are not the owner of this listing");
//             return res.redirect(`/listings/${id}`)
//         } 
//     };
//     next();
// };

// module.exports.isReviewAuthor = async (req, res, next) => {
//     let {id, reviewId} = req.params;
//     let review = await Review.findById(reviewId);
//     if(!review){
//         req.flash("error", "Review you requested for does not exist");
//         return res.redirect(`/listings/${id}`)
//     }else{
//         if(review.author._id && !review.author._id.equals(res.locals.currUser._id)){
//         req.flash("error", "You are not the author of this review");
//         return res.redirect(`/listings/${id}`)
//         }
//     };
//     next();
// };


// module.exports.validPassword = async (req, res, next) =>{[
//     body("oldPassword")
//         .notEmpty()
//         .withMessage("Current password is required"),

//     body("newPassword")
//       .isLength({ min: 6 })
//       .withMessage("New password must be at least 6 characters"),

//     body("confirmPassword").custom((value, { req }) => {
//       if (value !== req.body.newPassword) {
//         throw new Error("Confirm password does not match new password");
//       }
//       return true;
//     })
// ];
// next();
// };


// module.exports.validEmail = async (req, res, next) =>{[
//     body("email")
//       .notEmpty()
//       .withMessage("Email is required")
//       .isEmail()
//       .withMessage("Please provide a valid email address")
//       .normalizeEmail()
//   ];
//   next();
// };
  


// module.exports.validUsername = async (req, res, next) =>{[
//     body("username")
//       .notEmpty()
//       .withMessage("Username is required")
//       .isLength({ min: 3 })
//       .withMessage("Username must be at least 3 characters long")
//       .matches(/^[a-zA-Z0-9_]+$/)
//       .withMessage("Username can only contain letters, numbers, and underscores")
// ];
// next();
// };



// middleware/validators.js


const isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req._parsedOriginalUrl.pathname;
        req.flash("error", "You must be logged in");
        return res.redirect("/login");
    };    
    next();
};

const isLoggedOut = (req, res, next) => {
    if(req.isAuthenticated()){       
        req.flash("error", "You must be logged out first");
        return res.redirect("/listings");
    };
    next();
};

const saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

const validateListing = (req, res, next) => {
    // let {error} = listingSchema.validate(req.body);
    let {error} = generateListingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(404, errMsg);
    } else{
        next();
    }
};

const validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(404, errMsg);
    } else{
        next();
    }
};

const validateBooking = (req, res, next) => {
  let {error} = bookingSchema.validate(req.body);
  if(error){
      let errMsg = error.details.map((el) => el.message).join(",");
      throw new ExpressError(404, errMsg);
  } else{
      next();
  }
};

const isOwner = async (req, res, next) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect(`/listings`)
    }else {
        if(!listing.owner._id.equals(res.locals.currUser._id)){
            req.flash("error", "You are not the owner of this listing");
            return res.redirect(`/listings/${id}`)
        } 
    };
    next();
};

const isReviewAuthor = async (req, res, next) => {
    let {id, reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review){
        req.flash("error", "Review you requested for does not exist");
        return res.redirect(`/listings/${id}`)
    }else{
        if(review.author._id && !review.author._id.equals(res.locals.currUser._id)){
        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listings/${id}`)
        }
    };
    next();
};


const travellingStatus = async (req, res, next) => {
  if(req.user && req.user.userStatus == "hosting"){
      // console.log(req.user.userStatus);
      req.user.userStatus = "travelling";
      await req.user.save();
      // console.log(req.user.userStatus);
  } 
  next();
};

const hostingStatus = async (req, res, next) => {
  if(req.user && req.user.userStatus == "travelling"){
      // console.log(req.user.userStatus);
      req.user.userStatus = "hosting";
      await req.user.save();
      // console.log(req.user.userStatus);
  } 
  next();
};

const checkPasswordTimestamp = async (req, res, next) => {
    if (!req.isAuthenticated()) return next();
  
    try {
      const user = await User.findById(req.user._id);
  
      // If passwordUpdatedAt exists, compare it with session timestamp
      if (
        user.passwordUpdatedAt &&
        req.session.passwordTimestamp &&
        user.passwordUpdatedAt > new Date(req.session.passwordTimestamp)
      ) {
        // Password was changed after login
        req.logout(() => {
          req.flash("error", "Your session has expired due to a password change. Please log in again.");
          res.redirect("/login");
        });
        return;
      }
  
      next();
    } catch (err) {
      next(err);
    }
};  

const validPassword = [
  body("oldPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),

  body("confirmPassword")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Confirm password does not match new password");
      }
      return true;
    }),
];

 const validSignupPassword = [
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
 ];

const validEmail = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
];

const validUsername = [
  body("username")
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores")
];

module.exports = {
    isLoggedIn,
    isLoggedOut,
    isOwner,
    isReviewAuthor,
    saveRedirectUrl,
    validateReview,
    validateListing,
    validateBooking,
    validPassword,
    validSignupPassword,
    validEmail,
    validUsername,
    checkPasswordTimestamp, 
    travellingStatus,
    hostingStatus
};
