var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('mongodb://<dbuser>:<dbpassword>@<server>:<port>/<database>');

router.get('/add', function (req, res, next) {
    res.render('addauthor', { 
        "title": "Add Autor"
    });    
});

router.post('/add', function (req, res, next) {
    // get form values
    var name = req.body.name;
    
    // Form Validation
    req.checkBody('name', 'Nome é obrigatório').notEmpty();

    // Check for errors
    var errors = req.validationErrors();
    if(errors){
        res.render('addauthor', { 
            "title": "Add Autor" 
        });
    }else{
        var author = db.get('author');
        
        author.insert({
            'name' : name
        }, function (err, post) {
            if(err){
                res.send('There was an issue submitting the post');
            }else{
                // Success Message
                req.flash('Success', 'Autor incluido com sucesso.');
                res.location('/');
                res.redirect('/');
            }

        });
    }
});

router.get('/show/:author', function (req, res, next) {
    var db = req.db;
    var posts = db.get('posts');
    posts.find({ 'author':req.params.author }, {}, function (err, posts) {
        res.render('index', { 
            "title": req.params.author,
            "posts": posts
        });        
    });
});

module.exports = router;

