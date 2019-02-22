//express is the framework we're going to use to handle requests
const express = require('express');
const crypto = require("crypto");

let router = express.Router();
let getHash = require('../utilities/utils').getHash;

//Create connection to Heroku Database
let db = require('../utilities/utils').db;


const bodyParser = require("body-parser");
//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json());

router.post('/', (req, res) => {
    let email = req.body['email'];
    let theirNewPw = req.body['newPassword'];
    let wasSuccessful = false;
    if(email && theirNewPw) {
        //Using the 'one' method means that only one row should be returned
        db.one('SELECT Email FROM Members WHERE Email=$1', [email])
        .then(row => { //If successful, run function passed into .then()
            
            var newPassword = req.body['newPassword'];

            let salt = crypto.randomBytes(32).toString("hex");
            let salted_hash = getHash(newPassword, salt);

            let params = [salted_hash, salt, email];

            db.none("UPDATE Members SET Password = $1, Salt = $2 WHERE Email = $3", params)
            .then(() => {
                return res.send({
                    success: true,
                    msg: "Password changed"
                });


            }).catch((err) => {
                //log the error
                // Not sure why we would have an error here, we would have just made the user account
                res.send({
                    success: false,
                
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
            msg: 'Email and Password are required'
        });
    }
});

module.exports = router;