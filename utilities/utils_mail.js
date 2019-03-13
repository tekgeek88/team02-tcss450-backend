const nodemailer = require('nodemailer');


function emailHandler(error, info) {
  if (error) {
    console.log('##############  BEGIN sendMail ERROR  ##############');
    console.log(error);
    console.log('##############  END sendMail ERROR  ##############');
  } else {
    console.log(info.response);
  }
}

// This method handles the sending of all emails
async function sendEmail(from, receiver, subj, message) {
  
  // We only need to create the transport opbject once.
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // Build the email ooptions
  let mailOptions = {
    from: from,
    to: receiver,
    subject: subj,
    html: message
  };

  return await transporter.sendMail(mailOptions);

  // Send the message
  // transporter.sendMail(mailOptions, emailHandler);
}


async function sendWelcomeEmail(firstName, email) {

  let welcomeSubject = "A refactored Welcome! ";
  let welcomeMessage = "<strong>A refactored Welcome to our app " + firstName + "!</strong>";

return await sendEmail("uw.chatter.app@gmail.com", email, welcomeSubject, welcomeMessage);
}

async function sendInvitationEmail(toEmail, fromFirstName) {

  let welcomeSubject = `You have been invited to join the Chatter community!`;
  let message = `<html>
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
              <h2> ${fromFirstName} would like you to join the Chatter community!</h2>
              </div>
          </nav>
      
  <div id="wrapper">
      <section>
          <body>
              <div id="body-wrapper">
                  <h4> Chatter is a great community full of awesome people like yourself who enjoy to chat and talk about the weather.</h4>
                  <p>
                  Consider this your formal invitation to join our community from your friend ${fromFirstName}.
                  </p>
                  <p> If chatting about the weather is not your thing, have no worries. There is no obligation
                      and you are free to ignore this email if you wish.
                  </p>
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
  return await sendEmail("uw.chatter.app@gmail.com", toEmail, welcomeSubject, message);
}


async function sendVerificationEmail(firstName, email, request, token) {

  let subject = "Account Verification Required";
  let address = "http://" + request.headers.host + "/confirm?token=" + token.token;

  let message = `<html>
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
              <h2> Please confirm your email address</h2>
              </div>
          </nav>
      
  <div id="wrapper">
      <section>
          <body>
              <div id="body-wrapper">

                  <h4>Hi ${firstName}, thank you for choosing to join the Chatter community!<br>
                  In order and to keep it safe and spam free we require all users to verify their email address.</h4>
                  <p>
                  Please follow the link below to confirm your email account.<br>
                  <a href="${address}">${address}</a>
                  </p>
                  <p> If chatting about the weather is not your thing, have no worries. There is no obligation
                      and you are free to ignore this email if you wish.
                  </p>
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
  return await sendEmail("uw.chatter.app@gmail.com", email, subject, message);
}


async function sendPasswordEmail(email, newPassword) {

  
  let subject = "Temporary Password for Chatter";

  let message = `<html>
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
              <h2>Your temporary password</h2>
              </div>
          </nav>
      
  <div id="wrapper">
      <section>
          <body>
              <div id="body-wrapper">

                  <h4>Your temporary password has been generated and may now be used to sign in</h4>
                  <p>
<<<<<<< HEAD
                  Please click the link below to reset your password.<br>
                  <a href="${newPassword}">${newPassword}</a>
                  </p>
                  <p>If you did not make this request please disregard and contact an admin
=======
                  Just re-open Chatter and use your new temporary password to sign in.<br><br>
                  ${newPassword}
>>>>>>> email-message-updates
                  </p>
                  <p> Have a great day!<br><br>
  
  
                  <p> Sincerely,<br>
                  The Chatter Community
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
  </html>`;

  return await sendEmail("uw.chatter.app@gmail.com", email, subject, message);
  
}



module.exports = {
  sendEmail, sendWelcomeEmail, sendVerificationEmail, sendPasswordEmail, sendInvitationEmail
}