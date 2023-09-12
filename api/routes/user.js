const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


//importing User Model 
const User = require('../Models/User');

// signup route for signing users
router.post('/signup', (req, res, next) => {
    User.find({email: req.body.email})
    .exec()
    .then(user => {
        if (user.length > 0) {
            return res.status(409).json({
                message: 'Mail exists'
            });
        }
        else {
            //hasing password using "bcrypt" for better protection
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if (err) {
                    return res.status(500).json({
                        error: err 
                    });
                }
                else {
                    const user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        email: req.body.email,
                        password: hash
                    });

                    user.save()
                    .then(result => {
                        console.log(result);
                        res.status(201).json({
                            message: 'User created'
                        });
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err 
                        });
                    })
                }
            });
        }
    })
    
});


//route to delete user with specific "id"
router.delete('/:userId', (req, res, next) => {
    User.findByIdAndDelete({_id: req.params.userId})
    .exec()
    .then(user => {
        res.status(200).json({
            message: 'User deleted'
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err 
        });
    });
});


// exporting routers for using them in other modules
module.exports = router;