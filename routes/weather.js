const API_KEY = process.env.DARKSKY_SECRET_KEY;

const express = require('express');

const request = require('request');

var router = express.Router();

const bodyParser = require("body-parser");

router.use(bodyParser.json());

router.get("/forecast", (req, res) => {
    // for info on use of tilde (`) making a String literal, see below. 
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String
    let url = `https://api.darksky.net/forecast/${API_KEY}`;
    
    //find the query string (parameters) sent to this end point and pass them on to
    // Darksky.net api call 
    let n = req.originalUrl.indexOf('?') + 1;
    if(n > 0) {
        url += '&' + req.originalUrl.substring(n);
    }


    // This method works for now but will be inadequate for multiple requests
    //When this web service gets a request, make a request to the Phish Web service
    request(url, function (error, response, body) {
        if (error) {
            res.send(error);
        } else {
            // pass on everything (try out each of these in Postman to see the difference)
            // res.send(response);
            
            // or just pass on the body
            res.send(body);
        }
    });    
});

module.exports = router;
