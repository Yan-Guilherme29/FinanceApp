import AsyncStorage from '@react-native-async-storage/async-storage';

const TRANSACTIONS_KEY = 'transactions';

// Busca todas as transações
export async function getTransactions() {
  const data = await AsyncStorage.getItem(TRANSACTIONS_KEY);
  return data ? JSON.parse(data) : [];
}

// Salva a lista inteira
async function saveTransactions(transactions) {
  await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
}

// Inicializa (não precisa fazer nada no AsyncStorage, mas mantemos a função)
export function initDatabase() {
  // Sem necessidade de setup no AsyncStorage
}

// Adiciona uma transação
export async function addTransaction(type, amount, category, description, currency, date) {
  const transactions = await getTransactions();
  const newTransaction = {
    id: Date.now().toString(),
    type,
    amount,
    category,
    description,
    currency,
    date,
    created_at: new Date().toISOString(),
  };
  const updated = [newTransaction, ...transactions];
  await saveTransactions(updated);
  return newTransaction.id;
}

// Deleta uma transação pelo id
export async function deleteTransaction(id) {
  const transactions = await getTransactions();
  const updated = transactions.filter(t => t.id !== id);
  await saveTransactions(updated);
}

// Resumo mensal (ganhos, gastos, saldo)
export async function getMonthlySummary(year, month) {
  const transactions = await getTransactions();
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const end = `${year}-${String(month).padStart(2, '0')}-31`;

  const filtered = transactions.filter(t => t.date >= start && t.date <= end);

  const income = filtered
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = filtered
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return { income, expense, balance: income - expense };
}

// Gastos por categoria no mês
export async function getExpensesByCategory(year, month) {
  const transactions = await getTransactions();
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const end = `${year}-${String(month).padStart(2, '0')}-31`;

  const filtered = transactions.filter(
    t => t.type === 'expense' && t.date >= start && t.date <= end
  );

  const grouped = {};
  filtered.forEach(t => {
    grouped[t.category] = (grouped[t.category] || 0) + t.amount;
  });

  return Object.entries(grouped)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}