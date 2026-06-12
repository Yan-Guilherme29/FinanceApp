import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('finance.db');

export function initDatabase() {
  db.transaction(tx => {
    tx.executeSql(`
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
  });
}

export function addTransaction(type, amount, category, description, currency, date) {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO transactions (type, amount, category, description, currency, date) VALUES (?, ?, ?, ?, ?, ?)',
        [type, amount, category, description, currency, date],
        (_, result) => resolve(result.insertId),
        (_, error) => { reject(error); return false; }
      );
    });
  });
}

export function getTransactions() {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM transactions ORDER BY date DESC',
        [],
        (_, result) => resolve(result.rows._array),
        (_, error) => { reject(error); return false; }
      );
    });
  });
}

export function getMonthlySummary(year, month) {
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const end = `${year}-${String(month).padStart(2, '0')}-31`;

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        "SELECT type, COALESCE(SUM(amount), 0) as total FROM transactions WHERE date BETWEEN ? AND ? GROUP BY type",
        [start, end],
        (_, result) => {
          let income = 0, expense = 0;
          result.rows._array.forEach(row => {
            if (row.type === 'income') income = row.total;
            if (row.type === 'expense') expense = row.total;
          });
          resolve({ income, expense, balance: income - expense });
        },
        (_, error) => { reject(error); return false; }
      );
    });
  });
}

export function getExpensesByCategory(year, month) {
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const end = `${year}-${String(month).padStart(2, '0')}-31`;

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        "SELECT category, SUM(amount) as total FROM transactions WHERE type = 'expense' AND date BETWEEN ? AND ? GROUP BY category ORDER BY total DESC",
        [start, end],
        (_, result) => resolve(result.rows._array),
        (_, error) => { reject(error); return false; }
      );
    });
  });
}

export function deleteTransaction(id) {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM transactions WHERE id = ?',
        [id],
        (_, result) => resolve(result),
        (_, error) => { reject(error); return false; }
      );
    });
  });
}
