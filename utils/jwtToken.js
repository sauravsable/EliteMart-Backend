// Creating Token and Saving it into the Cookie

const sendToken = (user,statusCode,res)=>{

    const token = user.getJWTToken();

    // options for cookie
    const options = {
        maxAge: process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
        httpOnly: true
    };

    res.status(statusCode).cookie('token', token,options).json({
        success: true,
        user,
        token
    });
    
};

module.exports = sendToken;