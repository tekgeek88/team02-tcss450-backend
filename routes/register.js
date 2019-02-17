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
const { check, validationResult } = require('express-validator/check');

const bodyParser = require("body-parser");
//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json());

router.post('/', [
    
    // #####  Validate the information the user has submitted  #####
    check('first').not().isEmpty().withMessage('Must use a first name!'),
    check('last').not().isEmpty().withMessage('Must use a last name!'),
    check('email').isEmail().withMessage('Must use a valid email address')
    .custom(async value => {
        return await db.one('SELECT Email FROM Members WHERE Email=$1', [value])
            .then(row => {
                console.log("false");
                return false;
            })
            .catch((err) => {      
                return true;
            });
    }).withMessage("That email already exists!"),
    check('username').not().isEmpty().withMessage('Must use a username')
    .custom(async value => {
        return await db.one('SELECT Username FROM Members WHERE Username=$1', [value])
            .then(row => {
                console.log("false");
                return false;
            })
            .catch((err) => {      
                return true;
            });
    }).withMessage("That username already exists!"),
    // Must be at least 6 characters long and contain a number
    check('password', 'Must contain at least 6 characters!').isLength({ min: 6 })
    .matches(/\d/).withMessage('Must contain a number!')
], (req, res) => {
    res.type("application/json");

    // Finds the validation errors in this request and wraps them in a json object with handy functions
    // the android ap developer can use to notify the user of the issues.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.send({ 
            success: false,
            data: errors.array() });
    }

    //Retrieve data from query params
    var first = req.body['first'];
    var last = req.body['last'];
    var username = req.body['username'];
    var email = req.body['email'];
    var password = req.body['password'];
    
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
        db.one('SELECT MemberID, Email FROM Members WHERE Email=$1', [email])
        .then(row => {
            //If successful, create a verification token for this user.
            var token = {
                memberID: row['memberid'],
                token: crypto.randomBytes(16).toString('hex')
            };

            db.none("INSERT INTO VerificationToken(MemberID, Token) VALUES ($1, $2)", [token.memberID, token.token])
                .then(() => {
                    sendVerificationEmail(first, email, req, token)
                    .then(result => {
                        // console.log("#####    BEGIN MAIL TRANSACTION    #####");
                        // console.log(result);
                        // console.log("#####    END MAIL TRANSACTION    #####");
                        return res.send({
                            success: true,
                            msg: "Verification email sent"
                        });
                    })
                    .catch(err =>{
                        return res.send({
                            success: false,
                            error: err['response'],
                            msg: "Unable to send verification email"
                        });
                    })
                })
            .catch((err) => {
                return res.send({
                    success: false,
                    error: "Unable to insert the verification token into the database"
                });
            });
        }).catch((err) => {
            //log the error
            // Not sure why we would have an error here, we would have just made the user account
            res.send({
                success: false,
                error: err
            });
        });
        // Welcome the new user to our app and have them confirm their email
        // sendWelcomeEmail(first, email);
        
    }).catch((err) => {
        //If we get an error, it most likely means the account already exists
        //Therefore, let the requester know they tried to create an account that already exists
        res.send({
            success: false,
            error: "Unable to insert user into database"
        });
    });
});

function getComma(commaMachine) {
    let result = "";
    commaMachine.errorCount++;
    if (commaMachine.errorCount > 1 && commaMachine.commasLeft > 0) {
        result += ',';
        commaMachine.commasLeft--;
    }
    return result;
}

module.exports = router;
