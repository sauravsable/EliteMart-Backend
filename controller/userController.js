const ErrorHandler = require("../utils/errorHandler");
const User = require('../models/userModel');
const sendToken = require("../utils/jwtToken");
const Mail = require("../utils/mail");
const crypto = require("crypto");
const {uploadToS3, deleteFromS3} = require('../utils/uploadToS3');

exports.registerUser = async (req, res, next) => {
    
    const {name,email,password} = req.body;

    const existingUserName = await User.findOne({ name: name });

    if (existingUserName) {
        return res.status(400).json({ success: false, message: 'User Name is not available' });
    }

    
    const existingUserEmail = await User.findOne({ email: email });

    if (existingUserEmail) {
        return res.status(400).json({ success: false, message: 'Email already exists.' });
    }

    const user = await User.create({
        name,
        email,
        password,
    });

    sendToken(user,201,res)
};

// Login User
exports.loginUser = async (req,res,next)=>{

    const {email,password} = req.body;

    if(!email || !password){
        return next(new ErrorHandler("Please Enter Email & Password",400));
    }

    const user = await User.findOne({email}).select("+password");

    if(!user){
        return next(new ErrorHandler("Invalid email or password",401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid email or password",401));
    }

    sendToken(user,200,res);

};

//Logout user

exports.logout =  async(req,res,next)=>{

    res.clearCookie('token');
    
    res.status(200).json({
        success:true,
        message:"Logged out"
    })
};

//Forget Password

exports.forgetPassword = async(req,res,next)=>{
    const {email} = req.body;
    console.log(email);
    
    const user = await User.findOne({email:email});
    console.log(user);

    if(!user){
       return next(new ErrorHandler("User Not Found",404)); 
    }

    //Get ResetPassword Token
    const resetToken = user.getResetPasswordToken();

    await user.save({validateBeforeSave:false});

    const resetPasswordUrl = `${process.env.FRONTEND_URI}/password/reset/${resetToken}`;

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\n If you have not requested this email then 
    Please Ignore it`;

    try{

        Mail.sendMail({
            email:user.email,
            subject:"Ecommerce Password Recovery",
            message
        });

        res.status(200).json({
            success:true,
            message:`Email sent to ${user.email} successfully`
        });
    }
    catch (error){
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({validateBeforeSave:false});

        return next(new ErrorHandler(error.message,500));
    }
};

//Reset Password
exports.resetPassword = async(req,res,next)=>{
    console.log(req.body.password,req.body.confirmPassword);

    // creating token hash
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{$gt:Date.now()}
    });

    if(!user){
        return next(new ErrorHandler("Reset Password Token is Invalid or has been Expired",400)); 
    }

    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler("Password does not match",400)); 
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user,200,res);
};

// Get user detail
exports.getUserDetails = async(req,res,next)=>{

    const user = await User.findById(req.user._id);

    res.status(200).json({
        success:true,
        user
    })
}

// Update user password
exports.updatePassword = async(req,res,next)=>{

    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Old password is Incorrect",400));
    }

    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHandler("password does not match",400));
    }

    user.password = req.body.newPassword;

    await user.save();

    sendToken(user,200,res);
}

exports.updateUserProfile = async (req, res, next) => {
    try {

        const {name,email} = req.body;

        const user = await User.findOne({_id : req.user.id});

        if(user.name != name){
            
            const existingUserName = await User.findOne({ name: name });

            if (existingUserName) {
              return res.status(400).json({ success: false, message: 'User Name is not available' });
            }
        }

        if(user.email != email){
            const existingUserEmail = await User.findOne({ email: email });
    
            if (existingUserEmail) {
             return res.status(400).json({ success: false, message: 'Email already exists.' });
            }
        }

        const newUserData = {
            name: name,
            email: email
        };

        // Update user profile with new data
        const updatedUser = await User.findByIdAndUpdate(req.user._id, newUserData, { new: true });

        res.status(200).json({ success: true});
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


exports.updateProfileImage = async (req, res, next) => {
    try {

        const avatar = req.file;

        let newUserData;
        if (avatar && avatar !== "") {
            const user = await User.findById(req.user._id);

            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            const deletekey = user.avatar.key;

            await deleteFromS3(deletekey);

            const avatar = req.file;
    
            const {key,imageUrl} = await uploadToS3(avatar);

            
            newUserData = {
                avatar: {
                    key: key,
                    url: imageUrl
                }
            };
        }

        // Update user profile with new data
        const updatedUser = await User.findByIdAndUpdate(req.user._id, newUserData, { new: true });

        res.status(200).json({ success: true});
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

//Get All Users (Admin)
exports.getAllUsers = async(req,res,next)=>{

    const users = await User.find();
      
    res.status(200).json({
        success:true,
        users
    })
};  
