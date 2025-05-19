const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter using environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for port 465, false for 587
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const mailOptions = {
  from: {
    name: 'Mohit',
    address: process.env.GMAIL_USER,
  },
  to: ['mksinghmk@gmail.com'],
  subject: 'Hello This is Mohit',
  text: 'Hello',
  html: '<b>Hello Mohit</b>',
};

const sendMail = async () => {
  try {
    await transporter.sendMail(mailOptions);
    console.log('Email has been sent successfully');
  } catch (error) {
    console.error('Error sending email:', error.message);
  }
};

module.exports = sendMail;


