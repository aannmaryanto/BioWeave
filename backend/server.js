const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const documentRoutes = require('./src/routes/documentRoutes');
const searchRoutes = require('./src/routes/searchRoutes');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Database asynchronously
connectDB();

// Root Endpoint
app.get('/', (req, res) => {
  res.json({
    message: "Welcome to BioWeave API"
  });
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: "ok",
    message: "BioWeave API is running"
  });
});

// Mount Authentication, Dashboard, Document & Search Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/search', searchRoutes);

// Read PORT from process.env or fallback to 5000
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`🚀 BioWeave Backend server running on port ${PORT}`);
});
