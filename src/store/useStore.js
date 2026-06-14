import { create } from 'zustand';
import {
  addTransaction as dbAddTransaction,
  getTransactions,
  getMonthlySummary,
  getExpensesByCategory,
  deleteTransaction as dbDeleteTransaction,
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
    try {
      const transactions = await getTransactions();
      const summary = await getMonthlySummary(currentYear, currentMonth);
      const expensesByCategory = await getExpensesByCategory(currentYear, currentMonth);
      set({ transactions, summary, expensesByCategory });
    } catch (e) {
      console.log('Erro ao carregar dados:', e);
    }
  },

  addTransaction: async (type, amount, category, description, currency, date) => {
    try {
      await dbAddTransaction(type, amount, category, description, currency, date);
      // Aguarda o loadData terminar antes de atualizar o estado
      const { currentYear, currentMonth } = get();
      const transactions = await getTransactions();
      const summary = await getMonthlySummary(currentYear, currentMonth);
      const expensesByCategory = await getExpensesByCategory(currentYear, currentMonth);
      set({ transactions, summary, expensesByCategory });
    } catch (e) {
      console.log('Erro ao adicionar transação:', e);
    }
  },

  deleteTransaction: async (id) => {
    try {
      await dbDeleteTransaction(id);
      const { currentYear, currentMonth } = get();
      const transactions = await getTransactions();
      const summary = await getMonthlySummary(currentYear, currentMonth);
      const expensesByCategory = await getExpensesByCategory(currentYear, currentMonth);
      set({ transactions, summary, expensesByCategory });
    } catch (e) {
      console.log('Erro ao deletar transação:', e);
    }
  },

  setMonth: async (year, month) => {
    set({ currentYear: year, currentMonth: month });
    try {
      const transactions = await getTransactions();
      const summary = await getMonthlySummary(year, month);
      const expensesByCategory = await getExpensesByCategory(year, month);
      set({ transactions, summary, expensesByCategory });
    } catch (e) {
      console.log('Erro ao mudar mês:', e);
    }
  },

  setSavingGoal: (percent) => set({ savingGoalPercent: percent }),

  setCurrency: (currency) => set({ currency }),

  getSavingTarget: () => {
    const { summary, savingGoalPercent } = get();
    return (summary.income * savingGoalPercent) / 100;
  },
}));

export default useStore;