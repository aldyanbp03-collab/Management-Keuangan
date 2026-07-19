import { User, IncomeTransaction, SavingsGoal, ExpenseTransaction, CreditCard } from './types';

export const DEFAULT_USERS: User[] = [
  {
    id: 'user_aldyan',
    name: 'Aldyan BP',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    role: 'Premium Member'
  },
  {
    id: 'user_budi',
    name: 'Budi Santoso',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    role: 'Standard Member'
  },
  {
    id: 'user_siti',
    name: 'Siti Rahma',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    role: 'VIP Member'
  }
];

export interface UserFinancialState {
  incomeTransactions: IncomeTransaction[];
  savingsGoals: SavingsGoal[];
  expenses: ExpenseTransaction[];
  creditCards: CreditCard[];
}

export const DEFAULT_FINANCIALS: Record<string, UserFinancialState> = {
  user_aldyan: {
    incomeTransactions: [
      { id: 'inc_1', date: '2026-07-15', source: 'Gaji Bulanan', category: 'Salary', amount: 8500000 },
      { id: 'inc_2', date: '2026-07-12', source: 'UI/UX Design Freelance', category: 'Freelance', amount: 3200000 },
      { id: 'inc_3', date: '2026-07-08', source: 'Dividen Saham', category: 'Investment', amount: 750000 },
      { id: 'inc_4', date: '2026-06-25', source: 'Gaji Bulanan', category: 'Salary', amount: 8500000 },
      { id: 'inc_5', date: '2026-06-15', source: 'Design Consultation', category: 'Freelance', amount: 2100000 },
      { id: 'inc_6', date: '2026-05-25', source: 'Gaji Bulanan', category: 'Salary', amount: 8500000 },
      { id: 'inc_7', date: '2026-04-25', source: 'Gaji Bulanan', category: 'Salary', amount: 8000000 },
      { id: 'inc_8', date: '2026-03-25', source: 'Gaji Bulanan', category: 'Salary', amount: 8000000 },
      { id: 'inc_9', date: '2026-02-25', source: 'Gaji Bulanan', category: 'Salary', amount: 8000000 }
    ],
    savingsGoals: [
      { id: 'sav_1', name: 'Emergency Fund', target: 20000000, saved: 15000000, category: 'Keuangan' },
      { id: 'sav_2', name: 'New MacBook Pro M4', target: 45000000, saved: 13500000, category: 'Gadget' },
      { id: 'sav_3', name: 'Tokyo Vacation 2027', target: 15000000, saved: 7200000, category: 'Travel' }
    ],
    expenses: [
      { id: 'exp_1', date: '2026-07-19', time: '14:20', title: 'Makan Siang - Ramen Ya', category: 'Makanan & Minuman', amount: 120000, paymentMethod: 'cash' },
      { id: 'exp_2', date: '2026-07-19', time: '09:15', title: 'Bensin Pertamax', category: 'Transportasi', amount: 330000, paymentMethod: 'cash' },
      { id: 'exp_3', date: '2026-07-18', time: '18:30', title: 'Belanja Mingguan Supermarket', category: 'Kebutuhan Harian', amount: 450000, paymentMethod: 'credit_card', creditCardId: 'card_1' },
      { id: 'exp_4', date: '2026-07-17', time: '10:00', title: 'Amazon Web Services', category: 'Software', amount: 1250000, paymentMethod: 'credit_card', creditCardId: 'card_1' },
      { id: 'exp_5', date: '2026-07-16', time: '21:00', title: 'Netflix Subscription', category: 'Hiburan', amount: 186000, paymentMethod: 'credit_card', creditCardId: 'card_2' },
      { id: 'exp_6', date: '2026-07-15', time: '13:00', title: 'Pembelian Kopi Starbucks', category: 'Makanan & Minuman', amount: 65000, paymentMethod: 'savings', savingsGoalId: 'sav_3' }
    ],
    creditCards: [
      { id: 'card_1', cardName: 'UTAMA PLATINUM', cardNumber: '**** **** **** 8829', cardholder: 'ALDYAN BP', expiryDate: '09/28', limit: 50000000, currentSpend: 32500000, totalBill: 12500000, cardType: 'visa' },
      { id: 'card_2', cardName: 'GOLD MASTER', cardNumber: '**** **** **** 4321', cardholder: 'ALDYAN BP', expiryDate: '11/30', limit: 30000000, currentSpend: 4200000, totalBill: 186000, cardType: 'mastercard' }
    ]
  },
  user_budi: {
    incomeTransactions: [
      { id: 'inc_b1', date: '2026-07-15', source: 'Gaji Kantor', category: 'Salary', amount: 6000000 },
      { id: 'inc_b2', date: '2026-07-10', source: 'Jasa Edit Video', category: 'Freelance', amount: 1500000 }
    ],
    savingsGoals: [
      { id: 'sav_b1', name: 'Tabungan Nikah', target: 50000000, saved: 12000000, category: 'Masa Depan' },
      { id: 'sav_b2', name: 'DP Motor Matic', target: 8000000, saved: 4000000, category: 'Kendaraan' }
    ],
    expenses: [
      { id: 'exp_b1', date: '2026-07-19', time: '12:00', title: 'Nasi Padang Spesial', category: 'Makanan & Minuman', amount: 35000, paymentMethod: 'cash' },
      { id: 'exp_b2', date: '2026-07-18', time: '15:45', title: 'Servis Motor Rutin', category: 'Transportasi', amount: 250000, paymentMethod: 'cash' }
    ],
    creditCards: [
      { id: 'card_b1', cardName: 'CIMB NIAGA VISA', cardNumber: '**** **** **** 9191', cardholder: 'BUDI SANTOSO', expiryDate: '05/29', limit: 15000000, currentSpend: 3000000, totalBill: 750000, cardType: 'visa' }
    ]
  },
  user_siti: {
    incomeTransactions: [
      { id: 'inc_s1', date: '2026-07-15', source: 'Omset Toko Online', category: 'Business', amount: 22000000 },
      { id: 'inc_s2', date: '2026-07-05', source: 'Royalti Buku', category: 'Investment', amount: 4500000 }
    ],
    savingsGoals: [
      { id: 'sav_s1', name: 'Dana Haji', target: 100000000, saved: 45000000, category: 'Ibadah' },
      { id: 'sav_s2', name: 'Investasi Emas Antam', target: 25000000, saved: 18000000, category: 'Emas' }
    ],
    expenses: [
      { id: 'exp_s1', date: '2026-07-19', time: '19:30', title: 'Makan Malam Seafood', category: 'Makanan & Minuman', amount: 350000, paymentMethod: 'cash' },
      { id: 'exp_s2', date: '2026-07-17', time: '08:00', title: 'Grosir Stok Toko', category: 'Bisnis', amount: 5000000, paymentMethod: 'credit_card', creditCardId: 'card_s1' }
    ],
    creditCards: [
      { id: 'card_s1', cardName: 'MANDIRI SIGNATURE', cardNumber: '**** **** **** 7777', cardholder: 'SITI RAHMA', expiryDate: '12/32', limit: 100000000, currentSpend: 15000000, totalBill: 5000000, cardType: 'mastercard' }
    ]
  }
};
