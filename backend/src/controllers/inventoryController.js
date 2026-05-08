// Remove ownership import as we now use database-level user_id filtering

exports.getInventory = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { data, error } = await req.supabase
      .from('items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const mappedData = data.map(i => ({
      id: i.id,
      name: i.name,
      category: i.category,
      price: Number(i.price),
      quantity: i.stock,
      available: i.available
    }));

    return res.status(200).json(mappedData);
  } catch (err) {
    console.error("Fetch inventory error:", err);
    return res.status(500).json({ error: err.message });
  }
};

exports.addOrUpdateItem = async (req, res) => {
  try {
    const item = req.body;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const payload = {
       name: item.name,
       category: item.category,
       price: item.price,
       stock: item.quantity,
       available: item.available,
       user_id: userId
    };
    
    if (item.id && item.id.includes('-')) {
       payload.id = item.id; 
    }

    const { data, error } = await req.supabase.from('items').upsert(payload).select().single();
    
    if (error) throw error;

    return res.status(200).json(data);
  } catch(err) {
    console.error("Upsert Item Error:", err);
    return res.status(500).json({ error: err.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { error } = await req.supabase.from('items').delete().eq('id', id).eq('user_id', userId);
    
    if (error) throw error;

    return res.status(200).json({ success: true });
  } catch(err) {
    console.error("Delete Error:", err);
    return res.status(500).json({ error: err.message });
  }
};
