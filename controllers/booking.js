const Listing = require("../models/listing.js");
const User = require("../models/user.js");
const Booking = require("../models/booking.js");
const {bookingSchema} = require("../schema.js")
const ExpressError = require("../utils/expressError.js");
const {currencyConverter, tax, svc, calculateAvgRating } = require("../common.js");

const crypto = require("crypto");
const {instance} = require("../app.js");

module.exports.bookListingConfirm = async (req, res) => { 

    let {id} = req.params;

    if(typeof req.query.booking == "undefined"){
        res.redirect(`/listings/${id}`);
        return;
    }  

    let {guests, infants, pets, checkIn, checkOut, stayDays} = req.query.booking;

    const bookedListing = await Listing.findById(id).populate("owner").populate("reviews"); 

    let avgRating = calculateAvgRating(bookedListing);
    
    // let from = bookedListing.owner.countryInfo.currency || "INR";
    // let to = req.user.countryInfo.currency || "INR"; 
    let from = "INR";
    let to = req.user.countryInfo.currency || "INR"; 

    // let disAmtPerDay = 0;

    // function incDiscount(dis) {
    //   console.log("incDisc -> ", (disAmtPerDay = dis+.1));      
    //   return dis+.1;
    // } 
    // function decDiscount(dis) { 
    //   console.log("decDisc -> ", (disAmtPerDay = dis-.025));      
    //   return dis-.025;
    // }

    // if (stayDays == 5) {
    //   console.log(`im in the if block of ${stayDays}`);      
    //   disAmtPerDay = .25;
    // }else if (stayDays == 6) {
    //   console.log(`im in the if block of ${stayDays}`); 
    //   disAmtPerDay = .30;
    // }else if (stayDays == 7) {
    //   console.log(`im in the if block of ${stayDays}`); 
    //   disAmtPerDay = .70;
    // }else if (stayDays == 8) {
    //   console.log(`im in the if block of ${stayDays}`); 
    //   disAmtPerDay = .80;
    // }else if (stayDays == 9) {
    //   console.log(`im in the if block of ${stayDays}`); 
    //   disAmtPerDay = .90;
    // }else if (stayDays == 10) {
    //   console.log(`im in the if block of ${stayDays}`); 
    //   disAmtPerDay = 1;
    // }else{
    //   if (stayDays < 25) {
    //     disAmtPerDay = stayDays - 10;
    //     console.log(`im in the if block of ${stayDays}`); 
    //     disAmtPerDay = incDiscount(disAmtPerDay);
    //   }else{
    //     console.log(`im in the else block of ${stayDays}`); 
    //     disAmtPerDay = decDiscount(disAmtPerDay);
    //   }
    // }
  
    // let discount = Number(currencyConverter((bookedListing.price * .15), from, to).slice(1).split(",").join(""));
    // let taxDiscount = Number(currencyConverter((bookedListing.price * .15), from, to).slice(1).split(",").join("")); 
    // let discount = Number(currencyConverter(50, from, to).slice(1).split(",").join(""));
    // let taxDiscount = Number(currencyConverter(50, from, to).slice(1).split(",").join("")); 

    let convertedListingPrice = currencyConverter(bookedListing.price, from, to);
    let price = Number((Number(convertedListingPrice.replace(/[^\d.]/g, '')) * stayDays).toFixed(2));  
    
    let discount = Number(currencyConverter(((Number(convertedListingPrice.replace(/[^\d.]/g, '')) * svc) * .30), from, to).replace(/[^\d.]/g, ''));    
    let taxDiscount = Number(currencyConverter(((Number(convertedListingPrice.replace(/[^\d.]/g, '')) * tax) * .30), from, to).replace(/[^\d.]/g, '')); 
    
    
    // let taxDiscount = (Number(convertedListingPrice.slice(1).split(",").join("")) * .12) * disAmtPerDay;          
    // let discount = Number(currencyConverter(((Number(convertedListingPrice.slice(1).split(",").join("")) * svc) * disAmtPerDay), from, to).slice(1).split(",").join(""));
   
    let serviceAmt = (price * svc) - (stayDays > 4 ? discount : 0); // mne check kiya ki srvc m 50 day-1 - nhi krna long stay k liy krna h jese ki week ya month
    let totalTax = (price * tax) - (stayDays > 4 ? taxDiscount : 0); // or isko 63 ki jg 60 krde apne hisab s kyuki real m vo state wise or other tx bhi lgata h
    let totalAmount = price + serviceAmt + totalTax; 
    // let totalTax = (price * .12) - (stayDays > 4 ? taxDiscount : 0);
    // tax = .12 in aribnb
    // dis = (450*6) - (450*.25)

    // console.log(serviceAmt);
    // console.log(totalTax);
    
   
    let convertedObj = {};
   
    convertedObj = {
      listingPrice : convertedListingPrice,
      priceAndSvc : Number((price + serviceAmt).toFixed(2)).toLocaleString(navigator.language || "en-IN",{style: "currency", currency : to}), 
      price : price.toLocaleString(navigator.language || "en-IN",{style: "currency", currency : to}), 
      svc : Number(serviceAmt.toFixed(2)).toLocaleString(navigator.language || "en-IN",{style: "currency", currency : to}), 
      tax : Number(totalTax.toFixed(2)).toLocaleString(navigator.language || "en-IN",{style: "currency", currency : to}),  
      finalAmount : Number(totalAmount.toFixed(2)).toLocaleString(navigator.language || "en-IN",{style: "currency", currency : to}),
    }
    // console.log(convertedObj);
    // console.log("dis -> ", discount);
    // console.log("total price -> ", price);
    // console.log("actual price -> ", bookedListing.price);
    // console.log("actual price dis -> ", (bookedListing.price * .15));
    // console.log("converted price -> ", convertedListingPrice);
    // console.log("tax-dis -> ", taxDiscount);    

    // yha p hi mhuje check krna h ki book hone wali listing booked date ko to book nhi hori ya fir max guests vegre phle hi check krna h kyuki vha p direct payment ho jati h
  
    res.render("./bookings/booking.ejs", {guests, infants, pets, checkIn, checkOut, stayDays, id, bookedListing, avgRating, convertedObj});
};

module.exports.bookListing = async (req, res)=>{

    let {id} = req.params;
    let userId = req.user._id;
    
    let {guests, infants, pets, checkIn, checkOut, stayDays, totalAmount} = req.body.booked;
    const bookedListing = await Listing.findById(id); 
    const owner = await User.findById(bookedListing.owner);
    const bookedUser = await User.findById(userId);

    if(!bookedListing || !bookedListing.isAvailable){        
        req.flash("error", "Listing you requested for is not available");
        return res.redirect(`/listings/${id}`);
    }

    if(!bookedUser){        
        req.flash("error", "User doesn't exists");
        return res.redirect(`/listings/${id}`);
    }

    if(checkIn >= checkOut
        || guests.adults > bookedListing.aboutPlace.guests.adults 
        || guests.children > bookedListing.aboutPlace.guests.children 
        || pets > bookedListing.aboutPlace.pets
        || infants > bookedListing.aboutPlace.infants
        || guests.adults <= 0 
        || (stayDays <= 0 && !stayDays > 730)
        || !totalAmount
        || checkIn < new Date()) {        
        req.flash("error", "Booking data should be valid!");
        return res.redirect(`/listings/${id}`);
    }

    totalAmount = currencyConverter(totalAmount, req.user.countryInfo.currency || "INR", "INR").replace(/[^\d.]/g, '');        

    const booking = new Booking({
        listingId : id,
        ownerId : bookedListing.owner,
        guestId : userId,
        guests,
        infants,
        pets,
        checkIn,
        checkOut,
        stayDays,
        totalAmount,
        isPaid : true,
    });

    // const {error} = bookingSchema.validate(booking);

    // console.log(error);
    
    // if(error){
    //   let errMsg = error.details.map((el) => el.message).join(",");
    //   throw new ExpressError(404, errMsg);
    // }

    await booking.save();
    
    bookedUser.trips.push(booking);
    owner.listingReservations.push(booking);
    await bookedUser.save();
    await owner.save();

    // console.log(booking);   
    // console.log(totalAmount);

    req.flash("success", "Listing is booked !");
    res.redirect(`/my-trips`);
}

module.exports.createOrder = async (req, res) => {
    const bookedUser = await User.findById(req.user._id);
    const { amount } = req.body;

    const zeroDecimalCurrencies = ["CLP", "IDR", "JPY", "KRW", "UGX", "VND"];
    
    function formatAmount(amount, currency) {
      if (zeroDecimalCurrencies.includes(currency)) {
        return Math.round(amount); // No subunits
      } else {
        return Math.round(amount) * 100; // Convert to subunit (e.g. paise or cents)
      }
    }
    
    const options = {
      amount: formatAmount(amount, bookedUser.countryInfo.currency), // Convert amount to paise
      currency: bookedUser.countryInfo.currency || 'INR',
      receipt: 'receipt#1',
    };

    try {
      const order = await instance.orders.create(options);
      // console.log(order);      
      res.json(order);
    } catch (error) {
      res.status(500).send(error);
    }
};
  
// Route to verify Razorpay payment signature
module.exports.verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
    const key_secret =  process.env.RZR_KEY_SECRET;

    const generated_signature = crypto
      .createHmac('sha256', key_secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');     

    if (generated_signature === razorpay_signature) {
      res.json({ status: 'success', message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ status: 'failed', message: 'Invalid signature' });
    }    
};


module.exports.cancelListing = async (req, res)=>{

    let {id, bookingId} = req.params; 
    let booking = await Booking.findById({_id : bookingId});
    // let booking = await Booking.findByIdAndDelete({_id : bookingId});

    if(!booking){ 
        req.flash("error", "Booking doesn't exist!");
        return res.redirect(`/my-trips`);        
    }

    if(booking.guestId.equals(id) || booking.ownerId.equals(id)){

      // console.log(booking.guestId.equals(id), booking.ownerId.equals(id));

                  
      await Booking.findByIdAndDelete({_id : bookingId});
      await User.findByIdAndUpdate({_id : booking.guestId}, {$pull : {trips : bookingId}});
      await User.findByIdAndUpdate({_id : booking.ownerId}, {$pull : {listingReservations : bookingId}, $push : {cancelledReservations : booking.listingId}});

      req.flash("success", "Booking cancelled! Payment will be refunded in 24 hours")
      return res.redirect(`/my-trips`); 
    }
    else {
      req.flash("error", "You are not authorized to this booking !");
      return res.redirect(`/my-trips`); 
    }
}

