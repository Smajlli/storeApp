const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const CartSchema = new Schema({
    productId: String,
    title: String,
    price: String,
    category: String,
    description: String,
    image: [String]
});

const Cart = mongoose.model('Cart', CartSchema);
module.exports = Cart;