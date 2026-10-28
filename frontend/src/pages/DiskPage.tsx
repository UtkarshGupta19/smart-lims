import React, { useState, useEffect } from 'react';
import { scheduleDisk, compareDiskAlgorithms } from '../services/api';
import { DiskScheduleResult, DiskComparisonItem } from '../types';
import { Disc, Play, BarChart2, AlertCircle, Info, HelpCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const DiskPage: React.FC = () => {
  const [algorithm, setAlgorithm] = useState<string>('SSTF');
  const [queueInput, setQueueInput] = useState<string>('98, 183, 37, 122, 14, 124, 65, 67');
  const [head, setHead] = useState<number>(53);
  const [diskSize, setDiskSize] = useState<number>(200);
  const [direction, setDirection] = useState<'LEFT' | 'RIGHT'>('RIGHT');

  const [result, setResult] = useState<DiskScheduleResult | null>(null);
  const [comparison, setComparison] = useState<DiskComparisonItem[] | null>(null);
  const [boundaryAssumptions, setBoundaryAssumptions] = useState<any>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    handleCompareAll();
  }, []);

  const parseQueue = (): number[] | null => {
    setValidationError(null);
    const tokens = queueInput.split(',').map(s => s.trim()).filter(Boolean);
    const parsed: number[] = [];

    for (const t of tokens) {
      const num = Number(t);
      if (isNaN(num)) {
        setValidationError(`Invalid cylinder token '${t}'. Please enter comma-separated numbers.`);
        return null;
      }
      if (num < 0 || num >= diskSize) {
        setValidationError(`Cylinder ${num} is out of bounds! Must be within 0 to ${diskSize - 1}.`);
        return null;
      }
      parsed.push(num);
    }

    if (parsed.length === 0) {
      setValidationError('Cylinder request queue cannot be empty.');
      return null;
    }

    if (head < 0 || head >= diskSize) {
      setValidationError(`Initial head position (${head}) is out of bounds (0 to ${diskSize - 1}).`);
      return null;
    }

    return parsed;
  };

  const handleRunSingle = async () => {
    const queue = parseQueue();
    if (!queue) return;

    setLoading(true);
    try {
      const res = await scheduleDisk(algorithm, queue, head, direction, diskSize);
      setResult(res);
    } catch (err: any) {
      setValidationError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompareAll = async () => {
    const queue = parseQueue();
    if (!queue) return;

    setLoading(true);
    try {
      const compRes = await compareDiskAlgorithms(queue, head, diskSize, direction);
      setComparison(compRes.comparison);
      setBoundaryAssumptions(compRes.boundaryAssumptions);
      if (compRes.results[algorithm]) {
        setResult(compRes.results[algorithm]);
      } else {
        setResult(compRes.results['SSTF']);
      }
    } catch (err: any) {
      setValidationError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const chartData =
    result?.seekSequence.map((val: number, idx: number) => ({
      step: idx,
      track: val,
    })) || [];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Disc className="w-5 h-5 text-blue-600" />
            <span>Disk I/O Scheduling & Head Movement Optimizer</span>
          </h2>
          <p className="text-xs text-slate-500">
            FCFS, SSTF, SCAN (Elevator), and C-SCAN algorithms with trajectory visualization and boundary assumptions
          </p>
        </div>
      </div>

      {/* Configuration Form Card */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Algorithm</label>
            <select
              value={algorithm}
              onChange={e => setAlgorithm(e.target.value)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 bg-white"
            >
              <option value="FCFS">FCFS (First-Come First-Served)</option>
              <option value="SSTF">SSTF (Shortest Seek Time First)</option>
              <option value="SCAN">SCAN (Elevator Algorithm)</option>
              <option value="C-SCAN">C-SCAN (Circular SCAN)</option>
              <option value="LOOK">LOOK</option>
              <option value="C-LOOK">C-LOOK</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Initial Head Position</label>
            <input
              type="number"
              min={0}
              max={diskSize - 1}
              value={head}
              onChange={e => setHead(Number(e.target.value))}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Disk Cylinders (Range: 0 to N-1)</label>
            <input
              type="number"
              min={50}
              max={1000}
              value={diskSize}
              onChange={e => setDiskSize(Number(e.target.value))}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Sweep Direction (SCAN)</label>
            <select
              value={direction}
              onChange={e => setDirection(e.target.value as any)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 bg-white"
            >
              <option value="RIGHT">Right (Towards Cylinder {diskSize - 1})</option>
              <option value="LEFT">Left (Towards Cylinder 0)</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={handleRunSingle}
              disabled={loading}
              className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded font-semibold text-xs transition"
            >
              Run Single
            </button>
            <button
              onClick={handleCompareAll}
              disabled={loading}
              className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-xs transition shadow-sm"
            >
              Compare All
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Cylinder Request Queue (Comma-separated cylinders between 0 and {diskSize - 1})
          </label>
          <input
            type="text"
            value={queueInput}
            onChange={e => setQueueInput(e.target.value)}
            className="w-full border border-slate-300 rounded px-3 py-1.5 font-mono text-xs"
          />
        </div>

        {validationError && (
          <div className="p-2.5 bg-rose-50 border border-rose-300 rounded text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}
      </div>

      {/* Multi-Algorithm Comparison Table */}
      {comparison && (
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-blue-600" />
              <span>Multi-Algorithm Comparative Performance Matrix</span>
            </h3>
            <span className="text-[11px] text-slate-500">Evaluated on identical request queue</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs lab-table">
              <thead>
                <tr>
                  <th>Algorithm</th>
                  <th>Total Head Movement</th>
                  <th>Average Seek Distance</th>
                  <th>Head Service Order (Trajectory Path)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {comparison.map((item, idx) => (
                  <tr key={item.algorithm} className={idx === 1 ? 'bg-blue-50/40' : ''}>
                    <td className="font-bold text-slate-900 font-sans">{item.algorithm}</td>
                    <td>
                      <strong className="text-blue-700">{item.totalHeadMovement}</strong> cylinders
                    </td>
                    <td>{item.avgSeekDistance} cylinders / req</td>
                    <td className="text-slate-600">{item.seekSequence.join(' ➜ ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Single Algorithm Trajectory & Visual Graph */}
      {result && (
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Head Movement Trajectory: <span className="text-blue-600">{result.algorithm}</span>
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Total Movement: <strong className="text-slate-900">{result.totalHeadMovement}</strong> tracks | Seek Order: {result.seekSequence.join(' ➜ ')}
              </p>
            </div>
          </div>

          {/* Recharts Trajectory Graph */}
          <div className="h-64 w-full bg-slate-50 p-4 rounded border border-slate-200">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, diskSize]} stroke="#64748b" />
                <YAxis type="number" dataKey="step" stroke="#64748b" reversed label={{ value: 'Seek Step', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#1e293b' }} />
                <Line type="monotone" dataKey="track" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4, fill: '#1d4ed8' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Step Details Breakdown */}
          <div className="overflow-x-auto max-h-48">
            <table className="w-full text-left text-xs lab-table">
              <thead>
                <tr>
                  <th>Step</th>
                  <th>Current Track</th>
                  <th>Target Track</th>
                  <th>Distance Moved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {result.stepDetails.map(st => (
                  <tr key={st.step}>
                    <td className="font-bold text-slate-500">#{st.step}</td>
                    <td>Track {st.currentHead}</td>
                    <td className="font-bold text-blue-700">Track {st.targetHead}</td>
                    <td>{st.distance} tracks</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Boundary Assumptions & Direction Explanation Card */}
      {boundaryAssumptions && (
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
          <div className="font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>Boundary & Elevator Sweep Assumptions</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-600 leading-relaxed text-[11px]">
            <div className="p-2.5 bg-white rounded border border-slate-200">
              <strong className="text-slate-800 block mb-1">SCAN (Elevator Algorithm):</strong>
              {boundaryAssumptions.scan}
            </div>
            <div className="p-2.5 bg-white rounded border border-slate-200">
              <strong className="text-slate-800 block mb-1">C-SCAN (Circular SCAN):</strong>
              {boundaryAssumptions.cscan}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
