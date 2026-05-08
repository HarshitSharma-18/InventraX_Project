// Removed global supabase import in favor of req.supabase for verified user isolation

exports.getLast7DaysRevenue = async (req, res) => {
  try {
    // 1. Generate the last 7 dates programmatically (YYYY-MM-DD local time format)
    const datesMap = new Map();
    for (let i = 0; i < 7; i++) {
       const d = new Date();
       d.setDate(d.getDate() - i);
       
       // Ensure formatting handles timezone consistently: YYYY-MM-DD
       const year = d.getFullYear();
       const month = String(d.getMonth() + 1).padStart(2, '0');
       const day = String(d.getDate()).padStart(2, '0');
       const dateStr = `${year}-${month}-${day}`;
       
       // Initialize each day with 0 to handle missing data explicitly
       datesMap.set(dateStr, 0); 
    }

    // 2. Fetch the transactions for the last 7 days from the DB
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0,0,0,0);
    
    // We fetch raw data and map it, though in a pure DB flow you would use the 
    // SQL aggregation function provided. This ensures logic doesn't crash if the 
    // RPC is not defined in the live Supabase project yet.
    const { data: txs, error } = await req.supabase
      .from('transactions')
      .select('created_at, total_amount')
      .eq('user_id', userId)
      .gte('created_at', sevenDaysAgo.toISOString());

    if (error) throw error;

    // 3. Map DB results to all 7 days
    txs.forEach(tx => {
       const d = new Date(tx.created_at);
       const year = d.getFullYear();
       const month = String(d.getMonth() + 1).padStart(2, '0');
       const day = String(d.getDate()).padStart(2, '0');
       const dateStr = `${year}-${month}-${day}`;
       
       if (datesMap.has(dateStr)) {
          datesMap.set(dateStr, datesMap.get(dateStr) + Number(tx.total_amount));
       }
    });

    // 4. Transform into the exact response format required
    const responseData = [];
    datesMap.forEach((revenue, date) => {
       responseData.push({ date, revenue });
    });

    return res.status(200).json(responseData);
  } catch (err) {
    console.error('Revenue analytics error:', err);
    return res.status(500).json({ error: err.message });
  }
};
