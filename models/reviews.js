const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewsSchema = new Schema({
    comment: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId, ref: 'User'
    }
});

const Review = mongoose.model('Review', ReviewsSchema);

module.exports = Review;