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
    
    // Validate the token
    let token = req.query['token'];

    if (!token) {
        return res.send({
            success: false,
            msg: "Token cannot be blank"
        });
    } else {
        // Process the token and check if we should validate the user
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
                return res.send({
                    success: false, 
                    msg: 'This user has already been verified.' });
            // We need to validate the user
            } else {
                db.none("UPDATE Members SET Verification = $1 WHERE MemberID = $2", [1, memberID])
                .then(() => {

                // We successfully verified the user
                res.type('html');
                res.send(`<html>
                <body>    
                    <link href="https://fonts.googleapis.com/css?family=Roboto+Condensed" rel="stylesheet">
                <style type="text/css" media="screen">
                /********************************************************
                HEADER
                ********************************************************/
                    
                    body {
                        padding: 0px;
                        margin: 0px;
                    }
                    #content img { 
                        max-width: 100%;
                        height: auto; 
                      }
                
                    h1 {
                        font-family: 'Roboto Condensed', sans-serif;
                        margin: 15px 0;
                        font-size: 1.75em; 
                        font-weight: normal;
                        line-height: 0.8em;
                    }
                
                    h2 {
                        font-size: 0.75em;
                        margin: -5px 0 0;
                        font-weight: normal;
                    }
                
                    nav {
                        background-color: #008eb3;
                        text-align: center;
                        padding-top: 0px;
                        margin: 0px 0 0;
                    }
                
                    nav a {
                        font-weight: 800;
                        padding: 15px 10px;
                    }
                        /********************************************************
                        FOOTER
                        ********************************************************/
                
                        footer {
                            font-size: 0.75em;
                            text-align: center;
                            clear: both;
                            padding-top: 25px;
                            color: #ccc;
                        }
                
                        .social-icon {
                        width: 20px;
                        height: 20px;
                        margin: 0 5px;
                        }
                
                        /********************************************************
                        COLORS
                        ********************************************************/
                        
                        /*Site Body*/
                        body {
                            display: block;
                            background-color: #001970;
                            color: white;
                        }
                
                        /*Site Header1 Chatter logo*/
                        #header1 {
                            font-size: 1.5em;
                            display: block;
                            text-align: center;
                            padding: 0px;
                            margin: 0;
                            background: #001970;
                            border-color: #42A5F5;
                        }
                
                        /*Site Header2 community tag line*/
                        #header2 {
                            font-size: 1.1em;
                            display: block;
                            text-align: center;
                            padding: 15px;
                            margin: 0;
                            background: #303F9F;
                            border-color: #42A5F5;
                        }
                
                        /*Site Header*/
                        header {
                            background: #303F9F;
                            border-color: #42A5F5;
                        }
                
                        /* nav background on mobile (lower background color band)*/
                        #nav-logo {
                            background: #0077C2;
                            padding: 0px;
                        }
                
                        #nav-logo-bottom {
                            font-size: 1.6em;
                            padding: 20px;
                            margin: 0px;
                            overflow: hidden;
                            background: #42A5F5;
                            display: block;
                        }
                
                        /* Logo text */
                        h1, h2 {
                            color: #fff;
                        }
                
                        /* Links */
                        a {
                        text-decoration: none;
                            color: #008eb3;
                        }
                
                        /*  nav link */
                        nav a, nav a:visited {
                            color: #fff;
                        }
                
                        /* Seleceted Nav link */
                        nav a.selected, nav a:hover {
                            color: #008eb3;
                        }
                
                        #body-wrapper {
                            padding: 20px;
                        }
                
                </style>
                    
                <header id="header1" class="">
                    <h1>Chatter</h1> 
                    <div id="header2">
                            <h2>A community about great chats and great weather!</h2>
                    </div>     
                </header>
                        <nav id="nav-logo">
                            <a href="https://ibb.co/7gg39Hj" id = nav_logo>
                            <img src="https://i.ibb.co/9wwxMJc/chatter-logo.png" alt="Chatter Logo" border="0" width="250" height="250"></a>    
                            <div id="nav-logo-bottom">
                            <h2>Thank you for confirming your account!</h2>
                            </div>
                        </nav>
                    
                <div id="wrapper">
                    <section>
                        <body>
                            <div id="body-wrapper">
              
                                <h4>Thank you for confirming your account ${firstName}!</h4>
                                
                                <p>Please log in using your mobile app</p>
                                
                                <p> Have a great day!<br><br>
                
                                <p> Sincerely,<br>
                                The Chatter Community
                                
                                <h3>        
                                    Once again, congratulations and we look forward to chatting it up with you soon!
                                </h3>
                        </div>
                        </body>
                    </section>
                    <footer>
                        <p>&copy; 2019 University of Washington - Chatter.<br>
                            TCSS 450 - Mobile Application Design
                        </p>
                    </footer>
                </div>
                </body>
                </html>`
                );

                })
                .catch((err) => {
                    res.send({
                        success: false,
                        error: "We couldn't set isVerified to true"
                    });
                });
            }
            })
            .catch((err) => { // 
                res.send({
                    success: false,
                    error: "Couldn't find a user with that token"
                });
            });
        })
        .catch((err) => {
            //log the error
            res.send({
                success: false,
                error: 'Invalid token'
            });
        });


    }

});

// Ignore this, not used
// Handle the post with the token
router.post('/', urlencodedParser, (req, res) => {
    // Validate the token
    req.assert('token', 'Token cannot be blank').notEmpty();
    let token = req.body['token'];

    // Check for validation errors and return if found
    let errors = req.validationErrors();
    if (errors) {
        return res.send({
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
                return res.send({
                    success: false, 
                    msg: 'This user has already been verified.' });
            // We need to validate the user
            } else {
                db.none("UPDATE Members SET Verification = $1 WHERE MemberID = $2", [1, memberID])
                .then(() => {

                // We successfully verified the user
                res.status(200).send({
                    success: true,
                    msg: "The account has been verified. Please log in."
                });

                })
                .catch((err) => {
                    res.send({
                        success: false,
                        error: "We couldn't set isVerified to true"
                    });
                });
            }
            })
            .catch((err) => { // 
                res.send({
                    success: false,
                    error: "Couldn't find a user with that token"
                });
            });
        })
        .catch((err) => {
            //log the error
            res.send({
                success: false,
                error: 'Invalid token'
            });
        });

    }
}); // End router.post()

module.exports = router;
