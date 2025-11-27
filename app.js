if(process.env.NODE_ENV != "production"){
    require('dotenv').config()
}

const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require('ejs-mate');
const methodOverride = require("method-override");
const ExpressError = require("./utils/expressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const cookieParser = require("cookie-parser");
const falsh = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const Razorpay = require('razorpay');
const nodemailer = require('nodemailer');

module.exports.instance = new Razorpay({
    key_id: process.env.RZR_KEY_ID,
    key_secret: process.env.RZR_KEY_SECRET,
});

module.exports.transporter = nodemailer.createTransport({
    service: "SendGrid",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const bookingRouter = require("./routes/booking.js");

app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = process.env.DB_NAME;

main()
.then(()=>{
    console.log("Connected to database");
}).catch(err => console.log(`Database Error - ${err}`));

async function main() {
  await mongoose.connect(`${MONGO_URL}${DB_NAME}`);
};

const store = MongoStore.create({
    mongoUrl : MONGO_URL,
    dbName : DB_NAME,
    // crypto : {
    //     secret : process.env.SESSION_SECRET,
    // },
    touchAfter : 24 * 60 * 60,
});


const sessionOption = {
    store, 
    secret : process.env.SESSION_SECRET,
    resave : false,
    saveUninitialized : true,    
    cookie : {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true,
    },
};

app.use(cookieParser());
app.use(session(sessionOption));
app.use(falsh());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/listings/:id/book", bookingRouter);
app.use("/", userRouter);

app.get("/debug/session", (req, res) => {
    res.send({
      sessionTimestamp: req.session.passwordTimestamp,
      userTimestamp: req.user?.passwordUpdatedAt,
    });
  });

// middleware
app.use("*", (req, res, next) => {          
    // next(new ExpressError(404, "Page not found"));
    return res.render("lostPage")
});

// error handler
app.use((err, req, res, next)=> {
    let {statusCode = 500, message = "Something went wrong"} = err;
    return res.status(statusCode).render("error.ejs", {err});  
});

app.listen(port, () => {
    console.log(`Server is listenig to port : ${port}`);    
});