const Quote = require("../models/Quote");
const fs = require("fs");
const path = require("path");
const User = require("../models/User");

const { validationResult } = require("express-validator");

exports.getPosts = (req, res, next) => {
    const currentPage = req.query.page;
    console.log(currentPage);
    const perPage = 3;
    let totalItems;
    Quote.find()
        .countDocuments()
        .then(count => {
            totalItems = count;
            return Quote.find()
                .skip((currentPage - 1) * perPage)
                .limit(perPage);
        })
        .then(result => {
            res.status(200).json({
                result: result,
                totalItems: totalItems,
                perPage: perPage
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.getSinglePost = (req, res, next) => {
    const postId = req.params.postId;
    Quote.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error("Post not found");
                error.statusCode = 422;
                res.status(error.statusCode).json({
                    message: error.message
                });
                return;
            }

            res.status(200).json({
                message: "Post found",
                post: post
            });
        })
        .catch(err => {
            err.statusCode = 500;
            next(err);
        });
};

exports.createPost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validator failed, entered data is incorrect.");
        error.statusCode = 422;
        throw error;
    }
    // return res.status(422).json({
    //     message: 'Validator failed, entered data is incorrect.',
    //     errors: errors.array()
    // });
    const imageUrl = req.file.path;
    const quote = req.body.quote;
    let author;
    console.log(req.body.file, "file");

    const newQuote = new Quote({
        author: req.userId,
        quote: quote,
        imageUrl: imageUrl
    });

    newQuote
        .save()
        .then(result => {
            return User.findById(req.userId);
        })
        .then(user => {
            author = user;
            user.quotes.push(newQuote);
            return user.save();
        })
        .then(result => {
            res.status(201).json({
                message: "Quote Created Successfully",
                post: newQuote,
                author: { _id: author._id, name: author.name }
            });
        })
        .catch(err => {
            console.log(err);
            if (!err.statusCode) {
                err.statusCode = 500;
            }

            next(err);
            // res.json({
            //     err: err
            // })
        });
};

exports.updateQuote = (req, res, next) => {
    const postId = req.params.postId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validator failed, entered data is incorrect.");
        error.statusCode = 422;
        throw error;
    }
    const quote = req.body.quote;
    const author = req.body.author;
    let image = req.file;

    let newPost;
    Quote.findByIdAndUpdate(postId)
        .then(post => {
            if (!post) {
                const error = new Error("Post not found");
                error.statusCode = 422;
                throw error;
                // res.status(error.statusCode).json({
                //     message: error.message
                // })
                // return
            }
            post.quote = quote;
            post.author = author;
            if (post.author.toString() !== req.userId) {
                const error = new Error("Not Authorized");
                error.statusCode = 403;
                throw error;
            }
            if (image) {
                clearImage(post.imageUrl);
                post.imageUrl = req.file.path;
            }
            newPost = post;
            return post.save();
        })
        .then(result => {
            res.status(200).json({
                message: "Editted Successfully",
                post: newPost
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }

            next(err);
        });
};

exports.deleteQuote = (req, res, next) => {
    const postId = req.params.postId;

    Quote.findById(postId)
        .then(post => {
            if (!post) {
                return res.json({
                    message: "Post Not Found"
                });
            }
            if (post.author.toString() !== req.userId) {
                const error = new Error("Not Authorized");
                error.statusCode = 403;
                throw error;
            }
            clearImage(post.imageUrl);
            return Quote.findByIdAndDelete(post._id);
        })
        .then(result => {
            return User.findById(req.userId)
        })
        .then(user => {
            user.quotes.pull(postId)
            return user.save()
        })
        .then(result => {
            res.status(200).json({
                message: "Post Deleted"
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }

            next(err)
        });
};

const clearImage = filePath => {
    filePath = path.join(__dirname, "..", filePath);
    fs.unlink(filePath, err => console.log(err));
};
