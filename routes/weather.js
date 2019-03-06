const express = require('express');

let router = express.Router();

// request module is needed to make a request to a web service
const httpRequest = require('request');

//Create connection to Heroku Database
let db = require('../utilities/utils').db;

//######    YAHOO WEATHER OAUTH API     ########
let OAuth = require('oauth');

// ##### OAuth Headers for Yahoo Weather
let header = {
    "Yahoo-App-Id": process.env.YAHOO_APP_ID
};

// ##### OAuth Request body for Yahoo Weather
let request = new OAuth.OAuth (
    null, null,
    process.env.YAHOO_CLIENT_ID,
    process.env.YAHOO_CLIENT_SECRET,
    '1.0', null, 'HMAC-SHA1', null,
    header
);


// ########   Retrieve current OR daily forecast  ########
router.get("/forecast", (req, res) => {
    res.type("application/json");
    let url = `https://weather-ydn-yql.media.yahoo.com/forecastrss?`;
    let location = req.query['location'] || "";
    let lat = req.query['lat'] || "";
    let lon = req.query['lon'] || "";
    let units = req.query['u'] || 'f';

    if (location) {
        if(isNaN(location)) {
            return res.send({
                success: false,
                error: "Please check your URL and zip code befre trying again"
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
                console.log("URL: " + url);
                console.log(err);
                return res.send({
                    success: false,
                    msg: "Could not connect to 3rd party weather provider"
                });
            } else {
                res.type("application/json");
                res.send(data);
            }
        }
    );
});


// ########   Retrieve Weather Data - Hourly forecasts  ########
router.get("/forecast/hourly", (req, res) => {
    res.type("application/json");
    let urlYahoo = `https://weather-ydn-yql.media.yahoo.com/forecastrss?`;
    let urlDarkSky = `https://api.darksky.net/forecast/${process.env.DARK_SKY_SECRET_KEY}/`;
    let location = req.query['location'] || "";
    let lat = req.query['lat'] || "";
    let lon = req.query['lon'] || "";
    let latPlusLon = `${lat},${lon}`;
    let units = req.query['u'] || 'f';

    // This is great, we've recieved lat and long's and can hit the API like normal
    if (location) {
        if(isNaN(location)) {
            return res.send({
                success: false,
                error: "Please check your URL and zip code and try again"
            });
        } else {
            urlYahoo += `location=${location}&u=${units}&format=json`;
        }
        request.get(urlYahoo, null, null, (error, data, result)  => {
            if (error) {
                return res.send({
                    success: false,
                    message: "Could not connect to 3rd party weather provider"
                });            
            } else {
                let desiredLat = JSON.parse(data).location.lat;
                let desiredLon = JSON.parse(data).location.long;
                latPlusLon = `${desiredLat},${desiredLon}`; 
                urlDarkSky += latPlusLon;
                httpRequest.get(urlDarkSky, function (error, response, body) {
                    if (error) {
                        console.log(error);
                        return res.send({
                            success: false,
                            error: "Couldn't connect to the the Forecast.IO API"
                        });
                    } else {
                        res.send(JSON.parse(body));    
                    }
                }); 
            }      
        });
    } else {
        if (lat && lon) {
            if (isNaN(lat) || isNaN(lon)) {
                return res.send({
                    success: false,
                    error: "Please check your URL and Zip code before trying again"
                });
            } else {
                urlDarkSky += latPlusLon;
                httpRequest.get(urlDarkSky, function (error, response, body) {
                    if (error) {
                        console.log(error);
                        return res.send({
                            success: false,
                            error: "Couldn't connect to the the Forecast.IO API"
                        });
                    } else {
                        return res.send(body);    
                    }
                });
            }
        }
    }
});


// ########   Fetched saved weather data   ########
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


// ########   Insert a forecast location   ########
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


// ########   Delete a forecast location   ########
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
