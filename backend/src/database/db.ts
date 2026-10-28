import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let dbDir = process.env.VERCEL ? '/tmp' : path.resolve(process.cwd(), 'database');
if (!fs.existsSync(dbDir)) {
  try {
    fs.mkdirSync(dbDir, { recursive: true });
  } catch {
    // If running with cwd = backend, try ../database
    dbDir = path.resolve(process.cwd(), '../database');
    try {
      if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
    } catch {
      dbDir = '/tmp';
    }
  }
}

const dbPath = path.join(dbDir, 'smart_lims.db');
export const db = new Database(dbPath);

// Enable WAL mode for high performance
try {
  db.pragma('journal_mode = WAL');
} catch (e) {
  // Ignore in serverless or read-only test
}

// Automatically initialize schema and default seeds on load
try {
  initDatabase();
} catch (err) {
  // Ignore if already initialized
}


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
      is_available INTEGER DEFAULT 1,
      assigned_user TEXT,
      assigned_pid TEXT
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

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      resource_id TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      user_name TEXT NOT NULL,
      pid TEXT NOT NULL,
      status TEXT NOT NULL,
      reason TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
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
    db.prepare(`INSERT INTO users (id, name, email, role) VALUES (?, ?, ?, ?)`).run('U3', 'Claude Shannon', 'shannon@lab.edu', 'Faculty');
    db.prepare(`INSERT INTO users (id, name, email, role) VALUES (?, ?, ?, ?)`).run('U4', 'Grace Hopper', 'hopper@lab.edu', 'Student');

    db.prepare(`INSERT INTO machines (id, name, cpu_capacity_ghz, ram_mb, disk_gb) VALUES (?, ?, ?, ?, ?)`).run('PC-01', 'Workstation Alpha', 3.8, 16384, 512);
    db.prepare(`INSERT INTO machines (id, name, cpu_capacity_ghz, ram_mb, disk_gb) VALUES (?, ?, ?, ?, ?)`).run('PC-02', 'Workstation Beta', 3.6, 16384, 512);
    db.prepare(`INSERT INTO machines (id, name, cpu_capacity_ghz, ram_mb, disk_gb) VALUES (?, ?, ?, ?, ?)`).run('PC-03', 'Workstation Gamma', 4.2, 32768, 1024);
    db.prepare(`INSERT INTO machines (id, name, cpu_capacity_ghz, ram_mb, disk_gb) VALUES (?, ?, ?, ?, ?)`).run('PC-04', 'Workstation Delta', 3.4, 8192, 256);
    db.prepare(`INSERT INTO machines (id, name, cpu_capacity_ghz, ram_mb, disk_gb) VALUES (?, ?, ?, ?, ?)`).run('PC-05', 'Server Node Epsilon', 4.5, 65536, 2048);

    db.prepare(`INSERT INTO licenses (id, name, total_licenses, allocated_licenses) VALUES (?, ?, ?, ?)`).run('LIC-MATLAB', 'MATLAB R2026a', 5, 2);
    db.prepare(`INSERT INTO licenses (id, name, total_licenses, allocated_licenses) VALUES (?, ?, ?, ?)`).run('LIC-ANSYS', 'ANSYS Multiphysics', 3, 1);
    db.prepare(`INSERT INTO licenses (id, name, total_licenses, allocated_licenses) VALUES (?, ?, ?, ?)`).run('LIC-CADENCE', 'Cadence EDA Suite', 2, 1);
    db.prepare(`INSERT INTO licenses (id, name, total_licenses, allocated_licenses) VALUES (?, ?, ?, ?)`).run('LIC-LABVIEW', 'LabVIEW Professional', 4, 1);

    logEvent('INFO', 'SYSTEM', 'Smart-LIMS Database Initialized Successfully.');
  }
}

export function logEvent(level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS', module: string, message: string): void {
  try {
    const id = 'LOG-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    db.prepare(`INSERT INTO logs (id, level, module, message) VALUES (?, ?, ?, ?)`).run(id, level, module, message);
  } catch (err) {
    console.error('Failed to write log to DB:', err);
  }
}

export function getRecentLogs(limit: number = 50): Array<{ id: string; timestamp: string; level: string; module: string; message: string }> {
  try {
    return db.prepare(`SELECT id, timestamp, level, module, message FROM logs ORDER BY rowid DESC LIMIT ?`).all(limit) as any;
  } catch {
    return [];
  }
}

export function recordBooking(resourceId: string, resourceType: string, userName: string, pid: string, status: string, reason?: string): void {
  try {
    const id = 'BK-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    db.prepare(`INSERT INTO bookings (id, resource_id, resource_type, user_name, pid, status, reason) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
      id,
      resourceId,
      resourceType,
      userName,
      pid,
      status,
      reason || ''
    );
  } catch (err) {
    console.error('Failed to record booking in DB:', err);
  }
}

export function getRecentBookings(limit: number = 50): Array<{ id: string; resource_id: string; resource_type: string; user_name: string; pid: string; status: string; reason: string; created_at: string }> {
  try {
    return db.prepare(`SELECT id, resource_id, resource_type, user_name, pid, status, reason, created_at FROM bookings ORDER BY rowid DESC LIMIT ?`).all(limit) as any;
  } catch {
    return [];
  }
}
