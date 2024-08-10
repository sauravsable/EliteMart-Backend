require('dotenv').config();
const express = require('express');
const session  =require('express-session');
const cookieParser = require('cookie-parser');
const cors = require("cors");
const logger = require("./logger");
const morgan = require ("morgan");
const connectDataBase = require('./database');
const PORT = process.env.PORT || 5500;
const emailQueue = require('./utils/bullmq');

const errorMiddleWare = require('./middleware/error');

const app = express();

app.use(cors({ 
    origin: ["http://localhost:3000","https://elite-mart-nine.vercel.app"], 
    // origin: true,
    credentials: true,
}));

app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 5 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure : true
    }
}));

app.use(cookieParser());

connectDataBase();


const morganFormat = ':method :url :status :response-time ms';

app.use(morgan(morganFormat, { stream: logger.stream }));

// Middleware for handling errors
app.use(logger.errorLogger);

app.get('/',(req,res)=>{
res.send("server is running");    
})

// Routes
const productRoute = require('./routes/productRoute');
const userRoute = require('./routes/userRoute');
const orderRoute = require('./routes/orderRoute');
const paymentRoute = require('./routes/paymentRoute');
const adminRoute = require('./routes/adminRoute');
const cartRoute =  require('./routes/cartRoute');

app.use('/api/v1',productRoute);
app.use('/api/v1',userRoute);
app.use('/api/v1',orderRoute);
app.use("/api/v1",paymentRoute);
app.use("/api/v1",adminRoute);
app.use("/api/v1",cartRoute);

//Middleware for error
app.use(errorMiddleWare);


app.listen(PORT,()=>{
    console.log(`server is running on ${PORT}`);
});
