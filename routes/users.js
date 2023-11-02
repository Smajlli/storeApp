const express = require('express');
const router = express.Router();
const User = require('../models/users');
const passport = require('passport');
const Product = require('../models/products');
const Cart = require('../models/carts');


router.get('/register', (req, res) => {
    res.render('users/register.ejs');
});

router.post('/register', async(req, res, next) => {
    try{
        const { email, username, password } = req.body.user;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.logIn(registeredUser, function(err) {
            if(err) {
                return next(err);
            } else {
                req.flash('success', 'Registered successfully !');
                res.redirect('/products');
            }
        })
    } catch(e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
})

router.get('/login', (req, res) => {
    res.render('users/login.ejs');
})

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'Welcome back !');
    res.redirect('/products');
})

router.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if(err) {
            return next(err);
        } else {
            req.flash('success', 'Logged out !');
            return res.redirect('/products');
        }
    });
})

router.get('/cart/:id', async(req, res) => {
    const {id} = req.params;
    const user = await User.findById(id).populate('cart');
    res.render('users/cart.ejs', {user} )
})

router.post('/products/:id/addcart', async(req, res) => {
    const {id} = req.params;
    const product = await Product.findById(id);
    const newCart = new Cart({
        productId: `${product._id}`,
        title: `${product.title}`,
        price: `${product.price}`,
        category: `${product.category}`,
        description: `${product.description}`
    });
    for(let i = 0; i < product.image.length; i++) {
        let image = product.image[i];
        newCart.image.push(image);
    }
    const user = await User.findById(req.user._id);
    user.cart.push(newCart);
    await newCart.save();
    await user.save();
    req.flash('success', 'Added to cart');
    res.redirect(`/products/${id}`);
})

router.delete('/cart/:id/product/:productId', async(req, res) => {
    const {id, productId} = req.params;
    await User.findByIdAndUpdate(id, { $pull: { cart: productId } });
    await Cart.findByIdAndDelete(productId);
    req.flash('success','Removed');
    res.redirect(`/cart/${id}`);
}) 

module.exports = router;
