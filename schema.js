const Joi = require('joi');
const {currencyConverter} = require("./common.js");

// const axios = require("axios");

async function getUserCurrency(req) {
  // 1. Use stored user profile currency
  if (req.user?.countryInfo?.currency) {
    return req.user.countryInfo.currency;
  }

  // 2. Try to detect from IP
//   try {
//     const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
//     const response = await axios.get(`https://ipapi.co/${ip}/json/`);
//     return response.data.currency || "INR";
//   } catch (err) {
//     console.error("IP lookup failed:", err.message);
//     return "INR";
//   }
}

function generateListingSchema(currency = "INR") {

  const minPriceINR = 1000;
  const maxPriceINR = 25000;

  const minConverted = Number(currencyConverter(minPriceINR, "INR", currency).replace(/[^\d.]/g, ''))
  const maxConverted = Number(currencyConverter(maxPriceINR, "INR", currency).replace(/[^\d.]/g, ''));

  console.log("schema min -> ",minConverted);
  console.log("schema max -> ",maxConverted);
  
  
  return Joi.object({
    listing: Joi.object({
      title: Joi.string().trim().min(10).max(36).required(),
      description: Joi.string().trim().min(50).max(200).required(),
      location: Joi.string().trim().required(),
      country: Joi.string().trim().required(),
      currency: Joi.string().trim().required(),
      price: Joi.number().min(minConverted).max(maxConverted).required(),
      images: Joi.array().allow("", null),
      houseType: Joi.string().trim().required(),
      privacyType: Joi.string().trim().required(),
      amenities: Joi.object().allow("", null),
      aboutPlace: Joi.object().required(),
      houseRules: Joi.object().required(),
      housePolicy: Joi.object().required(),
    }).required()
  });
}

module.exports = {
  getUserCurrency,
  generateListingSchema
};




// module.exports.listingSchema = Joi.object({
//     listing : Joi.object({
//         title : Joi.string().required().min(10).max(36),
//         description : Joi.string().required().min(50).max(200),
//         location : Joi.string().required(),
//         country : Joi.string().required(),
//         price : Joi.number().required().min(minV).max(maxV),
//         images : Joi.array().allow("", null),
//         houseType : Joi.string().required(),
//         privacyType : Joi.string().required(),
//         amenities : Joi.object().allow("", null),        
//         // keys({
//         //     bathroom : Joi.array().allow(""),
//         //     homesafty : Joi.array().allow(""),
//         //     entertainment : Joi.array().allow(""),
//         //     kitchen : Joi.array().allow(""),
//         //     bedroom : Joi.array().allow(""),
//         //     internet : Joi.array().allow(""),
//         //     outdoor : Joi.array().allow(""),
//         // })
//         aboutPlace : Joi.object().required(),
//         houseRules : Joi.object().required(),
//         housePolicy : Joi.object().required(),
//     }).required()
// });


module.exports.reviewSchema = Joi.object({
    review : Joi.object({
        rating : Joi.number().required().min(1).max(5),
        comment : Joi.string().trim().required().min(1),
    }).required()
});

module.exports.bookingSchema = Joi.object({
  booked : Joi.object({   
    guests : Joi.object({
      adults : Joi.number().min(0).max(25),
      childrens : Joi.number().min(0).max(25),
    }).required(),
    pets : Joi.number().min(0).max(5).required(),
    infants : Joi.number().min(0).max(5).required(),
    totalAmount : Joi.string().required(),
    isPaid : Joi.boolean().required(),
    stayDays : Joi.number().min(1).max(730).required(),
    checkIn : Joi.string().required(),
    checkOut : Joi.string().required(),
  })
});


// module.exports.userSchema = Joi.object({
//   user : Joi.object({
//     email : Joi.string().required(),
//     username : Joi.string().min(3).max(25).required(),    
//     phoneNo : Joi.number().min(10).max(10),
//     listings : Joi.array().allow(""),
//     wishlists : Joi.array().allow(""),
//     trips : Joi.array().allow(""),
//     receivedMessages : Joi.array().allow(""),
//     sentMessages : Joi.array().allow(""),
//     listingsReservations : Joi.array().allow(""),
//     profileImg : Joi.string().allow(""),
//     statusType : Joi.string().required(),
//     countryInfo : Joi.object({
//       country : Joi.string().required(),
//       countryCapital : Joi.string().required(),
//       city : Joi.string().required(),
//       region : Joi.string().required(),
//       currency : Joi.string().required(),
//       language : Joi.object({
//         name : Joi.string(),
//         locale : Joi.string(),
//       }).required(),
//       callingCode : Joi.string().required(),
//       currencyName : Joi.string().required(),
//       timezone : Joi.string(),
//     }).required(),
//   about : {
//     dob : Joi.number().min(0).max(20),
//     pets : Joi.string().min(0).max(40),
//     liveAt : Joi.string().min(0).max(25),
//     school : Joi.string().min(0).max(40),
//     work : Joi.string().min(0).max(20),
//     intro : Joi.string().min(0).max(250),
//     languages : Joi.array().allow(""),
//     interests : Joi.array().allow(""),
//  },
//   })
// })


// mhuje user k liy bhi validate krna h and booking k liy bhi