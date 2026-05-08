exports.getProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data, error } = await req.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // Profile doesn't exist yet, return empty or default
      return res.status(404).json({ error: 'Profile not found' });
    }

    if (error) throw error;

    return res.status(200).json(data);
  } catch (err) {
    console.error('Profile fetch error:', err);
    return res.status(500).json({ error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const updatedProfile = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const payload = {
      id: userId,
      name: updatedProfile.name,
      email: updatedProfile.email,
      phone: updatedProfile.phone,
      role: updatedProfile.role,
      address: updatedProfile.address,
      photo_url: updatedProfile.photo_url,
      updated_at: new Date()
    };

    const { error } = await req.supabase
      .from('profiles')
      .upsert(payload);

    if (error) {
      console.error("Supabase Upsert Error:", error);
      return res.status(500).json({ error: error.message || 'Database error' });
    }
    
    return res.status(200).json({ success: true, message: 'Profile updated successfully' });
  } catch (err) {
    console.error("Update Profile Error:", err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
};
