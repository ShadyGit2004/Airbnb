const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

module.exports.createReview = async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);    
    let newReviwe = new Review(req.body.review);   
    newReviwe.author = req.user._id;
    listing.reviews.push(newReviwe);
    await newReviwe.save();    
    await listing.save();    
    req.flash("success", "New Review Created!");
    res.redirect(`/listings/${id}`)
};

module.exports.destroyReview = async (req, res) => {
    let {id, reviewId} = req.params;    
    await Listing.findByIdAndUpdate(id, { $pull : {reviews : reviewId} });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
};