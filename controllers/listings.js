const Listing = require("../models/listing.js");
const User = require("../models/user.js");
const Review = require("../models/review.js");
const Booking = require("../models/booking.js");

const { getUserCurrency, generateListingSchema } = require("../schema.js");

const {currencyConverter, svc, calculateAvgRating } = require("../common.js");
const ExpressError = require("../utils/expressError.js");

async function generateCoordinates(listing, location) {
    // let searchUrl = `https://geocode.search.hereapi.com/v1/geocode?q=${location}&apiKey=${process.env.MAP_API_KEY}`;
    let searchUrl = `https://api.mapbox.com/search/geocode/v6/forward?q=${location}&access_token=${process.env.MAPBOX_TOKEN}`;
    await fetch(searchUrl)
    .then((result) => result.json())
    .then((data) => {
        // console.log(data.items[0].address);  // y mhuje listing ki location ki city, location, country, state, postal code deta jis s ki m us listing ki exact location frontend p mention kr pau     
        // listing.position = {...data.items[0].position};     
        // console.log(data);
           
        listing.position = { lat: data.features[0].properties.coordinates.latitude, lng: data.features[0].properties.coordinates.longitude };    
        
    }).catch((e)=>{
        console.log(e);
    });
}

function checkHouserules(houseRules) {
    for (const key in houseRules) {
        if(typeof houseRules[key] == "object"){
         houseRules[key] = houseRules[key].filter((rule) => {
            if(!rule == ""){              
                return rule;
            }
         });
        }
    }    
}

module.exports.indexPage = async (req, res) => {
    let {price, propertyType} = req.query;  
    
    let errMsg = null;
    let allListings = null;
    let filtered = false;
    let p = null;

    if (price || propertyType) {

        if(req.user && price && req.user?.countryInfo?.currency != "INR"){
            console.log(req.user.countryInfo.currency != "INR", req.user.countryInfo.currency ,"INR");            
            price = Math.round(currencyConverter(price, req.user?.countryInfo?.currency, "INR").replace(/[^\d.]/g, ''));
        }         
        
        if (price) {
            p = Number(req.query.price).toLocaleString(navigator.language || "en-IN", {style : "currency", currency : req.user ? req.user?.countryInfo?.currency : "INR"});
        }

        if(price && propertyType){         
            allListings = await Listing.find({price : { $lte : price }, houseType : {$eq : propertyType}});   
        }else if(propertyType){
            allListings = await Listing.find({houseType : {$eq : propertyType}});           
        } else{
            allListings = await Listing.find({price : { $lte : price}}); 
        }

        filtered = true;

        if (!allListings.length > 0) {  
            errMsg = price && propertyType ? `Listing not found for property type ${propertyType} and in price range of ${p}` : propertyType ? `Listing not found for property type ${propertyType}` : `Listing not found in price range of ${p}`; 
            // errMsg = "Listing not found"; 
            res.render("./listings/index.ejs", {errMsg, filtered, currencyConverter});
            return;
        } 

    } else{        
        allListings = await Listing.find({}); 
    }  

    let user = await User.findById(req.user);       

    const wishlistIds = new Set(user?.wishlists.map(w => w.toString()));

    for (let listing of allListings) {
        if(wishlistIds.size) {
            listing.inWishlist = wishlistIds.has(listing._id.toString());
        }
    
        // Populate listing.owner and listing.reviews
        await listing.populate("owner");
        await listing.populate("reviews");
    }

    res.render("./listings/index.ejs", { allListings, errMsg, filtered, currencyConverter, svc, calculateAvgRating});
};

module.exports.renderNewForm = (req, res) => {    
    res.render("./listings/new.ejs", {currencyConverter});
};

module.exports.showListing = async (req, res) =>{
    let {modal} = req.query;
    let {id} = req.params;
    let listing = await Listing.findById(id).populate({path : "reviews", populate : {path : "author"}}).populate("owner");
    let user = await User.findById(req.user);

    let usersWishlist = user?.wishlists;  
    let inWishlist = false; 

    if(!listing || listing.owner._id.toString() == req.user?._id.toString()){
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    } else {          
        if(usersWishlist && typeof usersWishlist != "undefined") {
            inWishlist = usersWishlist.some((w) => w._id.toString() === id);
        }
        if(modal){
            return res.render("./listings/modal.ejs", {modalImages : listing.images, listing, inWishlist,});
         }
               
        let convertedPrice = currencyConverter(listing.price, "INR", req.user?.countryInfo?.currency || "INR");     
        let discount = Number(currencyConverter(((Number(convertedPrice.replace(/[^\d.]/g, '')) * svc) * .30), "INR", req.user?.countryInfo?.currency || "INR").replace(/[^\d.]/g, ''));            
        let avgRating = calculateAvgRating(listing);
        let allListings = await Listing.find({owner : listing.owner}).populate("reviews"); 
        let allBookings = await Booking.find({listingId : id}); // new feature show all bookings ainfo in show page
        res.render("./listings/show.ejs", {listing, allListings, allBookings, inWishlist, convertedPrice, discount, svc, avgRating});  
    }         
};

module.exports.createListing = async (req, res) => {    

    const userCurrency = await getUserCurrency(req);
    const schema = generateListingSchema(userCurrency);

    const { error } = schema.validate(req.body);

    if (error) {
       throw new ExpressError(404 , error.details[0].message);       
    }

    let price = req.body.listing.price;
  
    let p = Math.round(currencyConverter(price, req.user.countryInfo.currency, "INR").replace(/[^\d.]/g, ''));

    if (!(1000 <= Number(p))) {     
        req.flash("error", `Listing price should be greater then ${currencyConverter(1000, "INR", req.user.countryInfo.currency)}!`);
        res.redirect("/listings/new"); 
        return;
    }
    
    let { houseRules } = req.body.listing;

    checkHouserules(houseRules);

    const newListing =  new Listing(req.body.listing);
    newListing.price = p;
    newListing.currency = userCurrency;
    newListing.houseRules = houseRules;
    newListing.owner = req.user._id;
    
    for (const file of req.files) {
        file.path = file.path.replace('/upload','/upload/q_auto:best'); 
    };
        
    newListing.images = req.files;
    const user = await User.findById(req.user._id);
    if(user.statusType != "Host"){
    user.statusType = "Host";
    user.userStatus = "hosting";
    }

    await generateCoordinates(newListing, req.body.listing.location); 
    // newListing.position = { lat: 10.257794, lng: -84.200915 };     
    await newListing.save();
    
    user.listings.push(newListing);
    await user.save();
    
    req.flash("success", "New listing is Created!");
    res.redirect("/my-listings");   
};

module.exports.renderEditForm = async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/my-listings");
    }else {
        for (let image of listing.images) {   
            image.path = image.path.replace('/upload','/upload/w_220'); 
        };        
        
        res.render("./listings/edit.ejs", {listing, imageUrlArr : listing.images, currencyConverter}); 
    }    
};

module.exports.updateListing = async (req, res) => {   

    if (!req.body.listing) {
        req.flash("error", "Listing should be valid!");
        res.redirect(`/my-listings`);  
    }

    let {id} = req.params;  
    let { houseRules } = req.body.listing;  
    
    let price = req.body.listing.price;     
    let p = Math.round(currencyConverter(price, req.user.countryInfo.currency, "INR").replace(/[^\d.]/g, '')); 

    if(req.body.listing.country.trim() == "" || req.body.listing.location.trim() == "" || req.body.listing.title.trim() == "" || req.body.listing.description.trim() == "" || req.body.listing.currency.trim() == "" || req.body.listing.price.trim() == ""){
        req.flash("error", "Listing details should be valid white space is not allowed");
        res.redirect(`/listings/${id}/edit`);  
        return;
    }

    if (!(1000 <= p)) {     
        req.flash("error", `Listing price should be greater then ${currencyConverter(1000, "INR", req.user.countryInfo.currency)}!`);
        res.redirect(`/listings/${id}/edit`);  
        return;
    }

    checkHouserules(houseRules); 

    const userCurrency = await getUserCurrency(req);
    const schema = generateListingSchema(userCurrency);

    const { error } = schema.validate(req.body);

    if (error) {
       throw new ExpressError(404 , error.details[0].message);  
    }

    let updatedListing = await Listing.findByIdAndUpdate(id, {...req.body.listing, houseRules : houseRules, price : p}, {runValidators : true});
    if(updatedListing.location != req.body.listing.location){
        await generateCoordinates(updatedListing, req.body.listing.location);        
        await updatedListing.save(); 
    } 
    
    req.flash("success", "Listing Updated!"); 
    res.redirect(`/my-listings`);  
};

module.exports.updateListingImages = async (req, res) => {   

    let {id, imgId} = req.params;    

    if (!req.files.length > 0) {
        req.flash("error", "Image data should be valid!");
        res.redirect(`/listings/${id}/edit`);  
        return;
    };
    
    let updatedListing = await Listing.findById(id);
    
    req.files[0].path = req.files[0].path.replace('/upload','/upload/q_auto:best');

    for (let image of updatedListing.images) {
        if(image._id == imgId){     
            image.path = req.files[0].path;
            image.filename = req.files[0].filename;              
        }
    }

    await updatedListing.save();
   
    req.flash("success", "Image Updated!");
    res.redirect(`/listings/${id}/edit`);  
};


module.exports.toggleIsAvailable = async (req, res) => {
    let {id} = req.params;  
    let listing = await Listing.findById(id);

    if(!listing){        
        req.flash("error", "Listing not found");
        res.redirect(`/my-listings`);
        return;
    } 

    listing.isAvailable = !(listing.isAvailable);
    await listing.save();

    req.flash("success", "Availability status updated");
    res.redirect("/my-listings");
};

module.exports.destroyListing = async (req, res) => {
    let {id} = req.params;  
    let listing = await Listing.findById(id); 
    let user = await User.findById(listing.owner);

    if(!listing.isAvailable){        
        req.flash("error", "Listing is booked by guest, please cancel booking first to delete");
        res.redirect(`/my-listings`);
        return;
    }    
    
    //  listing.reviews?.foreach(async (review)=>{
    //     await Review.findByIdAndDelete(review._id);
    //  });

    await Listing.findByIdAndDelete(id); // delete owner's listing
    await User.findByIdAndUpdate({_id : listing.owner}, {$pull : {listings : id}}); // update owner's listing array
    
    let allListings = await Listing.find({owner: user._id});
    if(!allListings.length > 0){
        user.statusType = "Guest";
        user.userStatus = "travelling";
        user.save();
    }    

    req.flash("success", "Listing Deleted!");
    res.redirect("/my-listings");
};