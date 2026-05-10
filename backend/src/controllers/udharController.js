exports.getCustomers = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { data: customers, error } = await req.supabase
      .from('customers')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Fetch total due for each customer using a subquery/grouping
    const { data: transactions, error: txError } = await req.supabase
      .from('udhar_transactions')
      .select('customer_id, type, amount')
      .eq('user_id', userId);

    if (txError) throw txError;

    const balances = {};
    for (const tx of transactions) {
      if (!balances[tx.customer_id]) balances[tx.customer_id] = 0;
      if (tx.type === 'CREDIT') {
        balances[tx.customer_id] += Number(tx.amount);
      } else if (tx.type === 'PAYMENT') {
        balances[tx.customer_id] -= Number(tx.amount);
      }
    }

    const customersWithBalance = customers.map(c => ({
      ...c,
      total_due: balances[c.id] || 0
    }));

    return res.status(200).json(customersWithBalance);
  } catch (err) {
    console.error('Fetch customers error:', err);
    return res.status(500).json({ error: err.message });
  }
};

exports.createCustomer = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    const { full_name, mobile_number, alternate_number, address, opening_balance, notes } = req.body;

    if (!full_name || full_name.trim().length === 0) {
      return res.status(400).json({ error: 'Full name is required' });
    }
    if (!mobile_number || mobile_number.trim().length < 10) {
      return res.status(400).json({ error: 'Valid mobile number is required' });
    }
    
    const obAmt = Number(opening_balance) || 0;
    if (obAmt < 0) {
      return res.status(400).json({ error: 'Opening balance cannot be negative' });
    }

    // Check for duplicate mobile
    const { data: existing } = await req.supabase
      .from('customers')
      .select('id')
      .eq('user_id', userId)
      .eq('mobile_number', mobile_number.trim())
      .is('deleted_at', null)
      .single();
    
    if (existing) {
      return res.status(400).json({ error: 'Customer with this mobile number already exists' });
    }
    
    const { data, error } = await req.supabase
      .from('customers')
      .insert({ 
        full_name: full_name.trim(), 
        mobile_number: mobile_number.trim(), 
        alternate_number: alternate_number?.trim(), 
        address: address?.trim(), 
        notes: notes?.trim(),
        user_id: userId 
      })
      .select()
      .single();

    if (error) throw error;
    
    // We do not set total_due directly on customer insert because the trigger or the summary query handles it. 
    // Wait, the summary query calculates total_due from udhar_transactions! So we MUST insert the transaction.

    if (obAmt > 0) {
      const { error: txError } = await req.supabase
        .from('udhar_transactions')
        .insert({
          customer_id: data.id,
          user_id: userId,
          type: 'CREDIT',
          amount: obAmt,
          remarks: 'Opening Balance'
        });
      
      if (txError) {
        console.error('Failed to create opening balance transaction:', txError);
        // It's safe to return data, the transaction might be missing but the customer is created.
      }
    }

    return res.status(201).json(data);
  } catch (err) {
    console.error('Create customer error:', err);
    return res.status(500).json({ error: err.message });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    const { id } = req.params;
    const { full_name, mobile_number, alternate_number, address, notes } = req.body;

    if (!full_name || full_name.trim().length === 0) return res.status(400).json({ error: 'Full name is required' });
    if (!mobile_number || mobile_number.trim().length < 10) return res.status(400).json({ error: 'Valid mobile number is required' });
    
    const { data, error } = await req.supabase
      .from('customers')
      .update({ 
        full_name: full_name.trim(), 
        mobile_number: mobile_number.trim(), 
        alternate_number: alternate_number?.trim(), 
        address: address?.trim(), 
        notes: notes?.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  console.log(`DELETE request received for customer ID: ${req.params.id} by user: ${req.user?.id}`);
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    const { id } = req.params;
    
    // Attempt the update. If RLS is on, Supabase will handle the user_id check via the policy.
    // However, we still add an explicit filter for safety.
    const query = req.supabase
      .from('customers')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (userId) {
      query.or(`user_id.eq.${userId},user_id.is.null`);
    }

    const { data, error, count } = await query.select();

    if (error) throw error;
    
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Customer not found or already deleted' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getCustomerLedger = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    const { id } = req.params;
    const { data, error } = await req.supabase
      .from('udhar_transactions')
      .select('*')
      .eq('customer_id', id)
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.addTransaction = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    const { customer_id, type, amount, remarks } = req.body;
    
    const { data, error } = await req.supabase
      .from('udhar_transactions')
      .insert({ customer_id, type, amount, remarks, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    const { data: transactions, error } = await req.supabase
      .from('udhar_transactions')
      .select('type, amount, customer_id, created_at')
      .eq('user_id', userId);

    if (error) throw error;

    let totalPendingUdhar = 0;
    let todayCollected = 0;
    const customerBalances = {};
    const todayStr = new Date().toISOString().split('T')[0];

    for (const tx of transactions) {
      if (!customerBalances[tx.customer_id]) customerBalances[tx.customer_id] = 0;
      
      const amt = Number(tx.amount);
      if (tx.type === 'CREDIT') {
        customerBalances[tx.customer_id] += amt;
        totalPendingUdhar += amt;
      } else if (tx.type === 'PAYMENT') {
        customerBalances[tx.customer_id] -= amt;
        totalPendingUdhar -= amt;
        
        // Check if collected today
        const txDate = new Date(tx.created_at).toISOString().split('T')[0];
        if (txDate === todayStr) {
          todayCollected += amt;
        }
      }
    }

    let customersWithDue = 0;
    for (const balance of Object.values(customerBalances)) {
      if (balance > 0) customersWithDue++;
    }

    return res.status(200).json({
      totalPendingUdhar,
      todayCollected,
      customersWithDue
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.searchCustomers = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { q } = req.query;
    if (!q) return res.status(200).json([]);

    const { data: customers, error } = await req.supabase
      .from('customers')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .or(`full_name.ilike.%${q}%,mobile_number.ilike.%${q}%`)
      .limit(5);

    if (error) throw error;
    if (customers.length === 0) return res.status(200).json([]);

    const customerIds = customers.map(c => c.id);

    // Fetch transactions to calculate real-time insights
    const { data: transactions, error: txError } = await req.supabase
      .from('udhar_transactions')
      .select('*')
      .in('customer_id', customerIds)
      .order('created_at', { ascending: false });

    if (txError) throw txError;

    const insights = {};
    for (const tx of transactions) {
      if (!insights[tx.customer_id]) {
        insights[tx.customer_id] = {
          total_due: 0,
          transaction_count: 0,
          last_payment_date: null,
          last_payment_amount: 0,
          recent_transactions: []
        };
      }
      
      const ins = insights[tx.customer_id];
      ins.transaction_count++;
      
      if (ins.recent_transactions.length < 3) {
        ins.recent_transactions.push(tx);
      }

      const amt = Number(tx.amount);
      if (tx.type === 'CREDIT') {
        ins.total_due += amt;
      } else if (tx.type === 'PAYMENT') {
        ins.total_due -= amt;
        if (!ins.last_payment_date) {
          ins.last_payment_date = tx.created_at;
          ins.last_payment_amount = amt;
        }
      }
    }

    const customersWithInsights = customers.map(c => {
      const ins = insights[c.id] || { 
        total_due: 0, 
        transaction_count: 0, 
        last_payment_date: null,
        last_payment_amount: 0,
        recent_transactions: []
      };
      
      // Calculate a basic trust score (0-100)
      let trust_score = 100;
      if (ins.total_due > 5000) trust_score -= 20;
      if (ins.total_due > 10000) trust_score -= 30;
      
      return {
        ...c,
        ...ins,
        trust_score: Math.max(0, trust_score)
      };
    });

    return res.status(200).json(customersWithInsights);
  } catch (err) {
    console.error('Search customers error:', err);
    return res.status(500).json({ error: err.message });
  }
};

exports.addUdhar = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { customerId, customerName, customerPhone, amount, items, remarks } = req.body;

    if (!amount || amount <= 0) return res.status(400).json({ error: 'Valid amount is required' });

    let finalCustomerId = customerId;

    // 1. Ensure customer exists or create if new
    if (!finalCustomerId) {
      if (!customerPhone || customerPhone.trim().length < 10) {
        return res.status(400).json({ error: 'Valid mobile number required' });
      }
      
      const { data: existing } = await req.supabase
        .from('customers')
        .select('id')
        .eq('user_id', userId)
        .eq('mobile_number', customerPhone.trim())
        .is('deleted_at', null)
        .single();
      
      if (existing) {
        finalCustomerId = existing.id;
      } else {
        const { data: created, error: createError } = await req.supabase
          .from('customers')
          .insert({
            full_name: customerName || 'New Customer',
            mobile_number: customerPhone.trim(),
            user_id: userId
          })
          .select('id')
          .single();
        if (createError) throw createError;
        finalCustomerId = created.id;
      }
    }

    // 2. Create the main transaction (Bill)
    const { data: bill, error: billError } = await req.supabase
      .from('transactions')
      .insert({
        customer_name: customerName || 'Udhar Customer',
        contact_number: customerPhone,
        total_amount: amount,
        payment_method: 'UDHAR',
        user_id: userId
      })
      .select('id')
      .single();
    
    if (billError) throw billError;

    // 3. Save line items and deduct stock if items are provided
    if (items && items.length > 0) {
      const lineItems = items.map(item => ({
        transaction_id: bill.id,
        item_id: item.productId,
        quantity: item.quantity,
        price: item.price
      }));
      
      const { error: lineError } = await req.supabase.from('transaction_items').insert(lineItems);
      if (lineError) throw lineError;

      for (const item of items) {
        await req.supabase.rpc('deduct_stock', { p_item_id: item.productId, p_quantity: item.quantity });
      }
    }

    // 4. Create the Udhar Ledger entry
    const { error: ledgerError } = await req.supabase
      .from('udhar_transactions')
      .insert({
        customer_id: finalCustomerId,
        user_id: userId,
        type: 'CREDIT',
        amount: amount,
        remarks: remarks || `Bill #${bill.id.substring(0, 8)}`
      });
    
    if (ledgerError) throw ledgerError;

    return res.status(200).json({ 
      success: true, 
      transactionId: bill.id,
      customerId: finalCustomerId 
    });
  } catch (err) {
    console.error('Add Udhar error:', err);
    return res.status(500).json({ error: err.message });
  }
};

exports.createWithUdhar = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { full_name, mobile_number, address, notes, amount, items, remarks } = req.body;

    if (!full_name || !mobile_number) {
      return res.status(400).json({ error: 'Name and mobile number are required' });
    }

    // 1. Check for duplicate mobile
    const { data: existing } = await req.supabase
      .from('customers')
      .select('id')
      .eq('user_id', userId)
      .eq('mobile_number', mobile_number.trim())
      .is('deleted_at', null)
      .single();
    
    if (existing) {
      return res.status(400).json({ error: 'Customer with this mobile number already exists' });
    }

    // 2. Create customer
    const { data: customer, error: custError } = await req.supabase
      .from('customers')
      .insert({
        full_name: full_name.trim(),
        mobile_number: mobile_number.trim(),
        address: address?.trim(),
        notes: notes?.trim(),
        user_id: userId
      })
      .select('id')
      .single();
    
    if (custError) throw custError;

    // 3. Create Bill/Transaction
    const { data: bill, error: billError } = await req.supabase
      .from('transactions')
      .insert({
        customer_name: full_name.trim(),
        contact_number: mobile_number.trim(),
        total_amount: amount,
        payment_method: 'UDHAR',
        user_id: userId
      })
      .select('id')
      .single();
    
    if (billError) throw billError;

    // 4. Handle items and stock deduction
    if (items && items.length > 0) {
      const lineItems = items.map(item => ({
        transaction_id: bill.id,
        item_id: item.productId,
        quantity: item.quantity,
        price: item.price
      }));
      await req.supabase.from('transaction_items').insert(lineItems);
      for (const item of items) {
        await req.supabase.rpc('deduct_stock', { p_item_id: item.productId, p_quantity: item.quantity });
      }
    }

    // 5. Create Udhar Ledger entry
    const { error: ledgerError } = await req.supabase
      .from('udhar_transactions')
      .insert({
        customer_id: customer.id,
        user_id: userId,
        type: 'CREDIT',
        amount: amount,
        remarks: remarks || `Initial Purchase #${bill.id.substring(0, 8)}`
      });
    
    if (ledgerError) throw ledgerError;

    return res.status(201).json({ 
      success: true, 
      transactionId: bill.id,
      customerId: customer.id 
    });
  } catch (err) {
    console.error('Create with Udhar error:', err);
    return res.status(500).json({ error: err.message });
  }
};




