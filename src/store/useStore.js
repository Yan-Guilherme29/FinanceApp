import { create } from 'zustand';
import {
  addTransaction as dbAddTransaction,
  getTransactions,
  getWeeklySummary,
  getExpensesByCategory,
  deleteTransaction as dbDeleteTransaction,
  getWeekStart,
  offsetWeek,
} from '../database/database';

const useStore = create((set, get) => ({
  transactions: [],
  summary: { income: 0, expense: 0, balance: 0 },
  expensesByCategory: [],
  currentWeekStart: getWeekStart(new Date()), // Date object
  savingGoalPercent: 20,
  currency: 'EUR',

  loadData: async () => {
    const { currentWeekStart } = get();
    try {
      const transactions = await getTransactions();
      const summary = await getWeeklySummary(currentWeekStart);
      const expensesByCategory = await getExpensesByCategory(currentWeekStart);
      set({ transactions, summary, expensesByCategory });
    } catch (e) {
      console.log('Erro ao carregar dados:', e);
    }
  },

  addTransaction: async (type, amount, category, description, currency, date) => {
    try {
      await dbAddTransaction(type, amount, category, description, currency, date);
      const { currentWeekStart } = get();
      const transactions = await getTransactions();
      const summary = await getWeeklySummary(currentWeekStart);
      const expensesByCategory = await getExpensesByCategory(currentWeekStart);
      set({ transactions, summary, expensesByCategory });
    } catch (e) {
      console.log('Erro ao adicionar transação:', e);
    }
  },

  deleteTransaction: async (id) => {
    try {
      await dbDeleteTransaction(id);
      const { currentWeekStart } = get();
      const transactions = await getTransactions();
      const summary = await getWeeklySummary(currentWeekStart);
      const expensesByCategory = await getExpensesByCategory(currentWeekStart);
      set({ transactions, summary, expensesByCategory });
    } catch (e) {
      console.log('Erro ao deletar transação:', e);
    }
  },

  prevWeek: async () => {
    const { currentWeekStart } = get();
    const newWeek = offsetWeek(currentWeekStart, -1);
    set({ currentWeekStart: newWeek });
    const transactions = await getTransactions();
    const summary = await getWeeklySummary(newWeek);
    const expensesByCategory = await getExpensesByCategory(newWeek);
    set({ transactions, summary, expensesByCategory });
  },

  nextWeek: async () => {
    const { currentWeekStart } = get();
    const now = getWeekStart(new Date());
    if (currentWeekStart >= now) return; // não avança além da semana atual
    const newWeek = offsetWeek(currentWeekStart, 1);
    set({ currentWeekStart: newWeek });
    const transactions = await getTransactions();
    const summary = await getWeeklySummary(newWeek);
    const expensesByCategory = await getExpensesByCategory(newWeek);
    set({ transactions, summary, expensesByCategory });
  },

  setSavingGoal: (percent) => set({ savingGoalPercent: percent }),
  setCurrency: (currency) => set({ currency }),

  getSavingTarget: () => {
    const { summary, savingGoalPercent } = get();
    return (summary.income * savingGoalPercent) / 100;
  },
}));

export default useStore;