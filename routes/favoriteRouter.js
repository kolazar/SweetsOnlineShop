const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();


favoriteRouter.use(bodyParser.json());


favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) =>{ res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({"user": req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favorites)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(favorites);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({"user": req.user._id})
        .then((favorite)=>{ 
        if(favorite == null){   
            Favorites.create({user: req.user._id})                
            .then((favorite)=>{
                favorite.dishes.push({"$each": req.body})
                favorite.save()
                    .then((favorite)=>{
                        console.log('Favorite Created ',favorite);
                        res.statusCode = 200;
                        res.setHeader('Content-Type','application/json');
                        res.json(favorite);
                    });  
                },(err)=>next(err)); 
            } else {

                for (var i=0; i<req.body.length; i++) {
                    if (favorite.dishes.indexOf(req.body[i]._id) === -1) {
                        favorite.dishes.push(req.body[i]._id);
                    }
                    else {
                        err = new Error('The dish is already in your favorites list. Please choose another one!');
                        err.status = 403;
                        return next(err);
                        break;
                    }
                }
                    favorite.save()
                    .then((favorite)=>{
                        Favorites.findById(favorite._id)
                        .populate('user')
                        .populate('dishes')
                        .then((favorite)=>{
                            res.statusCode = 200;
                            res.setHeader('Content-Type','application/json');
                            res.json(favorite);
                        });
                    }),(err)=>next(err);
                }  
        },(err)=>next(err))
        .catch((err)=>next(err)); 
    })
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({"user": req.user._id})
    .then((favorite)=>{
        favorite.remove()
        .then((resp)=>{
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(resp);
        },(err)=>next(err))
    },(err)=>next(err))
    .catch((err)=>next(err));
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) =>{ res.sendStatus(200); })
.get(cors.corsWithOptions, (req,res,next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites/'
    + req.params.dishId);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({"user": req.user._id})
        .then((favorite)=>{ 
        if(favorite == null){   
            Favorites.create({user: req.user._id})                
            .then((favorite)=>{
                favorite.dishes.push(req.params.dishId);
                favorite.save()
                    .then((favorite)=>{
                        console.log('Favorite Created ',favorite);
                        res.statusCode = 200;
                        res.setHeader('Content-Type','application/json');
                        res.json(favorite);
                    });  
                },(err)=>next(err)); 
            } else {                
                 if(!favorite.dishes.includes(req.params.dishId)) {
                  favorite.dishes.push(req.params.dishId)
                    favorite.save()
                    .then((favorite)=>{
                        Favorites.findById(favorite._id)
                        .populate('user')
                        .populate('dishes')
                        .then((favorite)=>{
                            res.statusCode = 200;
                            res.setHeader('Content-Type','application/json');
                            res.json(favorite);
                        });
                    }),(err)=>next(err);
                } else {
                    err = new Error('The dish is already in your favorites list. Please choose another one!');
                    err.status = 403;
                    return next(err);
                    }
            }  
        },(err)=>next(err))
        .catch((err)=>next(err)); 
    })
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/'
    + req.params.dishId);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({"user": req.user._id})
        .then((favorite) =>{
            if(favorite.dishes.includes(req.params.dishId)){
            favorite.dishes.pull(req.params.dishId);
            favorite.save()
            .then((favorite)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(favorite);
            },(err)=>next(err))
            } else {
                err = new Error('Dish ' + req.params.dishId + ' not found');
                err.status = 404;
                return next(err);
            }
        },(err)=>next(err))    
    .catch((err)=>next(err));
});

module.exports = favoriteRouter;
