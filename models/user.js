const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const Listing = require("./listing.js");
const Booking = require("./booking.js");
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email : {
        type : String,
        required : true
    },
    joinAt : {
        type : Date,
        default : Date.now()
    },
    profileImg : {
        type : String
    },
    statusType : {
        type : String,
        default : "guest", 
    },
    userStatus : {
        type : String,
        default : "travelling",     
    },
    about : {
       dob : {
        type : Number,
        min : 10,
        maxLength : 20
       },  
       pets : {
        type : String,
        maxLength : 40
       },
       liveAt : {
        type : String,
        maxLength : 25
       },
       school : {
        type : String,
        maxLength : 40
       },
       work : {
        type : String,
        maxLength : 20
       },
       intro : {
        type: String,
        maxLength : 250
       },       
       languages : {      
        type : Array      
       },
       interests : {
        type : Array        
       }
    },
    wishlists : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Listing",
        },
    ],
    listings : [
        {
            type :  mongoose.Schema.Types.ObjectId,
            ref : "Listing",
        },
    ],
    trips : [
        {
            type :  mongoose.Schema.Types.ObjectId,
            ref : "Booking",
        },
    ],
    listingReservations : [
        {
            type :  mongoose.Schema.Types.ObjectId,
            ref : "Booking",
        },
    ],
    completedReservations : [
        {
            type :  mongoose.Schema.Types.ObjectId,
            ref : "Booking",
        },
    ],
    cancelledReservations : [
        {
            type :  mongoose.Schema.Types.ObjectId,
            ref : "Booking",
        },
    ],
    receivedMessages : [
        {
            type :  mongoose.Schema.Types.ObjectId,
            ref : "Message",
        },
    ],
    sentMessages : [
        {
            type :  mongoose.Schema.Types.ObjectId,
            ref : "Message",
        },
    ],
    countryInfo : {
        country : {
            type : String,
        },
        countryCapital : {
            type : String,
        },
        city : {
            type : String,
        },
        region : {
            type : String,
        },
        currency : {
            type : String,
            default : "INR",
        },
        language :{
            name : {
                type : String,
                default : "English"
            },
            locale : {
                type : String,
                default : "en-IN"
            },
        },
        callingCode : {
            type : String,      
        },
        currencyName : {
            type : String,
        },
        timezone : {
            type : String,
            default : "Asia/kolkata",
        }
    },
    phoneNo : {
        type : Number,
        default : 0,
    },
    passwordUpdatedAt : {
        type: Date,
        default: Date.now(),
    },
    isEmailVerified : {
        type : Boolean,
        default : false,
    },
    resetOtp : {
        type : String,
        default : "",
    },
    resetOtpExpiry : {
        type : Number,
        default : 0,
    },
    verifyOtp : {
        type : String,
        default : "",
    },
    verifyOtpExpiry : {
        type : Number,
        default : 0,
    },
    
}, {timestamps:true});

userSchema.post("findOneAndDelete", async (user) => {   
    if(user){
       await Listing.deleteMany({owner : user._id});
       await Review.deleteMany({author : user._id});
    }  
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

module.exports = User;

// booking delete nhi hogi and user bhi nhi hoga agr user delete krega acc ko to 