var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('mongodb://<dbuser>:<dbpassword>@<server>:<port>/<database>');


router.get('/add', function (req, res, next) {
    var categories = db.get('categories');
    var authors = db.get('author');

    categories.find({},{}, function (err, categories){
        authors.find({}, {}, function (err, authors){
            res.render('addpost', { 
                "title": "Add Post", 
                "categories": categories,
                "titlepost": "",
                "bodypost": "",
                "authors": authors,
                "author": "",
                "categorysel": ""
            }); 
        });        
    });
    
});

router.get('/show/:id', function (req, res, next) {
    var db = req.db;
    var posts = db.get('posts');
    //try {
        posts.findById(req.params.id, function (err, post) {
            res.render('show', { 
                "post": post
            });        
        });
   /* } catch (error) {
        res.status(404);



        // respond with html page
        if (req.accepts('html')) {
          res.render('error', { url: req.url , "message": "Not found"});
          return;
        }

        // respond with json
        if (req.accepts('json')) {
          res.send({ error: 'Not found' });
          return;
        }

        // default to plain-text. send()
        res.type('txt').send('Not found');
    }*/
});


router.post('/add', function (req, res, next) {
    // get form values
    var title = req.body.title;
    var category = req.body.category;
    var body = req.body.body;
    var author = req.body.author;
    var date = new Date();

    

    if (req.files.mainimage){
        console.log('uploading file...');

        var mainimageOriginalName = req.files.mainimage.originalname;
        var mainimageName = req.files.mainimage.name;
        var mainimageMime = req.files.mainimage.mimetype;
        var mainimagePath = req.files.mainimage.path;
        var mainimageExt = req.files.mainimage.extension;
        var mainimageSize = req.files.mainimage.size;
    } else {
        console.log('default image...');
        var mainimageName = 'noimage.png';
    }

    // Form Validation
    req.checkBody('title', 'Titulo é obrigatório').notEmpty();
    req.checkBody('category', 'Categoria é obrigatório').notEmpty();
    req.checkBody('author', 'Autor é obrigatório').notEmpty();    
    req.checkBody('body', 'Post é obrigatório').notEmpty();

    // Check for errors
    var errors = req.validationErrors();
    if(errors){
        var categories = db.get('categories');

        categories.find({},{}, function (err, categories){
            res.render('addpost', { 
                "errors": errors,
                "title": "Add Post", 
                "titlepost" : title,
                "categories": categories,
                "categorysel" : category,
                "author" : author,
                "bodypost" : body,
                "mainimagename": mainimageOriginalName
            });
        });

    }else{
        var posts = db.get('posts');
        
        posts.insert({
            'title' : title,
            'body' : body,
            'category' : category,
            'date': date,
            'author' : author,            
            'mainimage': mainimageName            
        }, function (err, post) {
            if(err){
                res.send('There was an issue submitting the post');
            }else{
                // Success Message
                req.flash('Success', 'Post Incluido com sucesso.');
                res.location('/');
                res.redirect('/');
            }

        });
    }
});


router.post('/addcomment', function (req, res, next) {
    // get form values
    var name = req.body.name;
    var email = req.body.email;
    var body = req.body.body;
    var postid = req.body.postid;
    var commentdate = new Date();   


    // Form Validation
    req.checkBody('name', 'Nome é obrigatório').notEmpty();
    req.checkBody('body', 'Comentario é obrigatório').notEmpty();
    req.checkBody('postid', 'Postid é obrigatório').notEmpty();    
    req.checkBody('email', 'E-mail é obrigatório').notEmpty();
    req.checkBody('email', 'E-mail não é valido').isEmail();

    // Check for errors
    var errors = req.validationErrors();
    if(errors){
        var posts = db.get('posts');

        posts.findById(postid, function (err, post) {
            res.render('show', { 
                "errors": errors,
                "post": post
            });
        })

    }else{
        var commentfields = {"name": name, "email": email, "body" : body, "commentdate": commentdate};
        
        var posts = db.get('posts');
        
        posts.update(
        {
            "_id": postid
        },
        {
            $push:{
                "comments": commentfields
            }
        },
        function  (err, doc) {
            if(err){
                throw err;
            } else {
                req.flash('Success', 'Comentario adicionado com sucesso.');
                //res.location('/');
                //res.redirect('/');
                res.location('/posts/show/' + postid);
                res.redirect('/posts/show/' + postid);
            }
        }
        );
    }
});

module.exports = router;