const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");

let {currencyConverter} = require("../common.js");
const ExpressError = require("../utils/expressError.js");

const listingSchema = new Schema({
    title : {
        type : String,
        minLength : 10,
        maxLength : 36,
        required : true,
    },
    description : {
        type : String,
        minLength : 50,
        maxLength : 200,
        required : true,
    },
    images : [
        {
            path : String,
            filename : String,
        }, 
    ],
    price : {
        type : Number,
        min: 1000,
        max : 25000,
        required : true,
    },
    // price : {
    //     type : Number,
    //     required : true,
    // },
    location : {
        type : String,
        required : true,
    },
    country : {
        type : String,
        required : true,
    },
    reviews : [
      {
        type : Schema.Types.ObjectId,
        ref : "Review",
      },
    ],
    owner : {
        type : Schema.Types.ObjectId,
        ref : "User",
    },
    position : {
        type : Object,
        required : true,
    },     
    currency: { type: String, required: true, default: "INR" },
    houseType : {
        type : String,
        required : true,
    },
    privacyType : {
        type : String,
        required : true,
    },
    aboutPlace : {
        type : Object, 
        required : true, 
        guests : {
            adults : {
            type : Number,
            min : 1,
            max : 25,
            required : true,
            },
            infants : {
                type : Number,
                min : 0,
                max : 5,
            },
            pets : {
                type : Number,
                min : 1,
                max : 5,
            },
        },
        beds : {
            type : Number,
            min : 1,
            max : 50,
            required : true,
        },
        bedrooms : {
            type : Number,
            min : 0,
            max : 50,            
        },
        bathrooms : {
            type : Number,
            min : 1,
            max : 50,
            required : true,
        },
    },
    houseRules : {
        type : Object,  
        required : true,
        checkIn : {
            type : String,
            required : true,
        },
        checkOut : {
            type : String,
            required : true,
        },
        selfCheckIn : {
            type : String,
            required : true,
        },        
        pets : String,
        smoking : String,
        party : String,
        photography : String,       
    },
    housePolicy : {
        type : Object,  
        cancellationPolicy : {
            type : String,
            required : true,
        },
        cancellationTime : {
            type : String,
            required : true,
        },    
        minimumDays : {
            type : Number,
            default : 1,
            required : true,
        },   
        maximumDays : {
            type : Number,
            default : 30,
            required : true,
        }, 
        required : true,
    },

    amenities : {   
        type : Object,     
        bathroom : {
            type : Array,
        },
        bedroom : {
            type : Array,
        },
        entertainment : {
            type : Array,
        },
        homesafty : {
            type : Array,
        },
        kitchen : {
            type : Array,
        },
        internet : {
            type : Array,
        },
        outdoor : {
            type : Array,
        },
    },
    isAvailable : {
        required : true,
        type : Boolean,
        default : true,
    },
    // bookingDates : [
    //     {
    //         bookingCheckIn : {
    //             type : Date,
    //         },
    //         bookingCheckOut : {
    //             type : Date,
    //         }
    //     },
    // ],

    // avgRating :{
    //     type : Number,
    //     min : 0,
    //     max : 5,
    // },
    // mhuje avgRating ko bhi apply krba h idea ye h ki jab koi bhi review dega to jo function mne avgStars k liy likha h vo m run kr dunga avgRating ko save krane k liy in review model.js
    
    // geometry : {
    //  type : "Point",    
    //  enum : ["Point"],
    //  coordinates : [
    //   4.8837643,
    //   52.3742953
    // ]
    // },
});

// listingSchema.pre("validate", function (next) {
//     const currency = this.currency || "INR";
//     const minINR = 1000;
//     const maxINR = 25000;
  
//     const min = Number(currencyConverter(minINR, "INR", currency).replace(/[^\d.]/g, ''));
//     const max = Number(currencyConverter(maxINR, "INR", currency).replace(/[^\d.]/g, ''));
    
//     console.log("modl curr ->", currency);
//     console.log("modl min ->", minINR);
//     console.log("modl max ->", maxINR);
//     console.log("modl price ->", this.price);
  
//     if (this.price < min || this.price > max) {
//       return next(new ExpressError(400 ,`Price must be between ${min.toFixed(2)} and ${max.toFixed(2)} ${currency}`));
//     }
  
//     next();
//   });

listingSchema.post("findOneAndDelete", async (listing) => {   
    if(listing){
        await Review.deleteMany({_id : {$in : listing.reviews}});
    }  
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;



