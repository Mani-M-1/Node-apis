const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

//importing "Order" and "Product" routes 
const Order = require('../Models/Order');
const Product = require('../Models/Product');


//get route to get all orders
router.get('/', (req, res, next) => {
    Order.find() //finding all orders
    .select('product quantity _id') //select is used to select sepcific feilds
    .populate('product', 'name') //allows to seamlessly fetch and replace "product" & "name" fields with the corresponding referenced documents
    .exec() //exec is used to execute query
    .then(docs => {
        res.status(200).json({
            count: docs.length,
            orders: docs.map(doc => {
                return {
                    _id: doc._id,
                    product: doc.product,
                    quantity: doc.quantity,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/orders/' + doc._id
                    }
                }
            })
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err 
        });
    });
});

//post route to post an order
router.post('/', (req, res, next) => {
    //finding product by productId
    Product.findById(req.body.productId) //finding order by id 
    .then(product => {
        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            })
        }
        const order = new Order({
            _id: new mongoose.Types.ObjectId(),
            quantity: req.body.quantity,
            product: req.body.productId,
        });
        return order.save();
    })
    .then(result => {
        res.status(201).json({
            message: 'Order stored',
            createdOrder: {
                _id: result._id,
                product: result.product,
                quantity: result.quantity,
            },
            request: {
                type: 'GET',
                url: 'http://localhost:3000/orders/' + result._id
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

//get route to get a specific order by the "id"
router.get('/:orderId', (req, res, next) => {
    Order.findById(req.params.orderId) //finding order by id 
    .populate('product')
    .exec() 
    .then(order => {
        if (!order) {
            res.status(404).json({
                message: 'Order not found'
            });
        }
        res.status(200).json({
            order: order,
            request: {
                type: 'GET',
                url: 'http://localhost:3000/orders'
            }
        })
    })
    .catch(err => {
        res.status(500).json({
            error: err 
        });
    });
});

//delete route to delete specific order by the "id"
router.delete('/:orderId', (req, res, next) => {
    Order.findByIdAndDelete({_id: req.params.orderId}) //finding order by id and deleting
    .exec()
    .then(result => {
        console.log(result)
        if (!result) {
            res.status(404).json({
                message: 'Order not found'
            })
        }
        res.status(200).json({
            message: 'Order deleted',
            request: {
                type: 'POST',
                url: 'http://localhost:3000/orders',
                body: {productId: 'ID', quantity: 'Number'}
            }
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err 
        });
    });
});

// exporting routers for using them in other modules
module.exports = router;