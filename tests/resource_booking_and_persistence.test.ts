import { describe, it, expect } from 'vitest';
import { ResourceManager } from '../backend/src/core/resource/ResourceManager.js';
import { SynchronizationEngine } from '../backend/src/core/sync/SynchronizationEngine.js';
import { recordBooking, getRecentBookings, logEvent, getRecentLogs } from '../backend/src/database/db.js';

describe('Resource Management & Double-Booking Prevention', () => {
  const resourceManager = new ResourceManager();

  it('prevents double-booking of workstations and software licenses', () => {
    // Attempt booking an existing machine
    const firstBooking = resourceManager.bookResource({
      machineId: 'PC-02',
      userName: 'Ada Lovelace',
      pid: 'P101',
      memoryMB: 1024,
    });

    expect(firstBooking.success).toBe(true);
    expect(firstBooking.bookingId).toBeDefined();

    // Verify machine status changed to OCCUPIED
    const machine = resourceManager.getMachines().find(m => m.id === 'PC-02');
    expect(machine).toBeDefined();
    expect(machine!.status).toBe('OCCUPIED');
    expect(machine!.assignedUser).toBe('Ada Lovelace');

    // Attempt second booking by another user on the same machine (must fail with double booking prevention)
    const conflictingBooking = resourceManager.bookResource({
      machineId: 'PC-02',
      userName: 'Alan Turing',
      pid: 'P102',
      memoryMB: 1024,
    });

    expect(conflictingBooking.success).toBe(false);
    expect(conflictingBooking.reason).toContain('Double booking prevented');

    // Cancel first booking to restore machine availability
    const cancelRes = resourceManager.cancelBooking({
      machineId: 'PC-02',
      pid: 'P101',
      userName: 'Ada Lovelace',
    });
    expect(cancelRes.success).toBe(true);

    const releasedMachine = resourceManager.getMachines().find(m => m.id === 'PC-02');
    expect(releasedMachine!.status).toBe('AVAILABLE');
    expect(releasedMachine!.assignedUser).toBeUndefined();
  });

  it('records audit logs for bookings, rejections, and cancellations', () => {
    const logs = resourceManager.getAuditLogs();
    expect(logs.length).toBeGreaterThan(0);
    // Audit logs must contain timestamps and action types
    expect(logs.some(l => l.action.includes('BOOKING'))).toBe(true);
  });
});

describe('Concurrency Engine: Workstation Booking Race Condition vs Mutex', () => {
  const sync = new SynchronizationEngine();

  it('demonstrates race condition with lost updates vs Mutex serialized booking', () => {
    const raceResult = sync.runBookingRaceSimulation('PC-05', 'Server Node Epsilon');
    expect(raceResult.resourceId).toBe('PC-05');

    // In unsynchronized race: conflicting requests lead to race condition and double booking bug
    expect(raceResult.unsynchronized.doubleBookingDetected).toBe(true);
    expect(raceResult.unsynchronized.grantedBookings.length).toBe(2);

    // In Mutex lock: atomic serialization grants resource to first request and safely rejects competing ones
    expect(raceResult.synchronized.doubleBookingDetected).toBe(false);
    expect(raceResult.synchronized.grantedBookings.length).toBe(1);
    expect(raceResult.synchronized.rejectedBookings.length).toBe(1);
  });
});

describe('Database Persistence & Audit Integrity', () => {
  it('persists and retrieves booking records from SQLite', () => {
    recordBooking('PC-03', 'LAB_WORKSTATION', 'Ada Lovelace', 'P303', 'GRANTED', 'Test booking record');
    const bookings = getRecentBookings(20);
    expect(bookings.some(b => b.resource_id === 'PC-03' && b.user_name === 'Ada Lovelace')).toBe(true);
  });

  it('persists and retrieves audit logs from SQLite', () => {
    logEvent('INFO', 'TEST_SUITE', 'Automated persistence verification log');
    const logs = getRecentLogs(20);
    expect(logs.some(l => l.module === 'TEST_SUITE')).toBe(true);
  });
});
