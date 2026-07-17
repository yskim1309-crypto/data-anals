/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area } from 'recharts';
import { DataPoint, AnalysisMode } from '../types';

interface Props {
  data: DataPoint[];
  mode: AnalysisMode;
  loading: boolean;
}

const MIL_STD_LIMIT = [
  { frequency: 0, limit: 100 },
  { frequency: 10, limit: 100 },
  { frequency: 100, limit: 80 },
  { frequency: 1000, limit: 60 },
  { frequency: 10000, limit: 60 },
];

export function MainChart({ data, mode, loading }: Props) {
  if (loading) {
    return (
      <div className="flex-1 bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-mono text-slate-400">Processing signals...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex-1 bg-slate-900/30 flex items-center justify-center border-2 border-dashed border-slate-800 m-6 rounded-2xl">
        <div className="text-center space-y-2">
          <p className="text-slate-500 font-medium">No Data Loaded</p>
          <p className="text-xs text-slate-600">Please upload a test CSV file to begin analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-hidden flex flex-col gap-6">
      <div className="bg-slate-800/40 border border-brand-border rounded-2xl p-6 flex-1 min-h-0 flex flex-col shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-mono text-slate-400 uppercase tracking-widest">
            {mode === 'WAVEFORM' && 'Real-time Waveform Monitor'}
            {mode === 'FFT' && 'Frequency Spectrum (Magnitude)'}
            {mode === 'MIL_STD' && 'CE102 Conducted Emissions vs Limit'}
            {mode === 'SIMULATION' && 'Measured vs Simulated Comparison'}
          </h3>
          <div className="flex gap-2">
             <div className="flex items-center gap-2 px-2 py-1 bg-slate-900 rounded border border-slate-700">
                <div className="w-2 h-2 rounded-full bg-brand-accent"></div>
                <span className="text-[10px] text-slate-400 font-mono">CH1: VOLTAGE</span>
             </div>
             {mode === 'SIMULATION' && (
               <div className="flex items-center gap-2 px-2 py-1 bg-slate-900 rounded border border-slate-700">
                  <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                  <span className="text-[10px] text-slate-400 font-mono">SIM: PSIM_OUT</span>
               </div>
             )}
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            {mode === 'WAVEFORM' || mode === 'SIMULATION' ? (
              <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="#475569" 
                  fontSize={10} 
                  tickFormatter={(val) => `${val.toFixed(2)}ms`}
                />
                <YAxis stroke="#475569" fontSize={10} domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#38bdf8" 
                  strokeWidth={1.5} 
                  dot={false} 
                  activeDot={{ r: 4, stroke: '#38bdf8', strokeWidth: 2 }}
                />
                {mode === 'SIMULATION' && (
                  <Line 
                    type="monotone" 
                    dataKey="simulation" 
                    stroke="#ec4899" 
                    strokeWidth={1.5} 
                    strokeDasharray="5 5"
                    dot={false} 
                  />
                )}
              </LineChart>
            ) : mode === 'FFT' ? (
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFFT" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="timestamp" stroke="#475569" fontSize={10} label={{ value: 'Frequency (Hz)', position: 'insideBottom', offset: -5 }} />
                <YAxis stroke="#475569" fontSize={10} label={{ value: 'dBuV', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Area type="stepAfter" dataKey="value" stroke="#38bdf8" fillOpacity={1} fill="url(#colorFFT)" />
              </AreaChart>
            ) : (
              // MIL-STD View
              <LineChart margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                 <XAxis type="number" dataKey="timestamp" stroke="#475569" fontSize={10} domain={[10, 10000000]} scale="log" />
                 <YAxis stroke="#475569" fontSize={10} />
                 <Tooltip />
                 {/* Limit Line */}
                 <Line data={MIL_STD_LIMIT} type="stepAfter" dataKey="limit" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                 {/* Actual Data */}
                 <Line data={data} type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={1} dot={false} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
