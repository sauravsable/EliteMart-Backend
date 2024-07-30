const express = require('express');
const {registerUser, loginUser, logout, forgetPassword, resetPassword, getUserDetails, updatePassword, updateUserProfile, getAllUsers, getSingleUser, updateUserRole, deleteUser, addCart, getCarts } = require('../controller/userController');
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

router.route("/create/cart").post(isAuthenticatedUser,addCart);

router.route("/getcarts").get(isAuthenticatedUser,getCarts);

router.route("/password/update").put(isAuthenticatedUser,updatePassword);

router.put("/me/update",upload.single('avatar'),isAuthenticatedUser,updateUserProfile);

router.route("/admin/users").get(isAuthenticatedUser,authorizeRoles("admin"),getAllUsers);

router.route("/admin/user/:id").get(isAuthenticatedUser,authorizeRoles("admin"),getSingleUser)
                               .put(isAuthenticatedUser,authorizeRoles("admin"),updateUserRole)
                               .delete(isAuthenticatedUser,authorizeRoles("admin"),deleteUser);

module.exports = router;