//express is the framework we're going to use to handle requests
const express = require('express');

//We use this create the SHA256 hash
const crypto = require("crypto");

//Create connection to Heroku Database
let db = require('../utilities/utils').db;

let getHash = require('../utilities/utils').getHash;

let sendWelcomeEmail = require('../utilities/utils_mail').sendWelcomeEmail;

let sendVerificationEmail = require('../utilities/utils_mail').sendVerificationEmail;

var router = express.Router();
// Use a validator to check the users credentials
var expressValidator = require('express-validator');
router.use(expressValidator());

const bodyParser = require("body-parser");
//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json());

router.post('/', (req, res) => {
    res.type("application/json");

    //Retrieve data from query params
    var first = req.body['first'];
    var last = req.body['last'];
    var username = req.body['username'];
    var email = req.body['email'];
    var password = req.body['password'];
    //Verify that the caller supplied all the parameters
    //In js, empty strings or null values evaluate to false
    if(first && last && username && email && password) {
        //We're storing salted hashes to make our application more secure
        //If you're interested as to what that is, and why we should use it
        //watch this youtube video: https://www.youtube.com/watch?v=8ZtInClXe1Q
        let salt = crypto.randomBytes(32).toString("hex");
        let salted_hash = getHash(password, salt);
        
        //Use .none() since no result gets returned from an INSERT in SQL
        //We're using placeholders ($1, $2, $3) in the SQL query string to avoid SQL Injection
        //If you want to read more: https://stackoverflow.com/a/8265319
        let params = [first, last, username, email, salted_hash, salt];
        db.none("INSERT INTO MEMBERS(FirstName, LastName, Username, Email, Password, Salt) VALUES ($1, $2, $3, $4, $5, $6)", params)
        .then(() => {
            //We successfully added the user, let the user know
            // get the MemberId
            db.one('SELECT MemberID, Email FROM Members WHERE Email=$1', [email])
            .then(row => { //If successful, run function passed into .then()          
                // Create a verification token for this user
                var token ={
                    memberID: row['memberid'],
                    token: crypto.randomBytes(16).toString('hex')
                };

                db.none("INSERT INTO VerificationToken(MemberID, Token) VALUES ($1, $2)", [token.memberID, token.token])
                .then(() => {
                    console.log("Generating a verification token...");
                    // If email did not send an error
                    sendVerificationEmail(first, email, req, token);
                    console.log('************   email sent');
                    res.status(200);


                }).catch((err) => {
                    //log the error
                    console.log(err);
                    // Not sure why we would have an error here, we would have just made the user account
                    res.send({
                        success: false,
                        error: err
                    });
                });
            }).catch((err) => {
                //log the error
                console.log(err);
                // Not sure why we would have an error here, we would have just made the user account
                res.send({
                    success: false,
                    error: err
                });
            });
 
            res.send({
                success: true
            });
            // Welcome the new user to our app and have them confirm their email
            // sendWelcomeEmail(first, email);
            
        }).catch((err) => {
            //log the error
            console.log(err);
            //If we get an error, it most likely means the account already exists
            //Therefore, let the requester know they tried to create an account that already exists
            res.send({
                success: false,
                error: err
            });
        });
    } else {
        res.send({
            success: false,
            input: req.body,
            error: "Missing required user information"
        });
    }
});

module.exports = router;
