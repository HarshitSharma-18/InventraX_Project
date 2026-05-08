const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://qmturbsrhoifplupnbzx.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtdHVyYnNyaG9pZnBsdXBuYnp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzczNTUsImV4cCI6MjA5MjAxMzM1NX0.oBJahwYP41TBuEFAYdFNCiU49KNCDiA5Sst9dk5T4ys';

const supabaseMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.split('.').length === 3) {
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    const token = authHeader.replace('Bearer ', '').trim();
    
    // Verify the token and get the user
    const { data: { user }, error } = await client.auth.getUser(token);
    
    if (error) {
      console.error('Supabase Auth Error:', error.message);
    }
    
    if (!error && user) {
      req.supabase = client;
      req.user = user;
    } else {
      req.supabase = createClient(supabaseUrl, supabaseAnonKey);
    }
  } else {
    req.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  
  next();
};

module.exports = supabaseMiddleware;
