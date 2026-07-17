/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Download, CheckCircle2, AlertCircle, FileBarChart } from 'lucide-react';
import { AnalysisResult } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Props {
  results: AnalysisResult | null;
  fileName: string;
}

export function ResultsPanel({ results, fileName }: Props) {
  const exportPDF = async () => {
    const element = document.getElementById('root');
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#0f172a'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('l', 'mm', 'a4');
    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();
    
    pdf.addImage(imgData, 'PNG', 0, 0, width, height);
    pdf.save(`Analysis_Report_${fileName.replace('.csv', '')}.pdf`);
  };

  if (!results) {
    return (
      <div className="w-80 border-l border-brand-border h-[calc(100vh-73px)] p-6 bg-slate-900/20">
        <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
          <FileBarChart className="w-12 h-12 mb-4" />
          <p className="text-xs font-mono uppercase tracking-widest">Waiting for Data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 border-l border-brand-border h-[calc(100vh-73px)] p-6 flex flex-col gap-6 bg-slate-900/20">
      <div className="space-y-4">
        <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest">Analysis Verdict</h2>
        
        <div className={`p-4 rounded-xl border flex items-center gap-3 ${
          results.passFail === 'PASS' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          {results.passFail === 'PASS' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-bold tracking-tight text-lg">{results.passFail}</span>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest">Metrics Summary</h2>
        <div className="grid gap-3">
          <MetricBox label="Peak-to-Peak" value={`${results.peakValue.toFixed(2)} V`} />
          <MetricBox label="RMS Voltage" value={`${results.rmsValue.toFixed(2)} V`} />
          <MetricBox label="Ripple Factor" value={`${results.ripple.toFixed(2)} %`} />
          {results.efficiency && <MetricBox label="Efficiency" value={`${results.efficiency.toFixed(1)} %`} />}
        </div>
      </div>

      <div className="mt-auto space-y-3">
        <button 
          onClick={exportPDF}
          className="w-full flex items-center justify-center gap-2 py-3 bg-white text-slate-900 rounded-lg font-bold hover:bg-slate-200 transition-colors shadow-lg"
        >
          <Download className="w-4 h-4" />
          GENERATE PDF
        </button>
        <p className="text-[10px] text-center text-slate-500 font-mono">
          REF: MIL-STD-461G / CE102
        </p>
      </div>
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-800/50 border border-brand-border p-3 rounded-lg flex justify-between items-center">
      <span className="text-[11px] text-slate-500 uppercase font-medium">{label}</span>
      <span className="text-sm font-mono text-white">{value}</span>
    </div>
  );
}
