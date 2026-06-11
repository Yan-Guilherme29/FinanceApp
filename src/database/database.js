import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('finance.db');

export function initDatabase() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      currency TEXT DEFAULT 'BRL',
      date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

// Adiciona uma transação (gasto ou ganho)
export function addTransaction(type, amount, category, description, currency, date) {
  const stmt = db.prepareSync(
    'INSERT INTO transactions (type, amount, category, description, currency, date) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const result = stmt.executeSync(type, amount, category, description, currency, date);
  stmt.finalizeSync();
  return result.lastInsertRowId;
}

// Busca todas as transações ordenadas por data
export function getTransactions() {
  return db.getAllSync('SELECT * FROM transactions ORDER BY date DESC');
}

// Busca transações por período
export function getTransactionsByPeriod(startDate, endDate) {
  return db.getAllSync(
    'SELECT * FROM transactions WHERE date BETWEEN ? AND ? ORDER BY date DESC',
    startDate,
    endDate
  );
}

// Busca totais de ganhos e gastos do mês atual
export function getMonthlySummary(year, month) {
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const end = `${year}-${String(month).padStart(2, '0')}-31`;

  const income = db.getFirstSync(
    "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'income' AND date BETWEEN ? AND ?",
    start, end
  );
  const expense = db.getFirstSync(
    "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'expense' AND date BETWEEN ? AND ?",
    start, end
  );

  return {
    income: income?.total ?? 0,
    expense: expense?.total ?? 0,
    balance: (income?.total ?? 0) - (expense?.total ?? 0),
  };
}

// Busca gastos agrupados por categoria no mês
export function getExpensesByCategory(year, month) {
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const end = `${year}-${String(month).padStart(2, '0')}-31`;

  return db.getAllSync(
    "SELECT category, SUM(amount) as total FROM transactions WHERE type = 'expense' AND date BETWEEN ? AND ? GROUP BY category ORDER BY total DESC",
    start, end
  );
}

// Deleta uma transação
export function deleteTransaction(id) {
  db.runSync('DELETE FROM transactions WHERE id = ?', id);
}
