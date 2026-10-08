import React, { useState } from 'react';
import { scheduleDisk } from '../services/api';
import { Disc, Play } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const DiskPage: React.FC = () => {
  const [algorithm, setAlgorithm] = useState<string>('SSTF');
  const [queueInput, setQueueInput] = useState<string>('98, 183, 37, 122, 14, 124, 65, 67');
  const [head, setHead] = useState<number>(53);
  const [direction, setDirection] = useState<'LEFT' | 'RIGHT'>('RIGHT');
  const [result, setResult] = useState<any>(null);

  const handleRun = async () => {
    const queue = queueInput.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
    const res = await scheduleDisk(algorithm, queue, head, direction);
    setResult(res);
  };

  const chartData = result?.seekSequence.map((val: number, idx: number) => ({
    step: idx,
    track: val,
  })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Disc className="w-6 h-6 text-cyan-400" />
          <span>Disk I/O Scheduling Engine</span>
        </h2>
        <p className="text-xs text-slate-400">Head Movement Minimization & Seek Distance Comparator</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div>
            <label className="text-[11px] text-slate-400 font-medium">Algorithm</label>
            <select
              value={algorithm}
              onChange={e => setAlgorithm(e.target.value)}
              className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
            >
              <option value="FCFS">FCFS</option>
              <option value="SSTF">SSTF</option>
              <option value="SCAN">SCAN</option>
              <option value="C-SCAN">C-SCAN</option>
              <option value="LOOK">LOOK</option>
              <option value="C-LOOK">C-LOOK</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-medium">Initial Head</label>
            <input
              type="number"
              value={head}
              onChange={e => setHead(Number(e.target.value))}
              className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-medium">Request Queue</label>
            <input
              type="text"
              value={queueInput}
              onChange={e => setQueueInput(e.target.value)}
              className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleRun}
              className="w-full py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Calculate Seek</span>
            </button>
          </div>
        </div>

        {result && (
          <div className="space-y-6">
            <div className="flex items-center gap-6 text-xs font-mono">
              <span className="text-slate-400">Total Head Movement: <strong className="text-cyan-400">{result.totalHeadMovement} tracks</strong></span>
              <span className="text-slate-400">Avg Seek Distance: <strong className="text-emerald-400">{result.avgSeekDistance} tracks</strong></span>
              <span className="text-slate-400">Seek Sequence: <strong className="text-white">{result.seekSequence.join(' ➜ ')}</strong></span>
            </div>

            {/* Recharts Head Trajectory Chart */}
            <div className="h-64 w-full bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" domain={[0, 200]} stroke="#64748b" />
                  <YAxis type="number" dataKey="step" stroke="#64748b" reversed />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Line type="monotone" dataKey="track" stroke="#22d3ee" strokeWidth={2} dot={{ r: 4, fill: '#06b6d4' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
