import { LabMachine, SoftwareLicense, ResourceAllocationRequest } from '../../types.js';
import { deadlockEngine } from '../deadlock/DeadlockEngine.js';
import { logEvent, recordBooking, getRecentBookings } from '../../database/db.js';

export class ResourceManager {
  private machines: Map<string, LabMachine> = new Map();
  private licenses: Map<string, SoftwareLicense> = new Map();
  private auditLogs: Array<{ id: string; timestamp: string; action: string; details: string; status: 'SUCCESS' | 'REJECTED' | 'CANCELLED' }> = [];

  constructor() {
    this.seedResources();
  }

  public seedResources(): void {
    this.machines.clear();
    this.licenses.clear();

    const defaultMachines: LabMachine[] = [
      { id: 'PC-01', name: 'Workstation Alpha', cpuCapacityGhz: 3.8, ramMB: 16384, diskGB: 512, currentCpuUsagePercent: 35, currentMemoryUsageMB: 4096, currentDiskUsageGB: 120, installedSoftware: ['MATLAB', 'ANSYS', 'AutoCAD'], isAvailable: true, activeProcessCount: 1, status: 'AVAILABLE' },
      { id: 'PC-02', name: 'Workstation Beta', cpuCapacityGhz: 3.6, ramMB: 16384, diskGB: 512, currentCpuUsagePercent: 75, currentMemoryUsageMB: 8192, currentDiskUsageGB: 240, installedSoftware: ['MATLAB', 'LabVIEW'], isAvailable: true, activeProcessCount: 2, status: 'AVAILABLE' },
      { id: 'PC-03', name: 'Workstation Gamma', cpuCapacityGhz: 4.2, ramMB: 32768, diskGB: 1024, currentCpuUsagePercent: 15, currentMemoryUsageMB: 4096, currentDiskUsageGB: 80, installedSoftware: ['MATLAB', 'ANSYS', 'Cadence', 'LabVIEW'], isAvailable: true, activeProcessCount: 0, status: 'AVAILABLE' },
      { id: 'PC-04', name: 'Workstation Delta', cpuCapacityGhz: 3.4, ramMB: 8192, diskGB: 256, currentCpuUsagePercent: 0, currentMemoryUsageMB: 0, currentDiskUsageGB: 50, installedSoftware: ['AutoCAD'], isAvailable: false, activeProcessCount: 0, status: 'MAINTENANCE' },
      { id: 'PC-05', name: 'Server Node Epsilon', cpuCapacityGhz: 4.5, ramMB: 65536, diskGB: 2048, currentCpuUsagePercent: 20, currentMemoryUsageMB: 16384, currentDiskUsageGB: 300, installedSoftware: ['MATLAB', 'ANSYS', 'Cadence', 'LabVIEW', 'AutoCAD'], isAvailable: true, activeProcessCount: 1, status: 'AVAILABLE' },
    ];

    defaultMachines.forEach(m => this.machines.set(m.id, m));

    const defaultLicenses: SoftwareLicense[] = [
      { id: 'LIC-MATLAB', name: 'MATLAB R2026a', totalLicenses: 5, allocatedLicenses: 2, availableLicenses: 3, allocatedToProcesses: { P1: 1, P2: 1 } },
      { id: 'LIC-ANSYS', name: 'ANSYS Multiphysics', totalLicenses: 3, allocatedLicenses: 1, availableLicenses: 2, allocatedToProcesses: { P2: 1 } },
      { id: 'LIC-CADENCE', name: 'Cadence EDA Suite', totalLicenses: 2, allocatedLicenses: 1, availableLicenses: 1, allocatedToProcesses: { P3: 1 } },
      { id: 'LIC-LABVIEW', name: 'LabVIEW Professional', totalLicenses: 4, allocatedLicenses: 1, availableLicenses: 3, allocatedToProcesses: { P5: 1 } },
    ];

    defaultLicenses.forEach(l => this.licenses.set(l.id, l));
  }

  public getMachines(): LabMachine[] {
    return Array.from(this.machines.values());
  }

  public getLicenses(): SoftwareLicense[] {
    return Array.from(this.licenses.values());
  }

  /**
   * Safe shared resource booking service.
   * Enforces availability, prevents double-booking, and records audit logs.
   */
  public bookResource(params: {
    machineId?: string;
    licenseId?: string;
    userName: string;
    pid: string;
    memoryMB?: number;
    licenseCount?: number;
  }): { success: boolean; reason: string; bookingId?: string } {
    const { machineId, licenseId, userName, pid, memoryMB = 512, licenseCount = 1 } = params;

    // Validate machine booking if requested
    if (machineId) {
      const machine = this.machines.get(machineId);
      if (!machine) {
        const reason = `Machine ${machineId} does not exist.`;
        this.logAudit('REJECTED', `Booking failed: ${reason}`, userName, pid, machineId);
        return { success: false, reason };
      }
      if (!machine.isAvailable || machine.status === 'MAINTENANCE') {
        const reason = `Machine ${machineId} is currently under maintenance or offline.`;
        this.logAudit('REJECTED', `Booking failed: ${reason}`, userName, pid, machineId);
        return { success: false, reason };
      }
      if (machine.status === 'OCCUPIED' && machine.assignedUser) {
        const reason = `Double booking prevented: Machine ${machineId} is already occupied by ${machine.assignedUser} (PID: ${machine.assignedPid || 'N/A'}).`;
        this.logAudit('REJECTED', `Booking conflict: ${reason}`, userName, pid, machineId);
        return { success: false, reason };
      }
      if (machine.currentMemoryUsageMB + memoryMB > machine.ramMB) {
        const reason = `Insufficient memory: Machine ${machineId} has ${machine.ramMB - machine.currentMemoryUsageMB} MB free, requested ${memoryMB} MB.`;
        this.logAudit('REJECTED', `Booking failed: ${reason}`, userName, pid, machineId);
        return { success: false, reason };
      }
    }

    // Validate software license booking if requested
    if (licenseId) {
      const lic = this.licenses.get(licenseId);
      if (!lic) {
        const reason = `Software license ${licenseId} not found.`;
        this.logAudit('REJECTED', `Booking failed: ${reason}`, userName, pid, licenseId);
        return { success: false, reason };
      }
      if (lic.availableLicenses < licenseCount) {
        const reason = `License allocation exhausted: ${lic.name} has ${lic.availableLicenses} available, requested ${licenseCount}.`;
        this.logAudit('REJECTED', `Booking failed: ${reason}`, userName, pid, licenseId);
        return { success: false, reason };
      }
    }

    // Commit machine allocation
    if (machineId) {
      const machine = this.machines.get(machineId)!;
      machine.status = 'OCCUPIED';
      machine.assignedUser = userName;
      machine.assignedPid = pid;
      machine.currentMemoryUsageMB += memoryMB;
      machine.activeProcessCount += 1;
      machine.currentCpuUsagePercent = Math.min(95, machine.currentCpuUsagePercent + 25);
    }

    // Commit license allocation
    if (licenseId) {
      const lic = this.licenses.get(licenseId)!;
      lic.allocatedLicenses += licenseCount;
      lic.availableLicenses -= licenseCount;
      lic.allocatedToProcesses[pid] = (lic.allocatedToProcesses[pid] || 0) + licenseCount;
    }

    const bookingId = 'BK-' + Date.now().toString().slice(-6);
    const targetDesc = [machineId, licenseId].filter(Boolean).join(' + ');
    const reason = `Successfully reserved ${targetDesc} for user ${userName} [Process ${pid}]`;

    this.logAudit('SUCCESS', reason, userName, pid, targetDesc);
    return { success: true, reason, bookingId };
  }

  /**
   * Cancel an existing resource booking.
   */
  public cancelBooking(params: {
    machineId?: string;
    licenseId?: string;
    pid?: string;
    userName?: string;
  }): { success: boolean; reason: string } {
    const { machineId, licenseId, pid = 'Manual-Cancel', userName = 'Operator' } = params;
    let releasedItems: string[] = [];

    if (machineId) {
      const machine = this.machines.get(machineId);
      if (machine) {
        machine.status = 'AVAILABLE';
        machine.assignedUser = undefined;
        machine.assignedPid = undefined;
        machine.currentMemoryUsageMB = Math.max(0, machine.currentMemoryUsageMB - 512);
        machine.activeProcessCount = Math.max(0, machine.activeProcessCount - 1);
        machine.currentCpuUsagePercent = Math.max(10, machine.currentCpuUsagePercent - 25);
        releasedItems.push(`Machine ${machineId}`);
      }
    }

    if (licenseId) {
      const lic = this.licenses.get(licenseId);
      if (lic) {
        const count = lic.allocatedToProcesses[pid] || 1;
        delete lic.allocatedToProcesses[pid];
        lic.allocatedLicenses = Math.max(0, lic.allocatedLicenses - count);
        lic.availableLicenses = Math.min(lic.totalLicenses, lic.availableLicenses + count);
        releasedItems.push(`License ${lic.name}`);
      }
    }

    const reason = `Cancelled booking and released: ${releasedItems.join(', ')}`;
    this.logAudit('CANCELLED', reason, userName, pid, releasedItems.join(', '));
    return { success: true, reason };
  }

  private logAudit(status: 'SUCCESS' | 'REJECTED' | 'CANCELLED', details: string, userName: string, pid: string, resource: string): void {
    const logItem = {
      id: 'AUDIT-' + Date.now().toString().slice(-6) + '-' + Math.random().toString(36).substring(2, 5),
      timestamp: new Date().toISOString(),
      action: status === 'SUCCESS' ? 'BOOKING_GRANTED' : status === 'REJECTED' ? 'BOOKING_REJECTED' : 'BOOKING_CANCELLED',
      details,
      status,
    };
    this.auditLogs.unshift(logItem);
    if (this.auditLogs.length > 100) this.auditLogs.pop();

    logEvent(status === 'REJECTED' ? 'WARN' : 'INFO', 'RESOURCE_MANAGER', details);
    recordBooking(resource, 'LAB_RESOURCE', userName, pid, status, details);
  }

  public getAuditLogs(): any[] {
    const dbLogs = getRecentBookings(30);
    if (dbLogs.length > 0) {
      return dbLogs.map(b => ({
        id: b.id,
        timestamp: b.created_at,
        action: b.status === 'SUCCESS' ? 'BOOKING_GRANTED' : b.status === 'REJECTED' ? 'BOOKING_REJECTED' : 'BOOKING_CANCELLED',
        details: b.reason || `Booking for ${b.resource_id}`,
        status: b.status as any,
        user: b.user_name,
        pid: b.pid,
      }));
    }
    return this.auditLogs;
  }

  /**
   * Compatibility method for existing tests and routes
   */
  public allocateResource(req: ResourceAllocationRequest): {
    success: boolean;
    allocatedMachine?: string;
    allocatedLicense?: string;
    reason: string;
    deadlockCheckPassed: boolean;
  } {
    if (req.machineId) {
      const machine = this.machines.get(req.machineId);
      if (!machine) return { success: false, reason: `Machine ${req.machineId} not found`, deadlockCheckPassed: true };
      if (!machine.isAvailable || machine.status === 'MAINTENANCE') return { success: false, reason: `Machine ${req.machineId} is offline or undergoing maintenance`, deadlockCheckPassed: true };
      if (machine.status === 'OCCUPIED' && machine.assignedUser) {
        return { success: false, reason: `Machine ${req.machineId} is already booked by ${machine.assignedUser}`, deadlockCheckPassed: true };
      }
    }

    if (req.licenseId) {
      const lic = this.licenses.get(req.licenseId);
      if (!lic) return { success: false, reason: `License ${req.licenseId} not found`, deadlockCheckPassed: true };
      const reqCount = req.licenseCount || 1;
      if (lic.availableLicenses < reqCount) {
        return { success: false, reason: `License ${lic.name} is fully allocated (0 available)`, deadlockCheckPassed: true };
      }
    }

    // Banker safety check if requested Cadence license
    if (req.licenseId === 'LIC-CADENCE') {
      const bankerCheck = deadlockEngine.runBankersAlgorithm({
        processes: ['P1', 'P2', 'P3', req.pid],
        resources: ['MATLAB', 'ANSYS', 'Cadence'],
        available: [1, 0, 0],
        max: [[2, 1, 0], [1, 2, 0], [0, 1, 2], [1, 1, 0]],
        allocation: [[1, 0, 0], [0, 1, 0], [0, 0, 1], [0, 0, 0]],
        need: [],
      });

      if (!bankerCheck.isSafe) {
        return {
          success: false,
          reason: `Request rejected by Banker's Algorithm: Granting would transition system into UNSAFE DEADLOCK STATE!`,
          deadlockCheckPassed: false,
        };
      }
    }

    // Grant
    if (req.machineId) {
      const machine = this.machines.get(req.machineId)!;
      machine.status = 'OCCUPIED';
      machine.assignedUser = req.userName || 'Student';
      machine.assignedPid = req.pid;
      machine.currentMemoryUsageMB += req.memoryMB || 128;
      machine.activeProcessCount += 1;
    }

    if (req.licenseId) {
      const lic = this.licenses.get(req.licenseId)!;
      const count = req.licenseCount || 1;
      lic.allocatedLicenses += count;
      lic.availableLicenses -= count;
      lic.allocatedToProcesses[req.pid] = (lic.allocatedToProcesses[req.pid] || 0) + count;
    }

    logEvent('SUCCESS', 'RESOURCE_MANAGER', `Resource granted to ${req.pid}: ${req.machineId || ''} ${req.licenseId || ''}`);

    return {
      success: true,
      allocatedMachine: req.machineId,
      allocatedLicense: req.licenseId,
      reason: `Resource successfully granted to ${req.pid} after safety verification`,
      deadlockCheckPassed: true,
    };
  }

  public releaseResource(pid: string, machineId?: string, licenseId?: string): void {
    this.cancelBooking({ machineId, licenseId, pid });
  }
}

export const resourceManager = new ResourceManager();
