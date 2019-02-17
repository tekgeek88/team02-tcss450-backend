const express = require('express');

let router = express.Router();

//Create connection to Heroku Database
let db = require('../utilities/utils').db;

const bodyParser = require("body-parser");


//######    YAHOO WEATHER OAUTH API     ########
let OAuth = require('oauth');

let header = {
    "Yahoo-App-Id": process.env.YAHOO_APP_ID
};

let request = new OAuth.OAuth (
    null,
    null,
    process.env.YAHOO_CLIENT_ID,
    process.env.YAHOO_CLIENT_SECRET,
    '1.0',
    null,
    'HMAC-SHA1',
    null,
    header
);
//######    YAHOO WEATHER OAUTH API     ########



router.get("/forecast", (req, res) => {

    let url = `https://weather-ydn-yql.media.yahoo.com/forecastrss?`;
    let location = req.query['location'] || "";
    let lat = req.query['lat'] || "";
    let lon = req.query['lon'] || "";
    let units = req.query['u'] || 'f';

    if (location) {
        if(isNaN(location)) {
            return res.send({
                success: false,
                error: "Please check your URL and zip code and try again"
            });
        } else {
            url += `location=${location}&u=${units}&format=json`;
        }
    } else if (lat && lon) {
        if (isNaN(lat) || isNaN(lon)) {
            return res.send({
                success: false,
                error: "Please check your URL and zip code and try again"
            });
        } else {
            url += `lat=${lat}&lon=${lon}&u=${units}&format=json`;
        }
    } else {
        return res.send({
            success: false,
            error: "You have made an invalid request"
        });
    }

    request.get( url, null,  null,
        function (err, data, result) {
            if (err) {
                return res.send({
                    success: false,
                    msg: "Could not connect to 3rd part weather provider"
                });
            } else {
                res.type("application/json");
                res.send(data);
            }
        }
    );
});
// #################     Retrieve Weather Data  ##########################


// #################     Save Weather Data  ##########################
router.get("/locations", (req, res) => {
    res.type("application/json");

    let username = req.query['username'];


    // Inform the user if they didn't enter username or location
    if (!username) {
        return res.send({
            success: false,
            msg: "Username must not be blank"
        });
    }

    // Select the username from the Members table so that we can aquire the MemberID
    db.one('SELECT MemberID FROM Members WHERE Username=$1', [username]).then(row => {

        let params = [row['memberid']];

        db.many('SELECT * FROM Locations WHERE MemberID = $1', params).then(
            function (data) {
                res.send({
                    status: 'success',                
                    data: data,
                    message: 'Retrieved ALL Locations'
                });
            })
            .catch(function (err) {
                console.log("*******: " + err);
            return next(err);
            });

        
    })
    .catch((err) => {
        // If we fail here its likely because we violated the uniqueness constraint
        // Maybe we should upated instead?
        res.send({
            success: false,
            error: "I don't think we could find your user"
        });
    });
});






// #################     Converting to be one endpoint for both zip and coordinates    ##########################
router.put("/locations", (req, res) => {
    res.type("application/json");

    let username = req.query['username'];
    let location = req.query['location'];
    let nickname = req.query['nickname'];
    let lat = req.query['lat'];
    let lon = req.query['lon'];


    // Inform the user if they didn't enter username
    if (!username) {
        return res.send({
            success: false,
            msg: "Username must not be blank"
        });
    }else if (!nickname) {
        return res.send({
            success: false,
            msg: "Nickname must not be blank"
        });
    } else if (location) {
        if (isNaN(location) || !location) {
            return res.send({
                success: false,
                msg: "Location must be a valid zipcode"
            });
        }
        // Select the username from the Members table so that we can aquire the MemberID
        db.one('SELECT MemberID FROM Members WHERE Username=$1', [username]).then(row => {

            let params = [row['memberid'], nickname, location];

            db.none("INSERT INTO Locations (MemberID, Nickname, zip) VALUES ($1, $2, $3)", params)
                .then(() => {
                    return res.send({
                        success: true,
                        msg: 'Location added'
                    });
                })
                .catch((err) => {
                    // If we fail here its likely because we violated the uniqueness constraint
                    // Maybe we should upated instead?
                    return res.send({
                        success: false,
                        error: "A location with that nickname already exists"
                    });
                }).catch((err) => {
                // If we couldn't find the username let the user know
                return res.send({
                    success: false,
                    error: 'Username not found'
                });
            });
        });
    } else if (!lat || !lon) {
        return res.send({
            success: false,
            msg: "Latitude or longitude must not be blank"
        });
    } else if (isNaN(lat) || isNaN(lon))  {
        return res.send({
            success: false,
            msg: "Latitude or longitude must be a coordinate"
        });
    } else {
        // Select the username from the Members table so that we can aquire the MemberID
        db.one('SELECT MemberID FROM Members WHERE Username=$1', [username]).then(row => {

            let params = [row['memberid'], nickname, lat, lon];

            db.none("INSERT INTO Locations (MemberID, Nickname, lat, long) VALUES ($1, $2, $3, $4)", params)
                .then(() => {
                    console.log("Location added!");
                    res.send({
                        success: true,
                        msg: 'Location added'
                    });
                })
                .catch((err) => {
                    // If we fail here its likely because we violated the uniqueness constraint
                    // Maybe we should upated instead?
                    res.send({
                        success: false,
                        error: "A location with that nickname already exists"
                    });
                }).catch((err) => {
                // If we couldn't find the username let the user know
                res.send({
                    success: false,
                    error: 'Username not found'
                });
            });
        });
    }
});


router.delete("/locations", (req, res) => {
    res.type("application/json");

    let username = req.query['username'];
    let nickname = req.query['nickname'];

    // Inform the user if they didn't enter username or location
    if (!username) {
        return res.send({
            success: false,
            msg: "Username must not be blank"
        });
    } else if (!nickname) {
        return res.send({
            success: false,
            msg: "Nickname must not be blank"
        });
    }

    // Select the username from the Members table so that we can aquire the MemberID
    db.one('SELECT MemberID FROM Members WHERE Username=$1', [username])
        .then(row => {

            let params = [row['memberid'], nickname];
            console.log(params);
            // Delete one record and return * the number of records deleted
            db.one("DELETE FROM Locations WHERE (MemberID=$1) AND (Nickname=$2) RETURNING *", params)
                .then(() => {
                    res.send({
                        success: true,
                        msg: 'Location removed'
                    });
                }).catch((err) => {
                // If we error here we didnt find a location
                res.send({
                    success: false,
                    error: "A location with that nickname does not exists"
                });
            }).catch((err) => {
                // If we couldn't find the username let the user know
                res.send({
                    success: false,
                    error: 'Username not found'
                });
            });
        }).catch((err) => {
            // If we couldn't find the username let the user know
            res.send({
                success: false,
                error: 'And this time the username was REALLY not found'
            });
        });
});
// #################     Save Weather Data  ##########################

module.exports = router;
