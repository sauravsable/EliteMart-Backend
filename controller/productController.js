const Product = require("../models/productModel");
const ApiFeatures = require("../utils/apifeatures");
const ErrorHandler = require("../utils/errorHandler");
const {uploadToS3, deleteFromS3} = require('../utils/uploadToS3');

// Create Product -- Admin
exports.createProduct = async (req, res, next) => {
  // console.log(req.body);
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({ message: "No files uploaded." });
  }

  const imagesLinks = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const uploadResult = await uploadToS3(file);

    if (uploadResult.error) {
      console.error("Error uploading file:", uploadResult.error);
      return res.status(500).json({ message: "Failed to upload image." });
    }

    imagesLinks.push({
      key:uploadResult.key,
      url: uploadResult.imageUrl,

    });
  }

  req.body.images = imagesLinks;
  req.body.user = req.user._id;
  const product = await Product.create(req.body);

  res.status(201).json({
      success:true,
      product
  });
};

// Get Products
exports.getAllProducts = async (req, res) => {
  // return next(new ErrorHandler("Product Not Found",404));

  const resultPerPage = 15;
  const productsCount = await Product.estimatedDocumentCount();

  const apifeature = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter();

  let products = await apifeature.query;

  let filteredProductCount = products.length;

  // products = await apifeature.query;

  // console.log("products data",products);

  res.status(200).json({
    success: true,
    products,
    productsCount,
    resultPerPage,
    filteredProductCount,
  });
};

// Get ALL Products (Admin)
exports.getAdminProducts = async (req, res) => {
  const products = await Product.find();

  res.status(200).json({
    success: true,
    products,
  });
};

// Get Product Details
exports.getProductDetails = async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product Not Found", 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
};

//Update Product -- Admin
exports.updateProduct = async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHander("Product not found", 404));
  }

  for (let i = 0; i < product.images.length; i++) {
    await deleteFromS3(product.images[i].key);
  }

  const files = req.files;
  const imagesLinks = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const uploadResult = await uploadToS3(file);

    if (uploadResult.error) {
      console.error("Error uploading file:", uploadResult.error);
      return res.status(500).json({ message: "Failed to upload image." });
    }

    imagesLinks.push({
      key:uploadResult.key,
      url: uploadResult.imageUrl,

    });
  }

  req.body.images = imagesLinks;

 
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

exports.deleteProduct = async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    res.status(500).json({
      success: false,
      message: "Product Not Found",
    });
  }

  for (let i = 0; i < product.images.length; i++) {
    await deleteFromS3(product.images[i].key);
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: "Product Deleted Successfully",
  });
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
exports.getProductReviews = async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  if (!product) {
    return next(new ErrorHandler("Product Not Found", 404));
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
};

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
        numOfReviews: numOfReviews,
      },
    },
    {
      new: true, // To return the updated document
      runValidators: true, // To run model validators
    }
  );

  if (!updatedProduct) {
    // Handle case where product with given ID is not found
    return res.status(404).json({ error: "Product not found" });
  }

  res.status(200).json({
    success: true,
  });
};

// Get Cameras
exports.getCameras = async (req, res) => {
  try {
    const products = await Product.find({ 
       category: "Camera", 
      _id: { $ne: "66be293f2d936b55b97fca4c" } // Corrected the query for not equal
    });

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};



