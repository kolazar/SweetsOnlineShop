const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Cart = require('../models/cart');
const Items = require('../models/items');

const itemRouter = express.Router();


itemRouter.use(bodyParser.json());


itemRouter.route('/')
.options(cors.corsWithOptions, (req, res) =>{ res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Items.find({})
    .populate('comments.author')
    .then((Items)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(Items);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Items.create(req.body)
        .then((item)=>{
            console.log('Item Created ', item);
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(item);
        },(err)=>next(err))
        .catch((err)=>next(err));
    
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /items');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Items.remove({})
    .then((resp)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    },(err)=>next(err))
    .catch((err)=>next(err));
});

itemRouter.route('/:itemId')
.options(cors.corsWithOptions, (req, res) =>{ res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Items.findById(req.params.itemId)
    .populate('comments.author')
    .then((item)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(item);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /items'
    + req.params.itemsId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Items.findByIdAndUpdate(req.params.itemsId,{
        $set:req.body
    }, {new: true})
    .then((item)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(item);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Items.findByIdAndRemove(req.params.itemsId)
    .then((resp)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    },(err)=>next(err))
    .catch((err)=>next(err));
});

itemRouter.route('/:itemId/comments')
.options(cors.corsWithOptions, (req, res) =>{ res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Items.findById(req.params.itemsId)
    .populate('comments.author')
    .then((item)=>{
        if(item != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(item.comments);
        }
        else {
            err = new Error('item ' + req.params.itemsId + ' not found');
            err.status = 404;
            return next(err);
        }
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Items.findById(req.params.itemsId)
    .then((item)=>{
        if(item != null) {
            req.body.author = req.user._id;
            item.comments.push(req.body);
            item.save()
            .then((item)=>{
                Items.findById(item._id)
                .populate('comments.author')
                .then((item)=>{
                    res.statusCode = 200;
                    res.setHeader('Content-Type','application/json');
                    res.json(item);
                });
            }),(err)=>next(err);
          }
        else {
            err = new Error('item ' + req.params.itemsId + ' not found');
            err.status = 404;
            return next(err);
        }
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /items/'
    + req.params.itemsId + '/comments');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Items.findById(req.params.itemsId)
    .then((item)=>{
        if(item != null) {
           for (var i = (item.comments.length-1);i>=0;i--){
               item.comments.id(item.comments[i]._id).remove();
           }
           item.save()
            .then((item)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(item);
            }),(err)=>next(err);
          }
        else {
            err = new Error('Item ' + req.params.itemsId + ' not found');
            err.status = 404;
            return next(err);
        }
    },(err)=>next(err))
    .catch((err)=>next(err));
});

itemRouter.route('/:itemsId/comments/:commentId')
.options(cors.corsWithOptions, (req, res) =>{ res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Items.findById(req.params.itemsId)
    .populate('comments.author')
    .then((item)=>{
        if(item != null && item.comments.id(req.params.commentId)!= null) {
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(item.comments.id(req.params.commentId));
        }
        else if (item == null) {
            err = new Error('item ' + req.params.itemsId + ' not found');
            err.status = 404;
            return next(err);
        }

        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);
        }

    },(err)=>next(err))
    .catch((err)=>next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /Items'
    + req.params.itemsId +'/comments/' + req.params.commentId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Items.findById(req.params.itemsId)
    .then((item)=>{
        if(item != null && item.comments.id(req.params.commentId)!= null) {
            var authorId = item.comments.id(req.params.commentId).author;        
            var userId = req.user._id;
            if(authorId.equals(userId)){
                if(req.body.rating){
                    item.comments.id(req.params.commentId).rating = req.body.rating;
                }
                if(req.body.comment){
                    item.comments.id(req.params.commentId).comment = req.body.comment;
                }
                item.save()
                .then((item)=>{
                    Items.findById(item._id)
                    .populate('comments.author')
                    .then((item)=>{
                        res.statusCode = 200;
                        res.setHeader('Content-Type','application/json');
                        res.json(item);
                    });
                }),(err)=>next(err);
            } else{
                err = new Error('You are not authorized to perform this operation!');
                err.status = 403;
                return next(err);
            }
        }
        else if (item == null) {
            err = new Error('Item ' + req.params.itemsId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);
        }
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Items.findById(req.params.itemsId)
    .then((item)=>{
        if(item != null && item.comments.id(req.params.commentId)!= null) {
            var authorId = item.comments.id(req.params.commentId).author;        
            var userId = req.user._id;
            if(authorId.equals(userId)){
            item.comments.id(req.params.commentId).remove();
            item.save()
            .then((item)=>{
                Items.findById(item._id)
                .populate('comments.author')
                .then((item)=>{
                    res.statusCode = 200;
                    res.setHeader('Content-Type','application/json');
                    res.json(item);
                })
            }, (err)=>next(err));
          } else{
                err = new Error('You are not authorized to perform this operation!');
                err.status = 403;
                return next(err);
          }
        }
          else if (item == null) {
            err = new Error('Item ' + req.params.itemsId + ' not found');
            err.status = 404;
            return next(err);
        }

        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);
        }
    },(err)=>next(err))
    .catch((err)=>next(err));
});

itemRouter.route('/:itemId/shoppingCart')
.options(cors.corsWithOptions, (req, res) =>{ res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    var itemId = req.params.itemId;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    Items.findById(itemId, (err, item)=>{
        if(err){
            return res.redirect('/items');
        }
        cart.add(item, item.id);
        req.session.cart = cart;
        console.log(req.session.cart);
        res.redirect('/items');
    });
});


module.exports = itemRouter;
