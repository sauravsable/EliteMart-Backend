require('dotenv').config();
const express = require('express');
const session  =require('express-session');
const cookieParser = require('cookie-parser');
const cors = require("cors");

const connectDataBase = require('./database');

const PORT = process.env.PORT || 5500;

const errorMiddleWare = require('./middleware/error');

const app = express();

app.use(cors({ 
    origin: "https://elite-mart-nine.vercel.app", 
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

//Middleware for error
app.use(errorMiddleWare);


connectDataBase();


app.get('/',(req,res)=>{
res.send("server is running");    
})

app.get('/api/v1/checkToken', (req, res) => {
    const { token } = req.cookies;

    if (!token) {
        return res.json({ isToken: false });
    }

    try {
        jwt.verify(token, process.env.JWT_SECRET);
        return res.json({ isToken: true });
    } catch (error) {
        return res.json({ isToken: false });
    }
});

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
