import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Plus, 
  Search,
  MessageCircle,
  TrendingDown,
  TrendingUp,
  Store,
  Phone
} from 'lucide-react';
import { Screen, Customer, UdharTransaction } from './types';
import { AddCustomerModal } from './AddCustomerModal';
import { API_BASE_URL } from './constants';

export function UdharScreen({ setScreen }: { setScreen: (s: Screen) => void }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [summary, setSummary] = useState({ totalPendingUdhar: 0, todayCollected: 0, customersWithDue: 0 });
  const [isLoading, setIsLoading] = useState(true);
  
  const [view, setView] = useState<'list' | 'customer_detail' | 'add_transaction'>('list');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [ledger, setLedger] = useState<UdharTransaction[]>([]);
  
  // Modal state
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);

  // Forms
  const [txForm, setTxForm] = useState({ type: 'CREDIT' as 'CREDIT' | 'PAYMENT', amount: '', remarks: '' });
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSummaryAndCustomers = async () => {
    try {
      const token = localStorage.getItem('inventrax_token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [sumRes, custRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/udhar/summary`, { headers }),
        fetch(`${API_BASE_URL}/api/udhar/customers`, { headers })
      ]);
      
      if (sumRes.ok) setSummary(await sumRes.json());
      if (custRes.ok) setCustomers(await custRes.json());
    } catch (e) {
      console.error('Failed to fetch udhar data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLedger = async (customerId: string) => {
    try {
      const token = localStorage.getItem('inventrax_token');
      const res = await fetch(`${API_BASE_URL}/api/udhar/customers/${customerId}/ledger`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setLedger(await res.json());
    } catch (e) {
      console.error('Failed to fetch ledger:', e);
    }
  };

  useEffect(() => {
    fetchSummaryAndCustomers();
  }, []);

  const handleCustomerSave = (savedCustomer: Customer) => {
    if (customerToEdit) {
      setCustomers(customers.map(c => c.id === savedCustomer.id ? { ...c, ...savedCustomer } : c));
      if (selectedCustomer?.id === savedCustomer.id) {
        setSelectedCustomer({ ...selectedCustomer, ...savedCustomer } as Customer);
      }
    } else {
      setCustomers([savedCustomer, ...customers]);
    }
    setCustomerToEdit(null);
  };

  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;
    if (!confirm('Are you sure you want to delete this customer? This will also delete their ledger.')) return;
    try {
      const token = localStorage.getItem('inventrax_token');
      const res = await fetch(`${API_BASE_URL}/api/udhar/customers/${selectedCustomer.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setCustomers(customers.filter(c => c.id !== selectedCustomer.id));
        setSelectedCustomer(null);
        setView('list');
        fetchSummaryAndCustomers(); // Refresh summary
      }
    } catch (e) {
      console.error('Failed to delete customer:', e);
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    try {
      const token = localStorage.getItem('inventrax_token');
      const res = await fetch(`${API_BASE_URL}/api/udhar/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          customer_id: selectedCustomer.id,
          type: txForm.type,
          amount: Number(txForm.amount),
          remarks: txForm.remarks
        })
      });
      if (res.ok) {
        await fetchSummaryAndCustomers(); // Refresh all
        await fetchLedger(selectedCustomer.id);
        
        setSelectedCustomer(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            total_due: txForm.type === 'CREDIT' ? prev.total_due + Number(txForm.amount) : prev.total_due - Number(txForm.amount)
          };
        });
        
        setTxForm({ type: 'CREDIT', amount: '', remarks: '' });
        setView('customer_detail');
      }
    } catch (e) {
      console.error('Failed to add transaction:', e);
    }
  };

  if (view === 'add_transaction' && selectedCustomer) {
    return (
      <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 pb-10">
        <header className="flex items-center gap-4">
          <button onClick={() => setView('customer_detail')} className="p-2 -ml-2 text-primary hover:bg-surface-container-high rounded-full">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="font-headline font-extrabold text-2xl tracking-tight">Add Entry</h2>
            <p className="text-on-surface-variant mt-1 text-sm">{selectedCustomer.full_name}</p>
          </div>
        </header>

        <div className="flex bg-surface-container-low p-1 rounded-2xl">
          <button onClick={() => setTxForm({...txForm, type: 'CREDIT'})} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${txForm.type === 'CREDIT' ? 'bg-secondary text-white' : 'text-on-surface-variant'}`}>
            You Gave (Credit)
          </button>
          <button onClick={() => setTxForm({...txForm, type: 'PAYMENT'})} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${txForm.type === 'PAYMENT' ? 'bg-primary text-white' : 'text-on-surface-variant'}`}>
            You Got (Payment)
          </button>
        </div>

        <form onSubmit={handleAddTransaction} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest ml-2">Amount (₹)</label>
            <input required value={txForm.amount} onChange={e => setTxForm({...txForm, amount: e.target.value})} type="number" step="0.01" className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-5 text-2xl font-bold focus:ring-2 focus:ring-primary/20" placeholder="0" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest ml-2">Remarks / Items Details</label>
            <input value={txForm.remarks} onChange={e => setTxForm({...txForm, remarks: e.target.value})} className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-primary/20" placeholder="Milk, Bread, etc." />
          </div>
          <button type="submit" className={`w-full py-5 text-white rounded-2xl font-headline font-bold flex items-center justify-center gap-2 ambient-glow ${txForm.type === 'CREDIT' ? 'bg-secondary' : 'bg-primary'}`}>
            Save {txForm.type === 'CREDIT' ? 'Credit Entry' : 'Payment'}
          </button>
        </form>
      </div>
    );
  }

  if (view === 'customer_detail' && selectedCustomer) {
    return (
      <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 pb-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setView('list')} className="p-2 -ml-2 text-primary hover:bg-surface-container-high rounded-full">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h2 className="font-headline font-extrabold text-2xl tracking-tight">{selectedCustomer.full_name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-on-surface-variant text-sm flex items-center gap-1"><Phone size={12}/> {selectedCustomer.mobile_number}</p>
              </div>
            </div>
          </div>
          {selectedCustomer.mobile_number && (
            <a href={`https://wa.me/91${selectedCustomer.mobile_number}?text=Hello ${selectedCustomer.full_name}, your total pending udhar is ₹${selectedCustomer.total_due}. Please pay soon.`} target="_blank" rel="noopener noreferrer" className="p-3 bg-green-500/10 text-green-600 rounded-full shrink-0">
              <MessageCircle size={20} />
            </a>
          )}
        </header>

        <div className="flex gap-2">
           <button onClick={() => {
              setCustomerToEdit(selectedCustomer);
              setIsCustomerModalOpen(true);
           }} className="px-4 py-2 bg-surface-container-high rounded-full text-xs font-bold active:scale-95 transition-transform">Edit</button>
           <button onClick={handleDeleteCustomer} className="px-4 py-2 bg-secondary/10 text-secondary rounded-full text-xs font-bold active:scale-95 transition-transform">Delete</button>
        </div>

        <div className={`p-6 rounded-[2.5rem] editorial-shadow text-center ${selectedCustomer.total_due > 0 ? 'bg-secondary/10' : 'bg-primary/10'}`}>
          <p className="text-[10px] font-black uppercase text-on-surface-variant/60 tracking-widest mb-1">
            {selectedCustomer.total_due > 0 ? 'Pending Balance' : selectedCustomer.total_due < 0 ? 'Advance Balance' : 'Settled'}
          </p>
          <p className={`font-headline font-black text-4xl ${selectedCustomer.total_due > 0 ? 'text-secondary' : 'text-primary'}`}>
            ₹{Math.abs(selectedCustomer.total_due).toLocaleString()}
          </p>
        </div>

        <div className="flex gap-4">
          <button onClick={() => { setTxForm({ type: 'CREDIT', amount: '', remarks: '' }); setView('add_transaction'); }} className="flex-1 py-4 bg-surface-container-lowest text-secondary rounded-2xl font-bold flex items-center justify-center gap-2 editorial-shadow active:scale-95 transition-transform">
            <TrendingDown size={20} /> Gave ₹
          </button>
          <button onClick={() => { setTxForm({ type: 'PAYMENT', amount: '', remarks: '' }); setView('add_transaction'); }} className="flex-1 py-4 bg-surface-container-lowest text-primary rounded-2xl font-bold flex items-center justify-center gap-2 editorial-shadow active:scale-95 transition-transform">
            <TrendingUp size={20} /> Got ₹
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="font-headline font-bold text-lg">Ledger Details</h3>
          {ledger.map((tx) => (
            <div key={tx.id} className="bg-surface-container-lowest p-4 rounded-2xl flex justify-between items-center editorial-shadow">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${tx.type === 'CREDIT' ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary'}`}>
                  {tx.type === 'CREDIT' ? <TrendingDown size={18} /> : <TrendingUp size={18} />}
                </div>
                <div>
                  <p className="font-bold text-sm">{tx.remarks || (tx.type === 'CREDIT' ? 'Credit Given' : 'Payment Received')}</p>
                  <p className="text-[10px] text-on-surface-variant uppercase font-black">{new Date(tx.created_at).toLocaleDateString('en-GB')}</p>
                </div>
              </div>
              <p className={`font-headline font-black text-lg ${tx.type === 'CREDIT' ? 'text-secondary' : 'text-primary'}`}>
                ₹{tx.amount}
              </p>
            </div>
          ))}
          {ledger.length === 0 && <p className="text-center text-on-surface-variant text-sm mt-8">No transactions yet.</p>}
        </div>
        
        {/* Modals rendered conditionally here as well in case they open from detail view */}
        <AddCustomerModal 
          isOpen={isCustomerModalOpen} 
          onClose={() => setIsCustomerModalOpen(false)}
          customerToEdit={customerToEdit}
          onSave={handleCustomerSave}
        />
      </div>
    );
  }

  const filteredCustomers = customers.filter(c => 
    c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.mobile_number && c.mobile_number.includes(searchQuery))
  );

  // List View
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex items-start gap-4">
        <button onClick={() => setScreen('Dashboard')} className="p-2 -ml-2 mt-1 text-primary shrink-0 hover:bg-surface-container-high rounded-full transition-colors">
          <ArrowLeft size={28} />
        </button>
        <div>
          <h2 className="font-headline font-extrabold text-4xl tracking-tight text-on-surface">Udhar Ledger</h2>
          <p className="text-on-surface-variant mt-2">Manage customer credit and payments.</p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-3xl editorial-shadow">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total Pending</p>
          <p className="text-2xl font-headline font-extrabold text-secondary mt-1">₹{summary.totalPendingUdhar.toLocaleString()}</p>
          <p className="text-[10px] text-on-surface-variant/60 mt-2">From {summary.customersWithDue} customers</p>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-3xl editorial-shadow">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Collected Today</p>
          <p className="text-2xl font-headline font-extrabold text-primary mt-1">₹{summary.todayCollected.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex gap-4">
        <button onClick={() => { setCustomerToEdit(null); setIsCustomerModalOpen(true); }} className="flex-1 py-4 bg-primary text-white rounded-2xl font-headline font-bold flex items-center justify-center gap-2 ambient-glow active:scale-95 transition-transform">
          <Plus size={20} />
          Add Udhar
        </button>
      </div>

      {(customers.length > 0 || searchQuery) && (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={20} className="text-on-surface-variant/40" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or mobile..."
            className="w-full bg-surface-container-lowest border-none rounded-2xl py-4 pl-12 pr-5 focus:ring-2 focus:ring-primary/20 editorial-shadow text-sm"
          />
        </div>
      )}

      <div className="space-y-4">
        {customers.length > 0 && <h3 className="font-headline font-bold text-xl px-2">Customers</h3>}
        {filteredCustomers.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => { setSelectedCustomer(c); fetchLedger(c.id); setView('customer_detail'); }}
            className="bg-surface-container-lowest p-5 rounded-3xl editorial-shadow flex items-center justify-between active:scale-[0.98] transition-transform cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant font-headline font-bold text-lg uppercase shrink-0">
                {c.full_name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-sm tracking-tight truncate">{c.full_name}</p>
                <div className="flex items-center gap-1.5 mt-0.5 text-on-surface-variant text-xs truncate">
                  <span className="truncate">{c.mobile_number}</span>
                </div>
              </div>
            </div>
            <div className="text-right shrink-0 ml-2">
              <p className={`font-headline font-black ${c.total_due > 0 ? 'text-secondary' : 'text-primary'}`}>
                ₹{Math.abs(c.total_due).toLocaleString()}
              </p>
              <div className={`inline-block mt-0.5 px-2 py-0.5 rounded-sm text-[8px] font-black uppercase ${c.total_due > 0 ? 'bg-secondary/10 text-secondary' : c.total_due < 0 ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                {c.total_due > 0 ? 'Due' : c.total_due < 0 ? 'Advance' : 'Settled'}
              </div>
            </div>
          </motion.div>
        ))}
        {customers.length === 0 && !isLoading && (
           <div className="text-center py-10 opacity-60">
              <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-4">
                <Store size={40} className="text-on-surface-variant/40" />
              </div>
              <p className="font-bold">No customers added yet.</p>
              <p className="text-xs mt-1">Start by adding a customer to track Udhar.</p>
           </div>
        )}
      </div>
      
      {/* Modal rendered here */}
      <AddCustomerModal 
        isOpen={isCustomerModalOpen} 
        onClose={() => setIsCustomerModalOpen(false)}
        customerToEdit={customerToEdit}
        onSave={handleCustomerSave}
      />
    </div>
  );
}
