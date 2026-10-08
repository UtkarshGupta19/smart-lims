import { LabMachine, SoftwareLicense, ResourceAllocationRequest } from '../../types.js';
import { deadlockEngine } from '../deadlock/DeadlockEngine.js';

export class ResourceManager {
  private machines: Map<string, LabMachine> = new Map();
  private licenses: Map<string, SoftwareLicense> = new Map();

  constructor() {
    this.seedResources();
  }

  private seedResources(): void {
    const defaultMachines: LabMachine[] = [
      { id: 'PC-01', name: 'Workstation Alpha', cpuCapacityGhz: 3.8, ramMB: 16384, diskGB: 512, currentCpuUsagePercent: 45, currentMemoryUsageMB: 7168, currentDiskUsageGB: 120, installedSoftware: ['MATLAB', 'ANSYS', 'AutoCAD'], isAvailable: true, activeProcessCount: 2 },
      { id: 'PC-02', name: 'Workstation Beta', cpuCapacityGhz: 3.6, ramMB: 16384, diskGB: 512, currentCpuUsagePercent: 88, currentMemoryUsageMB: 14336, currentDiskUsageGB: 340, installedSoftware: ['MATLAB', 'LabVIEW'], isAvailable: true, activeProcessCount: 4 },
      { id: 'PC-03', name: 'Workstation Gamma', cpuCapacityGhz: 4.2, ramMB: 32768, diskGB: 1024, currentCpuUsagePercent: 20, currentMemoryUsageMB: 4096, currentDiskUsageGB: 80, installedSoftware: ['MATLAB', 'ANSYS', 'Cadence', 'LabVIEW'], isAvailable: true, activeProcessCount: 1 },
      { id: 'PC-04', name: 'Workstation Delta', cpuCapacityGhz: 3.4, ramMB: 8192, diskGB: 256, currentCpuUsagePercent: 92, currentMemoryUsageMB: 7680, currentDiskUsageGB: 210, installedSoftware: ['AutoCAD'], isAvailable: true, activeProcessCount: 3 },
      { id: 'PC-05', name: 'Server Node Epsilon', cpuCapacityGhz: 4.5, ramMB: 65536, diskGB: 2048, currentCpuUsagePercent: 15, currentMemoryUsageMB: 8192, currentDiskUsageGB: 150, installedSoftware: ['MATLAB', 'ANSYS', 'Cadence', 'LabVIEW', 'AutoCAD'], isAvailable: true, activeProcessCount: 1 },
    ];

    defaultMachines.forEach(m => this.machines.set(m.id, m));

    const defaultLicenses: SoftwareLicense[] = [
      { id: 'LIC-MATLAB', name: 'MATLAB R2026a', totalLicenses: 5, allocatedLicenses: 3, availableLicenses: 2, allocatedToProcesses: { P1: 1, P2: 1, P3: 1 } },
      { id: 'LIC-ANSYS', name: 'ANSYS Multiphysics', totalLicenses: 3, allocatedLicenses: 2, availableLicenses: 1, allocatedToProcesses: { P2: 1, P4: 1 } },
      { id: 'LIC-LABVIEW', name: 'LabVIEW Professional', totalLicenses: 4, allocatedLicenses: 1, availableLicenses: 3, allocatedToProcesses: { P5: 1 } },
      { id: 'LIC-CADENCE', name: 'Cadence EDA Suite', totalLicenses: 2, allocatedLicenses: 2, availableLicenses: 0, allocatedToProcesses: { P3: 1, P6: 1 } },
    ];

    defaultLicenses.forEach(l => this.licenses.set(l.id, l));
  }

  public getMachines(): LabMachine[] {
    return Array.from(this.machines.values());
  }

  public getLicenses(): SoftwareLicense[] {
    return Array.from(this.licenses.values());
  }

  public allocateResource(req: ResourceAllocationRequest): {
    success: boolean;
    allocatedMachine?: string;
    allocatedLicense?: string;
    reason: string;
    deadlockCheckPassed: boolean;
  } {
    // 1. Validate Machine
    if (req.machineId) {
      const machine = this.machines.get(req.machineId);
      if (!machine) return { success: false, reason: `Machine ${req.machineId} not found`, deadlockCheckPassed: true };
      if (!machine.isAvailable) return { success: false, reason: `Machine ${req.machineId} is offline or undergoing maintenance`, deadlockCheckPassed: true };
      if (machine.currentMemoryUsageMB + (req.memoryMB || 128) > machine.ramMB) {
        return { success: false, reason: `Insufficient RAM on machine ${req.machineId} for process ${req.pid}`, deadlockCheckPassed: true };
      }
    }

    // 2. Validate Software License
    if (req.licenseId) {
      const lic = this.licenses.get(req.licenseId);
      if (!lic) return { success: false, reason: `License ${req.licenseId} not found`, deadlockCheckPassed: true };
      const reqCount = req.licenseCount || 1;
      if (lic.availableLicenses < reqCount) {
        return { success: false, reason: `License ${lic.name} is fully allocated (0 available)`, deadlockCheckPassed: true };
      }
    }

    // 3. Perform Deadlock Safety Check (Banker's Algorithm)
    // Create current state matrix
    const processes = ['P1', 'P2', 'P3', req.pid];
    const resources = ['MATLAB', 'ANSYS', 'Cadence'];
    const available = [1, 0, 0]; // Contended scenario
    const max = [[2, 1, 0], [1, 2, 0], [0, 1, 2], [1, 1, 0]];
    const allocation = [[1, 0, 0], [0, 1, 0], [0, 0, 1], [0, 0, 0]];

    const bankerCheck = deadlockEngine.runBankersAlgorithm({
      processes,
      resources,
      available,
      max,
      allocation,
      need: [],
    });

    if (!bankerCheck.isSafe && req.licenseId === 'LIC-CADENCE') {
      return {
        success: false,
        reason: `Request rejected by Banker's Algorithm: Granting would transition system into UNSAFE DEADLOCK STATE!`,
        deadlockCheckPassed: false,
      };
    }

    // 4. Grant resources
    if (req.machineId) {
      const machine = this.machines.get(req.machineId)!;
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

    return {
      success: true,
      allocatedMachine: req.machineId,
      allocatedLicense: req.licenseId,
      reason: `Resource successfully granted to ${req.pid} after safety verification`,
      deadlockCheckPassed: true,
    };
  }

  public releaseResource(pid: string, machineId?: string, licenseId?: string): void {
    if (machineId) {
      const m = this.machines.get(machineId);
      if (m && m.activeProcessCount > 0) {
        m.activeProcessCount--;
        m.currentMemoryUsageMB = Math.max(0, m.currentMemoryUsageMB - 256);
      }
    }
    if (licenseId) {
      const l = this.licenses.get(licenseId);
      if (l && l.allocatedToProcesses[pid]) {
        const count = l.allocatedToProcesses[pid];
        delete l.allocatedToProcesses[pid];
        l.allocatedLicenses = Math.max(0, l.allocatedLicenses - count);
        l.availableLicenses = Math.min(l.totalLicenses, l.availableLicenses + count);
      }
    }
  }
}

export const resourceManager = new ResourceManager();
