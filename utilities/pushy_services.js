var Pushy = require('pushy');

// Plug in your Secret API Key 
var pushyAPI = new Pushy(process.env.PUSHY_API_KEY);

//use to send message to all clients registered to a Topoic 
function sendToTopic(topic, msg, from, chatId) {
    //build the message for FCM to send
    console.log("This weird shit is running!");
    var data = {
        "type": "topic_msg",
        "sender": from,
        "message": msg,
        "chat_id": chatId
    };

    console.log(data);

    to = '/topics/' + topic; 

    // Send push notification via the Send Notifications API 
    // https://pushy.me/docs/api/send-notifications 
    pushyAPI.sendPushNotification(data, to, {}, function (err, id) {
        // Log errors to console 
        if (err) {
            return console.log('Fatal Error', err);
        }

        // Log success 
        console.log('Push sent successfully! (ID: ' + id + ')');
    });
}

//use to send message to a specific client by the token
function sendToIndividual(token, msg, from, chatId) {
    console.log("sending to individual: ");
    //build the message for FCM to send
    var data = {
        "type": "msg",
        "sender": from,
        "message": msg,
        "chat_id": chatId
    };

    console.log(data);

    // Send push notification via the Send Notifications API 
    // https://pushy.me/docs/api/send-notifications 
    pushyAPI.sendPushNotification(data, token, {}, function (err, id) {
        // Log errors to console 
        if (err) {
            return console.log('Fatal Error', err);
        }

        // Log success 
        console.log('Push sent successfully! (ID: ' + id + ')');
    });
}

//use to send message to a specific client by the token
                    //  id, firstname, lastname, sentFromUsername); 
function sendFriendRequest(token, id, fromFirstname, fromLastname, fromUsername) {
    console.log("sending friend request notification: ");
    //build the message for FCM to send
    var data = {
        "type": "conn",
        "sender": fromUsername,
        "message": fromFirstname +" sent you a friend request!",
        "id": id,
        "firstname": fromFirstname,
        "lastname": fromLastname,
        "isVerified": 0
    };

    console.log(data);

    // Send push notification via the Send Notifications API 
    // https://pushy.me/docs/api/send-notifications 
    pushyAPI.sendPushNotification(data, token, {}, function (err, id) {
        // Log errors to console 
        if (err) {
            return console.log('Fatal Error', err);
        }

        // Log success 
        console.log('Push sent successfully! (ID: ' + id + ')');
    });
}

module.exports = {
    sendToTopic, sendToIndividual, sendFriendRequest
};