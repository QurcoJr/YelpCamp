var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var Campground = require('../models/campground');
var middleware = require('../middleware');

// root route
router.get('/', function (req, res) {
    res.render('landing');
});

// show register form
router.get("/register", function (req, res) {
    res.render("register", {
        page: 'register'
    });
});

//handle sign up logic
router.post("/register", function (req, res) {
    var newUser = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        avatar: req.body.avatar,
        about: req.body.about
    });
    if (req.body.adminCode === 'secret123') {
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            return res.render("register", {
                error: err.message
            });
        }
        passport.authenticate("local")(req, res, function () {
            req.flash("success", "Successfully Signed Up! Nice to meet you " + req.body.username);
            res.redirect("/campgrounds");
        });
    });
});

//show login form
router.get("/login", function (req, res) {
    res.render("login", {
        page: 'login'
    });
});
// handle login logic
router.post('/login', passport.authenticate('local', {
    successRedirect: '/campgrounds',
    failureRedirect: '/login',
    failureFlash: true,
    successFlash: 'Welcome to YelpCamp!'
}), function (req, res) {});

// logut route
router.get('/logout', function (req, res) {
    req.logout();
    req.flash('success', 'Logged you out!');
    res.redirect('/campgrounds');
});

router.get('/', function (req, res) {
    res.render('landing');
});

// USER PROFILE
router.get('/users/:id', function (req, res) {
    User.findById(req.params.id, function (err, foundUser) {
        if (err) {
            req.flash('error', 'Something went wrong.');
            return res.redirect("/");
        }
        Campground.find().where('author.id').equals(foundUser._id).exec(function (err, campgrounds) {
            if (err) {
                req.flash('error', 'Something went wrong.');
                return res.redirect("/");
            }
            res.render('users/show', {
                user: foundUser,
                campgrounds: campgrounds
            });
        })
    });
});


// EDIT USER
router.get('/users/:id/edit', middleware.checkUser, function (req, res) {
    User.findById(req.params.id, function (err, foundUser) {
        if (err) {
            req.flash('error', 'something went wrong');
        } else {
            res.render('users/edit', { user: foundUser });
        }
    });
});

// UPDATE User info
router.put('/users/:id', middleware.checkUser, function (req, res) {
    // find and update the correct user
    User.findByIdAndUpdate(req.params.id, req.body.user, function (err, updatedUser) {
        console.log(updatedUser);
        if (err) {
            req.flash('error', 'Something went wrong')
        } else {
            // redirect to user page
            req.flash('success', 'Personal info edited');
            res.redirect('/users/' + req.params.id);
        }
    });
});



// =========================
// AUTH ROUTES
// =========================

router.get('/register', function (req, res) {
    res.render('register');
});

// Handle sign up logic
router.post('/register', function (req, res) {
    var newUser = new User({
        username: req.body.username
    });
    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            return res.render('register');
        }
        passport.authenticate('local')(req, res, function () {
            res.redirect('/campgrounds');
        });
    });
});

// Show login form
router.get('/login', function (req, res) {
    res.render('login');
});
// handle login logic
router.post('/login', passport.authenticate('local', {
    successRedirect: '/campgrounds',
    failureRedirect: '/login'
}), function (req, res) {});

// logut rote
router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/campgrounds');
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

module.exports = router;