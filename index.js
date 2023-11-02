const express = require('express');
const app = express();
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const path = require('path');
const ExpressError = require('./ExpressError');
const reviews = require('./routes/reviews');
const User = require('./models/users');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const products = require('./routes/products');
const session = require('express-session');
const flash = require('connect-flash');
const users = require('./routes/users');


mongoose.connect('mongodb://localhost:27017/amerStore', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error:"));
db.once("open", () => {
    console.log("DATABASE CONNECTED");
});

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('uploads'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const sessionOpt = {
    secret: 'thisshouldbeasecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionOpt));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    //console.log(req.user); 
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('', products);
app.use('', reviews);
app.use('', users);

app.get('/home', (req, res) => {
    res.render('products/home.ejs')
});


app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404));
}) 

app.use((err, req, res, next) => {
    const { status = '500' } = err;
    if (!err.message) err.message = 'Oh boi, something went wrong :('
    res.status(500).render('error.ejs', { err })
})

app.listen(3000, () => {
    console.log('RUNNING ON PORT 3000');
})
