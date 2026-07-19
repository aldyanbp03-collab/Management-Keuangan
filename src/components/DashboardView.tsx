import { useState } from 'react';
import { IncomeTransaction, SavingsGoal, ExpenseTransaction, CreditCard } from '../types';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, PiggyBank, CreditCard as CardIcon, Plus, Info, AlertCircle, X, Edit3, Trash2, AlertTriangle, Calendar } from 'lucide-react';

interface DashboardViewProps {
  incomeTransactions: IncomeTransaction[];
  savingsGoals: SavingsGoal[];
  expenses: ExpenseTransaction[];
  creditCards: CreditCard[];
  searchQuery: string;
  startDate: string;
  endDate: string;
  onNavigateToTab: (tab: string) => void;
  onOpenQuickExpense: () => void;
  onOpenQuickIncome: () => void;
  onUpdateIncome?: (item: IncomeTransaction) => void;
  onDeleteIncome?: (id: string) => void;
  onUpdateExpense?: (item: ExpenseTransaction) => void;
  onDeleteExpense?: (id: string) => void;
}

export default function DashboardView({
  incomeTransactions,
  savingsGoals,
  expenses,
  creditCards,
  searchQuery,
  startDate,
  endDate,
  onNavigateToTab,
  onOpenQuickExpense,
  onOpenQuickIncome,
  onUpdateIncome,
  onDeleteIncome,
  onUpdateExpense,
  onDeleteExpense,
}: DashboardViewProps) {
  
  // Interactive rincian/edit/delete states
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  const [editingIncome, setEditingIncome] = useState<IncomeTransaction | null>(null);
  const [editingExpense, setEditingExpense] = useState<ExpenseTransaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<any | null>(null);

  // Form states for editing
  const [editIncomeSource, setEditIncomeSource] = useState('');
  const [editIncomeCategory, setEditIncomeCategory] = useState('');
  const [editIncomeAmount, setEditIncomeAmount] = useState('');
  const [editIncomeDate, setEditIncomeDate] = useState('');

  const [editExpenseTitle, setEditExpenseTitle] = useState('');
  const [editExpenseCategory, setEditExpenseCategory] = useState('');
  const [editExpenseAmount, setEditExpenseAmount] = useState('');
  const [editExpenseDate, setEditExpenseDate] = useState('');
  const [editExpenseTime, setEditExpenseTime] = useState('');
  const [editExpensePayment, setEditExpensePayment] = useState<'cash' | 'savings' | 'credit_card'>('cash');
  const [editExpenseSavingsId, setEditExpenseSavingsId] = useState('');
  const [editExpenseCardId, setEditExpenseCardId] = useState('');
  
  // Format Currency in IDR
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Financial Calculations (Reactive to state)
  const filteredIncome = incomeTransactions.filter(item => {
    if (startDate && item.date < startDate) return false;
    if (endDate && item.date > endDate) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesName = item.source.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
      const matchesType = "pemasukan".includes(q) || "income".includes(q) || "pendapatan".includes(q);
      return matchesName || matchesType;
    }
    return true;
  });

  const filteredExpenses = expenses.filter(item => {
    if (startDate && item.date < startDate) return false;
    if (endDate && item.date > endDate) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesName = item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
      const matchesType = "pengeluaran".includes(q) || "expense".includes(q) || "belanja".includes(q);
      return matchesName || matchesType;
    }
    return true;
  });

  const totalIncome = filteredIncome.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  
  // Total Savings across all goals
  const totalSaved = savingsGoals.reduce((acc, curr) => acc + curr.saved, 0);
  const totalSavingsTarget = savingsGoals.reduce((acc, curr) => acc + curr.target, 0);
  const overallSavingsProgress = totalSavingsTarget > 0 ? Math.round((totalSaved / totalSavingsTarget) * 100) : 0;

  // Credit Card limits & spent metrics
  const totalCardLimit = creditCards.reduce((acc, curr) => acc + curr.limit, 0);
  const totalCardSpent = creditCards.reduce((acc, curr) => acc + curr.currentSpend, 0);
  const availableCredit = totalCardLimit - totalCardSpent;

  // Expenses Today
  const todayStr = '2026-07-19'; // Fixed system date as of constraints
  const todayExpenses = expenses.filter(e => e.date === todayStr);
  const totalTodayExpenses = todayExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  // Daily budget assumption: Rp 600,000
  const dailyBudget = 600000;
  const remainingDailyBudget = Math.max(0, dailyBudget - totalTodayExpenses);

  // Active Main Credit Card (Utama Platinum or first card)
  const activeCard = creditCards.find(c => c.cardName.toLowerCase().includes('utama')) || creditCards[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300" id="dashboard-view-root">
      
      {/* Overview Highlight Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 landscape:grid-cols-2 lg:grid-cols-4 gap-4" id="overview-metrics-grid">
        {/* Net Income Card */}
        <div 
          onClick={() => onNavigateToTab('income')}
          className="bg-slate-900 p-5 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group flex items-center justify-between"
          id="net-income-card"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Pendapatan</span>
            <div className="text-xl font-extrabold text-slate-100 tracking-tight font-mono group-hover:text-emerald-400 transition-colors">
              {formatRupiah(totalIncome)}
            </div>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3 text-emerald-400" /> Stabil bulan ini
            </span>
          </div>
          <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-2xl group-hover:bg-emerald-500/20 transition-colors">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        {/* Total Expenses Card */}
        <div 
          onClick={() => onNavigateToTab('expenses')}
          className="bg-slate-900 p-5 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group flex items-center justify-between"
          id="total-expenses-card"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Pengeluaran</span>
            <div className="text-xl font-extrabold text-slate-100 tracking-tight font-mono group-hover:text-rose-400 transition-colors">
              {formatRupiah(totalExpenses)}
            </div>
            <span className="text-[10px] text-rose-400 font-bold flex items-center gap-0.5">
              <ArrowDownRight className="w-3 h-3 text-rose-400" /> Terkontrol
            </span>
          </div>
          <div className="p-3.5 bg-rose-500/10 text-rose-400 rounded-2xl group-hover:bg-rose-500/20 transition-colors">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Savings Balance Card */}
        <div 
          onClick={() => onNavigateToTab('savings')}
          className="bg-slate-900 p-5 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group flex items-center justify-between"
          id="total-savings-card"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Tabungan</span>
            <div className="text-xl font-extrabold text-slate-100 tracking-tight font-mono group-hover:text-sky-400 transition-colors">
              {formatRupiah(totalSaved)}
            </div>
            <span className="text-[10px] text-sky-400 font-bold">
              {overallSavingsProgress}% dari Target
            </span>
          </div>
          <div className="p-3.5 bg-sky-500/10 text-sky-400 rounded-2xl group-hover:bg-sky-500/20 transition-colors">
            <PiggyBank className="w-5 h-5" />
          </div>
        </div>

        {/* Credit Card Available Limit Card */}
        <div 
          onClick={() => onNavigateToTab('credit')}
          className="bg-slate-900 p-5 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group flex items-center justify-between"
          id="total-credit-card-card"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sisa Limit Kredit</span>
            <div className="text-xl font-extrabold text-slate-100 tracking-tight font-mono group-hover:text-sky-400 transition-colors">
              {formatRupiah(availableCredit)}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              Limit: {formatRupiah(totalCardLimit)}
            </span>
          </div>
          <div className="p-3.5 bg-sky-500/10 text-sky-400 rounded-2xl group-hover:bg-sky-500/20 transition-colors">
            <CardIcon className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column (Budget & Daily Expense, Savings), Right Column (Credit Card UI) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-main-bento-grid">
        
        {/* Left Bento: 7 Columns */}
        <div className="lg:col-span-7 space-y-6" id="dashboard-left-bento">
          
          {/* Daily Budget & Spent Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="daily-budget-spent-subgrid">
            <div className="bg-rose-500/5 p-5 rounded-3xl border border-rose-500/10 flex flex-col justify-between" id="today-expense-subcard">
              <div>
                <span className="text-[11px] font-bold text-rose-400/80 uppercase tracking-wider">Total Hari Ini</span>
                <div className="text-2xl font-black text-rose-400 mt-1 font-mono">
                  {formatRupiah(totalTodayExpenses)}
                </div>
              </div>
              <p className="text-xs text-rose-400/60 mt-3 font-semibold">Pengeluaran terdaftar hari ini</p>
            </div>

            <div className="bg-emerald-500/5 p-5 rounded-3xl border border-emerald-500/10 flex flex-col justify-between" id="daily-budget-subcard">
              <div>
                <span className="text-[11px] font-bold text-emerald-400/80 uppercase tracking-wider">Sisa Anggaran Harian</span>
                <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">
                  {formatRupiah(remainingDailyBudget)}
                </div>
              </div>
              <p className="text-xs text-emerald-400/60 mt-3 font-semibold">Batas aman harian: {formatRupiah(dailyBudget)}</p>
            </div>
          </div>

          {/* Quick Transaction Action */}
          <div className="bg-slate-900 text-slate-200 p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4" id="quick-actions-bar">
            <div>
              <h3 className="font-bold text-lg text-slate-100">Input Finansial Cepat</h3>
              <p className="text-xs text-slate-400 mt-0.5">Catat pemasukan atau pengeluaran Anda secara instan</p>
            </div>
            <div className="flex gap-2.5 w-full sm:w-auto">
              <button 
                onClick={onOpenQuickIncome}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 p-2.5 px-4 rounded-xl bg-slate-850 border border-slate-700 hover:bg-slate-800 text-xs font-black text-emerald-400 transition-all cursor-pointer"
                id="quick-income-btn"
              >
                <TrendingUp className="w-4 h-4 text-emerald-400" /> PEMASUKAN
              </button>
              <button 
                onClick={onOpenQuickExpense}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 p-2.5 px-4 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 text-xs font-black transition-all cursor-pointer shadow-lg shadow-rose-500/5"
                id="quick-expense-btn"
              >
                <ArrowDownRight className="w-4 h-4 text-rose-400" /> PENGELUARAN
              </button>
            </div>
          </div>

          {/* Tabungan Harian Card */}
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm" id="daily-savings-progress-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-200 text-base">Tabungan Harian</h3>
                <p className="text-xs text-slate-400 mt-0.5">Pantau pencapaian dan komitmen menabung Anda</p>
              </div>
              <button 
                onClick={() => onNavigateToTab('savings')}
                className="text-xs font-semibold text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-0.5"
                id="see-all-savings-btn"
              >
                Atur Target
              </button>
            </div>

            {/* Radial / Circle Progress display matched exactly with screenshot 2 */}
            <div className="flex flex-col sm:flex-row items-center justify-around p-4 gap-6 bg-slate-950/40 border border-slate-800/80 rounded-2xl">
              <div className="relative flex items-center justify-center" id="radial-progress-ring">
                {/* SVG circular progress ring */}
                <svg className="w-36 h-36 transform -rotate-90">
                  {/* Background track circle */}
                  <circle
                    cx="72"
                    cy="72"
                    r="58"
                    className="stroke-slate-800"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  {/* Dynamic Progress indicator */}
                  <circle
                    cx="72"
                    cy="72"
                    r="58"
                    className="stroke-sky-500 transition-all duration-1000 ease-out"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 58}
                    strokeDashoffset={2 * Math.PI * 58 * (1 - (overallSavingsProgress > 100 ? 100 : overallSavingsProgress) / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                {/* Central percentage indicator */}
                <div className="absolute text-center">
                  <span className="text-2xl font-black text-slate-200 font-mono block leading-none">{overallSavingsProgress}%</span>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-1 block">Target</span>
                </div>
              </div>

              {/* Savings Balance overview */}
              <div className="text-center sm:text-left space-y-2">
                <div className="text-xl font-extrabold text-slate-100 font-mono">
                  {formatRupiah(totalSaved)} <span className="text-xs font-normal text-slate-500">/ {formatRupiah(totalSavingsTarget)}</span>
                </div>
                <p className="text-xs text-slate-400 italic max-w-xs font-semibold leading-relaxed">
                  &quot;Sikit demi sedikit, lama-lama menjadi bukit.&quot;
                </p>
                
                {/* Quick list of dynamic savings goals */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs text-slate-300">
                  {savingsGoals.slice(0, 2).map((goal) => (
                    <div key={goal.id} className="flex justify-between items-center gap-6">
                      <span className="font-semibold text-slate-300 truncate max-w-[140px]">{goal.name}</span>
                      <span className="text-[11px] font-mono font-bold text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded">
                        {Math.round((goal.saved / goal.target) * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Bento Column: 5 Columns - Credit Card Monitor & Dynamic Transactions */}
        <div className="lg:col-span-5 space-y-6" id="dashboard-right-bento">
          
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm" id="credit-card-monitor-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-200 text-base">Monitor Kartu Kredit</h3>
                <p className="text-xs text-slate-400 mt-0.5">Pemakaian limit dan rincian tagihan</p>
              </div>
              <button
                onClick={() => onNavigateToTab('credit')}
                className="text-xs font-semibold text-sky-400 hover:text-sky-300 hover:underline"
                id="see-all-cards-btn"
              >
                Rincian
              </button>
            </div>

            {activeCard ? (
              <div className="space-y-4">
                {/* Credit Card physical visual preview matched with screenshot 1 */}
                <div className="relative bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-950 p-6 rounded-3xl text-white shadow-xl overflow-hidden group min-h-[200px]" id="credit-card-physical-container">
                  {/* Card Background elements */}
                  <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
                  <div className="absolute left-10 bottom-0 w-24 h-24 bg-sky-500/15 rounded-full blur-2xl"></div>

                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-indigo-300 uppercase">Premium Finance</span>
                      <h4 className="text-xs font-bold text-slate-100 mt-0.5">{activeCard.cardName}</h4>
                    </div>
                    <span className="text-2xl font-black italic tracking-wider text-white">
                      {activeCard.cardType === 'visa' ? 'VISA' : 'Mastercard'}
                    </span>
                  </div>

                  {/* Card NFC & Chip Graphic icon */}
                  <div className="my-5 flex items-center gap-3">
                    {/* Simulated SIM chip */}
                    <div className="w-8 h-6 bg-yellow-400/40 rounded border border-yellow-500/30"></div>
                    <svg className="w-5 h-5 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>

                  {/* Card Number masked */}
                  <div className="text-lg font-bold font-mono tracking-widest text-slate-100">
                    {activeCard.cardNumber}
                  </div>

                  {/* Cardholder & Expiry */}
                  <div className="flex items-end justify-between mt-6">
                    <div>
                      <span className="text-[8px] uppercase tracking-widest text-slate-400 block">Cardholder</span>
                      <span className="text-xs font-bold tracking-wide uppercase text-slate-100">{activeCard.cardholder}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] uppercase tracking-widest text-slate-400 block">Expires</span>
                      <span className="text-xs font-bold font-mono text-slate-100">{activeCard.expiryDate}</span>
                    </div>
                  </div>
                </div>

                {/* Spent limit indicators matched with screenshot 2 */}
                <div className="space-y-3 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80" id="credit-limit-indicators">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-400">Pemakaian Limit</span>
                    <span className="font-extrabold text-slate-200 font-mono">
                      {Math.round((activeCard.currentSpend / activeCard.limit) * 100)}% Used
                    </span>
                  </div>
                  {/* Custom Progress Bar */}
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-sky-500 h-2.5 rounded-full transition-all duration-700"
                      style={{ width: `${(activeCard.currentSpend / activeCard.limit) * 100}%` }}
                    ></div>
                  </div>
                  
                  {/* Financial sub-metrics */}
                  <div className="grid grid-cols-2 gap-4 pt-1 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wide">Sisa Limit</span>
                      <span className="font-extrabold text-slate-200 font-mono block text-sm mt-0.5">
                        {formatRupiah(activeCard.limit - activeCard.currentSpend)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wide">Tagihan Aktif</span>
                      <span className="font-extrabold text-rose-400 font-mono block text-sm mt-0.5">
                        {formatRupiah(activeCard.totalBill)}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs space-y-2">
                <AlertCircle className="w-6 h-6 mx-auto text-slate-600" />
                <p>Belum ada kartu kredit aktif.</p>
              </div>
            )}

            {/* Daily card specific expenses matched with screenshot 2 */}
            <div className="mt-5 border-t border-slate-800 pt-4" id="card-daily-spending-list">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Pengeluaran Kartu Hari Ini</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {expenses
                  .filter(e => e.paymentMethod === 'credit_card' && (activeCard ? e.creditCardId === activeCard.id : true))
                  .slice(0, 3)
                  .map((exp) => (
                    <div key={exp.id} className="flex justify-between items-center text-xs p-2 rounded-xl hover:bg-slate-800 transition-colors">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-300 truncate">{exp.title}</p>
                        <p className="text-[10px] text-slate-500">{exp.category} • {exp.time || '12:00'}</p>
                      </div>
                      <span className="font-mono font-bold text-rose-400 shrink-0">
                        -{formatRupiah(exp.amount)}
                      </span>
                    </div>
                  ))}
                {expenses.filter(e => e.paymentMethod === 'credit_card' && (activeCard ? e.creditCardId === activeCard.id : true)).length === 0 && (
                  <p className="text-[11px] text-slate-500 italic py-2 text-center">Tidak ada transaksi kartu hari ini.</p>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Dynamic Recent Transactions List */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm" id="recent-activities-log">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-slate-200 text-base">Aliran Finansial Terbaru</h3>
            <p className="text-xs text-slate-400 mt-0.5">Gabungan pemasukan dan pengeluaran</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => onNavigateToTab('income')}
              className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-colors cursor-pointer"
            >
              Lihat Pemasukan
            </button>
            <button 
              onClick={() => onNavigateToTab('expenses')}
              className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-semibold hover:bg-rose-500/20 transition-colors cursor-pointer"
            >
              Lihat Pengeluaran
            </button>
          </div>
        </div>

        {/* 1. DESKTOP VIEW: High details Table */}
        <div className="hidden md:block overflow-x-auto" id="recent-financials-table-container">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-2">Tanggal</th>
                <th className="py-3 px-2">Keterangan / Sumber</th>
                <th className="py-3 px-2">Kategori</th>
                <th className="py-3 px-2">Metode</th>
                <th className="py-3 px-2 text-right">Jumlah (IDR)</th>
                <th className="py-3 px-2 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-semibold">
              {[
                ...incomeTransactions.map(i => ({ ...i, type: 'income' as const })),
                ...expenses.map(e => ({ ...e, type: 'expense' as const }))
              ]
                .filter(item => {
                  if (startDate && item.date < startDate) return false;
                  if (endDate && item.date > endDate) return false;
                  if (searchQuery) {
                    const q = searchQuery.toLowerCase();
                    if (item.type === 'income') {
                      const matchesName = (item as any).source.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
                      const matchesType = "pemasukan".includes(q) || "income".includes(q) || "pendapatan".includes(q);
                      return matchesName || matchesType;
                    } else {
                      const matchesName = (item as any).title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
                      const matchesType = "pengeluaran".includes(q) || "expense".includes(q) || "belanja".includes(q);
                      return matchesName || matchesType;
                    }
                  }
                  return true;
                })
                .sort((a, b) => b.date.localeCompare(a.date))
                .slice(0, 5)
                .map((item) => {
                  const isIncome = item.type === 'income';
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-2 text-slate-500 font-mono">{item.date}</td>
                      <td className="py-3 px-2">
                        <span className="font-semibold text-slate-200">
                          {isIncome ? (item as any).source : (item as any).title}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="bg-slate-850 text-slate-300 text-[10px] px-2 py-0.5 rounded-full font-bold border border-slate-800">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        {isIncome ? (
                          <span className="text-emerald-400 font-semibold uppercase text-[10px]">Transfer Masuk</span>
                        ) : (
                          <span className={`uppercase text-[10px] font-bold ${
                            (item as any).paymentMethod === 'cash' ? 'text-slate-400' :
                            (item as any).paymentMethod === 'savings' ? 'text-sky-400' : 'text-indigo-400'
                          }`}>
                            {(item as any).paymentMethod === 'cash' ? '💵 Cash' :
                             (item as any).paymentMethod === 'savings' ? '🐷 Tabungan' : '💳 Kartu'}
                          </span>
                        )}
                      </td>
                      <td className={`py-3 px-2 text-right font-bold font-mono text-sm ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isIncome ? '+' : '-'}{formatRupiah(item.amount)}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              if (isIncome) {
                                setEditingIncome(item as IncomeTransaction);
                                setEditIncomeSource((item as any).source);
                                setEditIncomeCategory(item.category);
                                setEditIncomeAmount((item as any).amount.toString());
                                setEditIncomeDate(item.date);
                              } else {
                                setEditingExpense(item as ExpenseTransaction);
                                setEditExpenseTitle((item as any).title);
                                setEditExpenseCategory(item.category);
                                setEditExpenseAmount((item as any).amount.toString());
                                setEditExpenseDate(item.date);
                                setEditExpenseTime((item as any).time || '12:00');
                                setEditExpensePayment((item as any).paymentMethod);
                                setEditExpenseSavingsId((item as any).savingsGoalId || '');
                                setEditExpenseCardId((item as any).creditCardId || '');
                              }
                            }}
                            className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500 hover:text-slate-950 transition-all cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setTransactionToDelete(item)}
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-slate-950 transition-all cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              
              {incomeTransactions.length === 0 && expenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-500 italic">
                    Belum ada data transaksi finansial terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 2. MOBILE VIEW: View-only clean list, clickable for Rincian / Detail bottom-sheet */}
        <div className="md:hidden space-y-2.5" id="recent-financials-mobile-list">
          {[
            ...incomeTransactions.map(i => ({ ...i, type: 'income' as const })),
            ...expenses.map(e => ({ ...e, type: 'expense' as const }))
          ]
            .filter(item => {
              if (startDate && item.date < startDate) return false;
              if (endDate && item.date > endDate) return false;
              if (searchQuery) {
                const q = searchQuery.toLowerCase();
                if (item.type === 'income') {
                  const matchesName = (item as any).source.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
                  const matchesType = "pemasukan".includes(q) || "income".includes(q) || "pendapatan".includes(q);
                  return matchesName || matchesType;
                } else {
                  const matchesName = (item as any).title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
                  const matchesType = "pengeluaran".includes(q) || "expense".includes(q) || "belanja".includes(q);
                  return matchesName || matchesType;
                }
              }
              return true;
            })
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 5)
            .map((item) => {
              const isIncome = item.type === 'income';
              return (
                <div 
                  key={item.id}
                  onClick={() => setSelectedTransaction(item)}
                  className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer active:scale-[0.98] flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <span className="text-[10px] text-slate-500 font-mono font-bold block mb-1 whitespace-nowrap shrink-0">{item.date}</span>
                    <p className="font-bold text-slate-200 text-xs truncate">
                      {isIncome ? (item as any).source : (item as any).title}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      <span className="bg-slate-800/60 text-slate-300 text-[10px] px-2.5 py-0.5 rounded-full border border-slate-700/40 font-semibold tracking-wide whitespace-nowrap shrink-0">
                        {item.category}
                      </span>
                      {isIncome ? (
                        <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-semibold tracking-wide whitespace-nowrap shrink-0">
                          💰 Transfer Masuk
                        </span>
                      ) : (item as any).paymentMethod === 'savings' ? (
                        <span className="bg-amber-500/10 text-amber-400 text-[10px] px-2.5 py-0.5 rounded-full border border-amber-500/20 font-semibold tracking-wide whitespace-nowrap shrink-0">
                          🐖 Tabungan
                        </span>
                      ) : (item as any).paymentMethod === 'credit_card' ? (
                        <span className="bg-sky-500/10 text-sky-400 text-[10px] px-2.5 py-0.5 rounded-full border border-sky-500/20 font-semibold tracking-wide whitespace-nowrap shrink-0">
                          💳 Kartu Kredit
                        </span>
                      ) : (
                        <span className="bg-slate-800 text-slate-400 text-[10px] px-2.5 py-0.5 rounded-full border border-slate-700/60 font-semibold tracking-wide whitespace-nowrap shrink-0">
                          💵 Cash
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`font-mono font-black text-sm block ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isIncome ? '+' : '-'}{formatRupiah(item.amount)}
                    </span>
                    <span className="text-[9px] text-slate-500 mt-0.5 block font-bold uppercase tracking-wider">Detail • Edit</span>
                  </div>
                </div>
              );
            })}
          
          {incomeTransactions.length === 0 && expenses.length === 0 && (
            <p className="text-center py-6 text-slate-500 italic text-xs">
              Belum ada data transaksi finansial terdaftar.
            </p>
          )}
        </div>
      </div>

      {/* MODAL: Rincian / Detail Transaksi (Mobile & Desktop) */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-800 animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-slate-200 text-base">Rincian Transaksi</h3>
              <button 
                onClick={() => setSelectedTransaction(null)}
                className="text-slate-400 hover:text-slate-200 p-1 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs font-semibold">
              <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-850 text-center space-y-1">
                <span className="text-[10px] text-slate-500 font-mono block">{selectedTransaction.date} {selectedTransaction.time && `• ${selectedTransaction.time}`}</span>
                <p className="text-slate-100 font-extrabold text-sm">{selectedTransaction.type === 'income' ? selectedTransaction.source : selectedTransaction.title}</p>
                <span className={`font-mono font-black text-lg block ${selectedTransaction.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {selectedTransaction.type === 'income' ? '+' : '-'}{formatRupiah(selectedTransaction.amount)}
                </span>
              </div>

              <div className="space-y-2 border-t border-slate-800/60 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Kategori</span>
                  <span className="text-slate-200 font-extrabold">{selectedTransaction.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Tipe Aliran</span>
                  <span className={`font-extrabold ${selectedTransaction.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {selectedTransaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                  </span>
                </div>
                {selectedTransaction.type !== 'income' && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">Metode Pembayaran</span>
                    <span className="text-slate-200 font-extrabold">
                      {selectedTransaction.paymentMethod === 'cash' ? '💵 Cash' : 
                       selectedTransaction.paymentMethod === 'savings' ? '🐷 Tabungan' : '💳 Kartu Kredit'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex gap-3">
              <button
                onClick={() => {
                  const t = selectedTransaction;
                  setSelectedTransaction(null);
                  if (t.type === 'income') {
                    setEditingIncome(t);
                    setEditIncomeSource(t.source);
                    setEditIncomeCategory(t.category);
                    setEditIncomeAmount(t.amount.toString());
                    setEditIncomeDate(t.date);
                  } else {
                    setEditingExpense(t);
                    setEditExpenseTitle(t.title);
                    setEditExpenseCategory(t.category);
                    setEditExpenseAmount(t.amount.toString());
                    setEditExpenseDate(t.date);
                    setEditExpenseTime(t.time || '12:00');
                    setEditExpensePayment(t.paymentMethod);
                    setEditExpenseSavingsId(t.savingsGoalId || '');
                    setEditExpenseCardId(t.creditCardId || '');
                  }
                }}
                className="flex-1 p-2.5 bg-sky-500 hover:bg-sky-600 text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
              >
                Ubah / Edit
              </button>
              <button
                onClick={() => {
                  const t = selectedTransaction;
                  setSelectedTransaction(null);
                  setTransactionToDelete(t);
                }}
                className="p-2.5 bg-rose-500/10 hover:bg-rose-500 hover:text-slate-950 text-rose-400 rounded-xl text-xs font-bold transition-all cursor-pointer px-4"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Edit Pemasukan (Income) */}
      {editingIncome && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-slate-200 text-base flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-emerald-400" /> Edit Pemasukan
              </h3>
              <button onClick={() => setEditingIncome(null)} className="text-slate-400 hover:text-slate-200 p-1 bg-slate-800 rounded-xl cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (onUpdateIncome && editingIncome) {
                onUpdateIncome({
                  ...editingIncome,
                  source: editIncomeSource,
                  category: editIncomeCategory,
                  amount: Number(editIncomeAmount),
                  date: editIncomeDate
                });
                setEditingIncome(null);
              }
            }} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-slate-400 block font-bold">Sumber Pemasukan</label>
                <input
                  type="text" required
                  className="w-full p-2.5 bg-slate-800 rounded-xl border border-slate-700 focus:border-emerald-500 outline-none text-slate-200"
                  value={editIncomeSource} onChange={(e) => setEditIncomeSource(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 block font-bold">Kategori</label>
                <select
                  className="w-full p-2.5 bg-slate-800 rounded-xl border border-slate-700 focus:border-emerald-500 outline-none text-slate-200 cursor-pointer"
                  value={editIncomeCategory} onChange={(e) => setEditIncomeCategory(e.target.value)}
                >
                  <option value="Gaji Pokok">Gaji Pokok</option>
                  <option value="Freelance">Proyek Freelance</option>
                  <option value="Bonus & Komisi">Bonus & Komisi</option>
                  <option value="Investasi">Dividen Investasi</option>
                  <option value="Hadiah & Lainnya">Hadiah & Lainnya</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 block font-bold">Jumlah (IDR)</label>
                <input
                  type="number" required
                  className="w-full p-2.5 bg-slate-800 rounded-xl border border-slate-700 focus:border-emerald-500 outline-none text-slate-200 font-mono font-bold"
                  value={editIncomeAmount} onChange={(e) => setEditIncomeAmount(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 block font-bold">Tanggal</label>
                <input
                  type="date" required
                  className="w-full p-2.5 bg-slate-800 rounded-xl border border-slate-700 focus:border-emerald-500 outline-none text-slate-200"
                  value={editIncomeDate} onChange={(e) => setEditIncomeDate(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full p-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-black transition-all cursor-pointer shadow-lg shadow-emerald-500/10 mt-2"
              >
                Simpan Perubahan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Pengeluaran (Expense) */}
      {editingExpense && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-slate-200 text-base flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-rose-400" /> Edit Pengeluaran
              </h3>
              <button onClick={() => setEditingExpense(null)} className="text-slate-400 hover:text-slate-200 p-1 bg-slate-800 rounded-xl cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (onUpdateExpense && editingExpense) {
                onUpdateExpense({
                  ...editingExpense,
                  title: editExpenseTitle,
                  category: editExpenseCategory,
                  amount: Number(editExpenseAmount),
                  date: editExpenseDate,
                  time: editExpenseTime,
                  paymentMethod: editExpensePayment,
                  savingsGoalId: editExpensePayment === 'savings' ? editExpenseSavingsId : undefined,
                  creditCardId: editExpensePayment === 'credit_card' ? editExpenseCardId : undefined
                });
                setEditingExpense(null);
              }
            }} className="space-y-3.5 text-xs font-semibold max-h-[80vh] overflow-y-auto pr-1">
              <div className="space-y-1">
                <label className="text-slate-400 block font-bold">Judul / Keperluan</label>
                <input
                  type="text" required
                  className="w-full p-2.5 bg-slate-800 rounded-xl border border-slate-700 focus:border-rose-500 outline-none text-slate-200"
                  value={editExpenseTitle} onChange={(e) => setEditExpenseTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 block font-bold">Kategori</label>
                <select
                  className="w-full p-2.5 bg-slate-800 rounded-xl border border-slate-700 focus:border-rose-500 outline-none text-slate-200 cursor-pointer"
                  value={editExpenseCategory} onChange={(e) => setEditExpenseCategory(e.target.value)}
                >
                  <option value="Makanan & Minuman">Makanan & Minuman</option>
                  <option value="Transportasi">Transportasi</option>
                  <option value="Belanja & Gaya Hidup">Belanja & Gaya Hidup</option>
                  <option value="Tagihan & Utilitas">Tagihan & Utilitas</option>
                  <option value="Kesehatan">Kesehatan</option>
                  <option value="Edukasi & Hiburan">Edukasi & Hiburan</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-400 block font-bold">Tanggal</label>
                  <input
                    type="date" required
                    className="w-full p-2 bg-slate-800 rounded-xl border border-slate-700 focus:border-rose-500 outline-none text-slate-200"
                    value={editExpenseDate} onChange={(e) => setEditExpenseDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 block font-bold">Waktu</label>
                  <input
                    type="time" required
                    className="w-full p-2 bg-slate-800 rounded-xl border border-slate-700 focus:border-rose-500 outline-none text-slate-200"
                    value={editExpenseTime} onChange={(e) => setEditExpenseTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 block font-bold">Jumlah Pengeluaran (IDR)</label>
                <input
                  type="number" required
                  className="w-full p-2.5 bg-slate-800 rounded-xl border border-slate-700 focus:border-rose-500 outline-none text-slate-200 font-mono font-bold"
                  value={editExpenseAmount} onChange={(e) => setEditExpenseAmount(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 block font-bold">Metode Pembayaran</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['cash', 'savings', 'credit_card'] as const).map((method) => (
                    <button
                      key={method} type="button"
                      onClick={() => setEditExpensePayment(method)}
                      className={`p-2 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
                        editExpensePayment === method 
                          ? 'bg-rose-500/10 border-rose-500 text-rose-400' 
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {method === 'cash' ? '💵 Cash' : method === 'savings' ? '🐷 Tabungan' : '💳 Kartu'}
                    </button>
                  ))}
                </div>
              </div>

              {editExpensePayment === 'savings' && (
                <div className="space-y-1">
                  <label className="text-slate-400 block font-bold">Hubungkan ke Tabungan</label>
                  <select
                    className="w-full p-2.5 bg-slate-800 rounded-xl border border-slate-700 focus:border-rose-500 outline-none text-slate-200 cursor-pointer"
                    value={editExpenseSavingsId} onChange={(e) => setEditExpenseSavingsId(e.target.value)}
                  >
                    <option value="">-- Pilih Pos Tabungan --</option>
                    {savingsGoals.map(g => (
                      <option key={g.id} value={g.id}>{g.name} ({formatRupiah(g.saved)})</option>
                    ))}
                  </select>
                </div>
              )}

              {editExpensePayment === 'credit_card' && (
                <div className="space-y-1">
                  <label className="text-slate-400 block font-bold">Hubungkan ke Kartu Kredit</label>
                  <select
                    className="w-full p-2.5 bg-slate-800 rounded-xl border border-slate-700 focus:border-rose-500 outline-none text-slate-200 cursor-pointer"
                    value={editExpenseCardId} onChange={(e) => setEditExpenseCardId(e.target.value)}
                  >
                    <option value="">-- Pilih Kartu Kredit --</option>
                    {creditCards.map(c => (
                      <option key={c.id} value={c.id}>{c.cardName} (Limit: {formatRupiah(c.limit)})</option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="w-full p-3 bg-rose-500 hover:bg-rose-600 text-slate-950 rounded-xl text-xs font-black transition-all cursor-pointer shadow-lg shadow-rose-500/10 mt-2"
              >
                Simpan Perubahan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Konfirmasi Hapus Transaksi (Dua Langkah) */}
      {transactionToDelete && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-800 animate-in zoom-in-95 duration-200 text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-slate-200 text-base">Hapus Transaksi Finansial?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Apakah Anda benar-benar yakin ingin menghapus transaksi <span className="text-white font-bold">{transactionToDelete.type === 'income' ? transactionToDelete.source : transactionToDelete.title}</span>? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => {
                  if (transactionToDelete.type === 'income' && onDeleteIncome) {
                    onDeleteIncome(transactionToDelete.id);
                  } else if (transactionToDelete.type === 'expense' && onDeleteExpense) {
                    onDeleteExpense(transactionToDelete.id);
                  }
                  setTransactionToDelete(null);
                }}
                className="flex-1 p-2.5 bg-rose-500 hover:bg-rose-600 text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Ya, Hapus Permanen
              </button>
              <button
                onClick={() => setTransactionToDelete(null)}
                className="flex-1 p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Batalkan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
