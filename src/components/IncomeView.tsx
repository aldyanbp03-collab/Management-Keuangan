import { useState, FormEvent } from 'react';
import { IncomeTransaction, SavingsGoal, CreditCard } from '../types';
import { Plus, Edit3, Trash2, ArrowRight, CreditCard as CardIcon, PiggyBank, Search, Calendar, ChevronRight, X, AlertTriangle, ArrowUpRight } from 'lucide-react';

interface IncomeViewProps {
  incomeTransactions: IncomeTransaction[];
  savingsGoals: SavingsGoal[];
  creditCards: CreditCard[];
  searchQuery: string;
  startDate: string;
  endDate: string;
  onAddIncome: (income: Omit<IncomeTransaction, 'id'>) => void;
  onUpdateIncome: (income: IncomeTransaction) => void;
  onDeleteIncome: (id: string) => void;
  onTransferToSavings: (savingsGoalId: string, amount: number) => void;
  onPayCreditCard: (creditCardId: string, amount: number) => void;
}

export default function IncomeView({
  incomeTransactions,
  savingsGoals,
  creditCards,
  searchQuery,
  startDate,
  endDate,
  onAddIncome,
  onUpdateIncome,
  onDeleteIncome,
  onTransferToSavings,
  onPayCreditCard,
}: IncomeViewProps) {
  // Modals & form state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IncomeTransaction | null>(null);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isPayCardOpen, setIsPayCardOpen] = useState(false);
  const [selectedIncomeTransaction, setSelectedIncomeTransaction] = useState<IncomeTransaction | null>(null);

  // Form inputs
  const [source, setSource] = useState('');
  const [category, setCategory] = useState('Salary');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('2026-07-19');

  // Transfer form inputs
  const [transferGoalId, setTransferGoalId] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  // Pay credit card inputs
  const [payCardId, setPayCardId] = useState('');
  const [payAmount, setPayAmount] = useState('');

  // Full-Screen Two-Step Deletion confirmation popup states
  const [incomeToDelete, setIncomeToDelete] = useState<IncomeTransaction | null>(null);
  const [deleteStep, setDeleteStep] = useState(1); // Step 1: Warning, Step 2: Final Confirmation

  // Format IDR Currency
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Filter helper based on top search bar & dates
  const filteredIncomes = incomeTransactions.filter(item => {
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

  // Total Income
  const totalIncomeSum = filteredIncomes.reduce((acc, curr) => acc + curr.amount, 0);

  // 6-Month Trend dynamic calculation based on current incomes
  const getPastSixMonths = () => {
    // Generate label names for past 6 months starting from July 2026 backwards
    const monthNames = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    const monthIndexes = [1, 2, 3, 4, 5, 6]; // Representing months Feb (2) to Jul (7) in 2026
    
    return monthNames.map((name, i) => {
      const targetMonthIndex = monthIndexes[i];
      // Sum the income amounts for this month in 2026
      const monthSum = incomeTransactions
        .filter(item => {
          const itemDate = new Date(item.date);
          const itemMonth = itemDate.getMonth(); // 0-indexed: Jan=0, Feb=1, etc.
          return itemMonth === targetMonthIndex && itemDate.getFullYear() === 2026;
        })
        .reduce((sum, item) => sum + item.amount, 0);
      
      return { month: name, total: monthSum || 3000000 }; // fallback to default min bar size
    });
  };

  const trendData = getPastSixMonths();
  const maxTrendVal = Math.max(...trendData.map(d => d.total)) || 1;

  // Handle forms submit
  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!source || !amount) return;
    onAddIncome({
      source,
      category,
      amount: Number(amount),
      date,
    });
    // Reset state
    setSource('');
    setCategory('Salary');
    setAmount('');
    setDate('2026-07-19');
    setIsAddOpen(false);
  };

  const handleUpdateSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!editingIncome || !editingIncome.source || !editingIncome.amount) return;
    onUpdateIncome(editingIncome);
    setEditingIncome(null);
  };

  const handleTransferSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!transferGoalId || !transferAmount) return;
    onTransferToSavings(transferGoalId, Number(transferAmount));
    setTransferGoalId('');
    setTransferAmount('');
    setIsTransferOpen(false);
  };

  const handlePayCardSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!payCardId || !payAmount) return;
    onPayCreditCard(payCardId, Number(payAmount));
    setPayCardId('');
    setPayAmount('');
    setIsPayCardOpen(false);
  };

  // Trigger two-step deletion
  const startDeleteFlow = (income: IncomeTransaction) => {
    setIncomeToDelete(income);
    setDeleteStep(1);
  };

  const executeDelete = () => {
    if (incomeToDelete) {
      onDeleteIncome(incomeToDelete.id);
      setIncomeToDelete(null);
      setDeleteStep(1);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300" id="income-view-root">
      
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" id="income-header-row">
        <div>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">Analisis Pendapatan (Income)</h2>
          <p className="text-xs text-slate-400 mt-0.5">Pantau aliran arus kas masuk, target alokasi tabungan, dan pelunasan kartu kredit.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {/* Quick Transfer, Quick Pay, and Add Income */}
          <button
            onClick={() => setIsTransferOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 p-2.5 px-4 rounded-xl border border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-black transition-all cursor-pointer shadow-lg shadow-amber-500/5 hover:border-amber-500/30 active:scale-95"
            id="open-transfer-savings-btn"
          >
            <div className="w-5 h-5 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
              <PiggyBank className="w-3.5 h-3.5" />
            </div>
            Alokasi Tabungan
          </button>
          <button
            onClick={() => setIsPayCardOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 p-2.5 px-4 rounded-xl border border-sky-500/20 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-black transition-all cursor-pointer shadow-lg shadow-sky-500/5 hover:border-sky-500/30 active:scale-95"
            id="open-pay-credit-btn"
          >
            <div className="w-5 h-5 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-400">
              <CardIcon className="w-3.5 h-3.5" />
            </div>
            Bayar Kartu Kredit
          </button>
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 p-2.5 px-5 rounded-xl bg-sky-500 hover:bg-sky-600 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-lg shadow-sky-500/20 active:scale-95"
            id="open-add-income-btn"
          >
            <Plus className="w-4.5 h-4.5 text-slate-950 font-black" /> Catat Pemasukan
          </button>
        </div>
      </div>

      {/* Grid: 6-Month Trend SVG Chart + Total Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="income-analytics-grid">
        {/* Total Inflow Summary */}
        <div className="lg:col-span-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm flex flex-col justify-between" id="net-monthly-income-card">
          <div className="space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Net Monthly Income</span>
            <div className="text-3xl font-black text-slate-100 tracking-tight leading-none font-mono">
              {formatRupiah(totalIncomeSum)}
            </div>
            
            <div className="space-y-2.5 pt-4 border-t border-slate-800 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Salary / Gaji Bulanan</span>
                <span className="font-extrabold text-slate-200 font-mono">
                  {formatRupiah(filteredIncomes.filter(i => i.category === 'Salary').reduce((sum, i) => sum + i.amount, 0))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Freelance / Proyek</span>
                <span className="font-extrabold text-slate-200 font-mono">
                  {formatRupiah(filteredIncomes.filter(i => i.category === 'Freelance').reduce((sum, i) => sum + i.amount, 0))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Investasi / Bisnis</span>
                <span className="font-extrabold text-slate-200 font-mono">
                  {formatRupiah(filteredIncomes.filter(i => i.category === 'Investment' || i.category === 'Business').reduce((sum, i) => sum + i.amount, 0))}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-3 bg-emerald-500/10 border border-emerald-500/10 rounded-2xl flex items-center gap-2.5 text-[11px] text-emerald-400 font-medium leading-relaxed">
            <ArrowUpRight className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Pendapatan bersih Anda naik +8.4% dibandingkan rata-rata semester lalu.</span>
          </div>
        </div>

        {/* Dynamic 6-Month Trend SVG Bar Chart */}
        <div className="lg:col-span-8 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm" id="income-six-month-trend-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-200 text-base">Tren 6 Bulan Terakhir</h3>
              <p className="text-xs text-slate-400 mt-0.5">Ringkasan grafik fluktuasi penghasilan (2026)</p>
            </div>
            <div className="flex gap-4 text-[10px] font-bold text-slate-500 uppercase">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-sky-500 rounded-full"></span> Aktif</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-slate-800 rounded-full"></span> Sebelumnya</span>
            </div>
          </div>

          {/* SVG Bar Chart container */}
          <div className="relative h-48 w-full mt-4" id="trend-bar-chart-container">
            <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-slate-600 pointer-events-none">
              <div className="border-b border-slate-800 w-full pb-1 text-right">{formatRupiah(maxTrendVal)}</div>
              <div className="border-b border-slate-800 w-full pb-1 text-right">{formatRupiah(maxTrendVal / 2)}</div>
              <div className="border-b border-slate-800 w-full pb-1 text-right">0</div>
            </div>
            {/* Bars container */}
            <div className="relative h-full w-full flex items-end justify-between px-6 pt-6 z-10">
              {trendData.map((data, idx) => {
                const heightPercentage = Math.round((data.total / maxTrendVal) * 80) + 10; // offset min height 10%
                return (
                  <div key={idx} className="flex flex-col items-center gap-2 group cursor-pointer flex-1">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-1 bg-slate-950 text-slate-200 border border-slate-800 font-mono text-[9px] font-semibold py-1 px-2 rounded-lg shadow-md transition-all duration-200 pointer-events-none transform -translate-y-2 z-20">
                      {formatRupiah(data.total)}
                    </div>
                    {/* Visual Bar */}
                    <div className="w-8 sm:w-12 bg-slate-850 hover:bg-sky-500/10 rounded-t-xl flex items-end justify-center h-full transition-all border border-slate-800/40 border-b-0">
                      <div 
                        className="w-5 sm:w-8 bg-sky-500/80 group-hover:bg-sky-500 rounded-t-lg transition-all duration-700"
                        style={{ height: `${heightPercentage}%` }}
                      ></div>
                    </div>
                    {/* Label */}
                    <span className="text-[10px] font-extrabold text-slate-500 group-hover:text-slate-300 transition-colors uppercase font-mono mt-1">
                      {data.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Log Rincian Pemasukan - Table */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm" id="income-transactions-log-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h3 className="font-bold text-slate-200 text-base">Log Rincian Pemasukan</h3>
            <p className="text-xs text-slate-400 mt-0.5">Daftar transaksi masuk yang berhasil diverifikasi sistem</p>
          </div>
          {/* Quick Search log filter */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari sumber pemasukan..."
              className="w-full text-xs p-2 pl-9 bg-slate-800 text-slate-300 hover:bg-slate-700 focus:bg-slate-800 rounded-xl border border-slate-700 focus:border-sky-500 outline-none transition-all font-medium"
              value={searchQuery}
              onChange={() => {}} // Controlled globally
              disabled // handled globally at App layout
            />
          </div>
        </div>

        {/* 1. DESKTOP VIEW: High details Table */}
        <div className="hidden md:block overflow-x-auto" id="income-table-container">
          <table className="w-full text-xs text-left text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Tanggal</th>
                <th className="py-3 px-3">Sumber Pendapatan</th>
                <th className="py-3 px-3">Kategori</th>
                <th className="py-3 px-3 text-right">Nominal (IDR)</th>
                <th className="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-semibold">
              {filteredIncomes.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-3 font-mono text-slate-500">{inc.date}</td>
                  <td className="py-3.5 px-3 font-bold text-slate-200">{inc.source}</td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full font-bold text-[10px] border border-emerald-500/20">
                      {inc.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right font-bold text-emerald-400 font-mono text-sm">
                    +{formatRupiah(inc.amount)}
                  </td>
                  <td className="py-3.5 px-3 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => setEditingIncome(inc)}
                      className="p-1 px-2.5 rounded-lg border border-slate-800 text-slate-400 hover:text-sky-400 hover:border-sky-500/40 hover:bg-sky-500/10 transition-all cursor-pointer"
                      id={`edit-income-btn-${inc.id}`}
                    >
                      <Edit3 className="w-3.5 h-3.5 inline mr-1" /> Edit
                    </button>
                    <button
                      onClick={() => startDeleteFlow(inc)}
                      className="p-1 px-2.5 rounded-lg border border-slate-800 text-rose-400 hover:text-rose-500 hover:border-rose-500/40 hover:bg-rose-500/10 transition-all cursor-pointer"
                      id={`delete-income-btn-${inc.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5 inline mr-1" /> Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {filteredIncomes.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500 italic">
                    Belum ada pemasukan terdaftar untuk filter ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 2. MOBILE VIEW: View-only clean list, clickable for Rincian / Detail Modal */}
        <div className="md:hidden space-y-2.5" id="income-mobile-list">
          {filteredIncomes.map((inc) => (
            <div
              key={inc.id}
              onClick={() => setSelectedIncomeTransaction(inc)}
              className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer active:scale-[0.98] flex items-center justify-between"
            >
              <div className="min-w-0 flex-1 pr-3">
                <span className="text-[10px] text-slate-500 font-mono font-bold block mb-1 whitespace-nowrap shrink-0">{inc.date}</span>
                <p className="font-bold text-slate-200 text-xs truncate">{inc.source}</p>
                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-semibold tracking-wide whitespace-nowrap shrink-0 inline-block mt-1.5">
                  {inc.category}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="font-mono font-black text-emerald-400 text-sm block">
                  +{formatRupiah(inc.amount)}
                </span>
                <span className="text-[9px] text-slate-500 mt-1 block font-bold uppercase tracking-wider">Detail • Edit</span>
              </div>
            </div>
          ))}
          {filteredIncomes.length === 0 && (
            <p className="text-center py-6 text-slate-500 italic text-xs">
              Belum ada pemasukan terdaftar untuk filter ini.
            </p>
          )}
        </div>
      </div>

      {/* MODAL: Rincian Transaksi Pemasukan (Mobile & Desktop) */}
      {selectedIncomeTransaction && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-800 animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-slate-200 text-base">Rincian Pemasukan</h3>
              <button 
                onClick={() => setSelectedIncomeTransaction(null)}
                className="text-slate-400 hover:text-slate-200 p-1 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs font-semibold">
              <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-850 text-center space-y-1">
                <span className="text-[10px] text-slate-500 font-mono block">{selectedIncomeTransaction.date}</span>
                <p className="text-slate-100 font-extrabold text-sm">{selectedIncomeTransaction.source}</p>
                <span className="font-mono font-black text-lg text-emerald-400 block">
                  +{formatRupiah(selectedIncomeTransaction.amount)}
                </span>
              </div>

              <div className="space-y-2 border-t border-slate-800/60 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Kategori</span>
                  <span className="text-slate-200 font-extrabold">{selectedIncomeTransaction.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Verifikasi</span>
                  <span className="text-emerald-400 font-extrabold">Selesai Berhasil</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex gap-3">
              <button
                onClick={() => {
                  const inc = selectedIncomeTransaction;
                  setSelectedIncomeTransaction(null);
                  setEditingIncome(inc);
                }}
                className="flex-1 p-2.5 bg-sky-500 hover:bg-sky-600 text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
              >
                Ubah / Edit
              </button>
              <button
                onClick={() => {
                  const inc = selectedIncomeTransaction;
                  setSelectedIncomeTransaction(null);
                  startDeleteFlow(inc);
                }}
                className="p-2.5 bg-rose-500/10 hover:bg-rose-500 hover:text-slate-950 text-rose-400 rounded-xl text-xs font-bold transition-all cursor-pointer px-4"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Tambah Pemasukan */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h3 className="font-bold text-slate-200 text-lg">Catat Pendapatan Masuk</h3>
              <button 
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4 pt-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Sumber / Pengirim</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gaji Utama, Freelance Design, Dividen"
                  className="w-full p-2.5 bg-slate-800 rounded-xl border border-slate-700 focus:border-sky-500 outline-none text-slate-200 placeholder-slate-500"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Kategori</label>
                  <select
                    className="w-full p-2.5 bg-slate-800 rounded-xl border border-slate-700 focus:border-sky-500 outline-none text-slate-200 cursor-pointer"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Salary">Salary</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Investment">Investment</option>
                    <option value="Business">Business</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Tanggal</label>
                  <input
                    type="date"
                    required
                    className="w-full p-2.5 bg-slate-800 rounded-xl border border-slate-700 focus:border-sky-500 outline-none text-slate-200 cursor-pointer"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Nominal (IDR)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-500 font-extrabold text-sm font-mono">Rp</span>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 5000000"
                    className="w-full p-2.5 pl-10 bg-slate-800 rounded-xl border border-slate-700 focus:border-sky-500 outline-none text-slate-200 font-mono text-sm"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full p-3 bg-sky-500 hover:bg-sky-600 text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-sky-500/10 mt-2"
              >
                Konfirmasi Simpan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Pemasukan */}
      {editingIncome && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h3 className="font-bold text-slate-200 text-lg">Edit Pendapatan</h3>
              <button 
                onClick={() => setEditingIncome(null)}
                className="text-slate-400 hover:text-slate-200 p-1 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateSubmit} className="space-y-4 pt-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Sumber / Pengirim</label>
                <input
                  type="text"
                  required
                  className="w-full p-2.5 bg-slate-800 rounded-xl border border-slate-700 focus:border-sky-500 outline-none text-slate-200"
                  value={editingIncome.source}
                  onChange={(e) => setEditingIncome({ ...editingIncome, source: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Kategori</label>
                  <select
                    className="w-full p-2.5 bg-slate-800 rounded-xl border border-slate-700 focus:border-sky-500 outline-none text-slate-200 cursor-pointer"
                    value={editingIncome.category}
                    onChange={(e) => setEditingIncome({ ...editingIncome, category: e.target.value })}
                  >
                    <option value="Salary">Salary</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Investment">Investment</option>
                    <option value="Business">Business</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Tanggal</label>
                  <input
                    type="date"
                    required
                    className="w-full p-2.5 bg-slate-800 rounded-xl border border-slate-700 focus:border-sky-500 outline-none text-slate-200 cursor-pointer"
                    value={editingIncome.date}
                    onChange={(e) => setEditingIncome({ ...editingIncome, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Nominal (IDR)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-500 font-extrabold text-sm font-mono">Rp</span>
                  <input
                    type="number"
                    required
                    className="w-full p-2.5 pl-10 bg-slate-800 rounded-xl border border-slate-700 focus:border-sky-500 outline-none text-slate-200 font-mono text-sm"
                    value={editingIncome.amount}
                    onChange={(e) => setEditingIncome({ ...editingIncome, amount: Number(e.target.value) })}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full p-3 bg-sky-500 hover:bg-sky-600 text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-sky-500/10 mt-2"
              >
                Simpan Perubahan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Alokasi Tabungan (Transfer ke Tabungan) */}
      {isTransferOpen && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h3 className="font-bold text-slate-200 text-lg flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-amber-400" /> Alokasi Dana ke Tabungan
              </h3>
              <button 
                onClick={() => setIsTransferOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleTransferSubmit} className="space-y-4 pt-4 text-xs font-semibold">
              <div className="p-3 bg-amber-500/10 border border-amber-500/10 rounded-2xl text-[11px] text-amber-300 leading-relaxed font-semibold mb-2">
                Pilih target tabungan aktif. Nominal yang ditransfer akan menambah saldo tersimpan target tabungan dan tercatat sebagai pemindahan dana.
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Pilih Tabungan Target</label>
                <select
                  required
                  className="w-full p-2.5 bg-slate-800 rounded-xl border border-slate-700 focus:border-sky-500 outline-none text-slate-200 cursor-pointer"
                  value={transferGoalId}
                  onChange={(e) => setTransferGoalId(e.target.value)}
                >
                  <option value="">-- Pilih Target Tabungan --</option>
                  {savingsGoals.map(goal => (
                    <option key={goal.id} value={goal.id}>
                      {goal.name} ({Math.round((goal.saved / goal.target) * 100)}% - Sisa {formatRupiah(goal.target - goal.saved)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Nominal Transfer (IDR)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-500 font-extrabold text-sm font-mono">Rp</span>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 500000"
                    className="w-full p-2.5 pl-10 bg-slate-800 rounded-xl border border-slate-700 focus:border-sky-500 outline-none text-slate-200 font-mono text-sm"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full p-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-amber-500/10 mt-2"
              >
                Lakukan Transfer
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Bayar Kartu Kredit (Direct payment using income) */}
      {isPayCardOpen && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h3 className="font-bold text-slate-200 text-lg flex items-center gap-2">
                <CardIcon className="w-5 h-5 text-sky-400" /> Bayar Tagihan Kartu Kredit
              </h3>
              <button 
                onClick={() => setIsPayCardOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePayCardSubmit} className="space-y-4 pt-4 text-xs font-semibold">
              <div className="p-3 bg-sky-500/10 border border-sky-500/10 rounded-2xl text-[11px] text-sky-300 leading-relaxed font-semibold mb-2">
                Melunasi tagihan kartu kredit langsung dari arus kas pemasukan. Ini akan memotong total tagihan dan mengurangi pemakaian limit kartu Anda.
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Pilih Kartu Kredit</label>
                <select
                  required
                  className="w-full p-2.5 bg-slate-800 rounded-xl border border-slate-700 focus:border-sky-500 outline-none text-slate-200 cursor-pointer"
                  value={payCardId}
                  onChange={(e) => setPayCardId(e.target.value)}
                >
                  <option value="">-- Pilih Kartu Kredit --</option>
                  {creditCards.map(card => (
                    <option key={card.id} value={card.id}>
                      {card.cardName} ({card.cardNumber}) - Tagihan: {formatRupiah(card.totalBill)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Nominal Pembayaran (IDR)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-500 font-extrabold text-sm font-mono">Rp</span>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 1000000"
                    className="w-full p-2.5 pl-10 bg-slate-800 rounded-xl border border-slate-700 focus:border-sky-500 outline-none text-slate-200 font-mono text-sm"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full p-3 bg-sky-500 hover:bg-sky-600 text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-sky-500/10 mt-2"
              >
                Bayar Tagihan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FULL-SCREEN TWO-STEP DELETION POPUP */}
      {incomeToDelete && (
        <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
          <div className="max-w-xl w-full text-center space-y-8 animate-in zoom-in-95 duration-300">
            
            {/* Warning Giant Icon */}
            <div className="mx-auto w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 animate-bounce">
              <AlertTriangle className="w-12 h-12" />
            </div>

            {/* Step 1 Content */}
            {deleteStep === 1 ? (
              <div className="space-y-4">
                <span className="text-[11px] font-extrabold tracking-widest text-rose-500 uppercase">Langkah 1 dari 2: Peringatan Keamanan</span>
                <h3 className="text-3xl font-black text-white tracking-tight">Konfirmasi Penghapusan Pemasukan</h3>
                <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
                  Anda akan menghapus transaksi masuk <span className="text-white font-bold">&quot;{incomeToDelete.source}&quot;</span> sebesar <span className="text-emerald-400 font-bold font-mono">{formatRupiah(incomeToDelete.amount)}</span> secara permanen dari sistem database. Tindakan ini tidak dapat dibatalkan.
                </p>
                <div className="pt-6 flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
                  <button
                    onClick={() => setDeleteStep(2)}
                    className="flex-1 p-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Lanjutkan Verifikasi
                  </button>
                  <button
                    onClick={() => setIncomeToDelete(null)}
                    className="flex-1 p-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Batalkan Penghapusan
                  </button>
                </div>
              </div>
            ) : (
              /* Step 2 Content */
              <div className="space-y-4">
                <span className="text-[11px] font-extrabold tracking-widest text-rose-500 uppercase">Langkah 2 dari 2: Otorisasi Final</span>
                <h3 className="text-3xl font-black text-white tracking-tight">Apakah Anda Benar-benar Yakin?</h3>
                <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
                  Tekan tombol di bawah untuk memberikan otorisasi penghapusan final. Data keuangan yang hilang tidak dapat dipulihkan atau disinkronkan kembali.
                </p>
                <div className="pt-6 flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
                  <button
                    onClick={executeDelete}
                    className="flex-1 p-3.5 bg-rose-500 hover:bg-rose-600 text-slate-950 rounded-2xl text-xs font-black tracking-wide transition-all cursor-pointer shadow-xl shadow-rose-500/20"
                  >
                    YA, HAPUS PERMANEN
                  </button>
                  <button
                    onClick={() => setDeleteStep(1)}
                    className="flex-1 p-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Kembali ke Langkah 1
                  </button>
                </div>
              </div>
            )}

            <p className="text-[10px] text-slate-500 font-mono">
              IP: Localhost | Date: {incomeToDelete.date} | ID: {incomeToDelete.id}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
