const express = require('express');
const {getSingleUser, updateUserRole, deleteUser} = require('../controller/adminController');
const {isAuthenticatedUser, authorizeRoles} = require('../middleware/auth');
const router = express.Router();


router.route("/admin/user/:id").get(isAuthenticatedUser,authorizeRoles("admin"),getSingleUser)
                               .put(isAuthenticatedUser,authorizeRoles("admin"),updateUserRole)
                               .delete(isAuthenticatedUser,authorizeRoles("admin"),deleteUser);

module.exports = router;