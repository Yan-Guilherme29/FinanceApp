import * as SecureStore from 'expo-secure-store';

const TRANSACTIONS_KEY = 'financeapp_transactions';
const CATEGORIES_KEY = 'financeapp_categories';

export function initDatabase() {}

// ─── Transações ───────────────────────────────────────────

async function getAllTransactions() {
  try {
    const data = await SecureStore.getItemAsync(TRANSACTIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.log('getTransactions error:', e);
    return [];
  }
}

async function saveTransactions(transactions) {
  try {
    await SecureStore.setItemAsync(TRANSACTIONS_KEY, JSON.stringify(transactions));
  } catch (e) {
    console.log('saveTransactions error:', e);
  }
}

export async function getTransactions() {
  return await getAllTransactions();
}

export async function addTransaction(type, amount, category, description, currency, date) {
  const transactions = await getAllTransactions();
  const newTransaction = {
    id: Date.now().toString(),
    type, amount, category, description, currency, date,
    created_at: new Date().toISOString(),
  };
  await saveTransactions([newTransaction, ...transactions]);
  return newTransaction.id;
}

export async function deleteTransaction(id) {
  const transactions = await getAllTransactions();
  await saveTransactions(transactions.filter(t => t.id !== id));
}

export async function getMonthlySummary(year, month) {
  const transactions = await getAllTransactions();
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const end = `${year}-${String(month).padStart(2, '0')}-31`;
  const filtered = transactions.filter(t => t.date >= start && t.date <= end);
  const income = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  return { income, expense, balance: income - expense };
}

export async function getExpensesByCategory(year, month) {
  const transactions = await getAllTransactions();
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const end = `${year}-${String(month).padStart(2, '0')}-31`;
  const filtered = transactions.filter(t => t.type === 'expense' && t.date >= start && t.date <= end);
  const grouped = {};
  filtered.forEach(t => { grouped[t.category] = (grouped[t.category] || 0) + t.amount; });
  return Object.entries(grouped).map(([category, total]) => ({ category, total })).sort((a, b) => b.total - a.total);
}

// ─── Categorias personalizadas ─────────────────────────────

export async function getCustomCategories() {
  try {
    const data = await SecureStore.getItemAsync(CATEGORIES_KEY);
    return data ? JSON.parse(data) : { expense: [], income: [] };
  } catch (e) {
    return { expense: [], income: [] };
  }
}

export async function addCustomCategory(type, name, emoji) {
  const categories = await getCustomCategories();
  const newCat = { id: Date.now().toString(), name, emoji };
  categories[type] = [...categories[type], newCat];
  await SecureStore.setItemAsync(CATEGORIES_KEY, JSON.stringify(categories));
  return newCat;
}

export async function deleteCustomCategory(type, id) {
  const categories = await getCustomCategories();
  categories[type] = categories[type].filter(c => c.id !== id);
  await SecureStore.setItemAsync(CATEGORIES_KEY, JSON.stringify(categories));
}

export async function clearAllData() {
  await SecureStore.deleteItemAsync(TRANSACTIONS_KEY);
}