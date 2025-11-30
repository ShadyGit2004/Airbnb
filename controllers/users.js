const Listing = require("../models/listing.js");
const User = require("../models/user.js");
const Review = require("../models/review.js");
const Message = require("../models/message.js");
const Booking = require("../models/booking.js");

// Valid lists
const languageList = require("../utils/languageList.js");
const currencyList = require("../utils/currencyList.js");
const timezoneList = require("../utils/timezoneList.js");

const { validationResult } = require("express-validator");

const {transporter} = require("../app.js");

const {calculateAvgRating, currencyConverter} = require("../common.js");

module.exports.renderSignUpForm = (req, res) => {
    res.render("users/signup.ejs")
};

module.exports.signup = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash("error", errors.array().map(err => err.msg).join(", "));
        return res.redirect("/signup");
    }
    
    try {
     let {username, email, password} = req.body;
     const response = await fetch('https://ipapi.co/json/');
     const data = await response.json();
    //  const data = {};
     const lng = data.languages || "en-IN, en-US";
    //  const lng = "en-IN, en-US";
    //  console.log(data);
    //  console.log(data.language);
    //  console.log(lng);
     
     const newUser = new User({
        username,        
        email, 
        statusType : "Guest",
        userStatus : "travelling",
        passwordUpdatedAt: new Date(),
        countryInfo : {
            currency : data.currency || "INR", // Example: "USD", "EUR", "INR"
            callingCode : data.country_calling_code || "+91",
            country : data.country_name || "India",
            countryCapital : data.country_capital || "Delhi",
            city : data.city || "Pilani",
            region : data.region || "Rajasthan",
            timezone : data.timezone || "Asia/Kolkata",
            language : {name : "English", locale: lng.split(",").slice(0,1).join("") || "en-IN"},
            currencyName : data.currency_name || "Rupee",
        },
     });
     
    //  console.log(newUser);          

     const regUser = await User.register(newUser, password);
     
     req.login(regUser, (err) => {
         if(err) {
            return next(err);
         }
         req.flash("success", "Welcome to Airbnb!");
         res.redirect("/listings");  
     });   
 
    } catch (err) {
      console.log(err.message); 
      req.flash("error", err.message);
      res.redirect("/signup");    
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
    req.session.passwordTimestamp = req.user.passwordUpdatedAt;
    req.flash("success", "Welcome back to Airbnb!");    
    let redirectUrl = req.user.userStatus !== "travelling" ? "/my-listings" : res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout((err)=>{
       if(err){
        return next(err);
       }
       req.flash("success", "You logged out");
       res.redirect("/listings");   
    });   
};


module.exports.getHosting = async (req, res) => {

  if(!req.user){
    req.flash("error", "User not found");
    return res.redirect("/listings");   
  }

  let user = await User.findById(req.user);

  if(user.userStatus == "travelling"){    
    user.userStatus = "hosting";
    await user.save();  
    return res.redirect("/my-listings");
  }else{    
    user.userStatus = "travelling";
    await user.save();
    res.redirect("/listings");
  }
};

module.exports.renderAccountPage = (req, res) => {
    res.render("users/account.ejs");
};

module.exports.renderProfilePage = (req, res) => { 
    res.render("users/profile.ejs");
};

module.exports.renderEditProfilePage = (req, res) => {
    res.render("users/editProfile.ejs");
};

module.exports.updateProfile = async (req, res) => {
    let {id} = req.params;        
    const user = await User.findById(id);

    if(!user){
        req.flash("error", "User not found");
        res.redirect(`/listings`);
        return;
    }

    let saveInDb = async (data, dataName) => {
        if (data != "") {    
            if (typeof(data) == "string") {                
                user.about[dataName] = data.trim();
            } else{
                user.about[dataName] = data;
            }                       
            await user.save();
            return;
        } else {
            user.about[dataName] = "";
            await user.save();  
            return;
        } 
    }

    if(req.file){ 
        user.profileImg = req.file.path;
        await user.save();
        // console.log(user);
        req.flash("success", "Profile photo updated");
        res.redirect(`/account/profile/${id}/edit`);
        return;
    } else if (req.body.about != undefined) {
        let {dob, pet, work, school, liveAt, intro, languages, interests, currency} = req.body.about; 
        
        if(pet || pet === ""){                    
            await saveInDb(pet, "pets");                
            res.redirect(`/account/profile/${id}/edit`)
            return;
        }else if(dob || dob === ""){                   
            await saveInDb(dob, "dob")
            res.redirect(`/account/profile/${id}/edit`)
            return;
        }else if(work || work === ""){                    
            // if (work != "") {
            //     user.about.work = work;
            //     await user.save();
            // } else {
            //     user.about.work = "";
            //     await user.save();  
            // }    
            await saveInDb(work, "work")
            res.redirect(`/account/profile/${id}/edit`)
            return;
        }else if(school || school === ""){            
            await saveInDb(school, "school");
            res.redirect(`/account/profile/${id}/edit`)
            return;
        }else if(liveAt || liveAt === ""){            
            await saveInDb(liveAt, "liveAt");
            res.redirect(`/account/profile/${id}/edit`)
            return;
        }else if(intro || intro === ""){            
            await saveInDb(intro, "intro");
            res.redirect(`/account/profile/${id}/edit`)
            return;
        }else if(languages || languages === ""){            
            languages = languages.filter((lng) => {
                if(lng !== ""){
                    return lng;                    
                }
            }) ;            
            await saveInDb(languages, "languages");            
            res.redirect(`/account/profile/${id}/edit`)
            return;
        }else if(interests || interests === ""){                    
            interests = interests.filter((i) => {
                if(i !== ""){
                    return i;                    
                }
            });            
            await saveInDb(interests, "interests");          
            res.redirect(`/account/profile/${id}/edit`)
            return;
        }else if(currency){  
            const redirectTo = req.get('Referrer') || '/listings';
            user.countryInfo['currency'] = currency;  
            await user.save(); 
            res.redirect(redirectTo);
        } else{           
            res.redirect(`/account/profile/${id}/edit`)
            return;
        }
    } else {
        req.flash("error", "Somthing went wrong :(")
        res.redirect(`/account/profile/${id}/edit`)
        return;
    }
}

module.exports.renderPersonalInfoPage = (req, res) => {
    res.render("users/personalInfo.ejs");
};
module.exports.renderLanguageAndCurrency = (req, res) => {
    res.render("users/languageandcurrency.ejs");
};
module.exports.renderLoginAndSecurity = (req, res) => {
    res.render("users/loginandsecurity.ejs");
};

module.exports.updateUsername = async (req, res, next) => {
  const { id } = req.params;
  const { username } = req.body;

    const user = await User.findById(id);
    if (!user) {
      req.flash("error", "Account you requested for doesn't exist");
      return res.redirect('/listings');
    }

    if (!username || username.trim() === "") {
      req.flash("error", "Username should be valid");
      return res.redirect("/account/personal-info");
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("error", errors.array().map(err => err.msg).join(", "));
      return res.redirect("/account/personal-info");
    }

    // Optional: Check if username already exists for a different user
    const existingUser = await User.findOne({ username: username.trim() });
    if (existingUser && existingUser._id.toString() !== id) {
      req.flash("error", "Username already taken");
      return res.redirect("/account/personal-info");
    }

    user.username = username.trim();
    await user.save();
//  host: "smtp.sendgrid.net",
    // Send email       
    // const mailOptions = {
    //   from: '"AirbnbByRajat" <airbnbbyrajat@gmail.com>',  // SendGrid verified email
    //   to: user.email,
    //   replyTo: "airbnbbyrajat@gmail.com",  
    //   subject: `New message from AirbnbByRajat`,
    //   text: "Username updated successfully",
    // };
    // await transporter.sendMail(mailOptions);

    // Re-login to update session with new username
    req.login(user, (err) => {
      if (err) return next(err);
      req.flash("success", "Username updated successfully");
      return res.redirect("/account/personal-info");
    });
};

module.exports.updateEmail = async (req, res) => {
    const { id } = req.params;
    const { email } = req.body;

    const user = await User.findById(id);

    if (!user) {
        req.flash("error", "Account you requested for doesn't exist");
        return res.redirect('/listings');
    }

    if (!email) {
        req.flash("error", "Email should be valid");
        return res.redirect("/account/personal-info");
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash("error", errors.array().map(err => err.msg).join(", "));
        return res.redirect("/account/personal-info");
    }

    // Optional email uniqueness check
    const existingUser = await User.findOne({ email: email.trim() });
    if (existingUser && existingUser._id.toString() !== id) {
        req.flash("error", "Email already in use");
        return res.redirect("/account/personal-info");
    }

    user.email = email.trim();
    await user.save();

    // const mailOptions = {
    //   from: '"AirbnbByRajat" <airbnbbyrajat@gmail.com>',  // SendGrid verified email
    //   to: user.email,
    //   replyTo: "airbnbbyrajat@gmail.com",  
    //   subject: `New message from AirbnbByRajat`,
    //   text: "Email updated successfully",
    // };
    // await transporter.sendMail(mailOptions);

    req.flash("success", "Email updated successfully");
    return res.redirect("/account/personal-info");
};

module.exports.updatePersonalInfo = async (req, res) => {
    const { id } = req.params;
    const { countryInfo } = req.body;
    const redirectTo = req.get('Referrer') || '/listings';
  
    const user = await User.findById(id);
    if (!user) {
      req.flash("error", "Account you requested for doesn't exist");
      return res.redirect('/listings');
    }
  
    if (!countryInfo) {
      req.flash("error", "No valid field provided for update (Data should be valid)");
      return res.redirect(redirectTo);
    }
  
    const { currency, language, timezone, country, city, region } = countryInfo;
    let updatedField = null;
  
    // Validate and update Language
    if (language) {
      if (!languageList.includes(language.name)) {
        req.flash("error", "Invalid language selected");
        return res.redirect(redirectTo);
      }
      if (!user.countryInfo.language) user.countryInfo.language = {};
      user.countryInfo.language.name = language.name;
      updatedField = "Language";
    }
  
    // Validate and update Currency
    else if (currency) {
      if (!currencyList.includes(currency)) {
        req.flash("error", "Invalid currency selected");
        return res.redirect(redirectTo);
      }
      user.countryInfo.currency = currency;
      updatedField = "Currency";
    }
  
    // Validate and update Timezone
    else if (timezone) {
      if (!timezoneList.includes(timezone)) {
        req.flash("error", "Invalid timezone selected");
        return res.redirect(redirectTo);
      }
      user.countryInfo.timezone = timezone;
      updatedField = "Timezone";
    }
  
    // Validate and update Address
    else if (country && city && region) {
      const hasInvalid = [country, city, region].some(v =>
        !v || v.trim() === "" || v.trim().length !== v.length
      );
      if (hasInvalid) {
        req.flash("error", "Invalid address fields or special characters/spaces are not supported");
        return res.redirect("/account/personal-info");
      }
  
      user.countryInfo.country = country.trim();
      user.countryInfo.city = city.trim();
      user.countryInfo.region = region.trim();
      updatedField = "Address";
    }
  
    // If no valid update field was found
    if (!updatedField) {
      req.flash("error", "No valid field provided for update");
      return res.redirect(redirectTo);
    }
  
    await user.save();

    // const mailOptions = {
    //   from: '"AirbnbByRajat" <airbnbbyrajat@gmail.com>',  // SendGrid verified email
    //   to: user.email,
    //   replyTo: "airbnbbyrajat@gmail.com",  
    //   subject: `New message from AirbnbByRajat`,
    //   text: `${updatedField} updated successfully`,
    // };
    // await transporter.sendMail(mailOptions);

    req.flash("success", `${updatedField} updated successfully`);
    return res.redirect(redirectTo);
}; 


module.exports.showUser = async (req, res)=>{
    let {id} = req.params;
    let user = await User.findById(id);

    if(!user){
        req.flash("error", "Account you requested for doesn't exists");    
        res.redirect(`/listings`);
        return;
    }
    
    let allListings = await Listing.find({owner : id}).populate({path : "reviews", populate : {path : "author"}});

    if(req.user._id.toString() == allListings[0].owner._id.toString()){
      res.redirect(`/listings`);
      return;
    }

    res.render("users/usershow.ejs", {user, allListings, calculateAvgRating});
};


module.exports.addToWishlists = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(req.user._id);
  const listing = await Listing.findById(id);
  const redirectTo = req.get('Referrer') || '/listings';

  if (!user) {
    req.flash('error', 'User not found');
    return res.redirect(redirectTo);
  }

  if (!listing) {
    req.flash('error', 'Listing not found');
    return res.redirect(redirectTo);
  }

  // Check if listing is already in wishlist
  let isInWishlist = user.wishlists.some(w => w._id.toString() === id);

  if (isInWishlist) {
    //  Remove listing from wishlist using $pull
    await User.findByIdAndUpdate(user._id, {
      $pull: { wishlists: id }
    });
    req.flash('success', 'Listing removed from wishlists');
  } else {
    //  Add listing to wishlist using $addToSet (prevents duplicates)
    await User.findByIdAndUpdate(user._id, {
      $addToSet: { wishlists: id }
    });
    req.flash('success', 'Listing added to wishlists');
  }

  res.redirect(redirectTo);
};


module.exports.wishlists = async (req, res)=>{
  const user = await User.findById(req.user._id).populate("wishlists").populate({
    path: "wishlists",
    populate: {
      path: "reviews", // this is the nested populate
    }
  });
  if (!user) {   
    req.flash('error', 'User not found');
    return res.redirect('/my-wishlists');
  }
  res.render("users/mywishlist.ejs",{wishlists : user.wishlists, currencyConverter, calculateAvgRating});
}

module.exports.trips = async (req, res)=>{
  const user = req.user;
  if (!user) {   
    req.flash('error', 'User not found');
    return res.redirect('/my-trips');
  }
  let trips = await Booking.find({guestId : user._id}).populate("listingId").populate("ownerId");
  res.render("users/mytrip.ejs", {trips, currencyConverter, calculateAvgRating});
}

module.exports.myListings = async (req, res)=>{
  const user = req.user;
  if (!user) {   
    req.flash('error', 'User not found');
    return res.redirect('/my-listings');
  }
  let listings = await Listing.find({owner : user._id});
  res.render("users/mylistings.ejs",{listings, currencyConverter, calculateAvgRating});
}

module.exports.listingsReservations = async (req, res)=>{
  const user = req.user;
  if (!user) {   
    req.flash('error', 'User not found');
    return res.redirect('/listings');
  }
  let reservations = await Booking.find({ownerId : user._id}).populate("listingId").populate("guestId");
  res.render("users/listingsreservations.ejs", {reservations, currencyConverter, calculateAvgRating});
}


module.exports.messageHostPage = async (req, res) => {  
  let {id} = req.params;
  const listing = await Listing.findById(id);
  if(!listing){
    req.flash("error", "Listing you requested for doesn't exist");
    return res.redirect("/listings");
  }
  res.render("listings/messagehost.ejs", {listing, currencyConverter});
}


module.exports.messageHost = async (req, res) => {
  const { name, email, message } = req.body;
  const user = await User.findById(req.params.userId);
  const host = await User.findById(req.params.hostId);
  if (!user) {   
    req.flash('error', 'User not found');
    return res.redirect('/listings');
  }
  if (!host){   
    req.flash('error', 'Host not found');
    return res.redirect('/listings');
  }

  // console.log(req.body);
  
  // const mailOptions = {
  //   from: '"AirbnbByRajat" <airbnbbyrajat@gmail.com>',  // SendGrid verified email
  //   to: host.email,
  //   replyTo: email,  
  //   subject: `New message from ${name}`,
  //   text: message,
  // };

  // console.log(mailOptions);  

  try {
    // await transporter.sendMail(mailOptions);  // ✅ should now work

    // Save message
    // const m = await Message.create({
    //   guestName: name,
    //   guestEmail: email,
    //   content: message,
    //   userId: user._id,
    //   hostId: host._id,
    // });
    // Sendgrid limit exceed so i commented this

    host.receivedMessages.push(m);
    user.sentMessages.push(m);
    await host.save();
    await user.save();

    req.flash('success', 'Message sent successfully!');
    res.redirect('/listings');
  } catch (err) {
    console.error('Email send error:', err);
    req.flash('error', 'Failed to send message.');
    res.redirect('/listings');
  }
};


module.exports.changePassword = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("error", errors.array().map(e => e.msg).join(", "));
      return res.redirect('/account/login-security');
    }
  
    const { oldPassword, newPassword } = req.body;
    // console.log({ oldPassword, newPassword });
  
    if (!oldPassword || !newPassword) {
      req.flash("error", "Missing password data");
      return res.redirect('/account/login-security');
    }
  
    const user = await User.findById(req.user._id);

    if (!user) {
      req.flash("error", "User not authenticated");
      return res.redirect('/account/login-security');
    }
  
    // Use callback version to catch incorrect password
    user.changePassword(oldPassword, newPassword, async (err) => {
      if (err) {
        if (err.name === 'IncorrectPasswordError') {
          req.flash("error", "Old password is incorrect");
        } else {
          console.error(err);
          req.flash("error", "An error occurred while changing the password");
        }
        return res.redirect('/account/login-security');
      }
  
      user.passwordUpdatedAt = new Date();
      await user.save();

      // Send email      
      // const mailOptions = {
      //   from: '"AirbnbByRajat" <airbnbbyrajat@gmail.com>',  // SendGrid verified email
      //   to: user.email,
      //   replyTo: "airbnbbyrajat@gmail.com",  
      //   subject: `New message from AirbnbByRajat`,
      //   text: "Password successfully changed",
      // };
      // let { error } = await transporter.sendMail(mailOptions);

      // if(error){
      //   console.error(error);        
      // }
  
      // const now = new Date();
      // const updatedAt = user.updatedAt || now;
      // const diffMs = now - updatedAt;
      // const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
      // let message;
      // if (diffDays === 0) {
      //   message = "Updated now";
      // } else if (diffDays === 1) {
      //   message = "Updated 1 day ago";
      // } else {
      //   message = `Updated ${diffDays} days ago`;
      // }
  
      // req.flash("success", message);
      return res.redirect('/account/login-security');
    });
};
  

module.exports.destroyUser = async (req, res)=>{

    let {id} = req.params;

    let user = await User.findById(id);

    if(!user){
        req.flash("error", "Account you requested for doesn't exists");    
        res.redirect(`/listings`);
        return;
    }

    let listing = await Listing.find({owner : id});
    let booking = await Booking.find({guestId : id});

    if(listing.length > 0){
        req.flash("error", "You can't delete your account when your listings exists (Switch to guest)");    
        res.redirect(`/listings`);
        return;
    }
    if(booking.length > 0){
        req.flash("error", "You can't delete your account when your bookings exists");    
        res.redirect(`/listings`);
        return;
    }

    await User.findByIdAndDelete(id); 

    // const mailOptions = {
    //   from: '"AirbnbByRajat" <airbnbbyrajat@gmail.com>',  // SendGrid verified email
    //   to: user.email,
    //   replyTo: "airbnbbyrajat@gmail.com",  
    //   subject: `New message from AirbnbByRajat`,
    //   text: "Account successfully deleted",
    // };
    // await transporter.sendMail(mailOptions);
    
    req.flash("success", "Account deleted");    
    res.redirect(`/listings`);
};


