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


function sendWelcomeEmail(firstName, email) {

  let welcomeSubject = "A refactored Welcome! ";
  let welcomeMessage = "<strong>A refactored Welcome to our app " + firstName + "!</strong>";

sendEmail("admin@ourapp.com", email, welcomeSubject, welcomeMessage);
}


async function sendVerificationEmail(firstName, email, request, token) {

  let subject = "Account Verification Required";

  let address = "http://" + request.headers.host + "/confirm?token=" + token.token;
  
  let message = `<html>
                    <body>
                      <h2>Hello ${firstName}, please click the link below to confirm your email address</h2>
                      <a href="${address}">${address}</a>
                    </body>
                  </html>`
  return await sendEmail("no-reply@ourapp.com", email, subject, message);
  
}



async function sendPasswordEmail(email, newPassword) {

  let subject = "Temporary Password for Chatter";

  let message = `<html>
                    <body>
                      <h2>Hello , please use the password below as sign in into the app</h2>
                      <a href="${newPassword}">${newPassword}</a>
                    </body>
                  </html>`
  return await sendEmail("no-reply@ourapp.com", email, subject, message);
  
}



module.exports = {
  sendEmail, sendWelcomeEmail, sendVerificationEmail, sendPasswordEmail
}