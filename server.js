const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    "https://www.ssinteriors.online", // Deployed frontend
    "http://localhost:3000"           // Local testing
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.options('*', cors());
app.use(express.json());

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS // App password
  }
});

// API endpoint to handle enquiries
app.post('/api/enquiry', (req, res) => {
  const {
    name,
    email,
    phone,
    projectType,
    houseType,
    budget,
    location,
    timeline,
    description
  } = req.body;

  // ✅ Respond immediately so frontend feels fast
  res.status(200).json({
    success: true,
    message: 'Enquiry received! We will contact you soon.'
  });

  // ⏳ Send email in background
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: "ssinteriorsliving@gmail.com",
    subject: `New Interior Design Enquiry - ${name}`,
    html: `
      <h2>New Enquiry from SS Interiors Website</h2>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 10px;">
        <h3>Contact Information:</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        
        <h3>Project Details:</h3>
        <p><strong>Project Type:</strong> ${projectType}</p>
        ${projectType === "residential" && houseType 
          ? `<p><strong>House Type:</strong> ${houseType}</p>` 
          : ""}
        <p><strong>Budget:</strong> ${budget || 'Not specified'}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Timeline:</strong> ${timeline || 'Not specified'}</p>
        
        <h3>Description:</h3>
        <p>${description || 'No additional details provided'}</p>
        
        <hr>
        <p><em>Submitted on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</em></p>
      </div>
    `
  };

  transporter.sendMail(mailOptions)
    .then(() => console.log("✅ Enquiry email sent"))
    .catch(err => console.error("❌ Error sending email:", err));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
