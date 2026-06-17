import * as SecureStore from 'expo-secure-store';

const TRANSACTIONS_KEY = 'financeapp_transactions';
const CATEGORIES_KEY = 'financeapp_categories';
const BUDGETS_KEY = 'financeapp_budgets';

export function initDatabase() { }

// ─── Helpers de semana ─────────────────────────────────────

// Retorna segunda-feira da semana de uma data
export function getWeekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay(); // 0=dom, 1=seg...
  const diff = day === 0 ? -6 : 1 - day; // ajusta para segunda
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Retorna domingo da semana
export function getWeekEnd(date = new Date()) {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

// Formata data para string AAAA-MM-DD
export function toDateString(date) {
  return date.toISOString().split('T')[0];
}

// Retorna label da semana ex: "9 - 15 Jun"
export function getWeekLabel(weekStart) {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const startDay = start.getDate();
  const endDay = end.getDate();
  const month = months[end.getMonth()];
  const year = end.getFullYear();

  if (start.getMonth() === end.getMonth()) {
    return `${startDay} - ${endDay} ${month} ${year}`;
  }
  return `${startDay} ${months[start.getMonth()]} - ${endDay} ${month} ${year}`;
}

// Navega semanas: offset = -1 (anterior), +1 (próxima)
export function offsetWeek(weekStart, offset) {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + offset * 7);
  return d;
}

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

export async function getWeeklySummary(weekStart) {
  const transactions = await getAllTransactions();
  const start = toDateString(getWeekStart(new Date(weekStart)));
  const end = toDateString(getWeekEnd(new Date(weekStart)));

  const filtered = transactions.filter(t => t.date >= start && t.date <= end);
  const income = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  return { income, expense, balance: income - expense };
}

export async function getExpensesByCategory(weekStart) {
  const transactions = await getAllTransactions();
  const start = toDateString(getWeekStart(new Date(weekStart)));
  const end = toDateString(getWeekEnd(new Date(weekStart)));

  const filtered = transactions.filter(
    t => t.type === 'expense' && t.date >= start && t.date <= end
  );

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

// ─── Orçamentos (fixo, vale toda semana) ──────────────────

export async function getBudgets() {
  try {
    const data = await SecureStore.getItemAsync(BUDGETS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
}

export async function setBudget(category, amount) {
  const budgets = await getBudgets();
  budgets[category] = amount;
  await SecureStore.setItemAsync(BUDGETS_KEY, JSON.stringify(budgets));
}

export async function deleteBudget(category) {
  const budgets = await getBudgets();
  delete budgets[category];
  await SecureStore.setItemAsync(BUDGETS_KEY, JSON.stringify(budgets));
}

// ─── Limpar dados ──────────────────────────────────────────

export async function clearAllData() {
  await SecureStore.deleteItemAsync(TRANSACTIONS_KEY);
}