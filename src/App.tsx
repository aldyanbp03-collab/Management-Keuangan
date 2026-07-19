import { useState, useEffect } from 'react';
import { User, IncomeTransaction, SavingsGoal, ExpenseTransaction, CreditCard } from './types';
import { DEFAULT_USERS, DEFAULT_FINANCIALS, UserFinancialState } from './data';
import UserSwitcher from './components/UserSwitcher';
import DashboardView from './components/DashboardView';
import IncomeView from './components/IncomeView';
import SavingsView from './components/SavingsView';
import ExpensesView from './components/ExpensesView';
import CreditCardsView from './components/CreditCardsView';
import { LayoutDashboard, Wallet, PiggyBank, TrendingUp, CreditCard as CardIcon, Bell, Calendar, Search, HelpCircle, UserCheck, RefreshCw, X, Trash2, AlertTriangle } from 'lucide-react';

export default function App() {
  // Dynamic list of user accounts
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('all_users_list');
    if (saved) {
      return JSON.parse(saved);
    }
    return DEFAULT_USERS;
  });

  // Account/User switcher state
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('current_user_id');
    const savedUsers = localStorage.getItem('all_users_list');
    const users = savedUsers ? JSON.parse(savedUsers) : DEFAULT_USERS;
    const matched = users.find((u: User) => u.id === saved);
    return matched || users[0];
  });

  // Navigation tab state
  const [activeTab, setActiveTab] = useState('dashboard');

  // Top Search & Period filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [datePreset, setDatePreset] = useState('Semua');

  // Master Financial State for the selected user
  const [financials, setFinancials] = useState<UserFinancialState>(() => {
    const savedUser = localStorage.getItem('current_user_id');
    const savedUsers = localStorage.getItem('all_users_list');
    const users = savedUsers ? JSON.parse(savedUsers) : DEFAULT_USERS;
    const matched = users.find((u: User) => u.id === savedUser);
    const initialUser = matched || users[0];
    const saved = localStorage.getItem(`financial_state_${initialUser.id}`);
    if (saved) {
      return JSON.parse(saved);
    }
    return DEFAULT_FINANCIALS[initialUser.id] || { incomeTransactions: [], savingsGoals: [], expenses: [], creditCards: [] };
  });

  // Notification states
  const [notifications, setNotifications] = useState<Array<{ id: string; text: string; date: string; details?: string }>>([
    { 
      id: 'not_1', 
      text: 'Peringatan: Pemakaian limit kartu Utama Platinum mendekati batas!', 
      date: '2026-07-19 14:00',
      details: 'Pemakaian kartu Utama Platinum Anda telah mencapai Rp 42.500.000 dari total limit Rp 50.000.000 (85%). Disarankan untuk membatasi transaksi besar baru atau segera mencicil tagihan kartu.'
    },
    { 
      id: 'not_2', 
      text: 'Transfer Sukses: Dana sebesar Rp 500,000 dialokasikan ke Tokyo Vacation.', 
      date: '2026-07-18 10:30',
      details: 'Alokasi dana ke tabungan impian Tokyo Vacation berhasil dilakukan. Saldo terkumpul saat ini adalah Rp 6.500.000 (33% dari target Rp 20.000.000).'
    },
    { 
      id: 'not_3', 
      text: 'Target Tercapai: Selamat! Tabungan Nikah Anda mencapai 24% dari target.', 
      date: '2026-07-17 09:15',
      details: 'Progres menabung Anda sangat luar biasa! Tabungan Nikah Anda sekarang memiliki saldo tersimpan sebesar Rp 24.000.000 dari target Rp 100.000.000.'
    },
    { 
      id: 'not_4', 
      text: 'Pemasukan Baru: Freelance UI/UX sebesar Rp 3,200,000 berhasil diverifikasi.', 
      date: '2026-07-15 11:00',
      details: 'Transaksi masuk dari klien luar negeri telah diverifikasi oleh sistem kliring perbankan. Dana telah dimasukkan ke dalam arus kas bulanan Anda secara otomatis.'
    }
  ]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [activeNotifDetail, setActiveNotifDetail] = useState<{ id: string; text: string; date: string; details?: string } | null>(null);
  const [isLandscape, setIsLandscape] = useState(false);

  // Temporary states for date filter popup
  const [isDatePopupOpen, setIsDatePopupOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);
  const [tempPreset, setTempPreset] = useState(datePreset);

  useEffect(() => {
    if (isDatePopupOpen) {
      setTempStartDate(startDate);
      setTempEndDate(endDate);
      setTempPreset(datePreset);
    }
  }, [isDatePopupOpen, startDate, endDate, datePreset]);

  const handleTempPresetChange = (preset: string) => {
    setTempPreset(preset);
    const today = new Date('2026-07-19'); // anchor point
    
    if (preset === 'Semua') {
      setTempStartDate('');
      setTempEndDate('');
    } else if (preset === 'Hari Ini') {
      const todayStr = '2026-07-19';
      setTempStartDate(todayStr);
      setTempEndDate(todayStr);
    } else if (preset === 'Minggu Ini') {
      const start = new Date(today);
      start.setDate(today.getDate() - 7);
      setTempStartDate(start.toISOString().split('T')[0]);
      setTempEndDate('2026-07-19');
    } else if (preset === 'Bulan Ini') {
      setTempStartDate('2026-07-01');
      setTempEndDate('2026-07-31');
    } else if (preset === '6 Bulan Terakhir') {
      const start = new Date(today);
      start.setMonth(today.getMonth() - 6);
      setTempStartDate(start.toISOString().split('T')[0]);
      setTempEndDate('2026-07-19');
    }
  };

  const applyDateFilter = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setDatePreset(tempPreset);
    setIsDatePopupOpen(false);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight && window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Synchronize state when user changes
  useEffect(() => {
    localStorage.setItem('current_user_id', currentUser.id);
    const saved = localStorage.getItem(`financial_state_${currentUser.id}`);
    if (saved) {
      setFinancials(JSON.parse(saved));
    } else {
      // Seed default financials for this user
      const defaults = DEFAULT_FINANCIALS[currentUser.id] || DEFAULT_FINANCIALS['user_aldyan'] || { incomeTransactions: [], savingsGoals: [], expenses: [], creditCards: [] };
      setFinancials(defaults);
      localStorage.setItem(`financial_state_${currentUser.id}`, JSON.stringify(defaults));
    }
  }, [currentUser]);

  // Save all users to local storage
  const saveUsers = (updatedUsers: User[]) => {
    setAllUsers(updatedUsers);
    localStorage.setItem('all_users_list', JSON.stringify(updatedUsers));
  };

  const handleAddUser = (name: string, role: string) => {
    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      avatar: '',
      role
    };
    const updated = [...allUsers, newUser];
    saveUsers(updated);

    // Initialize default empty financials for new user
    const defaults: UserFinancialState = {
      incomeTransactions: [],
      savingsGoals: [],
      expenses: [],
      creditCards: []
    };
    localStorage.setItem(`financial_state_${newUser.id}`, JSON.stringify(defaults));
    
    // Switch to new user
    setCurrentUser(newUser);
  };

  const handleDeleteUser = (userId: string) => {
    if (allUsers.length <= 1) return;
    const updated = allUsers.filter(u => u.id !== userId);
    saveUsers(updated);

    // Clean up local storage data
    localStorage.removeItem(`financial_state_${userId}`);

    // If current active user was deleted, switch to first remaining
    if (currentUser.id === userId) {
      setCurrentUser(updated[0]);
    }
  };

  // Save financials to local storage whenever they change
  const saveFinancials = (updated: UserFinancialState) => {
    setFinancials(updated);
    localStorage.setItem(`financial_state_${currentUser.id}`, JSON.stringify(updated));
  };

  // Preset Date Filter Selector
  const handlePresetChange = (preset: string) => {
    setDatePreset(preset);
    const today = new Date('2026-07-19'); // anchor point
    
    if (preset === 'Semua') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'Hari Ini') {
      const todayStr = '2026-07-19';
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'Minggu Ini') {
      // Past 7 days
      const start = new Date(today);
      start.setDate(today.getDate() - 7);
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate('2026-07-19');
    } else if (preset === 'Bulan Ini') {
      // Current month July 2026
      setStartDate('2026-07-01');
      setEndDate('2026-07-31');
    } else if (preset === '6 Bulan Terakhir') {
      const start = new Date(today);
      start.setMonth(today.getMonth() - 6);
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate('2026-07-19');
    }
  };

  // Core Financial operations & Handlers

  // Income Handlers
  const handleAddIncome = (newInc: Omit<IncomeTransaction, 'id'>) => {
    const transaction: IncomeTransaction = {
      ...newInc,
      id: `inc_${Date.now()}`
    };
    const updated = {
      ...financials,
      incomeTransactions: [transaction, ...financials.incomeTransactions]
    };
    saveFinancials(updated);
  };

  const handleUpdateIncome = (updatedInc: IncomeTransaction) => {
    const updated = {
      ...financials,
      incomeTransactions: financials.incomeTransactions.map(item => 
        item.id === updatedInc.id ? updatedInc : item
      )
    };
    saveFinancials(updated);
  };

  const handleDeleteIncome = (id: string) => {
    const updated = {
      ...financials,
      incomeTransactions: financials.incomeTransactions.filter(item => item.id !== id)
    };
    saveFinancials(updated);
  };

  // Savings Handlers
  const handleAddSavingsGoal = (newGoal: Omit<SavingsGoal, 'id'>) => {
    const goal: SavingsGoal = {
      ...newGoal,
      id: `sav_${Date.now()}`
    };
    const updated = {
      ...financials,
      savingsGoals: [...financials.savingsGoals, goal]
    };
    saveFinancials(updated);
  };

  const handleUpdateSavingsGoal = (updatedGoal: SavingsGoal) => {
    const updated = {
      ...financials,
      savingsGoals: financials.savingsGoals.map(item => 
        item.id === updatedGoal.id ? updatedGoal : item
      )
    };
    saveFinancials(updated);
  };

  const handleDeleteSavingsGoal = (id: string) => {
    const updated = {
      ...financials,
      savingsGoals: financials.savingsGoals.filter(item => item.id !== id)
    };
    saveFinancials(updated);
  };

  // Expense Handlers (Includes dynamic sync logic)
  const handleAddExpense = (newExp: Omit<ExpenseTransaction, 'id'>) => {
    const expense: ExpenseTransaction = {
      ...newExp,
      id: `exp_${Date.now()}`
    };

    let updatedGoals = [...financials.savingsGoals];
    let updatedCards = [...financials.creditCards];

    // Core requirement: deduct from Savings goal balance
    if (newExp.paymentMethod === 'savings' && newExp.savingsGoalId) {
      updatedGoals = updatedGoals.map(goal => {
        if (goal.id === newExp.savingsGoalId) {
          return {
            ...goal,
            saved: Math.max(0, goal.saved - newExp.amount)
          };
        }
        return goal;
      });
    }

    // Core requirement: link to selected credit card, reduce limit and increase spend
    if (newExp.paymentMethod === 'credit_card' && newExp.creditCardId) {
      updatedCards = updatedCards.map(card => {
        if (card.id === newExp.creditCardId) {
          return {
            ...card,
            currentSpend: card.currentSpend + newExp.amount,
            totalBill: card.totalBill + newExp.amount
          };
        }
        return card;
      });
    }

    const updated = {
      ...financials,
      expenses: [expense, ...financials.expenses],
      savingsGoals: updatedGoals,
      creditCards: updatedCards
    };
    saveFinancials(updated);
  };

  const handleUpdateExpense = (updatedExp: ExpenseTransaction) => {
    const updated = {
      ...financials,
      expenses: financials.expenses.map(e => e.id === updatedExp.id ? updatedExp : e)
    };
    saveFinancials(updated);
  };

  const handleDeleteExpense = (id: string) => {
    const targetExp = financials.expenses.find(e => e.id === id);
    if (!targetExp) return;

    let updatedGoals = [...financials.savingsGoals];
    let updatedCards = [...financials.creditCards];

    // Refund/Revert the spending balance
    if (targetExp.paymentMethod === 'savings' && targetExp.savingsGoalId) {
      updatedGoals = updatedGoals.map(goal => {
        if (goal.id === targetExp.savingsGoalId) {
          return {
            ...goal,
            saved: goal.saved + targetExp.amount
          };
        }
        return goal;
      });
    }

    if (targetExp.paymentMethod === 'credit_card' && targetExp.creditCardId) {
      updatedCards = updatedCards.map(card => {
        if (card.id === targetExp.creditCardId) {
          return {
            ...card,
            currentSpend: Math.max(0, card.currentSpend - targetExp.amount),
            totalBill: Math.max(0, card.totalBill - targetExp.amount)
          };
        }
        return card;
      });
    }

    const updated = {
      ...financials,
      expenses: financials.expenses.filter(e => e.id !== id),
      savingsGoals: updatedGoals,
      creditCards: updatedCards
    };
    saveFinancials(updated);
  };

  // Credit Card Handlers
  const handleAddCard = (newCard: Omit<CreditCard, 'id' | 'currentSpend' | 'totalBill'>) => {
    const card: CreditCard = {
      ...newCard,
      id: `card_${Date.now()}`,
      currentSpend: 0,
      totalBill: 0
    };
    const updated = {
      ...financials,
      creditCards: [...financials.creditCards, card]
    };
    saveFinancials(updated);
  };

  const handleUpdateCardLimit = (cardId: string, newLimit: number) => {
    const updated = {
      ...financials,
      creditCards: financials.creditCards.map(c => 
        c.id === cardId ? { ...c, limit: newLimit } : c
      )
    };
    saveFinancials(updated);
  };

  const handleDeleteCard = (cardId: string) => {
    const updated = {
      ...financials,
      creditCards: financials.creditCards.filter(c => c.id !== cardId)
    };
    saveFinancials(updated);
  };

  // Income Operations: Transfer to savings
  const handleTransferToSavings = (savingsGoalId: string, amount: number) => {
    // Increase savings goal saved amount
    const updatedGoals = financials.savingsGoals.map(goal => {
      if (goal.id === savingsGoalId) {
        return {
          ...goal,
          saved: goal.saved + amount
        };
      }
      return goal;
    });

    // Create a transaction log
    const goalName = financials.savingsGoals.find(g => g.id === savingsGoalId)?.name || 'Tabungan';
    const expenseLog: ExpenseTransaction = {
      id: `exp_trans_${Date.now()}`,
      date: '2026-07-19',
      time: '15:30',
      title: `Alokasi Tabungan: ${goalName}`,
      category: 'Alokasi Dana',
      amount: amount,
      paymentMethod: 'cash'
    };

    const updated = {
      ...financials,
      savingsGoals: updatedGoals,
      expenses: [expenseLog, ...financials.expenses]
    };
    saveFinancials(updated);
  };

  // Income Operations: Pay credit card bill
  const handlePayCreditCard = (creditCardId: string, amount: number) => {
    // Decrease the card's balance
    const updatedCards = financials.creditCards.map(card => {
      if (card.id === creditCardId) {
        return {
          ...card,
          currentSpend: Math.max(0, card.currentSpend - amount),
          totalBill: Math.max(0, card.totalBill - amount)
        };
      }
      return card;
    });

    // Create a transaction log in Expenses representing payment
    const cardName = financials.creditCards.find(c => c.id === creditCardId)?.cardName || 'Kartu Kredit';
    const expenseLog: ExpenseTransaction = {
      id: `exp_pay_${Date.now()}`,
      date: '2026-07-19',
      time: '15:45',
      title: `Bayar Kartu Kredit: ${cardName}`,
      category: 'Pembayaran Kartu',
      amount: amount,
      paymentMethod: 'cash'
    };

    const updated = {
      ...financials,
      creditCards: updatedCards,
      expenses: [expenseLog, ...financials.expenses]
    };
    saveFinancials(updated);
  };

  // Clear simulated database to reset defaults
  const handleResetDatabase = () => {
    localStorage.removeItem(`financial_state_${currentUser.id}`);
    const defaults = DEFAULT_FINANCIALS[currentUser.id] || DEFAULT_FINANCIALS['user_aldyan'];
    saveFinancials(defaults);
  };

  // Navigations Menu List
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'income', label: 'Pemasukan', icon: Wallet },
    { id: 'savings', label: 'Tabungan', icon: PiggyBank },
    { id: 'expenses', label: 'Pengeluaran', icon: TrendingUp },
    { id: 'credit', label: 'Kartu Kredit', icon: CardIcon },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col md:flex-row pb-20 md:pb-0" id="finance-pro-app-root">
      
      {/* Side Navigation Bar - Desktop (Sleek modern rail header sidebar) */}
      <aside className="w-64 bg-slate-900 text-slate-200 p-6 hidden md:flex flex-col justify-between shrink-0 border-r border-slate-800 z-30" id="desktop-sidebar-nav">
        <div className="space-y-8">
          {/* Main Logo matched to design */}
          <div className="flex items-center gap-3 px-2 py-1" id="desktop-sidebar-logo">
            <div className="p-2.5 bg-sky-500 text-slate-950 rounded-2xl shadow-lg shadow-sky-500/20">
              <CardIcon className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-white leading-none">FinancePro</h1>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 block">Management Money</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5" id="desktop-nav-links-container">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3.5 p-3 px-4 rounded-2xl text-left text-sm font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/15 font-bold'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  }`}
                  id={`nav-item-desktop-${item.id}`}
                >
                  <Icon className={`w-4.5 h-4.5 ${isSelected ? 'text-slate-950' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer actions of Sidebar */}
        <div className="space-y-4 border-t border-slate-800/80 pt-4" id="desktop-sidebar-footer">
          <button
            onClick={handleResetDatabase}
            className="w-full flex items-center gap-2 text-xs text-slate-500 hover:text-sky-400 transition-colors p-2 rounded-xl cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin-hover" /> Reset Simulated DB
          </button>
          
          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-[10px] text-slate-400 leading-relaxed">
            <span className="font-bold text-white block">Fintech Core v2.4</span>
            Port 3000 | Active session as user <span className="font-semibold text-sky-400">{currentUser.name}</span>.
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col min-w-0" id="main-content-pane">
        
        {/* Top Header Row (Search, Filters, Account Selector) */}
        <header className="bg-slate-900/50 border-b border-slate-800 backdrop-blur-md p-4 px-6 flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 z-30 shadow-xs" id="app-global-header">
          
          {/* Left: Search & Dates filter matched exactly with design specifications */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto relative" id="global-filters-container">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari di seluruh modul..."
                className="w-full text-xs p-2.5 pl-9 bg-slate-800 text-slate-200 hover:bg-slate-750 focus:bg-slate-800 rounded-xl border border-slate-700 focus:border-sky-500 outline-none transition-all font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                id="global-search-input"
              />
            </div>

            {/* Minimal Date Filter Popup Icon (Only shown in income, savings, and expenses views) */}
            {(activeTab === 'income' || activeTab === 'savings' || activeTab === 'expenses') && (
              <div className="relative" id="date-filter-popup-container">
                <button
                  onClick={() => setIsDatePopupOpen(!isDatePopupOpen)}
                  className={`p-2.5 text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-750 border border-slate-700/50 rounded-2xl relative cursor-pointer flex items-center justify-center transition-all gap-1.5 text-xs font-semibold ${
                    isDatePopupOpen ? 'border-sky-500 text-sky-400 bg-slate-800/80' : ''
                  }`}
                  title="Filter Tanggal"
                  id="date-filter-trigger-btn"
                >
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">Filter Tanggal</span>
                  {(startDate || endDate) && (
                    <span className="w-2 h-2 bg-sky-500 rounded-full animate-pulse"></span>
                  )}
                </button>

                {isDatePopupOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200" id="date-filter-dropdown-card">
                    <div className="flex justify-between items-center pb-2.5 border-b border-slate-800 mb-3">
                      <span className="text-xs font-black text-slate-200 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-sky-400" /> Filter Tanggal Transaksi
                      </span>
                      <button
                        onClick={() => setIsDatePopupOpen(false)}
                        className="text-slate-400 hover:text-slate-200 p-1 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-3.5">
                      {/* Presets */}
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Pilih Periode Cepat</label>
                        <select
                          value={tempPreset}
                          onChange={(e) => handleTempPresetChange(e.target.value)}
                          className="w-full text-xs p-2 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl border border-slate-700 focus:border-sky-500 outline-none cursor-pointer font-semibold transition-all"
                        >
                          <option value="Semua">Semua Periode</option>
                          <option value="Hari Ini">Hari Ini</option>
                          <option value="Minggu Ini">Minggu Ini (7 Hari)</option>
                          <option value="Bulan Ini">Bulan Ini (Juli 2026)</option>
                          <option value="6 Bulan Terakhir">6 Bulan Terakhir</option>
                        </select>
                      </div>

                      {/* Custom Date Range */}
                      <div className="grid grid-cols-2 gap-2 text-left">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Dari Tanggal</label>
                          <input
                            type="date"
                            className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 outline-none cursor-pointer text-xs focus:border-sky-500 transition-all"
                            value={tempStartDate}
                            onChange={(e) => {
                              setTempStartDate(e.target.value);
                              setTempPreset('Custom');
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Hingga Tanggal</label>
                          <input
                            type="date"
                            className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 outline-none cursor-pointer text-xs focus:border-sky-500 transition-all"
                            value={tempEndDate}
                            onChange={(e) => {
                              setTempEndDate(e.target.value);
                              setTempPreset('Custom');
                            }}
                          />
                        </div>
                      </div>

                      {/* Search/Apply Button */}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={applyDateFilter}
                          className="flex-1 py-2 bg-sky-500 hover:bg-sky-600 text-slate-950 rounded-xl text-xs font-black transition-all cursor-pointer shadow-lg shadow-sky-500/10 text-center flex items-center justify-center gap-1"
                        >
                          <Search className="w-3 h-3" /> Cari
                        </button>
                        <button
                          onClick={() => {
                            setTempStartDate('');
                            setTempEndDate('');
                            setTempPreset('Semua');
                            setStartDate('');
                            setEndDate('');
                            setDatePreset('Semua');
                            setIsDatePopupOpen(false);
                          }}
                          className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                          title="Reset Filter"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Quick Notifications & Account Profile Quick Switcher */}
          <div className="flex items-center gap-3 justify-between md:justify-end w-full md:w-auto" id="header-right-utils">
            {/* Logo on mobile only */}
            <div className="flex items-center gap-2 md:hidden" id="mobile-only-logo">
              <div className="p-1.5 bg-sky-500 text-slate-950 rounded-xl">
                <CardIcon className="w-4 h-4 text-slate-950" />
              </div>
              <span className="font-extrabold text-sm tracking-tight text-slate-200">FinancePro</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Notification bell and dropdown */}
              <div className="relative z-40">
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="p-2.5 text-slate-400 hover:text-slate-200 bg-slate-800 rounded-2xl relative cursor-pointer flex items-center justify-center transition-colors" 
                  id="notify-bell"
                >
                  <Bell className="w-4 h-4" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping"></span>
                  )}
                </button>

                {/* Dropdown Card */}
                {isNotificationsOpen && (
                  <div className="absolute -right-12 sm:right-0 mt-2 w-72 sm:w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200" id="notification-dropdown-card">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-3">
                      <span className="text-xs font-black text-slate-200 flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-sky-400" /> Pusat Notifikasi ({notifications.length})
                      </span>
                      <div className="flex items-center gap-1.5">
                        {notifications.length > 0 && (
                          <button
                            onClick={() => {
                              setNotifications([]);
                              setIsNotificationsOpen(false);
                            }}
                            className="text-[9px] text-rose-400 hover:text-rose-300 font-extrabold uppercase tracking-wider px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg cursor-pointer transition-colors"
                          >
                            Hapus Semua
                          </button>
                        )}
                        <button
                          onClick={() => setIsNotificationsOpen(false)}
                          className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 overflow-y-auto pr-0.5 max-h-72">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className="p-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 transition-all border border-slate-800/60 hover:border-slate-700 flex items-start gap-2 group text-left"
                        >
                          <div
                            onClick={() => {
                              setActiveNotifDetail(notif);
                              setIsNotificationsOpen(false);
                            }}
                            className="flex-1 cursor-pointer"
                          >
                            <p className="text-xs text-slate-200 font-bold leading-snug line-clamp-2">{notif.text}</p>
                            <span className="text-[9px] text-slate-500 font-mono mt-1 block">{notif.date} • Klik rincian</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setNotifications(notifications.filter(n => n.id !== notif.id));
                            }}
                            className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer shrink-0 animate-fade-in"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      {notifications.length === 0 && (
                        <div className="text-center py-8 text-slate-500 italic text-xs">
                          Tidak ada notifikasi baru saat ini.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Account/User Switcher */}
              <UserSwitcher
                currentUser={currentUser}
                allUsers={allUsers}
                onUserChange={(newUser) => setCurrentUser(newUser)}
                onAddUser={handleAddUser}
                onDeleteUser={handleDeleteUser}
              />
            </div>
          </div>

        </header>

        {/* Tab content area */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto max-w-7xl w-full mx-auto" id="app-viewports-container">
          {activeTab === 'dashboard' && (
            <DashboardView
              incomeTransactions={financials.incomeTransactions}
              savingsGoals={financials.savingsGoals}
              expenses={financials.expenses}
              creditCards={financials.creditCards}
              searchQuery={searchQuery}
              startDate={startDate}
              endDate={endDate}
              onNavigateToTab={(tab) => setActiveTab(tab)}
              onOpenQuickExpense={() => setActiveTab('expenses')}
              onOpenQuickIncome={() => setActiveTab('income')}
              onUpdateIncome={handleUpdateIncome}
              onDeleteIncome={handleDeleteIncome}
              onUpdateExpense={handleUpdateExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          )}

          {activeTab === 'income' && (
            <IncomeView
              incomeTransactions={financials.incomeTransactions}
              savingsGoals={financials.savingsGoals}
              creditCards={financials.creditCards}
              searchQuery={searchQuery}
              startDate={startDate}
              endDate={endDate}
              onAddIncome={handleAddIncome}
              onUpdateIncome={handleUpdateIncome}
              onDeleteIncome={handleDeleteIncome}
              onTransferToSavings={handleTransferToSavings}
              onPayCreditCard={handlePayCreditCard}
            />
          )}

          {activeTab === 'savings' && (
            <SavingsView
              savingsGoals={financials.savingsGoals}
              onAddSavingsGoal={handleAddSavingsGoal}
              onUpdateSavingsGoal={handleUpdateSavingsGoal}
              onDeleteSavingsGoal={handleDeleteSavingsGoal}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpensesView
              expenses={financials.expenses}
              savingsGoals={financials.savingsGoals}
              creditCards={financials.creditCards}
              searchQuery={searchQuery}
              startDate={startDate}
              endDate={endDate}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
              onUpdateExpense={handleUpdateExpense}
            />
          )}

          {activeTab === 'credit' && (
            <CreditCardsView
              creditCards={financials.creditCards}
              expenses={financials.expenses}
              onAddCard={handleAddCard}
              onUpdateCardLimit={handleUpdateCardLimit}
              onDeleteCard={handleDeleteCard}
              onUpdateExpense={handleUpdateExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          )}
        </div>

      </main>

      {/* Unified Bottom Nav Bar - Mobile Only matched exactly with specifications */}
      <footer className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-2 py-3 flex items-center justify-around md:hidden z-40 shadow-xl" id="mobile-bottom-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isSelected = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center gap-1 cursor-pointer"
              id={`nav-item-mobile-${item.id}`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${
                isSelected ? 'bg-sky-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[9px] font-bold ${
                isSelected ? 'text-sky-400' : 'text-slate-400'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </footer>

      {/* MODAL: Rincian Notifikasi */}
      {activeNotifDetail && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md flex items-center justify-center z-50 p-4 pt-20 sm:pt-4 pb-12 sm:pb-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-800 animate-in zoom-in-95 translate-y-6 sm:translate-y-0 duration-200 space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h3 className="font-bold text-slate-200 text-base flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-sky-400" /> Rincian Notifikasi
              </h3>
              <button 
                onClick={() => setActiveNotifDetail(null)}
                className="text-slate-400 hover:text-slate-200 p-1 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3 text-xs leading-relaxed">
              <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-500 font-mono block">{activeNotifDetail.date}</span>
                <p className="text-slate-100 font-bold text-sm leading-snug">{activeNotifDetail.text}</p>
              </div>
              
              {activeNotifDetail.details && (
                <div className="text-slate-400 font-medium">
                  <span className="text-slate-500 font-bold block mb-1">Informasi Tambahan:</span>
                  <p>{activeNotifDetail.details}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setNotifications(notifications.filter(n => n.id !== activeNotifDetail.id));
                  setActiveNotifDetail(null);
                }}
                className="flex-1 p-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
              >
                Hapus Notifikasi
              </button>
              <button
                onClick={() => setActiveNotifDetail(null)}
                className="flex-1 p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {isLandscape && (
        <div className="fixed top-3 left-1/2 transform -translate-x-1/2 bg-sky-500 text-slate-950 font-black text-[9px] tracking-widest px-4 py-1.5 rounded-full shadow-2xl z-50 flex items-center gap-1.5 animate-bounce border border-white/20">
          <span className="w-1.5 h-1.5 bg-slate-950 rounded-full animate-ping"></span>
          LANDSCAPE MODE OTOMATIS AKTIF
        </div>
      )}

    </div>
  );
}
