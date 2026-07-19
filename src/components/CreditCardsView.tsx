import { useState, FormEvent } from 'react';
import { CreditCard, ExpenseTransaction } from '../types';
import { Plus, Edit3, Trash2, X, CreditCard as CardIcon, ShieldAlert, Sparkles, AlertCircle, Info } from 'lucide-react';

interface CreditCardsViewProps {
  creditCards: CreditCard[];
  expenses: ExpenseTransaction[];
  onAddCard: (card: Omit<CreditCard, 'id' | 'currentSpend' | 'totalBill'>) => void;
  onUpdateCardLimit: (cardId: string, newLimit: number) => void;
  onDeleteCard: (cardId: string) => void;
  onUpdateExpense: (item: ExpenseTransaction) => void;
  onDeleteExpense: (id: string) => void;
}

export default function CreditCardsView({
  creditCards,
  expenses,
  onAddCard,
  onUpdateCardLimit,
  onDeleteCard,
  onUpdateExpense,
  onDeleteExpense,
}: CreditCardsViewProps) {
  // Modals & Form States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [limitInput, setLimitInput] = useState('');
  const [cardToDelete, setCardToDelete] = useState<CreditCard | null>(null);
  const [deleteStep, setDeleteStep] = useState(1);

  // States for Credit Card Transactions log
  const [selectedExpense, setSelectedExpense] = useState<ExpenseTransaction | null>(null);
  const [editingExpense, setEditingExpense] = useState<ExpenseTransaction | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<ExpenseTransaction | null>(null);

  // Edit Expense inputs
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editCardId, setEditCardId] = useState('');

  // Add Card Inputs
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardholder, setCardholder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [limit, setLimit] = useState('');
  const [cardType, setCardType] = useState<'visa' | 'mastercard' | 'jcb'>('visa');

  // IDR Formatter
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Mask helper for card list display
  const maskCardNumber = (numStr: string) => {
    if (numStr.startsWith('****')) return numStr;
    const clean = numStr.replace(/\s+/g, '');
    if (clean.length < 4) return numStr;
    return `**** **** **** ${clean.slice(-4)}`;
  };

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!cardName || !cardNumber || !limit) return;
    onAddCard({
      cardName,
      cardNumber: maskCardNumber(cardNumber),
      cardholder: cardholder || 'ALDYAN BP',
      expiryDate: expiryDate || '09/29',
      limit: Number(limit),
      cardType,
    });

    // Reset Form
    setCardName('');
    setCardNumber('');
    setCardholder('');
    setExpiryDate('');
    setLimit('');
    setCardType('visa');
    setIsAddOpen(false);
  };

  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!editingCard || !limitInput) return;
    onUpdateCardLimit(editingCard.id, Number(limitInput));
    setEditingCard(null);
    setLimitInput('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300" id="credit-cards-view-root">
      
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" id="cards-header-row">
        <div>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">Monitor Kartu Kredit (Cards)</h2>
          <p className="text-xs text-slate-400 mt-0.5">Pantau limit, pergerakan tagihan belanja kartu, dan kelola kartu kredit aktif.</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 p-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-lg shadow-sky-500/10 self-stretch sm:self-auto justify-center"
          id="open-add-card-btn"
        >
          <Plus className="w-4 h-4 text-slate-950" /> Daftarkan Kartu Baru
        </button>
      </div>

      {/* Grid of credit card components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="credit-cards-grid">
        {creditCards.map((card) => {
          const usedPct = card.limit > 0 ? Math.round((card.currentSpend / card.limit) * 100) : 0;
          const isOverlimit = card.currentSpend > card.limit;
          
          return (
            <div 
              key={card.id} 
              className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm flex flex-col justify-between gap-6 relative group"
              id={`credit-card-parent-${card.id}`}
            >
              <div className="space-y-4 flex-1">
                {/* Physical card visual style */}
                <div className={`relative p-6 rounded-3xl text-white shadow-xl overflow-hidden group min-h-[190px] transition-all ${
                  card.cardType === 'visa' 
                    ? 'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950' 
                    : card.cardType === 'mastercard'
                    ? 'bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950'
                    : 'bg-gradient-to-br from-sky-900 via-sky-950 to-slate-950'
                }`} id={`credit-card-preview-${card.id}`}>
                  
                  {/* Glowing background circles */}
                  <div className="absolute right-0 top-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl"></div>
                  <div className="absolute left-10 bottom-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>

                  {/* Header info */}
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Premium Finance</span>
                      <h3 className="text-xs font-bold text-slate-100 mt-0.5">{card.cardName}</h3>
                    </div>
                    <span className="text-2xl font-black italic tracking-wide uppercase text-white">
                      {card.cardType.toUpperCase()}
                    </span>
                  </div>

                  {/* Chip and NFC icon */}
                  <div className="my-4 flex items-center gap-3">
                    <div className="w-8 h-5.5 bg-yellow-500/20 rounded border border-yellow-500/30"></div>
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>

                  {/* Masked Card number */}
                  <div className="text-lg font-bold font-mono tracking-widest text-slate-100">{card.cardNumber}</div>

                  {/* Footer holder & expiry */}
                  <div className="flex justify-between items-end mt-5">
                    <div>
                      <span className="text-[8px] uppercase tracking-widest text-slate-400 block">Cardholder</span>
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-200">{card.cardholder}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] uppercase tracking-widest text-slate-400 block">Expires</span>
                      <span className="text-xs font-bold font-mono text-slate-200">{card.expiryDate}</span>
                    </div>
                  </div>
                </div>

                {/* Card limit indicator section matched with design */}
                <div className="space-y-3 bg-slate-950/40 p-4 rounded-2xl border border-slate-800" id={`limit-indicators-${card.id}`}>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-400">Pemakaian Limit</span>
                    <span className={`font-extrabold font-mono ${isOverlimit ? 'text-rose-400' : 'text-slate-200'}`}>
                      {usedPct}% Used
                    </span>
                  </div>
                  {/* Limit Progress Bar */}
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-2.5 rounded-full transition-all duration-700 ${isOverlimit ? 'bg-rose-500' : 'bg-sky-500'}`}
                      style={{ width: `${Math.min(100, usedPct)}%` }}
                    ></div>
                  </div>

                  {/* Sub metrics stats */}
                  <div className="grid grid-cols-2 gap-4 pt-1 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[9px] font-bold uppercase tracking-wide">Sisa Limit</span>
                      <span className="font-extrabold text-slate-200 font-mono block text-sm mt-0.5">
                        {formatRupiah(Math.max(0, card.limit - card.currentSpend))}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 block text-[9px] font-bold uppercase tracking-wide">Tagihan Aktif</span>
                      <span className="font-extrabold text-rose-400 font-mono block text-sm mt-0.5">
                        {formatRupiah(card.totalBill)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Card & specific card transactions */}
              <div className="flex gap-2 border-t border-slate-800 pt-4" id={`card-actions-row-${card.id}`}>
                <button
                  onClick={() => {
                    setEditingCard(card);
                    setLimitInput(card.limit.toString());
                  }}
                  className="flex-1 flex items-center justify-center gap-1 p-2 rounded-xl border border-slate-800 text-slate-300 hover:text-sky-400 hover:bg-sky-500/10 hover:border-sky-500/20 text-xs font-semibold transition-all cursor-pointer"
                  id={`edit-limit-btn-${card.id}`}
                >
                  <Edit3 className="w-3.5 h-3.5" /> Atur Limit
                </button>
                <button
                  onClick={() => {
                    setCardToDelete(card);
                    setDeleteStep(1);
                  }}
                  className="p-2 rounded-xl border border-slate-800 text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/20 text-xs font-semibold transition-all cursor-pointer"
                  id={`delete-card-btn-${card.id}`}
                  title="Hapus kartu kredit"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {creditCards.length === 0 && (
          <div className="col-span-full bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl text-center py-12 text-slate-500 text-xs space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto text-slate-600 animate-bounce" />
            <p className="font-semibold text-slate-400">Belum ada kartu kredit terdaftar.</p>
            <p>Daftarkan kartu kredit Anda untuk melacak tagihan belanja harian.</p>
          </div>
        )}
      </div>

      {/* Card transactions log overview */}
      {creditCards.length > 0 && (
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm" id="credit-cards-trans-history">
          <h3 className="font-bold text-slate-200 text-base mb-4">Transaksi Log Kartu Kredit Terbaru</h3>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {expenses
              .filter(e => e.paymentMethod === 'credit_card')
              .map((exp) => (
                <div 
                  key={exp.id} 
                  onClick={() => {
                    setSelectedExpense(exp);
                  }}
                  className="flex justify-between items-center text-xs p-3 bg-slate-950/20 hover:bg-slate-800/40 rounded-2xl border border-slate-800/40 hover:border-slate-700/60 transition-all cursor-pointer"
                >
                  <div className="space-y-0.5 text-left">
                    <p className="font-bold text-slate-100">{exp.title}</p>
                    <p className="text-[10px] text-slate-400">
                      {exp.category} • Kartu: <span className="font-semibold text-sky-400">{creditCards.find(c => c.id === exp.creditCardId)?.cardName || 'Kartu Kredit'}</span> • {exp.date} {exp.time || ''}
                    </p>
                  </div>
                  <span className="font-mono font-bold text-rose-400 text-sm">
                    -{formatRupiah(exp.amount)}
                  </span>
                </div>
              ))}
            {expenses.filter(e => e.paymentMethod === 'credit_card').length === 0 && (
              <p className="text-xs text-slate-500 italic text-center py-4">Belum ada aktivitas belanja menggunakan kartu kredit.</p>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Tambah Kartu Kredit Baru */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h3 className="font-bold text-slate-200 text-lg flex items-center gap-1.5">
                <CardIcon className="w-5 h-5 text-sky-400" /> Daftarkan Kartu Kredit Baru
              </h3>
              <button 
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4 pt-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Nama Kartu Kredit</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UTAMA PLATINUM, BCA GOLD"
                  className="w-full p-2.5 bg-slate-800 rounded-xl border border-slate-700 focus:border-sky-500 outline-none text-slate-200 placeholder-slate-500"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Nomor Kartu (16 digit / bebas)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 4321 8829 9191 8829"
                  maxLength={19}
                  className="w-full p-2.5 bg-slate-800 rounded-xl border border-slate-700 focus:border-sky-500 outline-none text-slate-200 font-mono placeholder-slate-500"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="ALDYAN BP"
                    className="w-full p-2.5 bg-slate-800 rounded-xl border border-slate-700 focus:border-sky-500 outline-none text-slate-200 uppercase placeholder-slate-500"
                    value={cardholder}
                    onChange={(e) => setCardholder(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="09/29"
                    maxLength={5}
                    className="w-full p-2.5 bg-slate-800 rounded-xl border border-slate-700 focus:border-sky-500 outline-none text-slate-200 font-mono placeholder-slate-500"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Pilih Brand</label>
                  <select
                    className="w-full p-2.5 bg-slate-800 rounded-xl border border-slate-700 focus:border-sky-500 outline-none text-slate-200 cursor-pointer"
                    value={cardType}
                    onChange={(e) => setCardType(e.target.value as any)}
                  >
                    <option value="visa" className="bg-slate-900">VISA</option>
                    <option value="mastercard" className="bg-slate-900">Mastercard</option>
                    <option value="jcb" className="bg-slate-900">JCB</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Limit Kredit (IDR)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 50000000"
                    className="w-full p-2.5 bg-slate-800 rounded-xl border border-slate-700 focus:border-sky-500 outline-none text-slate-200 font-mono placeholder-slate-500"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full p-3 bg-sky-500 hover:bg-sky-600 text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-sky-500/10 mt-2"
              >
                Daftarkan Kartu Kredit
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FULL-SCREEN TWO-STEP DELETION POPUP */}
      {cardToDelete && (
        <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
          <div className="max-w-xl w-full text-center space-y-8 animate-in zoom-in-95 duration-300">
            
            {/* Warning Giant Icon */}
            <div className="mx-auto w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 animate-bounce">
              <ShieldAlert className="w-12 h-12" />
            </div>

            {/* Step 1 Content */}
            {deleteStep === 1 ? (
              <div className="space-y-4">
                <span className="text-[11px] font-extrabold tracking-widest text-rose-500 uppercase">Langkah 1 dari 2: Peringatan Keamanan</span>
                <h3 className="text-3xl font-black text-white tracking-tight">Konfirmasi Penghapusan Kartu Kredit</h3>
                <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
                  Anda akan menghapus kartu kredit <span className="text-white font-bold">&quot;{cardToDelete.cardName}&quot;</span> ({cardToDelete.cardNumber}) dengan limit sebesar <span className="text-sky-400 font-bold font-mono">{formatRupiah(cardToDelete.limit)}</span> secara permanen dari sistem database. Tindakan ini tidak dapat dibatalkan.
                </p>
                <div className="pt-6 flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
                  <button
                    onClick={() => setDeleteStep(2)}
                    className="flex-1 p-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Lanjutkan Verifikasi
                  </button>
                  <button
                    onClick={() => setCardToDelete(null)}
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
                  Tekan tombol di bawah untuk memberikan otorisasi penghapusan final. Data kartu kredit dan limit yang dihapus tidak dapat dipulihkan atau disinkronkan kembali.
                </p>
                <div className="pt-6 flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
                  <button
                    onClick={() => {
                      onDeleteCard(cardToDelete.id);
                      setCardToDelete(null);
                      setDeleteStep(1);
                    }}
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
              IP: Localhost | Brand: {cardToDelete.cardType.toUpperCase()} | ID: {cardToDelete.id}
            </p>
          </div>
        </div>
      )}

      {/* MODAL: Detail Rincian Transaksi Kartu Kredit */}
      {selectedExpense && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-800 animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-slate-200 text-base">Rincian Transaksi CC</h3>
              <button 
                onClick={() => setSelectedExpense(null)}
                className="text-slate-400 hover:text-slate-200 p-1 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs font-semibold text-left">
              <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-850 text-center space-y-1">
                <span className="text-[10px] text-slate-500 font-mono block">{selectedExpense.date} {selectedExpense.time || '12:00'}</span>
                <p className="text-slate-100 font-extrabold text-sm">{selectedExpense.title}</p>
                <span className="font-mono font-black text-lg text-rose-400 block">
                  -{formatRupiah(selectedExpense.amount)}
                </span>
              </div>

              <div className="space-y-2 border-t border-slate-800/60 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Kategori</span>
                  <span className="text-slate-200 font-extrabold">{selectedExpense.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Kartu Kredit</span>
                  <span className="text-sky-400 font-extrabold truncate max-w-[150px]">
                    {creditCards.find(c => c.id === selectedExpense.creditCardId)?.cardName || 'Kartu Kredit'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex gap-2">
              <button
                onClick={() => {
                  setEditTitle(selectedExpense.title);
                  setEditAmount(selectedExpense.amount.toString());
                  setEditCategory(selectedExpense.category);
                  setEditDate(selectedExpense.date);
                  setEditCardId(selectedExpense.creditCardId || '');
                  setEditingExpense(selectedExpense);
                  setSelectedExpense(null);
                }}
                className="flex-1 p-2.5 bg-sky-500 hover:bg-sky-600 text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  setExpenseToDelete(selectedExpense);
                  setSelectedExpense(null);
                  setDeleteStep(1);
                }}
                className="flex-1 p-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
              >
                Hapus
              </button>
              <button
                onClick={() => setSelectedExpense(null)}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Edit Transaksi Kartu Kredit */}
      {editingExpense && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-slate-200 text-lg">Edit Transaksi Kartu Kredit</h3>
              <button 
                onClick={() => setEditingExpense(null)}
                className="text-slate-400 hover:text-slate-200 p-1 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!editTitle || !editAmount) return;
                onUpdateExpense({
                  ...editingExpense,
                  title: editTitle,
                  amount: Number(editAmount),
                  category: editCategory,
                  date: editDate,
                  creditCardId: editCardId || undefined
                });
                setEditingExpense(null);
              }}
              className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 text-xs font-semibold text-left"
            >
              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Keterangan Belanja</label>
                <input
                  type="text"
                  required
                  className="w-full p-2.5 bg-slate-800 rounded-xl border border-slate-700 focus:border-sky-500 outline-none text-slate-200"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Jumlah Pengeluaran (IDR)</label>
                <input
                  type="number"
                  required
                  className="w-full p-2.5 bg-slate-800 rounded-xl border border-slate-700 focus:border-sky-500 outline-none text-slate-200 font-mono"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Kategori</label>
                  <select
                    className="w-full p-2.5 bg-slate-800 rounded-xl border border-slate-700 focus:border-sky-500 outline-none text-slate-200 cursor-pointer"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                  >
                    <option value="Makanan & Minuman" className="bg-slate-900">Makanan & Minuman</option>
                    <option value="Transportasi" className="bg-slate-900">Transportasi</option>
                    <option value="Hiburan & Rekreasi" className="bg-slate-900">Hiburan & Rekreasi</option>
                    <option value="Pendidikan" className="bg-slate-900">Pendidikan</option>
                    <option value="Kesehatan" className="bg-slate-900">Kesehatan</option>
                    <option value="Belanja Bulanan" className="bg-slate-900">Belanja Bulanan</option>
                    <option value="Tagihan & Utilitas" className="bg-slate-900">Tagihan & Utilitas</option>
                    <option value="Lainnya" className="bg-slate-900">Lainnya</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Tanggal</label>
                  <input
                    type="date"
                    required
                    className="w-full p-2.5 bg-slate-800 rounded-xl border border-slate-700 focus:border-sky-500 outline-none text-slate-200"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Pilih Kartu Kredit</label>
                <select
                  className="w-full p-2.5 bg-slate-800 rounded-xl border border-slate-700 focus:border-sky-500 outline-none text-slate-200 cursor-pointer"
                  value={editCardId}
                  onChange={(e) => setEditCardId(e.target.value)}
                >
                  {creditCards.map(c => (
                    <option key={c.id} value={c.id} className="bg-slate-900">{c.cardName}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 p-3 bg-sky-500 hover:bg-sky-600 text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-sky-500/10"
                >
                  Simpan Perubahan
                </button>
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  className="flex-1 p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Konfirmasi Hapus Transaksi CC */}
      {expenseToDelete && (
        <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
          <div className="max-w-xl w-full text-center space-y-8 animate-in zoom-in-95 duration-300">
            <div className="mx-auto w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 animate-bounce">
              <ShieldAlert className="w-12 h-12" />
            </div>

            {deleteStep === 1 ? (
              <div className="space-y-4">
                <span className="text-[11px] font-extrabold tracking-widest text-rose-500 uppercase">Langkah 1 dari 2: Konfirmasi Hapus</span>
                <h3 className="text-3xl font-black text-white tracking-tight">Hapus Transaksi Kartu Kredit</h3>
                <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
                  Anda akan menghapus transaksi <span className="text-white font-bold">&quot;{expenseToDelete.title}&quot;</span> sebesar <span className="text-rose-400 font-bold font-mono">{formatRupiah(expenseToDelete.amount)}</span> dari riwayat kartu kredit secara permanen.
                </p>
                <div className="pt-6 flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
                  <button
                    onClick={() => setDeleteStep(2)}
                    className="flex-1 p-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Lanjutkan Verifikasi
                  </button>
                  <button
                    onClick={() => setExpenseToDelete(null)}
                    className="flex-1 p-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <span className="text-[11px] font-extrabold tracking-widest text-rose-500 uppercase">Langkah 2 dari 2: Otorisasi Final</span>
                <h3 className="text-3xl font-black text-white tracking-tight">Hapus Permanen?</h3>
                <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
                  Tindakan ini akan mengembalikan sisa limit kartu kredit Anda.
                </p>
                <div className="pt-6 flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
                  <button
                    onClick={() => {
                      onDeleteExpense(expenseToDelete.id);
                      setExpenseToDelete(null);
                      setDeleteStep(1);
                    }}
                    className="flex-1 p-3.5 bg-rose-500 hover:bg-rose-600 text-slate-950 rounded-2xl text-xs font-black tracking-wide transition-all cursor-pointer shadow-xl shadow-rose-500/20"
                  >
                    YA, HAPUS PERMANEN
                  </button>
                  <button
                    onClick={() => setDeleteStep(1)}
                    className="flex-1 p-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Kembali
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Edit Limit Kartu Kredit */}
      {editingCard && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h3 className="font-bold text-slate-200 text-lg">Sesuaikan Limit Kredit</h3>
              <button 
                onClick={() => setEditingCard(null)}
                className="text-slate-400 hover:text-slate-200 p-1 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4 pt-4 text-xs font-semibold">
              <p className="text-slate-400 leading-relaxed font-medium">Mengubah limit kartu kredit aktif <span className="text-sky-400 font-bold">{editingCard.cardName}</span>.</p>
              
              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Limit Kredit Baru (IDR)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-500 font-extrabold text-sm font-mono">Rp</span>
                  <input
                    type="number"
                    required
                    className="w-full p-2.5 pl-10 bg-slate-800 rounded-xl border border-slate-700 focus:border-sky-500 outline-none text-slate-200 font-mono text-sm"
                    value={limitInput}
                    onChange={(e) => setLimitInput(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full p-3 bg-sky-500 hover:bg-sky-600 text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-sky-500/10 mt-2"
              >
                Simpan Limit Baru
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
