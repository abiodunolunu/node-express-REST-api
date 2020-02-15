const express = require('express')
const { body } = require('express-validator')
const feedController = require('../controllers/feed')
const cors = require('cors')
const isAuth = require('../middleware/is-auth')


const router = express.Router()


//GET /feed/posts
router.get('/posts', cors(), isAuth, feedController.getPosts)

router.get('/post/:postId', cors(), isAuth, feedController.getSinglePost)

router.post('/post', cors(), isAuth, [
    body('quote').isLength({ min: 7 }).withMessage('Too short')
], feedController.createPost)

router.put('/post/:postId', cors(), isAuth, [
    body('quote').isLength({ min: 7 }).withMessage('Too short')
], feedController.updateQuote)

router.delete('/post/:postId', cors(), isAuth, feedController.deleteQuote)

module.exports = router