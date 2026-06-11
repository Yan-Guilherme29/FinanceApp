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
  // Estado
  transactions: [],
  summary: { income: 0, expense: 0, balance: 0 },
  expensesByCategory: [],
  currentYear: today.getFullYear(),
  currentMonth: today.getMonth() + 1,
  savingGoalPercent: 20, // meta padrão: guardar 20% do que ganha
  currency: 'EUR', // moeda padrão (ela mora fora)

  // Carrega tudo do banco
  loadData: () => {
    const { currentYear, currentMonth } = get();
    const transactions = getTransactions();
    const summary = getMonthlySummary(currentYear, currentMonth);
    const expensesByCategory = getExpensesByCategory(currentYear, currentMonth);
    set({ transactions, summary, expensesByCategory });
  },

  // Adiciona uma transação e recarrega
  addTransaction: (type, amount, category, description, currency, date) => {
    addTransaction(type, amount, category, description, currency, date);
    get().loadData();
  },

  // Deleta uma transação e recarrega
  deleteTransaction: (id) => {
    deleteTransaction(id);
    get().loadData();
  },

  // Muda o mês visualizado
  setMonth: (year, month) => {
    set({ currentYear: year, currentMonth: month });
    get().loadData();
  },

  // Altera a meta de poupança
  setSavingGoal: (percent) => set({ savingGoalPercent: percent }),

  // Altera a moeda principal
  setCurrency: (currency) => set({ currency }),

  // Calcula quanto ela deveria guardar esse mês
  getSavingTarget: () => {
    const { summary, savingGoalPercent } = get();
    return (summary.income * savingGoalPercent) / 100;
  },
}));

export default useStore;
