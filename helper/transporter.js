const nodemailer = require("nodemailer");
// Defining the account for sending email
module.exports= nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  // secure: true, // use TLS
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});
 
 
