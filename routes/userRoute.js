const express = require('express');
const {registerUser, loginUser, logout, forgetPassword, resetPassword, getUserDetails, updatePassword, updateUserProfile, updateProfileImage,getAllUsers } = require('../controller/userController');
const {isAuthenticatedUser, authorizeRoles} = require('../middleware/auth');
const multer = require('multer');
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({storage:storage});

router.post("/register",upload.single('avatar'),registerUser);

router.route("/login").post(loginUser);

router.route("/password/forgot").post(forgetPassword);

router.route("/password/reset/:token").put(resetPassword);

router.route("/logout").get(logout);

router.route("/me").get(isAuthenticatedUser,getUserDetails);

router.route("/password/update").put(isAuthenticatedUser,updatePassword);

router.put("/me/update",isAuthenticatedUser,updateUserProfile);

router.put("/me/updateProfileImage",upload.single('avatar'),isAuthenticatedUser,updateProfileImage);

router.route("/admin/users").get(isAuthenticatedUser,getAllUsers);

module.exports = router;