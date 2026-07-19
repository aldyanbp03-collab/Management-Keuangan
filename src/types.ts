export interface User {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

export interface IncomeTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  source: string; // e.g. "Gaji", "Freelance", "Investasi"
  category: string;
  amount: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  saved: number;
  category: string;
}

export interface ExpenseTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  title: string;
  category: string;
  amount: number;
  paymentMethod: 'cash' | 'savings' | 'credit_card';
  savingsGoalId?: string; // linked savings goal if paymentMethod is 'savings'
  creditCardId?: string; // linked card if paymentMethod is 'credit_card'
}

export interface CreditCard {
  id: string;
  cardName: string; // e.g. "Utama Platinum"
  cardNumber: string; // e.g. "**** **** **** 8829"
  cardholder: string;
  expiryDate: string; // MM/YY
  limit: number;
  currentSpend: number;
  totalBill: number;
  cardType: 'visa' | 'mastercard' | 'jcb';
}
