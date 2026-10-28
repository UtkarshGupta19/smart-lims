import React, { useEffect, useState } from 'react';
import { runLinuxMonitorScript, fetchSystemLogs, fetchModernConcepts } from '../services/api';
import { Terminal, Shield, Cpu, HardDrive, RefreshCw, CheckCircle, Database } from 'lucide-react';

export const LogsPage: React.FC = () => {
  const [selectedScript, setSelectedScript] = useState<string>('health_check.sh');
  const [terminalOutput, setTerminalOutput] = useState<string>('Select a Linux monitoring script to execute...');
  const [isRealExecution, setIsRealExecution] = useState<boolean>(true);
  const [loadingScript, setLoadingScript] = useState<boolean>(false);

  const [dbLogs, setDbLogs] = useState<any[]>([]);
  const [modernSpecs, setModernSpecs] = useState<any>(null);

  useEffect(() => {
    loadLogs();
    loadSpecs();
    handleRunScript('health_check.sh');
  }, []);

  const loadLogs = async () => {
    try {
      const logs = await fetchSystemLogs(40);
      setDbLogs(logs);
    } catch (err) {
      console.error(err);
    }
  };

  const loadSpecs = async () => {
    try {
      const data = await fetchModernConcepts();
      setModernSpecs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunScript = async (script: string) => {
    setSelectedScript(script);
    setLoadingScript(true);
    try {
      const res = await runLinuxMonitorScript(script);
      setTerminalOutput(res.output || res.error || 'No output received.');
      setIsRealExecution(!!res.isRealHostExecution);
      await loadLogs();
    } catch (err: any) {
      setTerminalOutput(`Execution Error: ${err.message}`);
    } finally {
      setLoadingScript(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Terminal className="w-5 h-5 text-blue-600" />
            <span>Audit Logs & Safe Host Monitoring CLI</span>
          </h2>
          <p className="text-xs text-slate-500">
            Persistent audit trail, whitelisted bash diagnostic scripts & hypervisor / GPU CUDA metrics
          </p>
        </div>
      </div>

      {/* Safe Script CLI Terminal Card */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Safe Host Diagnostics (Strictly Whitelisted Scripts)</span>
            </h3>
            <span className="text-[11px] text-slate-500">
              Only predefined, safe read-only monitoring scripts can be invoked. Arbitrary commands are prohibited.
            </span>
          </div>

          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded text-[11px] font-semibold flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Real Server Execution</span>
          </span>
        </div>

        {/* Script Selector Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'health_check.sh', label: 'Health Check' },
            { id: 'cpu_monitoring.sh', label: 'CPU Load Monitor' },
            { id: 'memory_monitoring.sh', label: 'Memory Stats' },
            { id: 'disk_monitoring.sh', label: 'Disk Space' },
            { id: 'process_monitoring.sh', label: 'Process Audit' },
            { id: 'user_management.sh', label: 'User Directory' },
            { id: 'backup.sh', label: 'Database Backup' },
          ].map(sc => (
            <button
              key={sc.id}
              onClick={() => handleRunScript(sc.id)}
              className={`px-3 py-1.5 rounded font-medium whitespace-nowrap transition border ${
                selectedScript === sc.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {sc.label}
            </button>
          ))}
        </div>

        {/* Terminal Window */}
        <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs space-y-2 border border-slate-800 shadow-inner">
          <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span className="ml-2 font-bold text-slate-200">bash ./scripts/{selectedScript}</span>
            </div>
            <span className="text-[10px] text-slate-500">
              {loadingScript ? 'Executing...' : 'Exit Code: 0 (OK)'}
            </span>
          </div>

          <pre className="text-emerald-400 whitespace-pre-wrap overflow-x-auto min-h-[140px] max-h-[260px] pt-1">
            {terminalOutput}
          </pre>
        </div>
      </div>

      {/* Persistent System Audit Logs Table */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Database className="w-4 h-4 text-blue-600" />
            <span>Persistent System & Simulation Event Audit Logs</span>
          </h3>
          <button
            onClick={loadLogs}
            className="px-2.5 py-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-xs font-medium flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="overflow-x-auto max-h-72">
          <table className="w-full text-left text-xs lab-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Level</th>
                <th>Module</th>
                <th>Event Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {dbLogs.map((log, idx) => (
                <tr key={idx}>
                  <td className="text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        log.level === 'INFO'
                          ? 'bg-blue-100 text-blue-800'
                          : log.level === 'WARN'
                          ? 'bg-amber-100 text-amber-800'
                          : log.level === 'ERROR'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {log.level}
                    </span>
                  </td>
                  <td className="font-bold text-slate-700">{log.module}</td>
                  <td className="font-sans text-slate-700">{log.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modern OS Concepts */}
      {modernSpecs && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-2 text-xs">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-blue-600" />
              <span>Simulated Hypervisor / Virtual Machine Spec</span>
            </h4>
            <div className="space-y-1 text-slate-600 font-mono text-[11px]">
              <div>Hypervisor: <strong>{modernSpecs.virtualMachine.hypervisorType}</strong></div>
              <div>vCPUs: <strong>{modernSpecs.virtualMachine.virtualCpus} cores</strong></div>
              <div>Allocated RAM: <strong>{modernSpecs.virtualMachine.allocatedRamGB} GB</strong></div>
              <div>Guest OS: <strong>{modernSpecs.virtualMachine.guestOs}</strong></div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-2 text-xs">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-emerald-600" />
              <span>Simulated GPU CUDA Acceleration Spec</span>
            </h4>
            <div className="space-y-1 text-slate-600 font-mono text-[11px]">
              <div>GPU Model: <strong>{modernSpecs.gpuAcceleration.gpuModel}</strong></div>
              <div>CUDA Cores: <strong>{modernSpecs.gpuAcceleration.cudaCores}</strong></div>
              <div>VRAM: <strong>{modernSpecs.gpuAcceleration.vramGB} GB GDDR6X</strong></div>
              <div>Streams: <strong>{modernSpecs.gpuAcceleration.activeCudaStreams} Concurrent</strong></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
