import React, { useEffect, useState } from 'react';
import { LabMachine, SoftwareLicense } from '../types';
import { fetchMachines, fetchLicenses, bookResource, cancelResourceBooking, fetchBookingAuditLogs } from '../services/api';
import { Server, Key, Send, CheckCircle2, XCircle, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';

export const ResourcesPage: React.FC = () => {
  const [machines, setMachines] = useState<LabMachine[]>([]);
  const [licenses, setLicenses] = useState<SoftwareLicense[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Booking Form State
  const [userName, setUserName] = useState<string>('Ada Lovelace');
  const [pid, setPid] = useState<string>('P101');
  const [selectedMachine, setSelectedMachine] = useState<string>('PC-01');
  const [selectedLicense, setSelectedLicense] = useState<string>('LIC-MATLAB');
  const [memoryMB, setMemoryMB] = useState<number>(512);

  const [bookingResult, setBookingResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    loadAllResources();
  }, []);

  const loadAllResources = async () => {
    try {
      const [m, l, logs] = await Promise.all([fetchMachines(), fetchLicenses(), fetchBookingAuditLogs()]);
      setMachines(m);
      setLicenses(l);
      setAuditLogs(logs);
    } catch (err) {
      console.error('Failed to load resources:', err);
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setBookingResult(null);
    try {
      const res = await bookResource({
        machineId: selectedMachine,
        licenseId: selectedLicense !== 'NONE' ? selectedLicense : undefined,
        userName,
        pid,
        memoryMB,
        licenseCount: 1,
      });
      setBookingResult(res);
      await loadAllResources();
    } catch (err: any) {
      setBookingResult({ success: false, reason: err.message || 'Booking submission failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (machineId?: string, licenseId?: string, targetPid?: string) => {
    if (!window.confirm(`Are you sure you want to cancel booking for ${machineId || licenseId}?`)) {
      return;
    }
    try {
      await cancelResourceBooking({ machineId, licenseId, pid: targetPid, userName: 'Lab Admin' });
      await loadAllResources();
    } catch (err) {
      console.error('Failed to cancel booking:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-600" />
            <span>Laboratory Resource Management & Allocation</span>
          </h2>
          <p className="text-xs text-slate-500">
            Workstation allocation, software licensing, double-booking prevention & persistent audit logs
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking Form (1 Col) */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-2 flex items-center gap-2 font-bold text-xs text-slate-800 uppercase tracking-wider">
            <Send className="w-4 h-4 text-blue-600" />
            <span>Create Resource Reservation</span>
          </div>

          <form onSubmit={handleCreateBooking} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">User / Student Name</label>
              <input
                type="text"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                required
                className="w-full mt-1 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-700">Process PID</label>
                <input
                  type="text"
                  value={pid}
                  onChange={e => setPid(e.target.value)}
                  required
                  className="w-full mt-1 border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">RAM Required</label>
                <input
                  type="number"
                  min={64}
                  step={64}
                  value={memoryMB}
                  onChange={e => setMemoryMB(Number(e.target.value))}
                  required
                  className="w-full mt-1 border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Lab Workstation</label>
              <select
                value={selectedMachine}
                onChange={e => setSelectedMachine(e.target.value)}
                className="w-full mt-1 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 bg-white"
              >
                {machines.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.id} - {m.name} ({m.status || (m.isAvailable ? 'AVAILABLE' : 'OFFLINE')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Software License</label>
              <select
                value={selectedLicense}
                onChange={e => setSelectedLicense(e.target.value)}
                className="w-full mt-1 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 bg-white"
              >
                <option value="NONE">None (Generic Terminal Access)</option>
                {licenses.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.availableLicenses} available)
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-xs transition shadow-sm disabled:opacity-50"
            >
              {loading ? 'Validating Reservation...' : 'Submit Booking Request'}
            </button>
          </form>

          {/* Booking Result Message */}
          {bookingResult && (
            <div
              className={`p-3 rounded border text-xs flex items-start gap-2 ${
                bookingResult.success
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-rose-50 border-rose-300 text-rose-800'
              }`}
            >
              {bookingResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <strong className="block font-semibold">
                  {bookingResult.success ? 'Booking Confirmed' : 'Booking Rejected'}
                </strong>
                <span className="text-[11px] leading-relaxed">{bookingResult.reason}</span>
              </div>
            </div>
          )}
        </div>

        {/* Workstations and Software Licenses (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Workstations Table */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Server className="w-4 h-4 text-blue-600" />
                <span>Lab Computer Workstations</span>
              </h3>
              <span className="text-[11px] text-slate-500">Preventing double-allocation</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs lab-table">
                <thead>
                  <tr>
                    <th>Machine</th>
                    <th>Specs</th>
                    <th>Status</th>
                    <th>Assigned User</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {machines.map(m => {
                    const isOccupied = m.status === 'OCCUPIED' || !!m.assignedUser;
                    return (
                      <tr key={m.id}>
                        <td>
                          <div className="font-bold text-blue-700">{m.id}</div>
                          <div className="text-[10px] text-slate-500 font-sans">{m.name}</div>
                        </td>
                        <td className="text-slate-600">
                          {m.currentMemoryUsageMB}/{m.ramMB}MB RAM
                        </td>
                        <td>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              isOccupied
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : !m.isAvailable
                                ? 'bg-slate-200 text-slate-700 border border-slate-300'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            }`}
                          >
                            {m.status || (m.isAvailable ? 'AVAILABLE' : 'MAINTENANCE')}
                          </span>
                        </td>
                        <td className="font-sans text-slate-700">
                          {m.assignedUser ? (
                            <span>
                              <strong>{m.assignedUser}</strong>{' '}
                              <span className="text-slate-400 font-mono">({m.assignedPid})</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td>
                          {isOccupied && (
                            <button
                              onClick={() => handleCancelBooking(m.id, undefined, m.assignedPid)}
                              className="px-2 py-1 text-[10px] text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded font-medium transition"
                            >
                              Release
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Software Licenses Status */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-4 h-4 text-slate-600" />
                <span>Academic Software License Pool</span>
              </h3>
              <span className="text-[11px] text-slate-500">Floating Seats</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {licenses.map(lic => (
                <div key={lic.id} className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800">{lic.name}</span>
                    <span className="font-mono text-blue-700">
                      {lic.availableLicenses} / {lic.totalLicenses} free
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full"
                      style={{ width: `${(lic.allocatedLicenses / lic.totalLicenses) * 100}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Allocated to: {Object.keys(lic.allocatedToProcesses).join(', ') || 'None'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Audit Log Section */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-slate-600" />
            <span>Resource Booking Audit Trail</span>
          </h3>
          <span className="text-[11px] text-slate-500">Persistent Event Log</span>
        </div>

        <div className="overflow-x-auto max-h-64">
          <table className="w-full text-left text-xs lab-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Status</th>
                <th>User / PID</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {auditLogs.map((log, idx) => (
                <tr key={idx}>
                  <td className="text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="font-bold text-slate-800 font-sans">{log.action}</td>
                  <td>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        log.status === 'SUCCESS' || log.status === 'BOOKING_GRANTED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.status === 'REJECTED' || log.status === 'BOOKING_REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="font-sans text-slate-700">
                    {log.user ? `${log.user} (${log.pid})` : log.pid || 'System'}
                  </td>
                  <td className="font-sans text-slate-600">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
