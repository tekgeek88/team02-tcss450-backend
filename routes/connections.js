const express = require('express');

let router = express.Router();

//Create connection to Heroku Database
let db = require('../utilities/utils').db;


/** Fetch all of the contacts for the given user */
router.get("/", (req, res) => {
    res.type("application/json");

    let username = req.query['username'];
    let sentTo = req.query['sent_to'];
    let sentFrom = req.query['sent_from'];

    // Inform the user if they didn't enter username or location
    if (!username && !setTimeout && !sentFrom) {
        return res.send({
            success: false,
            msg: "Your request was not understand"
        });
    }

    if (username) {
        // Select the username from the Members table so that we can aquire the MemberID
        db.one('SELECT MemberID FROM Members WHERE Username=$1', [username]).then(row => {
            let params = [row['memberid']];
            // Fetch all of the contacts with mutual connections to the given username 
            db.many('SELECT * FROM Contacts WHERE MemberId_A = $1 OR MemberId_B = $1', params).then(data => {
                res.send({
                    status: 'success',                
                    data: data,
                    message: 'Retreived ALL contacts'
                });
            })
            .catch(function (err) {
                console.log("ERROR Retreiving ALL Contacts!" + err);
                return next(err);
            });
        })
        .catch((err) => {
            res.send({
                success: false,
                error: "User does not exist!"
            });
        });
    } else if (sentTo) {
        // Select the username from the Members table so that we can aquire the MemberID
        db.one('SELECT MemberID FROM Members WHERE Username=$1', [sentTo]).then(row => {
            let params = [row['memberid']];
            console.log(params);
            db.many('SELECT * FROM Contacts WHERE MemberId_B = $1', params).then(data => {
                return res.send({
                        status: 'success',                
                        data: data,
                        message: 'Retreived ALL contacts SENT TO memberB!'
                });
            })
            .catch(function (err) {
                console.log("ERROR Retreiving ALL Contacts!" + err);
                return res.send({
                    success: false,
                    error: "User does not exist!"
                });
            });
        })
        .catch((err) => {
            return res.send({
                    success: false,
                    error: "User does not exist!"
            });
        });
    } else if (sentFrom) {
        console.log(sentFrom);
        // Select the username from the Members table so that we can aquire the MemberID
        db.one('SELECT MemberID FROM Members WHERE Username=$1', [sentFrom]).then(row => {
            let params = [row['memberid']];
            console.log(params);
            db.many('SELECT * FROM Contacts WHERE MemberId_A = $1', params).then(data => {
                res.send({
                    status: 'success',                
                    data: data,
                    message: 'Retreived ALL contacts SENT FROM memberA!'
                });
            })
            .catch(function (err) {
                console.log("ERROR Retreiving ALL Contacts!" + err);
                return res.send({
                    success: false,
                    error: "User does not exist!"
                });
            });
        })
        .catch((err) => {
            return res.send({
                    success: false,
                    error: "User does not exist!"
            });
        });
    }
});


/** Create a connection request from userA to userB */
router.put("/", (req, res) => {
    res.type("application/json");
    
    let sentFromUsername = req.query['sent_from'];
    let sentToUsername = req.query['sent_to'];

    // Inform the user if they didn't enter username
    if (!sentFromUsername || !sentToUsername) {
        return res.send({
            success: false,
            msg: "Two users are required to create a connection"
        });
    }

    db.one('SELECT MemberID FROM Members WHERE Username=$1', [sentFromUsername]).then(row => {
        let memberIdA = row['memberid'];
        db.one('SELECT MemberID FROM Members WHERE Username=$1', [sentToUsername]).then(row => {
            let memberIdB = row['memberid'];
            console.log("inserting: " + memberIdA, memberIdB);
            db.none("INSERT INTO Contacts (MemberID_A, MemberID_B) VALUES ($1, $2)", [memberIdA, memberIdB]).then(() => {
                return res.send({
                    success: true,
                    msg: 'Connection request has been made!'
                });
            })
            .catch((err) => {
                console.log("ERROR: " + err);
                return res.send({
                    success: false,
                    error: "Could not add connection from memberA to memberB"
                });
            })
        })
        .catch((err) => {
            console.log("Couldn't find MemberIdB");
            return res.send({
                success: false,
                error: 'Username not found'
            });
        })
    })
    .catch((err) => {
        // If we couldn't find the username let the user know
        console.log("Couldn't find MemberIdA");
        return res.send({
            success: false,
            error: 'Username not found'
        });
    })


});// End router.put()


// ########   Delete a forecast location   ########
router.delete("/", (req, res) => {
    res.type("application/json");
    
    let sentFromUsername = req.query['sent_from'];
    let sentToUsername = req.query['sent_to'];

    // Inform the user if they didn't enter username
    if (!sentFromUsername && !sentToUsername) {
        return res.send({
            success: false,
            msg: "Two users are required to create a connection"
        });
    }

    db.one('SELECT MemberID FROM Members WHERE Username=$1', [sentFromUsername]).then(row => {
        let memberIdA = row['memberid'];
        db.one('SELECT MemberID FROM Members WHERE Username=$1', [sentToUsername]).then(row => {
            let memberIdB = row['memberid'];
            console.log("removing: " + memberIdA, memberIdB);
            db.one("DELETE FROM Contacts WHERE ((MemberID_A=$1) AND (MemberID_B=$2)) RETURNING *", [memberIdA, memberIdB]).then(nothing => {
                return res.send({
                    success: true,
                    msg: 'Connection has been REMOVED!'
                });
            })
            .catch((err) => {
                console.log("ERROR: " + err);
                return res.send({
                    success: false,
                    error: "Could not DELETE connection between memberA and memberB"
                });
            });
        })
        .catch(err => {
            console.log("Couldn't find MemberIdB");
            return res.send({
                success: false,
                error: 'Username not found'
            });
        });
    })    
    .catch(err => {
        console.log("Couldn't find MemberIdB");
        return res.send({
            success: false,
            error: 'Username not found'
        });
    });  
});
    


// ########   Retrieve Weather Data - Hourly forecasts  ########
router.get("/confirm", (req, res) => {
    res.type("application/json");
    
    let sentFromUsername = req.query['sent_from'];
    let sentToUsername = req.query['sent_to'];

    // Inform the user if they didn't enter username
    if (!sentFromUsername && !sentToUsername) {
        return res.send({
            success: false,
            msg: "Two users are required to verify a connection"
        });
    }

    db.one('SELECT MemberID FROM Members WHERE Username=$1', [sentFromUsername]).then(row => {
        let memberIdA = row['memberid'];
        db.one('SELECT MemberID FROM Members WHERE Username=$1', [sentToUsername]).then(row => {
            let memberIdB = row['memberid'];
            console.log("Retreived ID's: " + memberIdA, memberIdB);
            db.one("UPDATE Contacts SET Verified=$1 WHERE ((MemberID_A=$2) AND (MemberID_B=$3)) RETURNING *", [1, memberIdA, memberIdB]).then(nothing => {
                return res.send({
                    success: true,
                    msg: 'Connection has been CONFIRMED!'
                });
            })
            .catch((err) => {
                console.log("ERROR: " + err);
                return res.send({
                    success: false,
                    error: "Could not CONFIRM connection between memberA and memberB"
                });
            });
        })
        .catch(err => {
            console.log("Couldn't find MemberIdB");
            return res.send({
                success: false,
                error: 'Username not found'
            });
        });
    })    
    .catch(err => {
        console.log("Couldn't find MemberIdB");
        return res.send({
            success: false,
            error: 'Username not found'
        });
    });
});


// ########   Fetched saved weather data   ########
router.get("/invite", (req, res) => {
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



module.exports = router;