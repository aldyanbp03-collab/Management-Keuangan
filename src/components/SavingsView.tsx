import { useState, FormEvent } from 'react';
import { SavingsGoal } from '../types';
import { Plus, Edit3, Trash2, PiggyBank, Target, HelpCircle, X, AlertTriangle, Sparkles } from 'lucide-react';

interface SavingsViewProps {
  savingsGoals: SavingsGoal[];
  onAddSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  onUpdateSavingsGoal: (goal: SavingsGoal) => void;
  onDeleteSavingsGoal: (id: string) => void;
}

export default function SavingsView({
  savingsGoals,
  onAddSavingsGoal,
  onUpdateSavingsGoal,
  onDeleteSavingsGoal,
}: SavingsViewProps) {
  // Modals & Form State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  
  // Forms Inputs
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [saved, setSaved] = useState('');
  const [category, setCategory] = useState('Impian');

  // Delete flow state
  const [goalToDelete, setGoalToDelete] = useState<SavingsGoal | null>(null);
  const [deleteStep, setDeleteStep] = useState(1);

  // Currency Formatter
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !target) return;
    onAddSavingsGoal({
      name,
      target: Number(target),
      saved: Number(saved) || 0,
      category,
    });
    // Reset Form
    setName('');
    setTarget('');
    setSaved('');
    setCategory('Keuangan');
    setIsAddOpen(false);
  };

  const handleUpdateSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!editingGoal || !editingGoal.name || !editingGoal.target) return;
    onUpdateSavingsGoal(editingGoal);
    setEditingGoal(null);
  };

  const startDeleteFlow = (goal: SavingsGoal) => {
    setGoalToDelete(goal);
    setDeleteStep(1);
  };

  const executeDelete = () => {
    if (goalToDelete) {
      onDeleteSavingsGoal(goalToDelete.id);
      setGoalToDelete(null);
      setDeleteStep(1);
    }
  };

  // Calculations
  const totalSavingsBalance = savingsGoals.reduce((sum, g) => sum + g.saved, 0);
  const totalSavingsTarget = savingsGoals.reduce((sum, g) => sum + g.target, 0);
  const overallProgress = totalSavingsTarget > 0 ? Math.round((totalSavingsBalance / totalSavingsTarget) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300" id="savings-view-root">
      
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" id="savings-header-row">
        <div>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">Tabungan Harian & Target (Savings)</h2>
          <p className="text-xs text-slate-400 mt-0.5">Atur alokasi dana, impian masa depan, dan komitmen menabung harian Anda.</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 p-2 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-lg shadow-sky-500/10 self-stretch sm:self-auto justify-center"
          id="open-add-savings-btn"
        >
          <Plus className="w-4.5 h-4.5" /> Tambah Target
        </button>
      </div>

      {/* Top Banner Stats */}
      <div className="bg-slate-900 border border-slate-800 text-white p-6 rounded-3xl relative overflow-hidden" id="savings-stats-banner">
        <div className="absolute right-0 top-0 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl"></div>
        <div className="absolute left-1/3 bottom-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10" id="savings-banner-grid">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Saldo Terkumpul</span>
            <div className="text-3xl font-black text-sky-400 font-mono tracking-tight">{formatRupiah(totalSavingsBalance)}</div>
            <p className="text-xs text-slate-400">Akumulasi dari seluruh target tabungan Anda</p>
          </div>

          <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Akumulasi Target Akhir</span>
            <div className="text-3xl font-black text-slate-200 font-mono tracking-tight">{formatRupiah(totalSavingsTarget)}</div>
            <p className="text-xs text-slate-400">Total modal pencapaian yang harus terkumpul</p>
          </div>

          <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progres Menabung Global</span>
              <div className="text-xl font-extrabold text-amber-400 font-mono mt-0.5">{overallProgress}% Terpenuhi</div>
            </div>
            {/* Simple mini progress bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
              <div className="bg-sky-500 h-full rounded-full transition-all duration-1000" style={{ width: `${overallProgress > 100 ? 100 : overallProgress}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Savings Goals Match with design concept */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="savings-goals-grid">
        {savingsGoals.map((goal) => {
          const progressPercent = goal.target > 0 ? Math.min(100, Math.round((goal.saved / goal.target) * 100)) : 0;
          return (
            <div 
              key={goal.id} 
              className="bg-slate-900 p-6 rounded-3xl border border-slate-800 hover:border-slate-700/60 transition-all flex flex-col justify-between relative group shadow-sm"
              id={`savings-goal-card-${goal.id}`}
            >
              {/* Category Badge & Actions */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-extrabold uppercase bg-sky-500/10 text-sky-400 px-2.5 py-0.5 rounded-full border border-sky-500/20">
                  {goal.category}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingGoal(goal)}
                    className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 hover:border-sky-500/20 rounded-lg border border-transparent transition-all cursor-pointer"
                    id={`edit-goal-btn-${goal.id}`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => startDeleteFlow(goal)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 rounded-lg border border-transparent transition-all cursor-pointer"
                    id={`delete-goal-btn-${goal.id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Goal Title & Current Saved Balance */}
              <div className="space-y-1">
                <h3 className="font-bold text-slate-200 text-base flex items-center gap-1.5 truncate">
                  <PiggyBank className="w-4 h-4 text-sky-400" /> {goal.name}
                </h3>
                <div className="text-xl font-extrabold text-slate-100 font-mono pt-1">
                  {formatRupiah(goal.saved)}
                </div>
                <div className="text-xs text-slate-400">
                  Target: <span className="font-semibold text-slate-300 font-mono">{formatRupiah(goal.target)}</span>
                </div>
              </div>

              {/* Progress Display */}
              <div className="space-y-2 mt-5 pt-4 border-t border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold">Tingkat Pencapaian</span>
                  <span className="font-extrabold text-sky-400 font-mono bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
                    {progressPercent}%
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-sky-500 h-full rounded-full transition-all duration-700" 
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1">
                  <span>Sisa Kekurangan</span>
                  <span className="font-semibold font-mono text-slate-300">
                    {goal.target > goal.saved ? formatRupiah(goal.target - goal.saved) : 'Tercapai! 🎉'}
                  </span>
                </div>
              </div>

              {/* Celebrate complete */}
              {progressPercent >= 100 && (
                <div className="absolute inset-0 bg-sky-500/5 rounded-3xl border border-sky-500/20 pointer-events-none flex items-center justify-center">
                  <div className="absolute right-3 bottom-3 text-sky-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Selesai
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {savingsGoals.length === 0 && (
          <div className="col-span-full bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl text-center py-12 text-slate-500 text-xs space-y-2">
            <Target className="w-8 h-8 mx-auto text-slate-600" />
            <p className="font-semibold text-slate-400">Belum ada target tabungan aktif.</p>
            <p>Tekan tombol &quot;Tambah Target&quot; untuk memulai menyisihkan dana.</p>
          </div>
        )}
      </div>

      {/* MODAL: Tambah Target */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h3 className="font-bold text-slate-200 text-lg">Buat Target Tabungan Baru</h3>
              <button 
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4 pt-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Nama Impian / Tujuan</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tabungan Nikah, Dana Darurat, Laptop Baru"
                  className="w-full p-2.5 bg-slate-800 rounded-xl border border-slate-700 focus:border-sky-500 outline-none text-slate-200 placeholder-slate-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                    <option value="Keuangan">Keuangan</option>
                    <option value="Gadget">Gadget</option>
                    <option value="Travel">Travel</option>
                    <option value="Kendaraan">Kendaraan</option>
                    <option value="Impian">Impian</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Saldo Awal (Opsional)</label>
                  <input
                    type="number"
                    placeholder="e.g. 1000000"
                    className="w-full p-2.5 bg-slate-800 rounded-xl border border-slate-700 focus:border-sky-500 outline-none text-slate-200 font-mono"
                    value={saved}
                    onChange={(e) => setSaved(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Target Nominal Akhir (IDR)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-500 font-extrabold text-sm font-mono">Rp</span>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 15000000"
                    className="w-full p-2.5 pl-10 bg-slate-800 rounded-xl border border-slate-700 focus:border-sky-500 outline-none text-slate-200 font-mono text-sm"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full p-3 bg-sky-500 hover:bg-sky-600 text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-sky-500/10 mt-2"
              >
                Simpan Target Tabungan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Target */}
      {editingGoal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h3 className="font-bold text-slate-200 text-lg">Edit Target Tabungan</h3>
              <button 
                onClick={() => setEditingGoal(null)}
                className="text-slate-400 hover:text-slate-200 p-1 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateSubmit} className="space-y-4 pt-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Nama Impian / Tujuan</label>
                <input
                  type="text"
                  required
                  className="w-full p-2.5 bg-slate-800 rounded-xl border border-slate-700 focus:border-sky-500 outline-none text-slate-200"
                  value={editingGoal.name}
                  onChange={(e) => setEditingGoal({ ...editingGoal, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Kategori</label>
                  <select
                    className="w-full p-2.5 bg-slate-800 rounded-xl border border-slate-700 focus:border-sky-500 outline-none text-slate-200 cursor-pointer"
                    value={editingGoal.category}
                    onChange={(e) => setEditingGoal({ ...editingGoal, category: e.target.value })}
                  >
                    <option value="Keuangan">Keuangan</option>
                    <option value="Gadget">Gadget</option>
                    <option value="Travel">Travel</option>
                    <option value="Kendaraan">Kendaraan</option>
                    <option value="Impian">Impian</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Saldo Terkumpul</label>
                  <input
                    type="number"
                    required
                    className="w-full p-2.5 bg-slate-800 rounded-xl border border-slate-700 focus:border-sky-500 outline-none text-slate-200 font-mono"
                    value={editingGoal.saved}
                    onChange={(e) => setEditingGoal({ ...editingGoal, saved: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Target Akhir (IDR)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-500 font-extrabold text-sm font-mono">Rp</span>
                  <input
                    type="number"
                    required
                    className="w-full p-2.5 pl-10 bg-slate-800 rounded-xl border border-slate-700 focus:border-sky-500 outline-none text-slate-200 font-mono text-sm"
                    value={editingGoal.target}
                    onChange={(e) => setEditingGoal({ ...editingGoal, target: Number(e.target.value) })}
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

      {/* FULL-SCREEN TWO-STEP DELETION POPUP FOR SAVINGS */}
      {goalToDelete && (
        <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
          <div className="max-w-xl w-full text-center space-y-8 animate-in zoom-in-95 duration-300">
            
            {/* Warning Giant Icon */}
            <div className="mx-auto w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 animate-pulse">
              <AlertTriangle className="w-12 h-12" />
            </div>

            {/* Step 1 Content */}
            {deleteStep === 1 ? (
              <div className="space-y-4">
                <span className="text-[11px] font-extrabold tracking-widest text-rose-500 uppercase">Langkah 1 dari 2: Peringatan Keamanan</span>
                <h3 className="text-3xl font-black text-white tracking-tight">Hapus Target Tabungan Aktif</h3>
                <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
                  Anda akan menghapus target tabungan <span className="text-white font-bold">&quot;{goalToDelete.name}&quot;</span> dengan saldo terkumpul saat ini sebesar <span className="text-amber-400 font-bold font-mono">{formatRupiah(goalToDelete.saved)}</span> secara permanen. Tindakan ini tidak dapat dibatalkan.
                </p>
                <div className="pt-6 flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
                  <button
                    onClick={() => setDeleteStep(2)}
                    className="flex-1 p-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Lanjutkan Verifikasi
                  </button>
                  <button
                    onClick={() => setGoalToDelete(null)}
                    className="flex-1 p-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Batalkan Penghapusan
                  </button>
                </div>
              </div>
            ) : (
              /* Step 2 Content */
              <div className="space-y-4">
                <span className="text-[11px] font-extrabold tracking-widest text-rose-500 uppercase">Langkah 2 dari 2: Otorisasi Penghapusan</span>
                <h3 className="text-3xl font-black text-white tracking-tight">Keluarkan Saldo atau Hapus Permanen?</h3>
                <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
                  Otorisasi final untuk menghapus tabungan. Data target beserta log pencapaian tabungan ini akan dihapus permanen dari sistem browser Anda.
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
              IP: Localhost | Target: {goalToDelete.target} | ID: {goalToDelete.id}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
