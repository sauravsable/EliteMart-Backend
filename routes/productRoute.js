const express = require("express");
const { 
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductDetails,
    createProductReview,
    getProductReviews,
    deleteReview,
    getAdminProducts,
    } = require("../controller/productController");
    
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const multer = require('multer');
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.route('/products').get(getAllProducts);

router.route("/admin/products").get(isAuthenticatedUser,authorizeRoles("admin"),getAdminProducts);

router.post('/admin/product/new',upload.array('images', 5), isAuthenticatedUser, authorizeRoles("admin"), createProduct);

router.route('/admin/product/:id').delete(isAuthenticatedUser, authorizeRoles("admin"), deleteProduct)
                                  .get(getProductDetails);                                  
                    
                  
router.put('/admin/product/:id',upload.array('images', 5),isAuthenticatedUser, authorizeRoles("admin"), updateProduct);                                 

router.route('/product/:id').get(getProductDetails);

router.route("/review").put(isAuthenticatedUser,createProductReview);

router.route("/reviews").get(getProductReviews)
                        .delete(isAuthenticatedUser,deleteReview);



module.exports = router;
