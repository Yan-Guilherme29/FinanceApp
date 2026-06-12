import { create } from 'zustand';
import {
  addTransaction,
  getTransactions,
  getMonthlySummary,
  getExpensesByCategory,
  deleteTransaction,
} from '../database/database';

const today = new Date();

const useStore = create((set, get) => ({
  transactions: [],
  summary: { income: 0, expense: 0, balance: 0 },
  expensesByCategory: [],
  currentYear: today.getFullYear(),
  currentMonth: today.getMonth() + 1,
  savingGoalPercent: 20,
  currency: 'EUR',

  loadData: async () => {
    const { currentYear, currentMonth } = get();
    const transactions = await getTransactions();
    const summary = await getMonthlySummary(currentYear, currentMonth);
    const expensesByCategory = await getExpensesByCategory(currentYear, currentMonth);
    set({ transactions, summary, expensesByCategory });
  },

  addTransaction: async (type, amount, category, description, currency, date) => {
    await addTransaction(type, amount, category, description, currency, date);
    await get().loadData();
  },

  deleteTransaction: async (id) => {
    await deleteTransaction(id);
    await get().loadData();
  },

  setMonth: (year, month) => {
    set({ currentYear: year, currentMonth: month });
    get().loadData();
  },

  setSavingGoal: (percent) => set({ savingGoalPercent: percent }),

  setCurrency: (currency) => set({ currency }),

  getSavingTarget: () => {
    const { summary, savingGoalPercent } = get();
    return (summary.income * savingGoalPercent) / 100;
  },
}));

export default useStore;
