const ErrorHandler = require("../utils/errorHandler");
const User = require('../models/userModel');

//Get Single Users (Admin)
exports.getSingleUser = async(req,res,next)=>{

    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler(`User Does not Exist with id: ${req.params.id}`,400));
    }

    res.status(200).json({
        success:true,
        user
    })
};


// Update user Role (Admin)
exports.updateUserRole = async(req,res,next)=>{

    const newUserData = {
        name:req.body.name,
        email:req.body.email,
        role:req.body.role
    };

    const user = await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:true
    });

    res.status(200).json({
        success:true
    });
};


// Update user Profile (Admin)
exports.deleteUser = async(req,res,next)=>{

    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler(`User Does not Exist with id: ${req.params.id}`,400));
    }

    await user.remove();

    res.status(200).json({
        success:true,
        message:"User Deleted Successfully"
    });
};