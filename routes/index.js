var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('mongodb://<dbuser>:<dbpassword>@<server>:<port>/<database>');

/* Home page blog posts. */
router.get('/', function(req, res, next) {
    var db = req.db;
    var posts = db.get('posts');
    posts.find({},{},function (err, posts) {
        console.log(posts);
        console.log(err);
        res.render('index', {
            "posts": posts
        });
    });
});

module.exports = router;
