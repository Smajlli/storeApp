const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./reviews');

const ProductSchema = new Schema({
    title: String,
    price: String,
    category: String,
    description: String,
    image: [String],
    author: {
        type: Schema.Types.ObjectId, ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId, ref: 'Review'
        }
    ]
});

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;