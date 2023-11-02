const express = require('express');
const Review = require('../models/reviews');
const Product = require('../models/products');
const router = express.Router();

router.post('/products/:id/review', async (req, res) => {
    const reviewData = req.body.review;
    const { id } = req.params;
    const newReview = new Review(reviewData);
    newReview.author = req.user._id;
    const product = await Product.findById(id);
    product.reviews.push(newReview);
    await newReview.save();
    await product.save();
    req.flash('success', 'Reviewed')
    res.redirect(`/products/${id}`);
});

router.delete('/products/:id/review/:reviewId', async (req, res) => {
    const { id, reviewId } = req.params;
    await Product.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/products/${id}`);
})

module.exports = router;