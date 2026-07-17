/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Activity, BarChart3, ShieldCheck, Cpu, Sliders } from 'lucide-react';
import { AnalysisMode } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Props {
  mode: AnalysisMode;
  setMode: (mode: AnalysisMode) => void;
  downsampleRate: number;
  setDownsampleRate: (rate: number) => void;
}

export function AnalysisSidebar({ mode, setMode, downsampleRate, setDownsampleRate }: Props) {
  const menuItems = [
    { id: 'WAVEFORM', label: 'Waveform Plot', icon: Activity },
    { id: 'FFT', label: 'FFT Analysis', icon: BarChart3 },
    { id: 'MIL_STD', label: 'MIL-STD Check', icon: ShieldCheck },
    { id: 'SIMULATION', label: 'Sim vs Real', icon: Cpu },
  ] as const;

  return (
    <aside id="analysis-sidebar" className="w-72 border-r border-brand-border h-[calc(100vh-73px)] p-6 flex flex-col gap-8">
      <div className="space-y-4">
        <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Sliders className="w-3 h-3" />
          Analysis Mode
        </h2>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setMode(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group",
                mode === item.id 
                  ? "bg-brand-accent/10 text-brand-accent border border-brand-accent/20" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              )}
            >
              <item.icon className={cn("w-4 h-4", mode === item.id ? "text-brand-accent" : "text-slate-500 group-hover:text-slate-300")} />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="space-y-4">
        <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest">Processing Parameters</h2>
        <div className="space-y-6 bg-slate-800/30 p-4 rounded-xl border border-brand-border">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs text-slate-400">Peak Resolution</label>
              <span className="text-xs font-mono text-brand-accent">{downsampleRate} pts</span>
            </div>
            <input 
              type="range" 
              min="50" 
              max="2000" 
              step="50"
              value={downsampleRate}
              onChange={(e) => setDownsampleRate(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-accent"
            />
            <p className="text-[10px] text-slate-500 italic leading-relaxed">
              *Min-Max Decimation preserves transient noise even at lower resolutions.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-auto space-y-4">
        <div className="p-4 bg-blue-500/5 rounded-lg border border-blue-500/10">
          <p className="text-[11px] text-blue-400 leading-normal">
            <strong>System Status:</strong> Offline processing active. No data leaves this device.
          </p>
        </div>
      </div>
    </aside>
  );
}
