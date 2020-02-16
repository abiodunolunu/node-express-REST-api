const Quote = require("../models/Quote");
const fs = require("fs");
const path = require("path");
const User = require("../models/User");

const {
    validationResult
} = require("express-validator");

exports.getPosts = async (req, res, next) => {
    const currentPage = req.query.page;
    const perPage = 3;
    try {
        const totalItems = await Quote.find().countDocuments();
        const quotes = await Quote.find()
            .skip((currentPage - 1) * perPage)
            .limit(perPage);

        res.status(200).json({
            result: quotes,
            totalItems: totalItems,
            perPage: perPage
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getSinglePost = async (req, res, next) => {
    const postId = req.params.postId;
    try {
        const post = await Quote.findById(postId)
        if (!post) {
            const error = new Error("Post not found");
            error.statusCode = 404;
            throw error
        }
        res.status(200).json({
            message: "Post found",
            post: post
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.createPost = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validator failed, entered data is incorrect.");
        error.statusCode = 422;
        throw error;
    }
    const imageUrl = req.file.path;
    const quote = req.body.quote;
    let author;
    const newQuote = new Quote({
        author: req.userId,
        quote: quote,
        imageUrl: imageUrl
    });

    try {
        await newQuote.save()
        const user = await User.findById(req.userId)
        user.quotes.push(newQuote)
        await user.save()
        author = user
        res.status(201).json({
            message: "Quote Created Successfully",
            post: newQuote,
            author: {
                _id: author._id,
                name: author.name
            }
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.updateQuote = async (req, res, next) => {
    const postId = req.params.postId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validator failed, entered data is incorrect.");
        error.statusCode = 422;
        throw error;
    }
    const quote = req.body.quote;
    let image = req.file;
    try {
        const post = await Quote.findByIdAndUpdate(postId);
        if (!post) {
            const error = new Error("Post not found");
            error.statusCode = 422;
            throw error;
        }
        if (post.author.toString() !== req.userId) {
            const error = new Error("Not Authorized");
            error.statusCode = 403;
            throw error;
        }
        post.quote = quote;
        if (image) {
            clearImage(post.imageUrl);
            post.imageUrl = req.file.path;
        }
        const result = await post.save();
        res.status(200).json({
            message: "Editted Successfully",
            post: result
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.deleteQuote = async (req, res, next) => {
    const postId = req.params.postId;
    try {
        const post = await Quote.findById(postId);
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
        await Quote.findByIdAndDelete(post._id);

        const user = await User.findById(req.userId);
        user.quotes.pull(postId);
        await user.save();
        res.status(200).json({
            message: "Post Deleted"
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

const clearImage = filePath => {
    filePath = path.join(__dirname, "..", filePath);
    fs.unlink(filePath, err => console.log(err));
};