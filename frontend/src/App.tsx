/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart3,
  Receipt,
  Package,
  PlusCircle,
  History,
  User,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Search,
  ShoppingCart,
  Plus,
  ArrowLeft,
  CheckCircle2,
  MoreVertical,
  Edit2,
  Camera,
  LayoutDashboard,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Home,
  FileSpreadsheet,
  Download,
  Banknote,
  QrCode,
  CreditCard,
  LogOut,
  Mail,
  Phone,
  Shield,
  MapPin,
  BookOpen
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Screen, Product, Transaction } from './types';
import { UdharScreen } from './UdharScreen';
import { API_BASE_URL } from './constants';


function Layout({ children, currentScreen, setScreen, onAddNew, profile }: {
  children: React.ReactNode,
  currentScreen: Screen,
  setScreen: (v: Screen) => void,
  onAddNew?: () => void,
  profile?: any
}) {
  return (
    <div className="flex flex-col min-h-screen max-w-full overflow-x-hidden pb-40">

      <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-outline-variant/10 px-6 py-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
          <h1 className="font-headline font-black text-2xl tracking-tight text-primary">InventraX</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScreen('Profile')}
            className={`p-1 rounded-full transition-all ${currentScreen === 'Profile' ? 'bg-surface-container-highest' : 'hover:bg-surface-container-high'}`}
            title="Profile"
          >
            {profile?.photo_url ? (
              <img src={profile.photo_url} alt="P" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <User size={24} className="text-on-surface-variant" />
            )}
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('inventrax_logged_in');
              localStorage.removeItem('inventrax_user_id');
              localStorage.removeItem('inventrax_token');
              window.location.reload();
            }}
            className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors"
            title="Logout"
          >
            <LogOut size={24} />
          </button>
        </div>
      </header>

      <main className="flex-grow pt-20 px-5 max-w-2xl mx-auto w-full">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-panel rounded-t-[2rem] editorial-shadow px-6 pb-6 pt-3 flex justify-between items-end max-w-2xl mx-auto">
        <button
          onClick={() => setScreen('Dashboard')}
          className={`flex flex-col items-center gap-1 transition-colors ${currentScreen === 'Dashboard' ? 'text-primary' : 'text-on-surface-variant/60'}`}
        >
          <div className={`p-2 rounded-2xl transition-all ${currentScreen === 'Dashboard' ? 'bg-primary-container text-on-primary-container' : 'bg-transparent'}`}>
            <Home size={24} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
        </button>

        <button
          onClick={() => onAddNew ? onAddNew() : setScreen('AddItem')}
          className="relative -top-3"
        >
          <div className="w-14 h-14 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center ambient-glow active:scale-90 transition-transform shadow-lg">
            <Plus size={32} />
          </div>
        </button>

        <button
          onClick={() => setScreen('Inventory')}
          className={`flex flex-col items-center gap-1 transition-colors ${currentScreen === 'Inventory' ? 'text-primary' : 'text-on-surface-variant/60'}`}
        >
          <div className={`p-2 rounded-2xl transition-all ${currentScreen === 'Inventory' ? 'bg-primary-container text-on-primary-container' : 'bg-transparent'}`}>
            <Package size={24} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Inventory</span>
        </button>

        <button
          onClick={() => setScreen('Udhar')}
          className={`flex flex-col items-center gap-1 transition-colors ${currentScreen === 'Udhar' ? 'text-primary' : 'text-on-surface-variant/60'}`}
        >
          <div className={`p-2 rounded-2xl transition-all ${currentScreen === 'Udhar' ? 'bg-primary-container text-on-primary-container' : 'bg-transparent'}`}>
            <CreditCard size={24} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Udhar</span>
        </button>
      </nav>
    </div>
  );
}

function AnalyzerScreen({ setScreen, transactions, products }: { setScreen: (s: Screen) => void, transactions: Transaction[], products: Product[] }) {
  const [timeRange, setTimeRange] = useState('7 Days');

  const categorySalesMap = new Map<string, number>();
  let totalItemsSold = 0;

  transactions.forEach(tx => {
    tx.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      const category = product ? product.category : 'Unknown Category';
      categorySalesMap.set(category, (categorySalesMap.get(category) || 0) + item.quantity);
      totalItemsSold += item.quantity;
    });
  });

  const sortedCategories = Array.from(categorySalesMap.entries()).sort((a, b) => b[1] - a[1]);
  const colors = ['#F87171', '#60A5FA', '#FBBF24', '#A78BFA', '#94A3B8'];

  const itemSalesData = sortedCategories.slice(0, 4).map((entry, idx) => ({
    name: entry[0],
    quantity: entry[1],
    value: Math.round((entry[1] / (totalItemsSold || 1)) * 100),
    color: colors[idx]
  }));

  if (sortedCategories.length > 4) {
    const othersCount = sortedCategories.slice(4).reduce((acc, curr) => acc + curr[1], 0);
    itemSalesData.push({
      name: 'Others',
      quantity: othersCount,
      value: Math.round((othersCount / (totalItemsSold || 1)) * 100),
      color: colors[4]
    });
  } else if (sortedCategories.length === 0) {
    itemSalesData.push({ name: 'No Data', quantity: 0, value: 100, color: '#E2E8F0' });
  }

  const revenueByDate = new Map<string, number>();
  const revenueByMonth = new Map<string, number>();
  const revenueByYear = new Map<string, number>();
  const revenueByHour = new Map<string, number>();

  const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  transactions.forEach(tx => {
    revenueByDate.set(tx.date, (revenueByDate.get(tx.date) || 0) + tx.amount);

    if (tx.date === todayStr) {
      const hourNum = parseInt(tx.time.split(':')[0] || '0');
      const block = Math.floor(hourNum / 3) * 3;
      const blockStr = block.toString().padStart(2, '0') + ':00';
      revenueByHour.set(blockStr, (revenueByHour.get(blockStr) || 0) + tx.amount);
    }

    const parts = tx.date.split(' ');
    if (parts.length === 3) {
      const monthStr = `${parts[1]} ${parts[2]}`; // "Apr 2026"
      revenueByMonth.set(monthStr, (revenueByMonth.get(monthStr) || 0) + tx.amount);
      revenueByYear.set(parts[2], (revenueByYear.get(parts[2]) || 0) + tx.amount);
    }
  });

  const todayBlocks = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];
  const formatHour = (hStr: string) => {
    const h = parseInt(hStr);
    if (h === 0) return '12am';
    if (h === 12) return '12pm';
    return h > 12 ? `${h - 12}pm` : `${h}am`;
  };

  const todayData = todayBlocks.map(h => ({
    name: formatHour(h),
    revenue: revenueByHour.get(h) || 0
  }));

  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const dayName = d.toLocaleDateString('en-GB', { weekday: 'short' });
    return { name: dayName, revenue: revenueByDate.get(dateStr) || 0 };
  });

  const last4Months = Array.from({ length: 4 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (3 - i));
    const monthStr = d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
    return { name: d.toLocaleDateString('en-GB', { month: 'short' }), revenue: revenueByMonth.get(monthStr) || 0 };
  });

  const currentYear = new Date().getFullYear();
  const last5Years = Array.from({ length: 5 }).map((_, i) => {
    const yearStr = (currentYear - 4 + i).toString();
    return { name: yearStr, revenue: revenueByYear.get(yearStr) || 0 };
  });

  const dataSets: Record<string, { name: string; revenue: number }[]> = {
    'Today': todayData,
    '7 Days': last7Days,
    '1-2 Months': last4Months,
    '1-5 Years': last5Years,
  };

  const currentSalesData = dataSets[timeRange] || dataSets['7 Days'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <button onClick={() => setScreen('Dashboard')} className="p-2 -ml-2 mt-1 text-primary shrink-0 hover:bg-surface-container-high rounded-full transition-colors">
            <ArrowLeft size={28} />
          </button>
          <div>
            <h2 className="font-headline font-extrabold text-4xl tracking-tight text-on-surface">Sales Performance</h2>
            <p className="text-on-surface-variant mt-2">Identify your most and least popular products.</p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {['Today', '7 Days', '1-2 Months', '1-5 Years'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${timeRange === range
                  ? 'bg-primary text-white ambient-glow scale-[1.05]'
                  : 'bg-surface-container-high text-on-surface-variant/60 hover:bg-surface-container-highest'
                }`}
            >
              {range}
            </button>
          ))}
        </div>
      </header>

      <div className="bg-surface-container-lowest p-6 rounded-[2.5rem] editorial-shadow space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-headline font-bold text-lg">Sales Momentum</h3>
          <div className="px-3 py-1 bg-primary/5 text-primary rounded-full text-xs font-black">
            {timeRange === 'Today' ? 'Live' : '+18.2%'}
          </div>
        </div>

        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={currentSalesData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fontWeight: 800, fill: 'rgba(0,0,0,0.3)' }}
                interval={timeRange === '1-2 Months' ? 1 : 0}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                  fontWeight: 800,
                  fontSize: '12px'
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-primary)"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorRev)"
                animationBegin={0}
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-[2.5rem] editorial-shadow">
          <h3 className="font-headline font-bold text-lg mb-6">Category Sales Velocity</h3>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="h-[200px] w-full md:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={itemSalesData}
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={8}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1500}
                  >
                    {itemSalesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 800 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4 w-full md:w-1/2">
              {itemSalesData.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <div className="flex-grow">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider">
                        {item.name} <span className="text-on-surface-variant/50 lowercase ml-1">({item.quantity} items)</span>
                      </span>
                      <span className="text-xs font-black text-primary">{item.value}%</span>
                    </div>
                    <div className="w-full h-1 bg-surface-container-high rounded-full mt-1 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

function HistoryScreen({ setScreen, transactions, onTransactionClick }: { setScreen: (s: Screen) => void, transactions: Transaction[], onTransactionClick: (t: Transaction) => void }) {
  const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const todayTotal = transactions
    .filter(t => t.date === todayStr && t.status === 'Completed')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex items-start gap-4">
        <button onClick={() => setScreen('Dashboard')} className="p-2 -ml-2 mt-1 text-primary shrink-0 hover:bg-surface-container-high rounded-full transition-colors">
          <ArrowLeft size={28} />
        </button>
        <div>
          <h2 className="font-headline font-extrabold text-4xl tracking-tight text-on-surface">Transaction History</h2>
          <p className="text-on-surface-variant mt-2">Track every sale and settlement precisely.</p>
        </div>
      </header>

      <div className="bg-surface-container-low p-6 rounded-[2rem] editorial-shadow text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <p className="text-[10px] font-black uppercase text-on-surface-variant/40 mb-2 relative z-10">Today's Settlements</p>
        <p className="text-4xl font-headline font-black text-primary relative z-10">₹{todayTotal.toLocaleString()}</p>
      </div>

      <div className="space-y-4">
        {transactions.map((tx, i) => (
          <motion.div
            key={`${tx.id}-${i}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onTransactionClick(tx)}
            className="bg-surface-container-lowest p-5 rounded-3xl editorial-shadow flex items-center justify-between group active:scale-[0.98] transition-transform cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl transition-colors ${
                tx.method === 'UDHAR' 
                  ? 'bg-secondary/10 text-secondary' 
                  : tx.status === 'Completed' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
              }`}>
                {tx.method === 'UDHAR' ? <BookOpen size={20} /> : <Package size={20} />}
              </div>
              <div>
                <p className="font-bold text-sm tracking-tight">{tx.customerName || 'Walk-in Customer'}</p>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] text-on-surface-variant/60 uppercase font-black">{tx.time} • {tx.method} • {tx.date}</p>
                  {tx.method === 'UDHAR' && (
                    <span className="flex h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-headline font-black ${tx.method === 'UDHAR' ? 'text-secondary' : ''}`}>₹{tx.amount.toLocaleString()}</p>
              <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${
                tx.method === 'UDHAR' 
                  ? 'bg-secondary text-white' 
                  : tx.status === 'Completed' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
              }`}>
                {tx.method === 'UDHAR' ? 'DUE' : tx.status}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function TransactionDetailScreen({ transaction, setScreen }: { transaction: Transaction, setScreen: (s: Screen) => void }) {
  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Receipt - #${transaction.id}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; padding: 20px; color: #000; font-size: 14px; }
            .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 15px; margin-bottom: 15px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 8px; }
            .items { border-bottom: 2px dashed #000; padding-bottom: 15px; margin-bottom: 15px; }
            .total { font-weight: bold; font-size: 1.2em; border-bottom: 2px dashed #000; padding-bottom: 15px; margin-bottom: 15px; }
            h2 { margin: 0 0 5px 0; }
            p { margin: 0 0 5px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>INVENTRAX</h2>
            <p>Receipt #${transaction.id.slice(0, 8).toUpperCase()}</p>
            <p>${transaction.date} • ${transaction.time}</p>
          </div>
          <div class="row">
            <span>Customer:</span>
            <span>${transaction.customerName}</span>
          </div>
          <div class="row" style="margin-bottom: 20px;">
            <span>Payment:</span>
            <span>${transaction.method}</span>
          </div>
          
          <div class="items">
            <div class="row" style="font-weight:bold; margin-bottom: 15px;">
              <span>Item</span>
              <span>Amount</span>
            </div>
            ${transaction.items.map(item => `
              <div class="row">
                <span>${item.name} x${item.quantity}</span>
                <span>Rs ${item.price * item.quantity}</span>
              </div>
            `).join('')}
          </div>
          
          <div class="row total">
            <span>GRAND TOTAL</span>
            <span>Rs ${transaction.amount}</span>
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <p>Thank you for shopping with us!</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 pb-10">
      <header className="flex items-center gap-4">
        <button onClick={() => setScreen('Dashboard')} className="p-2 -ml-2 text-primary">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="font-headline font-extrabold text-2xl tracking-tight">Order Details</h2>
          <p className="text-[10px] uppercase font-black text-on-surface-variant/40 tracking-widest">#{transaction.id}</p>
        </div>
      </header>

      <div className="bg-surface-container-low p-6 rounded-[2.5rem] editorial-shadow space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-on-surface-variant/40 tracking-widest mb-1">Customer</p>
            <p className="font-bold text-lg">{transaction.customerName}</p>
            {transaction.customerContact && (
              <p className="text-xs text-on-surface-variant font-medium mt-1">Contact: +91 {transaction.customerContact}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase text-on-surface-variant/40 tracking-widest mb-1">Status</p>
            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${transaction.status === 'Completed' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
              {transaction.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 py-4 border-t border-on-surface/5">
          <div>
            <p className="text-[10px] font-black uppercase text-on-surface-variant/40 tracking-widest mb-1">Date & Time</p>
            <p className="font-bold text-sm">{transaction.date} • {transaction.time}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase text-on-surface-variant/40 tracking-widest mb-1">Payment Method</p>
            <p className="font-bold text-sm">{transaction.method}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-headline font-bold text-xl px-2">Order Items</h3>
        <div className="bg-surface-container-low p-2 rounded-[2.5rem] editorial-shadow space-y-1">
          {transaction.items.map((item, idx) => (
            <div key={idx} className="bg-surface-container-lowest p-5 rounded-[2rem] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center text-on-surface-variant/40">
                  <Package size={24} />
                </div>
                <div>
                  <p className="font-bold text-sm tracking-tight">{item.name}</p>
                  <p className="text-[10px] text-on-surface-variant font-black uppercase">Qty: {item.quantity}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-headline font-black">₹{(item.price * item.quantity).toLocaleString()}</p>
                <p className="text-[10px] text-on-surface-variant/60 font-black">₹{item.price.toLocaleString()} ea</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-primary p-8 rounded-[3rem] text-white ambient-glow space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center opacity-60">
            <span className="text-xs font-bold uppercase tracking-widest">Subtotal</span>
            <span className="font-bold">₹{transaction.amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center opacity-60">
            <span className="text-xs font-bold uppercase tracking-widest">Tax (0%)</span>
            <span className="font-bold">₹0</span>
          </div>
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-white/20">
          <span className="font-headline font-black text-xl uppercase italic">Grand Total</span>
          <span className="font-headline font-black text-3xl tracking-tighter">₹{transaction.amount.toLocaleString()}</span>
        </div>
      </div>

      <button
        onClick={handlePrint}
        className="w-full py-5 bg-surface-container-high text-on-surface-variant font-headline font-bold rounded-full flex items-center justify-center gap-2 active:scale-95 transition-transform group"
      >
        <Receipt size={20} className="group-hover:rotate-12 transition-transform" />
        Print Receipt
      </button>
    </div>
  );
}

function DashboardScreen({ setScreen, transactions, products, onTransactionClick, profile }: {
  setScreen: (s: Screen) => void,
  transactions: Transaction[],
  products: Product[],
  onTransactionClick: (t: Transaction) => void,
  profile: any
}) {
  const [autoSync, setAutoSync] = useState(false);
  const [selectedSheet, setSelectedSheet] = useState(() => localStorage.getItem('inventrax_excel_sheet') || 'Book1.xlsx');

  const totalRevenue = transactions
    .filter(t => t.status === 'Completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOrders = transactions.filter(t => t.status === 'Completed').length;

  const lowStockCount = products.filter(p => p.stock <= 10).length;

  const exportToCSV = (filter?: 'Today' | 'Weekly' | 'Monthly' | 'All') => {
    const today = new Date();
    let data = transactions;

    if (filter === 'Today') {
      const todayStr = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      data = transactions.filter(t => t.date === todayStr);
    } else if (filter === 'Weekly') {
      const lastWeek = new Date(today);
      lastWeek.setDate(today.getDate() - 7);
      data = transactions.filter(t => new Date(t.date) >= lastWeek);
    } else if (filter === 'Monthly') {
      const lastMonth = new Date(today);
      lastMonth.setMonth(today.getMonth() - 1);
      data = transactions.filter(t => new Date(t.date) >= lastMonth);
    }

    if (data.length === 0) {
      alert(`No transactions found for ${filter}`);
      return;
    }

    const headers = ['Order ID', 'Customer Name', 'Contact', 'Date', 'Time', 'Amount', 'Method', 'Status', 'Items Detail'];
    const rows = data.map(t => [
      t.id,
      t.customerName,
      t.customerContact || 'N/A',
      t.date,
      t.time,
      t.amount,
      t.method,
      t.status,
      t.items.map(i => `${i.name}(x${i.quantity})`).join('; ')
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Transactions_${filter || 'Export'}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h2 className="font-headline font-extrabold text-4xl tracking-tight text-on-surface">Hello, {profile?.name?.split(' ')[0] || 'Admin'}</h2>
        <p className="text-on-surface-variant mt-2">Here is what is happening with your store today.</p>
      </header>

      <button
        onClick={() => setScreen('NewBill')}
        className="w-full h-14 bg-primary-container text-on-primary-container rounded-2xl font-headline font-bold flex items-center justify-center gap-2 ambient-glow active:scale-[0.98] transition-transform"
      >
        <PlusCircle size={24} />
        Create New Bill
      </button>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-3xl editorial-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total Revenue</p>
          <p className="text-2xl font-headline font-extrabold text-on-surface mt-1">₹{totalRevenue.toLocaleString()}</p>
          <p className="text-[10px] text-on-surface-variant/60 mt-2">Real-time stats</p>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-3xl editorial-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-on-surface-variant/10 text-on-surface-variant rounded-xl">
              <ShoppingCart size={20} />
            </div>
          </div>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total Orders</p>
          <p className="text-2xl font-headline font-extrabold text-on-surface mt-1">{totalOrders}</p>
          <p className="text-[10px] text-on-surface-variant/60 mt-2">Today's count</p>
        </div>
      </div>

      <button
        onClick={() => setScreen('Analyzer')}
        className="w-full bg-surface-container-lowest p-5 rounded-[2rem] editorial-shadow flex items-center justify-between group active:scale-[0.98] transition-transform"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
            <BarChart3 size={24} />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase text-on-surface-variant/40 tracking-widest leading-none mb-1">Insights</p>
            <h3 className="font-headline font-bold text-lg text-on-surface">Sales Analyzer</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-xs font-black text-primary">+18.2%</p>
            <p className="text-[8px] font-bold text-on-surface-variant/40 uppercase tracking-tighter">This Week</p>
          </div>
          <ChevronRight size={20} className="text-on-surface-variant/20" />
        </div>
      </button>

      <div className="bg-secondary p-4 rounded-[2rem] text-on-secondary relative overflow-hidden ambient-glow">
        <div className="absolute top-0 right-0 p-3 opacity-20 translate-x-4 -translate-y-4">
          <AlertTriangle size={60} strokeWidth={1} />
        </div>
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={14} />
              <span className="text-[10px] uppercase font-headline font-black tracking-widest opacity-80">Stock Alert</span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-headline font-black tracking-tight">{lowStockCount}</p>
              <p className="text-xs font-bold opacity-70">Items need restock</p>
            </div>
          </div>
          <button
            onClick={() => setScreen('Inventory')}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl transition-all font-black text-xs uppercase tracking-wider active:scale-95"
          >
            Review
          </button>
        </div>
      </div>

      <section className="bg-surface-container-lowest p-6 rounded-[2.5rem] editorial-shadow space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-headline font-bold text-xl tracking-tight">Excel Integration</h3>
        </div>

        <div className="bg-surface-container-high p-4 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <FileSpreadsheet size={24} />
          </div>
          <div className="flex-grow">
            <h4 className="font-bold text-sm">{selectedSheet}</h4>
            <p className="text-[8px] text-on-surface-variant font-black uppercase opacity-40">
              Status: {autoSync ? 'Auto Syncing' : 'Pending Auto Sync'} | Last Sync: {autoSync ? 'Just now' : 'Never'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between px-2">
          <span className="text-[10px] font-black uppercase text-on-surface-variant/60 tracking-widest leading-none">Auto Sync to Excel:</span>
          <button
            onClick={() => {
              if (!autoSync && selectedSheet === 'Book1.xlsx') {
                alert('Please select or create a sheet to enable auto-sync!');
                return;
              }
              setAutoSync(!autoSync);
            }}
            className={`w-12 h-6 rounded-full transition-all relative ${autoSync ? 'bg-primary' : 'bg-surface-container-highest'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${autoSync ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 relative">
          <button
            onClick={() => document.getElementById('sheet-upload')?.click()}
            className="py-3 bg-surface-container-high text-on-surface-variant rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-surface-container-highest transition-colors active:scale-95"
          >
            Select Sheet
          </button>
          <input
            type="file"
            id="sheet-upload"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                const name = e.target.files[0].name;
                setSelectedSheet(name);
                localStorage.setItem('inventrax_excel_sheet', name);
                setAutoSync(true); // Automatically turn on sync when they select a valid sheet
              }
            }}
          />
          <button
            onClick={() => {
              exportToCSV('All');
              const name = `InventraX_Export_${new Date().toISOString().split('T')[0]}.csv`;
              setSelectedSheet(name);
              localStorage.setItem('inventrax_excel_sheet', name);
              setAutoSync(true);
            }}
            className="py-3 bg-surface-container-high text-on-surface-variant rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-surface-container-highest transition-colors active:scale-95"
          >
            Create Sheet
          </button>
        </div>

        <div className="space-y-4 pt-4 border-t border-on-surface/5">
          <p className="text-[10px] font-black uppercase text-on-surface-variant/40 tracking-widest mb-1 ml-1">Manual Exports</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            <button
              onClick={() => exportToCSV('Today')}
              className="px-5 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest ambient-glow whitespace-nowrap active:scale-95 transition-transform flex items-center gap-2"
            >
              <Download size={12} />
              Export Today
            </button>
            <button
              onClick={() => exportToCSV('Weekly')}
              className="px-5 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest ambient-glow whitespace-nowrap active:scale-95 transition-transform flex items-center gap-2"
            >
              <Download size={12} />
              Weekly
            </button>
            <button
              onClick={() => exportToCSV('Monthly')}
              className="px-5 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest ambient-glow whitespace-nowrap active:scale-95 transition-transform flex items-center gap-2"
            >
              <Download size={12} />
              Monthly
            </button>
            <button
              onClick={() => exportToCSV('All')}
              className="px-5 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest ambient-glow whitespace-nowrap active:scale-95 transition-transform flex items-center gap-2"
            >
              <Download size={12} />
              Export All
            </button>
          </div>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-headline font-bold text-xl tracking-tight">Recent Transactions</h3>
          <button
            onClick={() => setScreen('History')}
            className="text-primary font-bold text-sm"
          >
            View All
          </button>
        </div>
        <div className="space-y-4">
          {transactions.slice(0, 3).map(tx => (
            <div
              key={tx.id}
              onClick={() => onTransactionClick(tx)}
              className="flex items-center justify-between bg-surface-container-lowest p-4 rounded-3xl editorial-shadow cursor-pointer active:scale-95 transition-transform"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl transition-colors ${tx.method === 'UDHAR' ? 'bg-secondary/10 text-secondary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                  {tx.method === 'UDHAR' ? <BookOpen size={20} /> : <Receipt size={20} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm">{tx.customerName}</p>
                    {tx.method === 'UDHAR' && (
                      <span className="text-[8px] font-black bg-secondary/10 text-secondary px-1.5 py-0.5 rounded uppercase">DUE</span>
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant">{tx.time} • {tx.method} • {tx.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-headline font-extrabold text-sm ${tx.method === 'UDHAR' ? 'text-secondary' : ''}`}>₹{tx.amount.toLocaleString()}</p>
                <p className="text-[10px] text-on-surface-variant font-black uppercase opacity-40">{tx.itemsCount} Items</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function NewBillScreen({ setScreen, products, onConfirm }: {
  setScreen: (s: Screen) => void,
  products: Product[],
  onConfirm: (t: Transaction) => void
}) {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSelectors, setActiveSelectors] = useState<Set<string>>(new Set());
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Card' | 'UDHAR'>('UPI');
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [udharCustomers, setUdharCustomers] = useState<any[]>([]);
  const [customerSearchResults, setCustomerSearchResults] = useState<any[]>([]);
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');




  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem('inventrax_token');
        const res = await fetch(`${API_BASE_URL}/api/udhar/customers`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setUdharCustomers(await res.json());
      } catch (e) {
        console.error(e);
      }
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    const query = customerName.length >= 2 ? customerName : (customerContact.length >= 3 ? customerContact : '');
    
    if (!query || paymentMode !== 'UDHAR') {
      setCustomerSearchResults([]);
      setShowCustomerSuggestions(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearchingCustomer(true);
      try {
        const token = localStorage.getItem('inventrax_token');
        const res = await fetch(`${API_BASE_URL}/api/udhar/customers/search?q=${encodeURIComponent(query)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCustomerSearchResults(data);
          setShowCustomerSuggestions(data.length > 0);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearchingCustomer(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [customerName, customerContact, paymentMode]);


  const handleConfirm = () => {
    const totalAmount = Object.entries(cart).reduce((sum: number, [id, qty]: [string, number]) => {
      const product = products.find(p => p.id === id);
      return sum + (product ? product.price * qty : 0);
    }, 0);
    const itemsCount = (Object.values(cart) as number[]).reduce((a, b) => a + b, 0);

    const now = new Date();
    const transactionItems = Object.entries(cart).map(([id, qty]) => {
      const p = products.find(prod => prod.id === id)!;
      return {
        productId: id,
        name: p.name,
        quantity: qty as number,
        price: p.price
      };
    });

    const newTx: Transaction = {
      id: Math.floor(1000 + Math.random() * 9000).toString(),
      customerName: customerName || 'Walk-in Customer',
      customerContact: customerContact,
      customerId: selectedCustomer?.id,
      date: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
      amount: totalAmount,
      method: paymentMode,
      itemsCount: itemsCount,
      status: 'Completed',
      items: transactionItems,
      // Pass Phase 4 fields if it's a new customer
      ...(!selectedCustomer && { address: customerAddress, notes: customerNotes })
    } as any;

    onConfirm(newTx);
    setScreen('Dashboard');
  };

  const updateQuantity = (id: string, delta: number) => {
    if (!activeSelectors.has(id)) {
      setActiveSelectors(prev => new Set(prev).add(id));
    }
    const product = products.find(p => p.id === id);
    const maxStock = product ? product.stock : Infinity;

    setCart(prev => {
      const current = prev[id] || 0;
      const next = Math.min(maxStock, Math.max(0, current + delta));
      return { ...prev, [id]: next };
    });
  };

  const setQuantity = (id: string, val: string) => {
    if (!activeSelectors.has(id)) {
      setActiveSelectors(prev => new Set(prev).add(id));
    }
    const product = products.find(p => p.id === id);
    const maxStock = product ? product.stock : Infinity;
    const num = val === '' ? 0 : parseInt(val);
    setCart(prev => {
      const validatedNum = isNaN(num) ? 0 : Math.min(maxStock, num);
      return { ...prev, [id]: validatedNum };
    });
  };

  const filteredProducts = products.filter(p => {
    if (p.available === false) return false;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All Items' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const cartEntries = Object.entries(cart).filter(([_, qty]) => (qty as number) > 0);
  const cartItemsCount = cartEntries.reduce((a: number, [_, qty]) => a + (qty as number), 0);
  const total = cartEntries.reduce((sum: number, [id, qty]) => {
    const product = products.find(p => p.id === id);
    return sum + (product ? product.price * (qty as number) : 0);
  }, 0);

  const categories = ['All Items', ...Array.from(new Set(products.filter(p => p.available !== false).map(p => p.category)))];

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <header className="flex items-center justify-between">
        <button
          onClick={() => {
            if (step === 2) setStep(1);
            else setScreen('Dashboard');
          }}
          className="p-2 -ml-2 text-primary"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="font-headline font-bold text-lg">{step === 1 ? 'Add to Bill' : 'Transaction Details'}</h2>
        <button
          onClick={() => setStep(1)}
          className={`relative p-2 -mr-2 transition-all active:scale-95 ${step === 2 ? 'text-primary' : 'text-on-surface-variant'}`}
        >
          <ShoppingCart size={24} />
          {cartItemsCount > 0 && (
            <span className="absolute top-1 right-1 bg-secondary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
              {cartItemsCount}
            </span>
          )}
        </button>
      </header>

      {step === 1 ? (
        <div onClick={() => setActiveSelectors(new Set())}>
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-high rounded-3xl py-4 pl-12 pr-6 border-none focus:ring-2 focus:ring-primary/20 transition-all font-sans"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar py-2" onClick={(e) => e.stopPropagation()}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-primary text-white ambient-glow' : 'bg-surface-container-high text-on-surface-variant/60'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="bg-surface-container-low p-2 rounded-[2rem] space-y-2">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => {
                const quantity = cart[product.id] ?? 0;
                const isSelectorActive = activeSelectors.has(product.id);

                return (
                  <div
                    key={product.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isSelectorActive) setActiveSelectors(new Set([product.id]));
                    }}
                    className="bg-surface-container-lowest p-3 rounded-2xl flex gap-4 relative overflow-hidden active:bg-surface-container-high transition-colors"
                  >

                    <div className={`flex flex-col justify-between py-1 transition-all flex-grow ${isSelectorActive ? 'pr-20' : 'pr-10'}`}>
                      <div>
                        <p className="text-[10px] font-black uppercase text-on-surface-variant/40 tracking-widest leading-none mb-1">{product.category}</p>
                        <h3 className="font-bold text-sm leading-tight mb-1">{product.name}</h3>
                        <div className="flex items-center gap-1">
                          {product.status === 'In Stock' ? (
                            <CheckCircle2 size={12} className="text-primary" />
                          ) : (
                            <AlertTriangle size={12} className="text-secondary" />
                          )}
                          <span className={`text-[10px] font-bold ${product.status === 'In Stock' ? 'text-primary' : 'text-secondary'}`}>
                            {product.status} {product.stock <= 10 && product.stock > 0 && `: ${product.stock}`}
                          </span>
                        </div>
                      </div>
                      <p className="font-headline font-extrabold text-lg leading-none">
                        ₹{product.price} <span className="text-xs font-normal text-on-surface-variant/60">/{product.unit}</span>
                      </p>
                    </div>

                    <div className="absolute bottom-3 right-3 flex items-center bg-surface-container-high rounded-full p-0.5 h-9 editorial-shadow transition-all">
                      {isSelectorActive ? (
                        <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => updateQuantity(product.id, -1)}
                            className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-primary active:scale-90 transition-transform"
                          >
                            <span className="font-black text-lg leading-none">-</span>
                          </button>
                          <input
                            type="number"
                            value={quantity === 0 ? '' : quantity}
                            onChange={(e) => setQuantity(product.id, e.target.value)}
                            className="w-8 bg-transparent border-none p-0 text-center text-xs font-black focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button
                            disabled={quantity >= product.stock}
                            onClick={() => updateQuantity(product.id, 1)}
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${quantity >= product.stock ? 'bg-on-surface/5 text-on-surface-variant/20 cursor-not-allowed' : 'bg-primary text-white active:scale-90'}`}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          disabled={product.stock === 0}
                          onClick={(e) => { e.stopPropagation(); setActiveSelectors(new Set([product.id])); }}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors active:scale-90 ${product.stock === 0 ? 'bg-on-surface/5 text-on-surface-variant/20 cursor-not-allowed text-xs font-black' : 'bg-white text-primary hover:bg-primary hover:text-white'}`}
                        >
                          {product.stock === 0 ? 'Out' : <Plus size={18} />}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-on-surface-variant/40 italic">
                No items found in this category
              </div>
            )}
          </div>

          {cartItemsCount > 0 && (
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              className="fixed bottom-24 left-4 right-4 bg-surface-container-lowest/80 backdrop-blur-xl rounded-[2.5rem] p-4 flex items-center justify-between editorial-shadow border border-white/20"
            >
              <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{cartItemsCount} items added</p>
                <p className="text-2xl font-headline font-black text-primary">₹{total.toFixed(2)}</p>
              </div>
              <button
                onClick={() => setStep(2)}
                className="bg-primary text-white px-8 py-4 rounded-full font-headline font-bold flex items-center gap-2 ambient-glow active:scale-95 transition-transform"
              >
                Review Bill
                <ChevronRight size={20} />
              </button>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
          <section className="bg-surface-container-lowest p-6 rounded-[2rem] editorial-shadow space-y-6">
            <div className="flex items-center gap-3">
              {paymentMode === 'UDHAR' ? (
                <BookOpen size={20} className="text-secondary" />
              ) : (
                <User size={20} className="text-primary" />
              )}
              <h3 className="font-headline font-bold text-lg">
                {paymentMode === 'UDHAR' ? 'Customer for Udhar' : 'Customer Details'}
              </h3>
            </div>

            <div className="space-y-4 relative">
              <div className="relative">
                <label className="text-[10px] font-black uppercase text-on-surface-variant/50 tracking-widest mb-1 ml-1 block">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter customer name"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (paymentMode === 'UDHAR') setShowCustomerSuggestions(true);
                  }}
                  onFocus={() => {
                    if (paymentMode === 'UDHAR' && customerName.length >= 2) setShowCustomerSuggestions(true);
                  }}
                  className="w-full bg-surface-container-high rounded-t-sm rounded-b-xl py-4 px-5 border-none focus:ring-0 font-bold placeholder:text-on-surface-variant/30"
                />
                
                {/* Customer Suggestions Dropdown */}
                <AnimatePresence>
                  {showCustomerSuggestions && customerSearchResults.length > 0 && paymentMode === 'UDHAR' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-[60] left-0 right-0 top-full mt-2 bg-surface-container-highest rounded-2xl editorial-shadow overflow-hidden border border-primary/10"
                    >
                      {customerSearchResults.map((customer) => (
                        <button
                          key={customer.id}
                          onClick={() => {
                            setCustomerName(customer.full_name);
                            setCustomerContact(customer.mobile_number);
                            setSelectedCustomer(customer);
                            setShowCustomerSuggestions(false);
                          }}
                          className="w-full text-left p-4 hover:bg-primary/5 border-b border-on-surface/5 last:border-none transition-colors flex items-center justify-between"
                        >
                          <div>
                            <p className="font-bold text-sm">{customer.full_name}</p>
                            <p className="text-[10px] text-on-surface-variant font-black">+91 {customer.mobile_number}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black text-primary uppercase">Due: ₹{customer.total_due || 0}</p>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Selected Customer Card (Phase 2) */}
              <AnimatePresence>
                {selectedCustomer && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-surface-container-low rounded-2xl p-4 border border-on-surface/5 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${selectedCustomer.trust_score >= 80 ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                              {selectedCustomer.trust_score >= 80 ? 'High Trust' : 'Medium Risk'}
                            </span>
                            <span className="text-[8px] font-black bg-on-surface/5 text-on-surface-variant/60 px-2 py-0.5 rounded-full uppercase">
                              Score: {selectedCustomer.trust_score}/100
                            </span>
                          </div>
                          <p className="font-bold text-sm">Ledger Insights</p>
                        </div>
                        <button 
                          onClick={() => setSelectedCustomer(null)}
                          className="text-[10px] font-black text-secondary uppercase underline"
                        >
                          Clear
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-surface-container-highest/50 p-3 rounded-xl">
                          <p className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">Current Due</p>
                          <p className={`text-lg font-headline font-black ${selectedCustomer.total_due > 0 ? 'text-secondary' : 'text-primary'}`}>₹{selectedCustomer.total_due.toLocaleString()}</p>
                        </div>
                        <div className="bg-surface-container-highest/50 p-3 rounded-xl">
                          <p className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">Last Payment</p>
                          <p className="text-lg font-headline font-black text-on-surface">
                            {selectedCustomer.last_payment_amount > 0 ? `₹${selectedCustomer.last_payment_amount}` : 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">Recent Activity</p>
                        <div className="space-y-1">
                          {selectedCustomer.recent_transactions?.map((tx: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center text-[10px] bg-white/40 p-2 rounded-lg">
                              <span className="font-bold text-on-surface-variant">{new Date(tx.created_at).toLocaleDateString()}</span>
                              <span className={`font-black ${tx.type === 'CREDIT' ? 'text-secondary' : 'text-primary'}`}>
                                {tx.type === 'CREDIT' ? '+' : '-'} ₹{tx.amount}
                              </span>
                            </div>
                          ))}
                          {(!selectedCustomer.recent_transactions || selectedCustomer.recent_transactions.length === 0) && (
                            <p className="text-[10px] text-on-surface-variant/40 italic text-center py-2">No transaction history</p>
                          )}
                        </div>
                      </div>

                      {selectedCustomer.total_due > 5000 && (
                        <div className="bg-secondary/10 border border-secondary/20 p-3 rounded-xl flex items-center gap-3">
                          <AlertTriangle size={16} className="text-secondary shrink-0" />
                          <p className="text-[10px] font-bold text-secondary leading-tight">
                            High pending balance alert! Customer owes ₹{selectedCustomer.total_due.toLocaleString()}.
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>


              <div>
                <label className="text-[10px] font-black uppercase text-on-surface-variant/50 tracking-widest mb-1 ml-1 block">Contact Number</label>
                <div className="flex">
                  <div className="bg-surface-container-high rounded-tl-xl rounded-bl-sm py-4 px-4 font-bold border-r border-on-surface/5">+91</div>
                  <input
                    type="tel"
                    placeholder="0000000000"
                    maxLength={10}
                    value={customerContact}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setCustomerContact(val);
                      if (paymentMode === 'UDHAR') setShowCustomerSuggestions(true);
                      if (val.length === 10) {
                        const existing = udharCustomers.find(c => c.mobile_number === val);
                        if (existing && !customerName) setCustomerName(existing.full_name);
                      }
                    }}
                    className="flex-grow bg-surface-container-high rounded-tr-sm rounded-br-xl py-4 px-5 border-none focus:ring-0 font-bold placeholder:text-on-surface-variant/30 text-on-surface"
                  />
                </div>
                {udharCustomers.find(c => c.mobile_number === customerContact) && (
                  <p className="text-[10px] font-bold text-primary mt-1 flex items-center gap-1"><CheckCircle2 size={10} /> Existing customer found</p>
                )}
                {isSearchingCustomer && (
                  <p className="text-[10px] font-bold text-on-surface-variant mt-1 animate-pulse">Searching customers...</p>
                )}
              </div>

              {/* New Customer Optional Details (Phase 4) */}
              {!selectedCustomer && paymentMode === 'UDHAR' && customerContact.length === 10 && (
                <div className="space-y-3">
                  <button
                    onClick={() => setShowNewCustomerForm(!showNewCustomerForm)}
                    className="flex items-center gap-2 text-[10px] font-black uppercase text-primary tracking-widest px-4 py-2 bg-primary/5 rounded-full hover:bg-primary/10 transition-colors"
                  >
                    {showNewCustomerForm ? '-' : '+'} Add Address & Notes (Optional)
                  </button>

                  <AnimatePresence>
                    {showNewCustomerForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 overflow-hidden pt-2"
                      >
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-on-surface-variant/50 tracking-widest ml-1 block">Address</label>
                          <textarea
                            value={customerAddress}
                            onChange={(e) => setCustomerAddress(e.target.value)}
                            placeholder="Customer's permanent address"
                            className="w-full bg-surface-container-high rounded-xl py-4 px-5 border-none focus:ring-0 font-bold placeholder:text-on-surface-variant/30 text-sm resize-none h-24"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-on-surface-variant/50 tracking-widest ml-1 block">Notes / Risk Info</label>
                          <input
                            type="text"
                            value={customerNotes}
                            onChange={(e) => setCustomerNotes(e.target.value)}
                            placeholder="e.g. Known via neighbor, trustworthy"
                            className="w-full bg-surface-container-high rounded-xl py-4 px-5 border-none focus:ring-0 font-bold placeholder:text-on-surface-variant/30 text-sm"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

          </section>

          <section className="bg-surface-container-lowest p-6 rounded-[2rem] editorial-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/20 rounded-full blur-3xl" />
            <div className="relative z-10 space-y-8">
              <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Total Pay</p>
                <p className="text-5xl font-headline font-black text-primary tracking-tighter">₹{total.toFixed(2)}</p>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Payment Mode</p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { mode: 'Cash', icon: <Banknote size={20} /> },
                    { mode: 'UPI', icon: <QrCode size={20} /> },
                    { mode: 'Card', icon: <CreditCard size={20} /> },
                    { mode: 'UDHAR', icon: <BookOpen size={20} /> }
                  ].map((item) => {
                    const isActive = paymentMode === item.mode;
                    return (
                      <button
                        key={item.mode}
                        onClick={() => setPaymentMode(item.mode as any)}
                        className={`flex flex-col items-center gap-1 py-4 rounded-2xl border-2 transition-all ${isActive ? (item.mode === 'UDHAR' ? 'border-secondary bg-secondary text-white ambient-glow scale-[1.05]' : 'border-primary bg-primary text-white ambient-glow scale-[1.05]') : 'border-transparent bg-surface-container-high text-on-surface-variant/60 hover:bg-surface-container-highest'}`}
                      >
                        {item.icon}
                        <span className="text-[10px] font-bold uppercase">{item.mode}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {paymentMode === 'UDHAR' && (
                <div className="bg-secondary/10 p-5 rounded-[2rem] border border-secondary/20 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
                    <BookOpen size={80} />
                  </div>
                  
                  <div className="flex items-center gap-2 text-secondary relative z-10">
                    <div className="p-1.5 bg-secondary/10 rounded-lg">
                      <BookOpen size={18} />
                    </div>
                    <p className="font-headline font-black text-sm uppercase tracking-wider">Udhar Ledger Preview</p>
                  </div>
                  
                  <div className="space-y-3 relative z-10">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest">Previous Due</span>
                      <span className="font-headline font-black text-on-surface">₹{selectedCustomer?.total_due.toLocaleString() || '0.00'}</span>
                    </div>
                    
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest">New Bill Amount</span>
                      <span className="font-headline font-black text-secondary">+ ₹{total.toLocaleString()}</span>
                    </div>
                    
                    <div className="pt-4 border-t border-secondary/20 mt-2">
                      <div className="flex justify-between items-center bg-secondary text-white p-4 rounded-2xl shadow-lg shadow-secondary/20">
                        <div>
                          <p className="text-[8px] font-black uppercase tracking-widest opacity-70">Total Due After Purchase</p>
                          <p className="text-2xl font-headline font-black tracking-tight">
                            ₹{( (selectedCustomer?.total_due || 0) + total ).toLocaleString()}
                          </p>
                        </div>
                        <TrendingUp size={24} className="opacity-50" />
                      </div>
                    </div>

                    {selectedCustomer && selectedCustomer.total_due > 10000 && (
                      <div className="mt-4 bg-white/50 backdrop-blur-sm p-3 rounded-xl border border-secondary/10 flex items-start gap-3">
                        <Shield size={16} className="text-secondary mt-0.5" />
                        <p className="text-[9px] font-bold text-on-surface-variant leading-relaxed">
                          <span className="text-secondary">Risk Warning:</span> This customer's credit limit is high. Consider requesting a partial payment before extending more credit.
                        </p>
                      </div>
                    )}

                    {!selectedCustomer && customerContact.length === 10 && customerName && (
                      <div className="mt-2 bg-primary/5 p-3 rounded-xl border border-primary/10 flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-primary" />
                        <span className="text-[10px] font-bold text-primary">New customer ledger will be initialized.</span>
                      </div>
                    )}
                  </div>
                </div>
              )}


              {/* Sticky Action Button for Step 2 (Phase 5) */}
              <div className="fixed bottom-24 left-4 right-4 z-40 bg-white/80 backdrop-blur-xl p-2 rounded-[2.5rem] editorial-shadow-high border border-white/40">
                <button
                  onClick={handleConfirm}
                  disabled={isSearchingCustomer || (paymentMode === 'UDHAR' && customerContact.length !== 10)}
                  className={`w-full py-5 rounded-[2.2rem] font-headline font-black text-xl flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-[0.98] ${
                    isSearchingCustomer || (paymentMode === 'UDHAR' && customerContact.length !== 10)
                      ? 'bg-on-surface/5 text-on-surface-variant/20 cursor-not-allowed'
                      : (paymentMode === 'UDHAR' ? 'bg-secondary text-white ambient-glow' : 'bg-primary text-white ambient-glow')
                  }`}
                >
                  {isSearchingCustomer ? (
                    <span className="animate-pulse">Processing...</span>
                  ) : (
                    <>
                      {paymentMode === 'UDHAR' ? <BookOpen size={24} /> : <CheckCircle2 size={24} />}
                      {paymentMode === 'UDHAR' ? (selectedCustomer ? 'Add to Ledger' : 'Create & Save Udhar') : 'Confirm Transaction'}
                    </>
                  )}
                </button>
                {paymentMode === 'UDHAR' && customerContact.length !== 10 && (
                  <motion.p 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] text-secondary font-black text-center mt-2 tracking-widest uppercase"
                  >
                    Enter 10-digit mobile to enable Udhar
                  </motion.p>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function InventoryScreen({
  setScreen,
  products,
  onDelete,
  onToggleAvailability,
  onEdit,
  menuOpen,
  setMenuOpen
}: {
  setScreen: (s: Screen) => void,
  products: Product[],
  onDelete: (id: string) => void,
  onToggleAvailability: (id: string) => void,
  onEdit: (p: Product) => void,
  menuOpen: string | null,
  setMenuOpen: (id: string | null) => void
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All Items' || p.category === selectedCategory;
    const matchesStock = !showLowStockOnly || p.status === 'Low Stock' || p.status === 'Out of Stock';
    return matchesSearch && matchesCategory && matchesStock;
  });

  const categories = ['All Items', ...Array.from(new Set(products.map(p => p.category)))];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="font-headline font-extrabold text-4xl tracking-tight">Inventory</h2>
        <p className="text-on-surface-variant mt-2">Track stock levels and items.</p>
      </header>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        <button 
          onClick={() => setShowLowStockOnly(false)}
          className={`shrink-0 w-36 h-36 p-5 rounded-[2rem] editorial-shadow flex flex-col justify-between transition-all active:scale-95 ${!showLowStockOnly ? 'bg-primary text-white ambient-glow' : 'bg-surface-container-lowest'}`}
        >
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${!showLowStockOnly ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>
            <Package size={20} />
          </div>
          <div className="text-left">
            <p className={`text-[8px] font-black uppercase tracking-widest mt-4 ${!showLowStockOnly ? 'text-white/60' : 'text-on-surface-variant/40'}`}>Total Items</p>
            <p className="text-2xl font-headline font-black">{products.length}</p>
          </div>
        </button>

        <button 
          onClick={() => setShowLowStockOnly(true)}
          className={`shrink-0 w-36 h-36 p-5 rounded-[2rem] editorial-shadow flex flex-col justify-between transition-all active:scale-95 border-b-4 ${showLowStockOnly ? 'bg-secondary text-white ambient-glow border-white/20' : 'bg-surface-container-lowest border-secondary/20'}`}
        >
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${showLowStockOnly ? 'bg-white/20 text-white' : 'bg-secondary/10 text-secondary'}`}>
            <AlertTriangle size={20} />
          </div>
          <div className="text-left">
            <p className={`text-[8px] font-black uppercase tracking-widest mt-4 ${showLowStockOnly ? 'text-white/60' : 'text-on-surface-variant/40'}`}>Low Stock</p>
            <p className="text-2xl font-headline font-black">{products.filter(p => p.status === 'Low Stock' || p.status === 'Out of Stock').length}</p>
          </div>
        </button>

        <div className="shrink-0 w-36 h-36 bg-surface-container-lowest p-5 rounded-[2rem] editorial-shadow flex flex-col justify-between">
          <div className="w-10 h-10 bg-primary-container/30 rounded-2xl flex items-center justify-center text-primary">
            <BarChart3 size={20} />
          </div>
          <div>
            <p className="text-[8px] font-black uppercase text-on-surface-variant/40 tracking-widest mt-4">Active SKUs</p>
            <p className="text-2xl font-headline font-black">{products.filter(p => p.available).length}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
            <input
              type="text"
              placeholder="Search SKU or Product Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-high rounded-2xl py-3 pl-12 pr-6 border-none text-sm focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-primary text-white ambient-glow' : 'bg-surface-container-high text-on-surface-variant/60'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-surface-container-low p-2 rounded-[2rem] space-y-2">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <div key={product.id} className="bg-surface-container-lowest p-4 rounded-2xl flex flex-col gap-4 relative">
                <div className="flex gap-4">

                  <div className="flex-grow">
                    <div className="flex gap-2 items-center mb-1">
                      <span className="text-[8px] font-bold bg-surface-container-high px-2 py-0.5 rounded uppercase tracking-widest">SKU: {product.sku}</span>
                      <span className="text-[8px] font-bold bg-primary-container/20 text-on-primary-container px-2 py-0.5 rounded uppercase tracking-widest">{product.category}</span>
                    </div>
                    <h3 className="font-bold text-sm">{product.name}</h3>
                  </div>
                  <div className="flex items-start gap-1">
                    <button
                      onClick={() => onEdit(product)}
                      className="p-2 text-on-surface-variant/40 hover:text-primary transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setMenuOpen(menuOpen === product.id ? null : product.id)}
                        className="p-2 text-on-surface-variant/40 hover:text-secondary transition-colors"
                      >
                        <MoreVertical size={18} />
                      </button>
                      {menuOpen === product.id && (
                        <div className="absolute top-10 right-0 z-20 bg-white editorial-shadow rounded-xl p-1 min-w-[100px] animate-in fade-in zoom-in duration-200">
                          <button
                            onClick={() => onDelete(product.id)}
                            className="w-full text-left px-3 py-2 text-xs font-bold text-secondary hover:bg-secondary/5 rounded-lg flex items-center gap-2"
                          >
                            <AlertTriangle size={14} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-y border-surface-container-high">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${product.available ? 'bg-primary/10 text-primary' : 'bg-on-surface-variant/10 text-on-surface-variant/40'}`}>
                      <CheckCircle2 size={16} />
                    </div>
                    <span className="text-xs font-bold">Status: {product.available ? 'Available' : 'Unavailable'}</span>
                  </div>
                  <button
                    onClick={() => onToggleAvailability(product.id)}
                    className={`w-12 h-6 rounded-full transition-all relative ${product.available ? 'bg-primary' : 'bg-surface-container-highest'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${product.available ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">Stock Level</span>
                    <span className={`text-sm font-headline font-black ${product.status === 'Low Stock' ? 'text-secondary' : 'text-primary'}`}>{product.stock} units</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${product.status === 'Low Stock' ? 'bg-secondary' : 'bg-primary'}`}
                      style={{ width: `${Math.min(100, (product.stock / 150) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-on-surface-variant/40 italic">
              No matching SKUs found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AddItemScreen({ setScreen, onAdd, productToEdit }: { setScreen: (s: Screen) => void, onAdd: (p: Product) => void, productToEdit?: Product | null }) {
  const [formData, setFormData] = useState({
    name: productToEdit?.name || '',
    quantity: productToEdit ? String(productToEdit.stock) : '',
    price: productToEdit ? String(productToEdit.price) : '',
    category: ['Produce', 'Dairy', 'Bakery'].includes(productToEdit?.category || 'Dairy') ? (productToEdit?.category || 'Dairy') : 'Other',
    customCategory: !['Produce', 'Dairy', 'Bakery'].includes(productToEdit?.category || 'Dairy') ? (productToEdit?.category || '') : '',
    available: productToEdit ? productToEdit.available : true,
    image: productToEdit?.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuAm9lnIClzzGvU4s6NMnewI5QhQszWtab0AnFyADb9XfxE3244g5BEDCVOt4z0GazJl7XR2t5-Y1WUJTs2Kr5JOXnhQy3l05HG72HYg1Oir7PbZP7HI8ck_3IpLaSAwPz7LUTlmD4WgHRlpOhSQi_zzixIVDFsyXpSb9pQMNs0UwKMlaZt6oonasmFwis3a8pKP7FXv2Ba5pDu2TsN0EFyvolTiVcTthioHrze5YZJBfu4saom8JdGbIOztelEVOtlzY5bmrn6JaA"
  });

  const handleSave = () => {
    const finalCategory = formData.category === 'Other' ? formData.customCategory : formData.category;
    if (!formData.name || !finalCategory || !formData.price) return;

    const newProduct: Product = {
      id: productToEdit?.id || `prod-${Date.now()}`,
      sku: productToEdit?.sku || `SKU-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      name: formData.name,
      category: finalCategory,
      stock: parseInt(formData.quantity) || 0,
      unit: productToEdit?.unit || 'ea',
      price: parseFloat(formData.price),
      image: formData.image,
      status: parseInt(formData.quantity) < 20 ? 'Low Stock' : 'In Stock',
      available: formData.available
    };

    onAdd(newProduct);
    setScreen('Inventory');
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
      <header className="flex items-center justify-between">
        <button onClick={() => setScreen('Dashboard')} className="p-2 -ml-2 text-primary">
          <ArrowLeft size={24} />
        </button>
        <h2 className="font-headline font-bold text-lg">New Item Profile</h2>
        <button className="p-2 -mr-2 text-on-surface-variant">
          <MoreVertical size={24} />
        </button>
      </header>



      <div className="space-y-6 pb-12">
        <section>
          <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-4">Select Category</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Produce', icon: <Package size={20} /> },
              { label: 'Dairy', icon: <Package size={20} /> },
              { label: 'Bakery', icon: <Package size={20} /> },
              { label: 'Other', icon: <Package size={20} /> }
            ].map((cat) => {
              const isActive = formData.category === cat.label;
              return (
                <button
                  key={cat.label}
                  onClick={() => setFormData({ ...formData, category: cat.label })}
                  className={`flex flex-col items-center gap-2 py-5 rounded-2xl transition-all ${isActive ? 'bg-primary text-white ambient-glow scale-[1.02]' : 'bg-surface-container-high text-on-surface-variant/60 hover:bg-surface-container-highest'}`}
                >
                  {cat.icon}
                  <span className="text-[10px] font-bold uppercase">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {formData.category === 'Other' && (
          <section className="bg-surface-container-low p-1 rounded-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-white p-5 rounded-xl editorial-shadow">
              <label className="text-[10px] font-black uppercase text-secondary tracking-widest mb-2 block">Enter Custom Category</label>
              <input
                type="text"
                placeholder="E.g. Spices, Gourmet, etc."
                value={formData.customCategory}
                onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                className="w-full border-none p-0 text-base font-bold focus:ring-0 placeholder:text-on-surface-variant/40 text-on-surface"
              />
            </div>
          </section>
        )}

        <section className="space-y-4">
          <div className="bg-surface-container-low p-1 rounded-2xl">
            <div className="bg-white p-5 rounded-xl editorial-shadow">
              <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest mb-2 block opacity-70">Item Name</label>
              <input
                type="text"
                placeholder="E.g. The Man of Jungle"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border-none p-0 text-base font-bold focus:ring-0 placeholder:text-on-surface-variant/40 text-on-surface"
              />
            </div>
          </div>

          <div className="bg-surface-container-low p-1 rounded-2xl">
            <div className="bg-white p-5 rounded-xl flex items-center justify-between editorial-shadow">
              <div className="flex-grow">
                <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest mb-2 block opacity-70">Initial Quantity / Stock</label>
                <input
                  type="text"
                  placeholder="e.g. 100"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full border-none p-0 text-base font-bold focus:ring-0 placeholder:text-on-surface-variant/40 text-on-surface"
                />
              </div>
              <Package size={20} className="text-on-surface-variant/30" />
            </div>
          </div>

          <div className="bg-surface-container-low p-1 rounded-2xl">
            <div className="bg-white p-5 rounded-xl flex items-center justify-between editorial-shadow">
              <div className="flex-grow">
                <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest mb-2 block opacity-70">Price</label>
                <input
                  type="text"
                  placeholder="Item Sale Rate"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full border-none p-0 text-base font-bold focus:ring-0 placeholder:text-on-surface-variant/40 text-on-surface"
                />
              </div>
              <span className="text-primary font-black text-xs">INR</span>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-low p-5 rounded-[2rem] flex items-center justify-between editorial-shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-container/20 text-primary rounded-2xl">
              <Package size={20} />
            </div>
            <div>
              <p className="font-bold text-on-surface">Available for Sale</p>
              <p className="text-[10px] text-on-surface-variant">Visible in public marketplace</p>
            </div>
          </div>
          <button
            onClick={() => setFormData({ ...formData, available: !formData.available })}
            className={`w-12 h-6 rounded-full transition-all relative ${formData.available ? 'bg-primary' : 'bg-surface-container-highest'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.available ? 'left-7' : 'left-1'}`} />
          </button>
        </section>

        <button
          onClick={handleSave}
          className="w-full py-5 bg-gradient-to-br from-primary-container to-primary text-white rounded-full font-headline font-black text-lg ambient-glow active:scale-[0.98] transition-transform"
        >
          Save Item
        </button>
      </div>
    </div>
  );
}

function AuthScreen({ onLogin }: { onLogin: (user: any, session: any) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && !name)) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const url = isLogin ? `${API_BASE_URL}/api/auth/login` : `${API_BASE_URL}/api/auth/signup`;
      const body = isLogin ? { email, password } : { name, email, password };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Authentication failed');
      } else {
        if (!isLogin) {
          alert('Account created successfully! Please sign in with your new credentials.');
          setIsLogin(true);
          setPassword('');
        } else {
          onLogin(data.user, data.session);
        }
      }
    } catch (err) {
      alert("Network error. Please make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center p-6 animate-in fade-in duration-1000">
      <div className="w-full max-w-md bg-white p-8 rounded-[3rem] editorial-shadow space-y-8 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center text-white ambient-glow mb-6">
            <Package size={32} />
          </div>
          <h1 className="font-headline font-extrabold text-4xl tracking-tighter text-on-surface mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-on-surface-variant/80 font-medium">
            {isLogin ? 'Enter your credentials to access your store dashboard.' : 'Sign up to start managing your store seamlessly.'}
          </p>
        </div>

        <div className="space-y-4 relative z-10">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest ml-2">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-primary/20 transition-all font-bold text-on-surface" />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest ml-2">Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="hello@inventrax.com" className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-primary/20 transition-all font-bold text-on-surface" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest ml-2">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-primary/20 transition-all font-bold text-on-surface" />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-5 bg-gradient-to-br from-primary-container to-primary text-white rounded-2xl font-headline font-black text-lg ambient-glow active:scale-[0.98] transition-transform relative z-10 disabled:opacity-50"
        >
          {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
        </button>

        <p className="text-center text-sm font-bold text-on-surface-variant relative z-10">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline">
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>

      <div className="mt-8 text-center relative z-10">
        <p className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest">
          Powered by <a href="https://rvinnovators.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">RV Innovators</a>
        </p>
      </div>
    </div>
  );
}

function ProfileScreen({ setScreen, profile, setProfile }: { setScreen: (s: Screen) => void, profile: any, setProfile: React.Dispatch<React.SetStateAction<any>> }) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [localProfile, setLocalProfile] = useState(profile);
  const [isSaving, setIsSaving] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalProfile((prev: any) => ({ ...prev, photo_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem('inventrax_token');
    if (!token) {
      alert("Security session expired. Please log in again.");
      return;
    }

    setIsSaving(true);
    let updatedProfile = { ...localProfile };

    try {
      // 1. Upload photo if it's new (base64)
      if (localProfile.photo_url && localProfile.photo_url.startsWith('data:image')) {
        const res = await fetch(`${API_BASE_URL}/api/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: profile.id, type: 'profile', imageBase64: localProfile.photo_url })
        });
        const data = await res.json();
        if (data.url) updatedProfile.photo_url = data.url;
      }

      // 2. Save entire profile to backend
      const res = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedProfile)
      });

      if (res.ok) {
        setProfile(updatedProfile);
        localStorage.setItem(`inventrax_profile_${profile.id}`, JSON.stringify(updatedProfile));
        setIsEditing(false);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert("Failed to save profile: " + (errData.error || res.statusText));
        if (res.status === 401) {
          localStorage.removeItem('inventrax_logged_in');
          window.location.reload();
        }
      }
    } catch (e: any) {
      console.error(e);
      alert("Network error: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const fields = [
    { label: 'Full Name', key: 'name', icon: <User size={18} /> },
    { label: 'Email Address', key: 'email', icon: <Mail size={18} /> },
    { label: 'Contact Number', key: 'phone', icon: <Phone size={18} /> },
    { label: 'Role', key: 'role', icon: <Shield size={18} /> },
    { label: 'Address', key: 'address', icon: <MapPin size={18} />, multiline: true },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setScreen('Dashboard')} className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h2 className="font-headline font-extrabold text-2xl tracking-tight">Profile</h2>
        </div>
        <button
          disabled={isSaving}
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${isEditing ? 'bg-on-surface text-surface' : 'bg-surface-container-highest text-on-surface border border-outline/10'}`}
        >
          {isSaving ? 'Saving...' : isEditing ? <><CheckCircle2 size={16} /> Save Changes</> : <><Edit2 size={16} /> Edit Profile</>}
        </button>
      </div>

      <div className="bg-surface-container-lowest p-8 rounded-[2.5rem] editorial-shadow space-y-8 relative overflow-hidden">
        <div className="flex flex-col items-center text-center">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-surface-container-high overflow-hidden flex items-center justify-center">
              {localProfile.photo_url ? (
                <img src={localProfile.photo_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-primary/20" />
              )}
            </div>
            {isEditing && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-10 h-10 bg-on-surface text-surface rounded-full flex items-center justify-center editorial-shadow hover:scale-110 transition-transform"
              >
                <Camera size={18} />
              </button>
            )}
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
          </div>
          <h3 className="mt-4 text-2xl font-headline font-black text-on-surface">{profile.name || 'User'}</h3>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest px-4 py-1 bg-surface-container-high rounded-full mt-2 border border-outline/5">
            {profile.role || 'Administrator'}
          </p>
        </div>

        <div className="grid gap-6">
          {fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <label className="text-[10px] font-black uppercase text-on-surface-variant/40 tracking-widest ml-2 flex items-center gap-2">
                {field.icon}
                {field.label}
              </label>
              {isEditing ? (
                field.multiline ? (
                  <textarea
                    value={(localProfile as any)[field.key]}
                    onChange={(e) => setLocalProfile((p: any) => ({ ...p, [field.key]: e.target.value }))}
                    className="w-full bg-surface-container-high rounded-2xl py-4 px-5 border-none focus:ring-2 focus:ring-on-surface/10 transition-all font-bold text-on-surface resize-none min-h-[100px]"
                  />
                ) : (
                  <input
                    type="text"
                    value={(localProfile as any)[field.key]}
                    onChange={(e) => setLocalProfile((p: any) => ({ ...p, [field.key]: e.target.value }))}
                    className="w-full bg-surface-container-high rounded-2xl py-4 px-5 border-none focus:ring-2 focus:ring-on-surface/10 transition-all font-bold text-on-surface"
                  />
                )
              ) : (
                <p className="w-full bg-surface-container-high/30 rounded-2xl py-4 px-5 font-bold text-on-surface">
                  {(profile as any)[field.key] || `No ${field.label.toLowerCase()} set`}
                </p>
              )}
            </div>
          ))}
        </div>

        {!isEditing && (
          <button
            onClick={() => {
              localStorage.removeItem('inventrax_logged_in');
              localStorage.removeItem('inventrax_user_id');
              localStorage.removeItem('inventrax_token');
              window.location.reload();
            }}
            className="w-full py-5 bg-surface-container-highest text-secondary rounded-2xl font-headline font-black text-lg flex items-center justify-center gap-3 border border-secondary/10 active:scale-[0.98] transition-transform hover:bg-secondary/5 mt-4"
          >
            <LogOut size={22} />
            Logout From Account
          </button>
        )}
      </div>
      <p className="text-center text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-[0.2em]">InventraX Secured • v1.2.0</p>
    </div>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const loggedIn = localStorage.getItem('inventrax_logged_in') === 'true';
    const token = localStorage.getItem('inventrax_token');
    return loggedIn && !!token; // Must have both to be considered logged in
  });
  const [profile, setProfile] = useState<any>(() => {
    const userId = localStorage.getItem('inventrax_user_id');
    const defaultProfile = {
      id: userId || '',
      name: 'User',
      email: '',
      phone: '',
      role: 'Administrator',
      address: '',
      photo_url: ""
    };
    if (userId) {
      const saved = localStorage.getItem(`inventrax_profile_${userId}`);
      if (saved) return { ...defaultProfile, ...JSON.parse(saved) };
    }
    return defaultProfile;
  });
  const [currentScreen, setScreen] = useState<Screen>('Dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      const userId = localStorage.getItem('inventrax_user_id');
      if (!userId) {
        setProducts([]);
        setTransactions([]);
        return;
      }
      try {
        const token = localStorage.getItem('inventrax_token');
        const headers = {
          'Authorization': `Bearer ${token}`
        };
        const [invRes, billsRes, profileRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/inventory`, { headers }),
          fetch(`${API_BASE_URL}/api/bills`, { headers }),
          fetch(`${API_BASE_URL}/api/profile`, { headers })
        ]);
        if (invRes.status === 401 || billsRes.status === 401 || profileRes.status === 401) {
          throw new Error('Unauthorized');
        }

        const invData = await invRes.json();
        const billsData = await billsRes.json();

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData && profileData.id) {
            setProfile(profileData);
            localStorage.setItem(`inventrax_profile_${userId}`, JSON.stringify(profileData));
          }
        } else if (profileRes.status === 404) {
          console.log("No profile found for this user yet.");
        }

        const loadedProducts = invData.map((item: any) => {
          const savedImg = localStorage.getItem(`inventrax_img_${item.id}`);
          return {
            id: item.id,
            name: item.name,
            category: item.category,
            price: item.price,
            unit: 'ea',
            image: savedImg || item.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCoeljB0TS97WbD6cnbBN4VkyK0CCJQuKCSJBZz3c35IE5Gz5lDbZMDJDDxhz79-aAb4IjfOPA5K4dzsX612PHmyE3Q2K1mQBHS8bIlURGXYVWVshZjL1Ro4NzCwp-zRo_5q5LiOFAW9Q0H-d81En1qu6I1-DKsu3shtCgOaIim6dq4Gm9U-XoQWlsCkz9ifT-wZhF330gmg-zpvUOQA2MP_Asy4sMEMIbQILHWBZT_97goDo-uTdxpmKrfhlY_W7Gp9Vdm8DU0wg',
            stock: item.quantity,
            status: item.quantity === 0 ? 'Out of Stock' : (item.quantity <= 10 ? 'Low Stock' : 'In Stock'),
            sku: `SKU-${item.id.slice ? item.id.slice(0, 6).toUpperCase() : Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            available: item.available
          };
        });
        setProducts(loadedProducts);

        const loadedTransactions = billsData.map((tx: any) => {
          const date = new Date(tx.timestamp);
          return {
            id: tx.id,
            customerName: tx.customerName || 'Walk-in Customer',
            customerContact: tx.customerPhone || '',
            date: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            time: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
            amount: tx.totalAmount,
            method: tx.paymentMode,
            itemsCount: tx.items?.length || 0,
            status: 'Completed',
            items: (tx.items || []).map((i: any) => ({
              productId: i.inventoryId,
              name: i.name,
              quantity: i.quantity,
              price: i.rate
            }))
          };
        });
        setTransactions(loadedTransactions);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [isLoggedIn]);

  const addProduct = async (newProduct: Product) => {
    try {
      const token = localStorage.getItem('inventrax_token');
      const payloadId = newProduct.id.startsWith('prod-') ? undefined : newProduct.id;
      const res = await fetch(`${API_BASE_URL}/api/inventory`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: payloadId,
          name: newProduct.name,
          category: newProduct.category,
          price: newProduct.price,
          quantity: newProduct.stock,
          available: newProduct.available
        })
      });
      const savedItem = await res.json();

      if (!res.ok) {
        alert("Failed to save item: " + (savedItem.error || 'Unknown error'));
        return;
      }

      const realId = savedItem.id || newProduct.id;

      let finalImageUrl = newProduct.image;
      if (newProduct.image && newProduct.image.startsWith('data:image')) {
        try {
          const uploadRes = await fetch(`${API_BASE_URL}/api/upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: realId, type: 'item', imageBase64: newProduct.image })
          });
          const uploadData = await uploadRes.json();
          if (uploadData.url) {
            finalImageUrl = uploadData.url;
            localStorage.setItem(`inventrax_img_${realId}`, finalImageUrl);
          }
        } catch (e) { console.error('Upload failed', e) }
      } else if (newProduct.image) {
        localStorage.setItem(`inventrax_img_${realId}`, newProduct.image);
      }

      const p: Product = {
        id: realId,
        name: savedItem.name || newProduct.name,
        category: savedItem.category || newProduct.category,
        price: savedItem.price || newProduct.price,
        unit: 'ea',
        image: finalImageUrl,
        stock: savedItem.stock !== undefined ? savedItem.stock : newProduct.stock,
        status: (savedItem.stock !== undefined ? savedItem.stock : newProduct.stock) <= 10 ? 'Low Stock' : 'In Stock',
        sku: newProduct.sku,
        available: savedItem.available !== undefined ? savedItem.available : newProduct.available
      };
      setProducts(prev => {
        const idx = prev.findIndex(item => item.id === p.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = p;
          return updated;
        }
        return [p, ...prev];
      });
    } catch (err) {
      console.error(err);
    }
  };

  const addTransaction = async (newTx: Transaction) => {
    try {
      const token = localStorage.getItem('inventrax_token');
      
      let url = `${API_BASE_URL}/api/bills`;
      let payload: any = {
        customerName: newTx.customerName,
        customerPhone: newTx.customerContact,
        totalAmount: newTx.amount,
        paymentMode: newTx.method,
        items: newTx.items.map(item => ({
          inventoryId: item.productId,
          quantity: item.quantity,
          rate: item.price
        }))
      };

      // Use atomic udhar endpoint for Udhar payments
      if (newTx.method === 'UDHAR') {
        if (newTx.customerId) {
          url = `${API_BASE_URL}/api/udhar/ledger/add-udhar`;
          payload = {
            customerId: newTx.customerId,
            customerName: newTx.customerName,
            customerPhone: newTx.customerContact,
            amount: newTx.amount,
            items: newTx.items,
            remarks: `Bill Purchase`
          };
        } else {
          // New Customer Flow (Phase 4)
          url = `${API_BASE_URL}/api/udhar/customers/create-with-udhar`;
          payload = {
            full_name: newTx.customerName,
            mobile_number: newTx.customerContact,
            address: (newTx as any).address,
            notes: (newTx as any).notes,
            amount: newTx.amount,
            items: newTx.items,
            remarks: `Initial Udhar Purchase`
          };
        }
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        alert("Failed to process transaction: " + (data.error || 'Unknown error'));
        return;
      }

      if (data.success) {
        newTx.id = data.transactionId;
        setTransactions(prev => [newTx, ...prev]);
        setProducts(prevProducts => prevProducts.map(product => {
          const soldItem = newTx.items.find(item => item.productId === product.id);
          if (soldItem) {
            const newStock = Math.max(0, product.stock - soldItem.quantity);
            let newStatus: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
            if (newStock === 0) newStatus = 'Out of Stock';
            else if (newStock <= 10) newStatus = 'Low Stock';

            return {
              ...product,
              stock: newStock,
              status: newStatus
            };
          }
          return product;
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTransactionClick = (t: Transaction) => {
    setSelectedTransaction(t);
    setScreen('TransactionDetail');
  };

  const deleteProduct = async (id: string) => {
    try {
      const token = localStorage.getItem('inventrax_token');
      await fetch(`${API_BASE_URL}/api/inventory/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      localStorage.removeItem(`inventrax_img_${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
      setMenuOpen(null);
    } catch (err) {
      console.error(err);
    }
  };
  const toggleAvailability = async (id: string) => {
    try {
      const token = localStorage.getItem('inventrax_token');
      const product = products.find(p => p.id === id);
      if (!product) return;
      await fetch(`${API_BASE_URL}/api/inventory`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          quantity: product.stock,
          available: !product.available
        })
      });
      setProducts(prev => prev.map(p =>
        p.id === id ? { ...p, available: !p.available } : p
      ));
    } catch (err) {
      console.error(err);
    }
  };

  if (!isLoggedIn) {
    return (
      <AuthScreen
        onLogin={async (user, session) => {
          if (session) {
            localStorage.setItem('inventrax_token', session.access_token);
          }
          setIsLoggedIn(true);
          localStorage.setItem('inventrax_logged_in', 'true');
          localStorage.setItem('inventrax_user_id', user.id);
        }}
      />
    );
  }

  return (
    <Layout currentScreen={currentScreen} setScreen={setScreen} onAddNew={() => { setEditingProduct(null); setScreen('AddItem'); }} profile={profile}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {currentScreen === 'Dashboard' && <DashboardScreen setScreen={setScreen} transactions={transactions} products={products} onTransactionClick={handleTransactionClick} profile={profile} />}
          {currentScreen === 'Analyzer' && <AnalyzerScreen setScreen={setScreen} transactions={transactions} products={products} />}
          {currentScreen === 'NewBill' && <NewBillScreen setScreen={setScreen} products={products} onConfirm={addTransaction} />}
          {currentScreen === 'Inventory' && (
            <InventoryScreen
              setScreen={setScreen}
              products={products}
              onDelete={deleteProduct}
              onToggleAvailability={toggleAvailability}
              onEdit={(p) => { setEditingProduct(p); setScreen('AddItem'); }}
              menuOpen={menuOpen}
              setMenuOpen={setMenuOpen}
            />
          )}
          {currentScreen === 'AddItem' && <AddItemScreen setScreen={setScreen} onAdd={addProduct} productToEdit={editingProduct} />}
          {currentScreen === 'History' && <HistoryScreen setScreen={setScreen} transactions={transactions} onTransactionClick={handleTransactionClick} />}
          {currentScreen === 'Profile' && <ProfileScreen setScreen={setScreen} profile={profile} setProfile={setProfile} />}
          {currentScreen === 'Udhar' && <UdharScreen setScreen={setScreen} />}
          {currentScreen === 'TransactionDetail' && selectedTransaction && (
            <TransactionDetailScreen transaction={selectedTransaction} setScreen={setScreen} />
          )}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}

