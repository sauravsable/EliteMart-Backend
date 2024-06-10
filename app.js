require('dotenv').config();
const express = require('express');
const bodyParser = require("body-parser")
const session  =require('express-session');
const cookieParser = require('cookie-parser');
const fileUpload = require("express-fileupload");
const cors = require("cors");

const cloudinary =  require("cloudinary");
const connectDataBase = require('./database');

const PORT = process.env.PORT || 5500;

const errorMiddleWare = require('./middleware/error');

const app = express();

app.use(cors({ origin: "https://elite-mart-nine.vercel.app", credentials: true }));
app.use(express.json());
app.use(bodyParser.urlencoded({extended : false}));
app.use(fileUpload());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 5 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
}));

app.use(cookieParser());

//Middleware for error
app.use(errorMiddleWare);


connectDataBase();

cloudinary.config({
    cloud_name : process.env.CLOUDINARY_NAME,
    api_key : process.env.CLOUDINARY_API_KEY ,
    api_secret : process.env.CLOUDINARY_API_SECRET,
})

app.get('/',(req,res)=>{
res.send("server is running");    
})

// Routes
const productRoute = require('./routes/productRoute');
const userRoute = require('./routes/userRoute');
const orderRoute = require('./routes/orderRoute');
const paymentRoute = require('./routes/paymentRoute');

app.use('/api/v1',productRoute);
app.use('/api/v1',userRoute);
app.use('/api/v1',orderRoute);
app.use("/api/v1",paymentRoute);

app.listen(PORT,()=>{
    console.log(`server is running on ${PORT}`);
});
