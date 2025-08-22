const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    "https://ssinteriorliving.netlify.app", // ✅ Replace with actual Netlify domain
    "http://localhost:3000" // ✅ For local testing
  ],
  methods: ["GET", "POST"],
}));

app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ssinteriors', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Enquiry Schema
const enquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  projectType: { type: String, required: true },
  budget: String,
  location: { type: String, required: true },
  timeline: String,
  description: String,
  submittedAt: { type: Date, default: Date.now }
});

const Enquiry = mongoose.model('Enquiry', enquirySchema);

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS  // App password (NOT your normal Gmail password)
  }
});

// API endpoint to handle enquiries
app.post('/api/enquiry', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      projectType,
      budget,
      location,
      timeline,
      description
    } = req.body;

    // Save to MongoDB
    const enquiry = new Enquiry({
      name,
      email,
      phone,
      projectType,
      budget,
      location,
      timeline,
      description
    });

    await enquiry.save();

    // Send email notification
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

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'Enquiry submitted successfully and email sent!'
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit enquiry'
    });
  }
});

// Get all enquiries (optional - for admin panel)
app.get('/api/enquiries', async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ submittedAt: -1 });
    res.json(enquiries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch enquiries' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
