const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

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
