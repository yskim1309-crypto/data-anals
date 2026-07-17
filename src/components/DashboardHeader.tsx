/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Upload, FileText, Settings2 } from 'lucide-react';
import { TestMetadata } from '../types';
import { parseFileName } from '../lib/analysis';

interface Props {
  metadata: TestMetadata;
  onMetadataChange: (meta: TestMetadata) => void;
  onFileUpload: (file: File) => void;
}

export function DashboardHeader({ metadata, onMetadataChange, onFileUpload }: Props) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
      const parsed = parseFileName(file.name);
      onMetadataChange(parsed);
    }
  };

  return (
    <header id="dashboard-header" className="border-b border-brand-border bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-brand-accent/10 p-2 rounded-lg">
            <Settings2 className="w-6 h-6 text-brand-accent" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-white">Power Test AI Analysis</h1>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">Personal Automation Edition</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-md border border-brand-border">
            <span className="text-xs text-slate-500 font-mono">VIN:</span>
            <input 
              type="text" 
              value={metadata.voltage} 
              onChange={e => onMetadataChange({ ...metadata, voltage: e.target.value })}
              className="bg-transparent border-none focus:ring-0 text-sm font-medium w-16 text-brand-accent"
              placeholder="28V"
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-md border border-brand-border">
            <span className="text-xs text-slate-500 font-mono">TEMP:</span>
            <input 
              type="text" 
              value={metadata.temperature} 
              onChange={e => onMetadataChange({ ...metadata, temperature: e.target.value })}
              className="bg-transparent border-none focus:ring-0 text-sm font-medium w-16 text-brand-accent"
              placeholder="80C"
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-md border border-brand-border">
            <span className="text-xs text-slate-500 font-mono">LOAD:</span>
            <input 
              type="text" 
              value={metadata.load} 
              onChange={e => onMetadataChange({ ...metadata, load: e.target.value })}
              className="bg-transparent border-none focus:ring-0 text-sm font-medium w-16 text-brand-accent"
              placeholder="50%"
            />
          </div>

          <label className="flex items-center gap-2 px-4 py-2 bg-brand-accent hover:bg-brand-accent/90 text-slate-900 font-medium rounded-md cursor-pointer transition-all">
            <Upload className="w-4 h-4" />
            <span>Import CSV</span>
            <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
          </label>
        </div>
      </div>
    </header>
  );
}
