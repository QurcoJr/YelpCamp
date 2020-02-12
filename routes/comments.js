var express = require('express');
var router = express.Router({
    mergeParams: true
});
var Campground = require('../models/campground');
var Comment = require('../models/comment');
var middleware = require('../middleware');


// comments new
router.get('/new', middleware.isLoggedIn, function (req, res) {
    // find campgrounds by id
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            console.log(err);
        } else {
            console.log(campground._id);
            res.render('comments/new', {
                campground: campground
            });
        }
    });
});

// comments new
router.post('/', middleware.isLoggedIn, function (req, res) {
    // lookup campgrounds usin ID
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            console.log(err);
            res.redirect('/campgrounds');
        } else {
            Comment.create(req.body.comment, function (err, comment) {
                if (err) {
                    req.flash('error', 'Something went wrong');
                } else {
                    // add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    // save comment
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    req.flash('success', 'Successfuly added comment');
                    res.redirect('/campgrounds/' + campground._id);
                }
            });
        }
    });
    // create new comment
    // connect new comment to campground
    // redirect to campground show page
});

// COMMENTS EDIT
router.get('/:comment_id/edit', middleware.checkCommentOwnership, function (req, res) {
    Campground.findById(req.params.id, function (err, foundCampground) {
        if (err || !foundCampground) {
            req.flash('error', 'Campground not found');
            return res.redirect('back');
        }
        Comment.findById(req.params.comment_id, function (err, foundComment) {
            if (err) {
                res.redirect("back");
            } else {
                res.render("comments/edit", {
                    campground_id: req.params.id,
                    comment: foundComment
                });
            }
        });
    });
});

// COMMENTS UPDATE
router.put('/:comment_id', middleware.checkCommentOwnership, function (req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, updatedComment) {
        if (err) {
            res.redirect("back");
        } else {
            req.flash('success', 'Comment edited');
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

// COMMENTS DESTROY
router.delete('/:comment_id', middleware.checkCommentOwnership, function (req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function (err) {
        if (err) {
            res.redirect("back");
        } else {
            req.flash('success', 'Comment deleted');
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

module.exports = router;