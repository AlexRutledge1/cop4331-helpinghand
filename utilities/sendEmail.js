const nodemailer = require("nodemailer");

let mailTransporter = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: "helpinghand-111@outlook.com",
    pass: "Helpinghand1"
  }
});

function Email(to, sub, content) {
  let mailDetails = {
    from: "helpinghand-111@outlook.com",
    to: to,
    subject: sub,
    html: content
  }
  mailTransporter.sendMail(mailDetails, function(err, data) {
    if(err) {
        console.log('Error Occurs');
    } else {
        console.log('Email sent successfully ' + data.response);
    }
});
}
// Export the registerEmail function
module.exports = {
  Email
};