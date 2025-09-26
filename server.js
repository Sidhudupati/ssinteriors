const express = require('express');
const cors = require('cors');
require('dotenv').config();
const SibApiV3Sdk = require('sib-api-v3-sdk');

const app = express();

// Middleware
app.use(cors({
  origin: [
    "https://www.ssinteriors.online",
    "http://localhost:3000"
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.options('*', cors());
app.use(express.json());

// Setup Brevo API client
const client = SibApiV3Sdk.ApiClient.instance;
client.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;
const brevoApi = new SibApiV3Sdk.TransactionalEmailsApi();

// API endpoint to handle enquiries
app.post('/api/enquiry', async (req, res) => {
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

  // Respond immediately
  res.status(200).json({
    success: true,
    message: 'Enquiry received! We will contact you soon.'
  });

  // Send email via Brevo
  try {
    const sendEmailResponse = await brevoApi.sendTransacEmail({
      sender: { email: "info@ssinteriors.online", name: "SS Interiors" },
      to: [{ email: "ssinteriorsliving@gmail.com" }], // your receiving email
      subject: `New Interior Design Enquiry - ${name}`,
      htmlContent: `
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
    });

    console.log("✅ Enquiry email sent via Brevo:", sendEmailResponse);
  } catch (err) {
    console.error("❌ Error sending email via Brevo:", err);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
