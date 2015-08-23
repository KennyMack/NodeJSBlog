var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('mongodb://<dbuser>:<dbpassword>@<server>:<port>/<database>');

router.get('/add', function (req, res, next) {
    res.render('addcategories', { 
        "title": "Add Categoria",
        "titlecat": ""
    });
});

router.get('/show/:category', function (req, res, next) {
    var db = req.db;
    var posts = db.get('posts');
    posts.find({ 'category':req.params.category }, {}, function (err, posts) {
        res.render('index', { 
            "title": req.params.category,
            "posts": posts
        });        
    });
});

router.post('/add', function (req, res, next) {
    // get form values
    var title = req.body.title;

    req.checkBody('title', 'Title field is required').notEmpty();
    // Check for errors
    var errors = req.validationErrors();
    if(errors){
        res.render('addcategories', { 
            "errors": errors,
            "title": "Add Categories", 
            "titlecat" : title
        });
    }else{
        var categories = db.get('categories')
        
        categories.insert({
            'title' : title           
        }, function (err, post) {
            if(err){
                res.send('There was an issue submitting the post');
            }else{
                // Sucess Message
                req.flash('Success', 'Categoria incluida com sucesso.');
                res.location('/');
                res.redirect('/');
            }

        });
    }
});

module.exports = router;