const express = require('express');
const {addCart,getCarts, getCartDetails, sendInvitation, removeUserFromCart, addProductToCart, removeProductFromCart, acceptInvitation, cancelInvitation} = require('../controller/cartController');
const {isAuthenticatedUser} = require('../middleware/auth');
const router = express.Router();

router.route("/create/cart").post(isAuthenticatedUser,addCart);

router.route("/getcarts").get(isAuthenticatedUser,getCarts);

router.route("/getcartDetails/:id").get(isAuthenticatedUser,getCartDetails);

router.route("/send-cart-invitation").post(isAuthenticatedUser,sendInvitation);

router.route("/remove-cart-member").post(isAuthenticatedUser,removeUserFromCart);

router.route("/add-product-to-cart").post(isAuthenticatedUser,addProductToCart);

router.route("/remove-product-from-cart").post(isAuthenticatedUser,removeProductFromCart);

router.route("/accept-invitation").post(acceptInvitation);

router.route("/reject-invitation").post(cancelInvitation);

module.exports = router;