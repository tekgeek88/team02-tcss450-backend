//express is the framework we're going to use to handle requests
const express = require('express');

//Create connection to Heroku Database
let db = require('../utilities/utils').db;

var router = express.Router();
const bodyParser = require("body-parser");

//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json());

let msg_functions = require('../utilities/utils').messaging;

//send a message to all users "in" the chat session with chatId
router.post("/send", (req, res) => {
    let email = req.body['email'];
    let message = req.body['message'];
    let chatId = req.body['chatId'];
    if(!email || !message || !chatId) {
        return res.send({
                success: false,
                error: "email, message, or chatId not supplied"
        });
        
    }
    //add the message to the database
    let insert = `INSERT INTO Messages(ChatId, Message, MemberId)
                  SELECT $1, $2, MemberId FROM Members 
                  WHERE email=$3`
    db.none(insert, [chatId, message, email])
    .then(() => {

        //send a notification of this message to ALL members with registered tokens
        db.manyOrNone('SELECT * FROM Push_Token')
        .then(rows => {
            rows.forEach(element => {
                msg_functions.sendToIndividual(element['token'], message, email);
            });
            return res.send({
                    success: true
            });
        }).catch(err => {
            console.log(err);
            return res.send({
                    success: false,
                    error: err
            });
        })
    }).catch((err) => {
        console.log(err);
        return res.send({
                success: false,
                error: err
        });
    });
});

//Get all of the messages from a chat session with id chatid
router.post("/getAll", (req, res) => {
    res.type("application/json");

    let chatId = req.body['chat_id'];
    console.log("chat_id: " + chatId);
    if (!chatId) {
        console.log("ERROR: CHAT_ID is required for retrieving the messages of a chat room!" );
        return res.send({
                success: false,
                message: "CHAT_ID is required for retrieving the messages of a chat room!"
        })
    }
    
    let query = `SELECT Messages.chatid, Members.username, Members.email, Messages.message, 
                 to_char(Messages.Timestamp AT TIME ZONE 'PDT', 'YYYY-MM-DD HH24:MI:SS.US' ) AS Timestamp
                 FROM Messages
                 INNER JOIN Members ON Messages.MemberId=Members.MemberId
                 WHERE ChatId=$1 
                 ORDER BY Timestamp DESC`
    db.manyOrNone(query, [chatId])
    .then((rows) => {
        if (!rows.length) {
            return res.send({
                success: false,
                message: "Unable to find any messages for the given CHAT_ID"
            });
        } else {
            return res.send({
                success: true,
                data: rows,
                message: "Returning all messages for the given CHAT_ID"
            });
        }
    }).catch((err) => {
        console.log("ERROR: Couldn't return many or none of the messages for the given CHAT_ID\n" + err );
        return res.send({
                success: false,
                message: "Couldn't return many or none of the messages for the given CHAT_ID"
        })
    });
});
module.exports = router;
