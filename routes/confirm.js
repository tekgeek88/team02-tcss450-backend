//express is the framework we're going to use to handle requests
const express = require('express');

//Create connection to Heroku Database
let db = require('../utilities/utils').db;

var router = express.Router();

var expressValidator = require('express-validator');
// This allows us to use a validator to check the users credentials
router.use(expressValidator());

const bodyParser = require("body-parser");
//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json());

// Create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

//add a get route to the router. 
router.get("/", (req, res) => {
    res.send({
        message: "Hello, you sent a GET request"
        
    });
});

// Handle the post with the token
router.post('/', urlencodedParser, (req, res) => {
    // Validate the token
    req.assert('token', 'Token cannot be blank').notEmpty();
    let token = req.body['token'];

    // Check for validation errors and return if found
    let errors = req.validationErrors();
    if (errors) {
        return res.status(400).send({
            success: false,
            msg: errors
        });
    // Process the token and check if we should validate the user
    } else {
        // Fetch the token from the body of the post
        let token = req.body.token;
        // Check the database to see if there is a token matching the given token.
        db.one('SELECT MemberID, Token FROM VerificationToken WHERE Token=$1', [token])
        .then(row => { //If successful, run function passed into .then() 

            let memberID = row['memberid'];

            db.one('SELECT FirstName, Verification FROM Members WHERE MemberID = $1', [memberID, token])
            .then(row => { //If successful we found a matching token
            // If we made it this far we know we have a user with a matching token.
            // Check to see if the user has been verified
            let isVerified = row['verification'];
            let firstName = row['firstname'];

            // If the user has been verified return and end these shenanigan's
            if (isVerified) {
                return res.status(400).send({
                    success: false, 
                    msg: 'This user has already been verified.' });
            // We need to validate the user
            } else {
                db.none("UPDATE Members SET Verification = $1 WHERE MemberID = $2", [1, memberID])
                .then(() => {

                // We successfully verified the user
                console.log("check the Members table and see if we have a verified member!");
                res.status(200).send({
                    success: true,
                    msg: "The account has been verified. Please log in."
                });

            })
            .catch((err) => {
                res.status(418).send({
                    success: false,
                    error: "We couldn't set isVerified to true"
                });
            });
            }
        })
        .catch((err) => { // 
            res.status(400).send({
                success: false,
                error: "Couldn't find a user with that token"
            });
        });



        })
        .catch((err) => {
            //log the error
            res.status(401).send({
                success: false,
                error: 'Invalid token'
            });
        });

    }
}); // End router.post()

module.exports = router;
