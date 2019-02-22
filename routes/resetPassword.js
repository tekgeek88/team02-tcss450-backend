const express = require('express');

//We use this create the SHA256 hash
const crypto = require("crypto");

//Create connection to Heroku Database
let db = require('../utilities/utils').db;

let getHash = require('../utilities/utils').getHash;

let sendPasswordEmail = require('../utilities/utils_mail').sendPasswordEmail;


var router = express.Router();

// Use a validator to check the users credentials
const { check, validationResult } = require('express-validator/check');

const bodyParser = require("body-parser");
//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json());

router.post('/', (req, res) => {
    let email = req.body['email'];
   // let theirNewPw = req.body['newPassword'];
    //let wasSuccessful = false;
    if(email) {
        //Using the 'one' method means that only one row should be returned
        db.one('SELECT Email FROM Members WHERE Email=$1', [email])
        .then(row => { //If successful, run function passed into .then()
            
            var newPassword = Math.floor((Math.random() * 412345) + 123456);
            
            let salt = crypto.randomBytes(32).toString("hex");
            let salted_hash = getHash(newPassword, salt);

            let params = [salted_hash, salt, email];

            db.none("UPDATE Members SET Password = $1, Salt = $2 WHERE Email = $3", params)
            .then(() => {
                sendPasswordEmail(email,newPassword)
                
                    .then(result => {
            
                        return res.send({
                            success: true,
                            msg: "Password email sent"
                        });
                
                });


            }).catch((err) => {
                //log the error
                // Not sure why we would have an error here, we would have just made the user account
                res.send({
                    success: false,
                    msg: "Email sent fail",
                    error: err
                    
                });
            });
          
        })
        //More than one row shouldn't be found, since table has constraint on it
        .catch((err) => {
            //If anything happened, it wasn't successful
            res.send({
                success: false,
                msg: "Account not found!"
            });
        });
    } else {
        
        res.send({
            success: false,
            msg: 'Email is required'
        });
    }
});
module.exports = router;