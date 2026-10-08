import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbDir = path.resolve(process.cwd(), '../database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'smart_lims.db');
export const db = new Database(dbPath);

// Enable WAL mode for high performance
db.pragma('journal_mode = WAL');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('Student', 'Faculty', 'Admin'))
    );

    CREATE TABLE IF NOT EXISTS machines (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      cpu_capacity_ghz REAL NOT NULL,
      ram_mb INTEGER NOT NULL,
      disk_gb INTEGER NOT NULL,
      current_cpu_usage REAL DEFAULT 0,
      current_memory_usage INTEGER DEFAULT 0,
      current_disk_usage INTEGER DEFAULT 0,
      is_available INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS processes (
      pid TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      arrival_time INTEGER NOT NULL,
      burst_time INTEGER NOT NULL,
      priority INTEGER NOT NULL,
      state TEXT NOT NULL,
      memory_req INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS licenses (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      total_licenses INTEGER NOT NULL,
      allocated_licenses INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      level TEXT NOT NULL,
      module TEXT NOT NULL,
      message TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS simulation_runs (
      id TEXT PRIMARY KEY,
      job_name TEXT NOT NULL,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      status TEXT NOT NULL,
      result_json TEXT NOT NULL
    );
  `);

  // Seed default data if empty
  const userCount = db.prepare('SELECT count(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    db.prepare(`INSERT INTO users (id, name, email, role) VALUES (?, ?, ?, ?)`).run('U1', 'Dr. Alan Turing', 'turing@lab.edu', 'Faculty');
    db.prepare(`INSERT INTO users (id, name, email, role) VALUES (?, ?, ?, ?)`).run('U2', 'Ada Lovelace', 'ada@lab.edu', 'Student');

    db.prepare(`INSERT INTO machines (id, name, cpu_capacity_ghz, ram_mb, disk_gb) VALUES (?, ?, ?, ?, ?)`).run('PC-01', 'Workstation Alpha', 3.8, 16384, 512);
    db.prepare(`INSERT INTO machines (id, name, cpu_capacity_ghz, ram_mb, disk_gb) VALUES (?, ?, ?, ?, ?)`).run('PC-02', 'Workstation Beta', 3.6, 16384, 512);
    db.prepare(`INSERT INTO machines (id, name, cpu_capacity_ghz, ram_mb, disk_gb) VALUES (?, ?, ?, ?, ?)`).run('PC-03', 'Workstation Gamma', 4.2, 32768, 1024);

    db.prepare(`INSERT INTO licenses (id, name, total_licenses, allocated_licenses) VALUES (?, ?, ?, ?)`).run('LIC-MATLAB', 'MATLAB R2026a', 5, 3);
    db.prepare(`INSERT INTO licenses (id, name, total_licenses, allocated_licenses) VALUES (?, ?, ?, ?)`).run('LIC-ANSYS', 'ANSYS Multiphysics', 3, 2);

    db.prepare(`INSERT INTO logs (id, level, module, message) VALUES (?, ?, ?, ?)`).run('LOG-1', 'INFO', 'SYSTEM', 'Smart-LIMS Database Initialized Successfully.');
  }
}
