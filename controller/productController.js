const Product = require ("../models/productModel");
const ApiFeatures = require("../utils/apifeatures");
const ErrorHandler = require("../utils/errorHandler");
const uploadToCloudinary = require("../utils/uploadToCloudinary");
const cloudinary = require("cloudinary").v2;

// Create Product -- Admin
exports.createProduct = async (req,res,next) =>{
  // console.log(req.body);
    let images = [];

    if (typeof req.body.images === "string") {
      images.push(req.body.images);
    } else {
      images = req.body.images;
    }
  
    const imagesLinks = [];
  
    for (let i = 0; i < images.length; i++) {
      const result = await uploadToCloudinary(images[i]);
  
      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }
  
    req.body.images = imagesLinks;
    req.body.user = req.user._id;
    const product = await Product.create(req.body);

    res.status(201).json({
        success:true,
        product
    });
}

// Get Products 
exports.getAllProducts = async (req,res)=>{

    // return next(new ErrorHandler("Product Not Found",404));

    const resultPerPage = 15;
    const productsCount = await Product.estimatedDocumentCount();

    const apifeature = new ApiFeatures(Product.find(),req.query).search().filter();

    let products = await apifeature.query; 

    let filteredProductCount = products.length;

    // products = await apifeature.query;


    // console.log("products data",products);

    res.status(200).json({
        success:true,
        products,
        productsCount,
        resultPerPage,
        filteredProductCount
    });
}


// Get ALL Products (Admin)
exports.getAdminProducts = async (req,res)=>{

    const products = await Product.find();

    res.status(200).json({
        success:true,
        products,
    });
}

// Get Product Details
exports.getProductDetails = async (req,res,next)=>{

    let product = await Product.findById(req.params.id);

    if(!product){
      return next(new ErrorHandler("Product Not Found",404));
    }

    res.status(200).json({
        success:true,
        product
    })

}

//Update Product -- Admin
exports.updateProduct = async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHander("Product not found", 404));
  }

  // Images Start Here
  let images = [];

  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  if (images !== undefined) {
    // Deleting Images From Cloudinary
    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    const imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "products",
      });

      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    req.body.images = imagesLinks;
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    product,
  });
};

// Delete Product -- Admin

exports.deleteProduct = async(req,res,next)=>{

    let product = await Product.findById(req.params.id);

    if(!product){
        res.status(500).json({
            success:false,
            message:"Product Not Found"
        })
    }

    for (let i = 0; i < product.images.length; i++) {
        await cloudinary.uploader.destroy(product.images[i].public_id); 
    }

    await product.deleteOne(); 

    res.status(200).json({
        success:true,
        message:"Product Deleted Successfully"
    })

};

// Create New Review or Update the review
exports.createProductReview = async (req, res, next) => {
    const { rating, comment, productId } = req.body;
  
    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };
  
    const product = await Product.findById(productId);
  
    const isReviewed = product.reviews.find(
      (rev) => rev.user.toString() === req.user._id.toString()
    );
  
    if (isReviewed) {
      product.reviews.forEach((rev) => {
        if (rev.user.toString() === req.user._id.toString())
          (rev.rating = rating), (rev.comment = comment);
      });
    } else {
      product.reviews.push(review);
      product.numOfReviews = product.reviews.length;
    }
  
    let avg = 0;
  
    product.reviews.forEach((rev) => {
      avg += rev.rating;
    });
  
    product.ratings = avg / product.reviews.length;
  
    await product.save({ validateBeforeSave: false });
  
    res.status(200).json({
      success: true,
    });
  };

// Get All Reviews of a Single Product
exports.getProductReviews = async(req,res,next)=>{

    const product = await Product.findById(req.query.id);

    if(!product){
        return next(new ErrorHandler("Product Not Found",404));
    }

    res.status(200).json({
        success:true,
        reviews:product.reviews
    })
}

// Delete Review
exports.deleteReview = async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHander("Product not found", 404));
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let avg = 0;

  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  let ratings = 0;

  if (reviews.length === 0) {
    ratings = 0;
  } else {
    ratings = avg / reviews.length;
  }

  const numOfReviews = reviews.length;

  const updatedProduct = await Product.findOneAndUpdate(
    { _id: req.query.productId }, // Filter criteria (assuming productId is the identifier)
    {
        $set: {
            reviews: reviews,
            ratings: ratings,
            numOfReviews: numOfReviews
        }
    },
    {
        new: true, // To return the updated document
        runValidators: true // To run model validators
    }
);

if (!updatedProduct) {
  // Handle case where product with given ID is not found
  return res.status(404).json({ error: 'Product not found' });
}

  res.status(200).json({
    success: true,
  });
};