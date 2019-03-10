const express = require('express');

let router = express.Router();

//Create connection to Heroku Database
let db = require('../utilities/utils').db;



/** Fetch all of the contacts for the given user */
router.get("/", (req, res) => {
    res.type("application/json");

    let username = req.query['username'];
    // let sentTo = req.query['sent_to'];
    // let sentFrom = req.query['sent_from'];

    // Inform the user if they didn't enter username or location
    if (!username) {
        return res.send({
            success: false,
            message: "Your request was not understand"
        });
    }

    
        // Select the username from the Members table so that we can aquire the MemberID
        
        let query = `SELECT name, chatId FROM CHATS WHERE  CHATID IN (SELECT chatID FROM 
                CHATMEMBERS WHERE MEMBERID = $1)`;

        db.one('SELECT MemberID FROM Members WHERE Username=$1', [username]).then(row => {
            let params = [row['memberid']];
            // Fetch all of the chats  
            db.many(query, params).then(data => {
                res.send({
                    success: true,                
                    data: data,
                    message: 'Retreived ALL Recent chats'
                });
            })
            .catch(function (err) {
                console.log("ERROR Retreiving ALL Chats!" + err);
                return res.send({
                    success: false,
                    message: "No chats found!"
                });
            });
        })
        .catch((err) => {
            res.send({
                success: false,
                message: "User does not exist!"
            });
        });
    
   
});



module.exports = router;