// Express is the framework we're going to use to handle requests
const express = require('express');
// Create a new instance of express
const app = express();
// Ese middleware to distribute JWT tokens
let middleware = require('./utilities/middleware');


//############   Community Routes   ############
app.use('/login', require('./routes/login.js'));
app.use('/register', require('./routes/register.js'));
app.use('/confirm', require('./routes/confirm.js'));
app.use('/changePassword', require('./routes/changePassword.js'));
app.use('/resetPassword', require('./routes/resetPassword.js'));

//############   Weather Routes   ############
app.use('/weather', middleware.checkToken, require('./routes/weather.js'));

//############   Messaging Routes   ############
app.use('/pushy', middleware.checkToken, require('./routes/pushy.js'));
app.use('/messaging', middleware.checkToken, require('./routes/messaging.js'));
app.use('/connections', middleware.checkToken, require('./routes/connections.js'));
app.use('/recentChats', middleware.checkToken, require('./routes/recentChats.js'));
app.use('/startChat', middleware.checkToken, require('./routes/startChat.js'));



//############   Test Routes   ############
app.use('/hello', require('./routes/hello.js'));

/*
 * Return HTML for the / end point. 
 * This is a nice location to document your web service API
 * Create a web page in HTML/CSS and have this end point return it. 
 * Look up the node module 'fs' ex: require('fs');
 */
app.get("/", (req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    for (i = 1; i < 7; i++) {
        //write a response to the client
        res.write('<h' + i + ' style="color:blue">Hello World!</h' + i + '>'); 
    }
    res.end(); //end the response
});

/* 
* Heroku will assign a port you can use via the 'PORT' environment variable
* To accesss an environment variable, use process.env.<ENV>
* If there isn't an environment variable, process.env.PORT will be null (or undefined)
* If a value is 'falsy', i.e. null or undefined, javascript will evaluate the rest of the 'or'
* In this case, we assign the port to be 5000 if the PORT variable isn't set
* You can consider 'let port = process.env.PORT || 5000' to be equivalent to:
* let port; = process.env.PORT;
* if(port == null) {port = 5000} 
*/ 
app.listen(process.env.PORT || 5000, () => {
    console.log("Server up and running on port: " + (process.env.PORT || 5000));
});