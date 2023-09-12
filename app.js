const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

//importing routes 
const productsRoute = require('./api/routes/products');
const ordersRoute = require('./api/routes/orders');
const userRoute = require('./api/routes/user');

//configuring .env file
dotenv.config();

//connecting mongodb to the node server
main().catch(err => console.log(err));

async function main() {
    await mongoose.connect(process.env.MONGOOSE_URI);
    console.log('DB connected successfully');
}


const app = express();


//using required middlewares
app.use(morgan('dev'));
app.use('/uploads',express.static('uploads'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


//cutomized cors error handling "Note: This should be written before using 'routes'"
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Authorization");

    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
        return res.status(200).json({})
    }

    next();
})


//using routes 
app.use('/products', productsRoute);
app.use('/orders', ordersRoute);
app.use('/user', userRoute);


//below code is used to show error message
app.use((req, res, next) => {
    const error = new Error('Not Found'); //Not Found is assigned to Error as "message"
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message //message is and inbuilt property to get error message given to "Error" method
        }
    });
});

module.exports = app;