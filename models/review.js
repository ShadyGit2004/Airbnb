const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    rating : {
        type : Number,
        required : true,
        min : 1, 
        max : 5,
    },
    comment : {
        type : String,
        required : true,
    },
    createdAt : {
        type : Date,
        default : Date.now(),
    },
    author : {
        type : Schema.Types.ObjectId,
        ref : "User",
    }
});

const Review = new mongoose.model("Review", reviewSchema);

module.exports = Review;