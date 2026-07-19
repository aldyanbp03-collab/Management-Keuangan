import { useState, useRef, useEffect, FormEvent, MouseEvent } from 'react';
import { User } from '../types';
import { Users, ChevronDown, Check, Sparkles, Plus, Trash2, X, AlertTriangle } from 'lucide-react';

interface UserSwitcherProps {
  currentUser: User;
  allUsers: User[];
  onUserChange: (user: User) => void;
  onAddUser: (name: string, role: string) => void;
  onDeleteUser: (userId: string) => void;
}

export default function UserSwitcher({
  currentUser,
  allUsers,
  onUserChange,
  onAddUser,
  onDeleteUser,
}: UserSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Standard Member');
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside as any);
    return () => document.removeEventListener('mousedown', handleClickOutside as any);
  }, []);

  // Helper to extract initials
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .trim()
      .split(/\s+/)
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddUser(newName.trim(), newRole);
    setNewName('');
    setNewRole('Standard Member');
    setIsAddOpen(false);
  };

  const confirmDeleteUser = (user: User, e: MouseEvent) => {
    e.stopPropagation(); // prevent switching user when clicking delete
    setUserToDelete(user);
  };

  const executeDeleteUser = () => {
    if (userToDelete) {
      onDeleteUser(userToDelete.id);
      setUserToDelete(null);
    }
  };

  return (
    <div className="relative z-40" ref={dropdownRef} id="user-switcher-container">
      {/* Active Profile Pill (Name Initials, No Photo) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 px-3 rounded-2xl border border-slate-800 hover:border-sky-500/50 hover:bg-slate-800/40 transition-all cursor-pointer bg-slate-900"
        id="user-switcher-btn"
      >
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center font-black text-sm tracking-tight border border-sky-500/30 shadow-sm">
            {getInitials(currentUser.name)}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-sky-500 border border-slate-900 rounded-full"></div>
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-[10px] text-slate-400 font-extrabold tracking-wider uppercase leading-none">{currentUser.role}</div>
          <div className="text-sm font-semibold text-slate-200 flex items-center gap-1 mt-0.5">
            {currentUser.name}
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 sm:hidden" />
      </button>

      {/* Dropdown switch menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-2 border-b border-slate-800 flex justify-between items-center">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-sky-400" /> Daftar Pengguna
            </span>
            <button
              onClick={() => {
                setIsAddOpen(true);
                setIsOpen(false);
              }}
              className="p-1 rounded-lg bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20 text-sky-400 transition-all text-[10px] font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Tambah Akun
            </button>
          </div>
          
          <div className="p-1.5 space-y-1 max-h-72 overflow-y-auto">
            {allUsers.map((user) => {
              const isSelected = user.id === currentUser.id;
              return (
                <div
                  key={user.id}
                  onClick={() => {
                    onUserChange(user);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-sky-500/10 text-sky-400 font-medium'
                      : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      isSelected ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {getInitials(user.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold truncate flex items-center gap-1">
                        {user.name}
                        {isSelected && <Sparkles className="w-3 h-3 text-sky-400 animate-pulse" />}
                      </div>
                      <div className="text-[10px] text-slate-400 leading-none mt-0.5">{user.role}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-1">
                    {isSelected && (
                      <span className="bg-sky-500/20 text-sky-400 p-0.5 rounded-full mr-1">
                        <Check className="w-3 h-3 font-bold" />
                      </span>
                    )}
                    {/* Delete Account Button (Can delete other accounts or any account if it is not the only account) */}
                    {allUsers.length > 1 && (
                      <button
                        onClick={(e) => confirmDeleteUser(user, e)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100"
                        title="Hapus akun ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="px-4 py-2 mt-1 bg-slate-950/80 text-[10px] text-center text-slate-500 rounded-b-xl leading-relaxed">
            Klik profil untuk berganti data instan <br /> tanpa menggunakan password.
          </div>
        </div>
      )}

      {/* MODAL: Tambah Akun Baru (Tanpa Password) */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h3 className="font-bold text-slate-200 text-base flex items-center gap-1.5">
                <Users className="w-4 h-4 text-sky-400" /> Tambah Akun Baru
              </h3>
              <button 
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="space-y-4 pt-4 text-xs font-semibold">
              <div className="p-3 bg-sky-500/10 border border-sky-500/10 rounded-2xl text-[10px] text-sky-300 leading-relaxed font-semibold">
                Akun baru akan dibuat secara instan tanpa memerlukan kata sandi. Anda bisa langsung beralih dan mengelola data keuangan mandiri.
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Nama Lengkap / Akun</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Riska Amalia"
                  className="w-full p-2.5 bg-slate-800 rounded-xl border border-slate-700 focus:border-sky-500 outline-none text-slate-200 placeholder-slate-500"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  maxLength={24}
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Tipe / Peran Pengguna</label>
                <select
                  className="w-full p-2.5 bg-slate-800 rounded-xl border border-slate-700 focus:border-sky-500 outline-none text-slate-200 cursor-pointer"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                >
                  <option value="Premium User">Premium User</option>
                  <option value="Standard Member">Standard Member</option>
                  <option value="Executive Officer">Executive Officer</option>
                  <option value="Family Manager">Family Manager</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full p-3 bg-sky-500 hover:bg-sky-600 text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-sky-500/10 mt-2"
              >
                Buat Akun Sekarang
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Konfirmasi Hapus Akun */}
      {userToDelete && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-800 animate-in zoom-in-95 duration-200 text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-bold text-slate-200 text-lg">Hapus Akun Ini?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Anda akan menghapus akun <span className="text-white font-bold">{userToDelete.name}</span>. Semua data keuangan, limit kartu, dan tabungan khusus akun ini akan dihapus permanen dari browser.
              </p>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={executeDeleteUser}
                className="flex-1 p-2.5 bg-rose-500 hover:bg-rose-600 text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Ya, Hapus Akun
              </button>
              <button
                onClick={() => setUserToDelete(null)}
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
