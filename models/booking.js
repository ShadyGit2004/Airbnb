
const mongoose = require("mongoose");

let today = new Date();

const bookingSchema = new mongoose.Schema({
    listingId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Listing",
    },
    ownerId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
    },
    guestId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
    },
    guests : {
        type : Object,
        adults : {
            type : Number,
            min : 1,
            max : 25,
        }, 
        childrens : {
            type : Number,
            min : 0,
            max : 25,
        },
        require :true,
    },
    infants : {
        type : Number,
        require :true,
        min : 0,
        max : 5,
    },
    pets : {
        type : Number,
        require :true,
        min : 0,
        max : 5,
    },
    checkIn : {
        type : Date,
        require :true,
        min : today,     
        max : new Date().setDate(today.getDate()+729),
    },
    checkOut : {
        type : Date,
        require :true,
        min : new Date().setDate(today.getDate()+1),        
        max : new Date().setDate(today.getDate()+730),
    },
    stayDays : {
        type : Number,
        require :true,
        min : 1,
        max : 730,
    },
    totalAmount : {
        type : String,
        require :true,
    },
    isPaid : {
        type : Boolean,
        default : false,
        require : true,
    },
    bookedAt : {
        type : Date,
        default : new Date(),
    },
    
});

const Booking = mongoose.model("booking", bookingSchema);

module.exports = Booking;