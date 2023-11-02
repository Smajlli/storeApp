const express = require('express');
const app = express();
const errorHandler = require('../errorHandler');
const router = express.Router();
const Product = require('../models/products');
const ExpressError = require('../ExpressError');
const { validateProduct } = require('../validateProduct');
const {isLoggedIn} = require('../middleware');
const multer = require('multer'); 
const fs = require('fs');
const Cart = require('../models/carts');
const User = require('../models/users');

app.use(express.urlencoded({extended: true}));

const storageConfig = multer.diskStorage({ 
    destination: (req, file, cb) => {
        cb(null, 'public/uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
 });

 const upload = multer({storage: storageConfig});
 

const validate = (req, res, next) => {
    const validationItem = {
        product: {
            ...req.body.product, image: req.files
        }
    }
    console.log(validationItem);
    const { error } = validateProduct.validate(validationItem);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};


router.get('/products', errorHandler(async (req, res) => {
    const allProducts = await Product.find().populate({ path: 'reviews', populate: { path: 'author' } }).populate('author');
    const category = req.query.category;
    res.render('products/index', { allProducts, category });
}));

router.get('/products/new', isLoggedIn, (req, res) => {
    res.render('products/new')
});

router.post('/products', upload.array('image', 5), validate, errorHandler(async(req, res, next) => {
    const data = req.body.product;
    const newProduct = new Product(data);
    for (let i = 0; i < req.files.length; i++) {
        let imgName = 'uploads/' + req.files[i].filename;
        newProduct.image.push(imgName);
    }
    newProduct.author = req.user._id;
    await newProduct.save();
    req.flash('success', 'Successfully made a new product !');
    res.redirect('products');
}));

router.get('/products/:id', errorHandler(async (req, res) => {
    const { id } = req.params;
    const singleProduct = await Product.findById(id).populate({ path: 'reviews', populate: { path: 'author' } }).populate('author');
    if(!singleProduct) {
        next(new ExpressError('Cannot find the product :(', 404));
        return;
    }
    res.render('products/show', { singleProduct });
}));

router.get('/products/:id/edit', errorHandler(async(req, res) => {
    const { id } = req.params;
    const foundProduct = await Product.findById(id);
    res.render('products/edit', { foundProduct })
}));


router.put('/products/:id', upload.array('image', 5), validate, errorHandler(async(req, res) => {
    const { id } = req.params;
    const foundProduct = await Product.findById(id);
    for (let i = 0; i < req.files.length; i++) {
        let imgName = 'uploads/' + req.files[i].filename;
        foundProduct.image.push(imgName);
    }
    await foundProduct.save();
    const data = req.body.product;
    const editProduct = await Product.findByIdAndUpdate(id, data);
    await editProduct.save();
    req.flash('success', 'Successfully edited a product !');
    res.redirect(`/products/${editProduct._id}`);
}));


router.delete('/products/:id', errorHandler(async(req, res) => {
    const { id } = req.params;
    const foundProduct = await Product.findById(id);
    if(foundProduct.image.length) {
        for (let i = 0; i < foundProduct.image.length; i++) {
            let imgPath = 'public/' + foundProduct.image[i];
            fs.unlink(imgPath, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Image removed !', imgPath);
                }
            })
        }
    }
    const users = await User.find();
    for(let i = 0; i < users.length; i++) {
        let userData = await users[i].populate('cart');
        let userCart = users[i].cart;
        if(userCart.length) {
            for(let y = 0; y < userCart.length; y++) {
                let userCartProductId = userCart[y].productId;
                if(userCartProductId == id) {
                    const cartProductId = userData.cart[y]._id;
                    await User.findByIdAndUpdate( userData._id, { $pull: { cart: cartProductId } } ); 
                }
            }
        }
    } 
    await Cart.findByIdAndDelete(id);
    await Product.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted a product !');
    res.redirect('/products');
}));



module.exports = router;