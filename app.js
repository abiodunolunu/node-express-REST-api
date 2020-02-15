const configKeys = require('./config').keys
const express = require('express')
const app = express()
const path = require('path')
const multer = require('multer')
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth')


const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true)
    } else (null, false)
}

// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Allow-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
//     res.setHeader(' Access-Control-Allow-Headers,', 'Origin, X-Requested-With, Accept, Content-Type, Authorization')
//     next()
// })

app.options('*', cors())

app.use(bodyParser.json())
app.use('/images', express.static(path.join(__dirname, 'images')))



app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Allow-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Accept, Content-Type, Authorization')
    next()
})

app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'))
app.use('/feed', feedRoutes)
app.use('/auth', authRoutes)


app.use((error, req, res, next) => {
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    console.log(message, '[app.js]');
    return res.status(status).json({
        message: message,
        data: data
    })
})

const PORT = 3000

mongoose.connect(configKeys.MONGO_URI, () => {
    app.listen(PORT, () => {
        console.log('Connected')
    });
})
