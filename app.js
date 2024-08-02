const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to take our messages');
  }
});

// Route to handle form submission
app.post('/submit', (req, res) => {
  const {  name, email, subject, phonenumber, property, message } = req.body;
  console.log('Form submission received:', req.body);

  if (!name || !email || !message) {
    console.log('Validation failed');
    return res.status(400).json({ error: 'Name, Email, and Message are required fields' });
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'yourfirstestate@gmail.com', // Replace with the recipient's email
    subject: subject || 'New Form Submission',
    text: `You have a new form submission from:
    
    Name: ${name}
    Email: ${email}
    Phone Number: ${phonenumber}
    Property: ${property}
    Message: ${message}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ error: 'Error sending email' });
    }
    console.log('Email sent:', info.response);
    res.status(200).json({ message: 'Form data submitted successfully' });
  });
});

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html')); // Correctly resolves the path to the HTML file
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
