const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const inventoryRoutes = require('./src/routes/inventory');
const billsRoutes = require('./src/routes/bills');
const revenueRoutes = require('./src/routes/revenue');
const authRoutes = require('./src/routes/auth');
const profileRoutes = require('./src/routes/profile');
const udharRoutes = require('./src/routes/udhar');

const supabaseMiddleware = require('./src/middleware/supabase');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; connect-src *;");
  next();
});
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(supabaseMiddleware);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/inventory', inventoryRoutes);
app.use('/api/bills', billsRoutes);
app.use('/api/revenue', revenueRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/udhar', udharRoutes);

// Image Upload Endpoint
app.post('/api/upload', async (req, res) => {
  try {
    const { id, type, imageBase64 } = req.body;
    if (!id || !type || !imageBase64) return res.status(400).json({ error: 'Missing parameters' });
    
    const { supabase } = require('./src/config/db');

    // If it's already a URL, just return it
    if (!imageBase64.includes('base64,')) {
       return res.json({ url: imageBase64 });
    }

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    const fileName = `${type}_${id}_${Date.now()}.png`;

    // Upload to Supabase Storage (Bucket: 'images')
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, buffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (error) {
      console.error("Supabase Storage Upload Error Detail:", JSON.stringify(error, null, 2));
      throw error;
    }

    // Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(fileName);
    
    return res.json({ url: publicUrl });
  } catch (err) {
    console.error("Upload Error:", err);
    let message = err.message || "Internal Server Error";
    if (message.includes("Bucket not found")) {
      message = "Storage bucket 'images' not found. Please create it in Supabase Storage.";
    }
    return res.status(500).json({ error: message });
  }
});

// General Error Handler
app.use((err, req, res, next) => {
  console.error('Global Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Backend Server running seamlessly on http://localhost:${PORT}`);
});

