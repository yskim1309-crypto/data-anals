/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Download, CheckCircle2, AlertCircle, FileBarChart, Sparkles, Loader2 } from 'lucide-react';
import { AnalysisResult } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Props {
  results: AnalysisResult | null;
  fileName: string;
  onAiAnalyze: () => void;
  isAiLoading: boolean;
}

export function ResultsPanel({ results, fileName, onAiAnalyze, isAiLoading }: Props) {
  const exportPDF = async () => {
    const element = document.body; // Capture entire body
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#0b0f1a'
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
    <div className="w-96 border-l border-brand-border h-[calc(100vh-73px)] p-6 flex flex-col gap-6 bg-slate-900/20 overflow-y-auto">
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
          {results.milStdResults ? (
            <>
              <MetricBox 
                label="Worst-case Margin" 
                value={`${results.milStdResults.worstMargin.toFixed(1)} dB`} 
                color={results.milStdResults.worstMargin < 0 ? 'text-rose-400' : 'text-emerald-400'}
              />
              {results.milStdResults.failedFrequency && (
                <MetricBox 
                  label="Failure Freq" 
                  value={`${(results.milStdResults.failedFrequency / 1000).toFixed(1)} kHz`} 
                />
              )}
              <MetricBox label="RMS Noise" value={`${results.rmsValue.toFixed(2)} dBuV`} />
            </>
          ) : (
            <>
              <MetricBox label="Peak-to-Peak" value={`${results.peakValue.toFixed(2)} V`} />
              <MetricBox label="RMS Voltage" value={`${results.rmsValue.toFixed(2)} V`} />
              <MetricBox label="Ripple Factor" value={`${results.ripple.toFixed(2)} %`} />
            </>
          )}
          {results.efficiency && <MetricBox label="Efficiency" value={`${results.efficiency.toFixed(1)} %`} />}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-brand-accent" />
            AI Insights
          </h2>
          {!results.aiSummary && (
            <button 
              onClick={onAiAnalyze}
              disabled={isAiLoading}
              className="text-[10px] font-bold text-brand-accent hover:underline disabled:opacity-50"
            >
              {isAiLoading ? 'GENERATING...' : 'ASK AI'}
            </button>
          )}
        </div>
        
        <div className="bg-slate-800/30 border border-brand-border rounded-xl p-4 min-h-[100px] flex flex-col">
          {isAiLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 py-4">
              <Loader2 className="w-5 h-5 text-brand-accent animate-spin" />
              <p className="text-[10px] font-mono text-slate-500">Processing signals with Gemini...</p>
            </div>
          ) : results.aiSummary ? (
            <div className="text-[12px] text-slate-300 leading-relaxed whitespace-pre-line">
              {results.aiSummary}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <p className="text-[11px] text-slate-600 italic">No AI insights generated yet. Click "ASK AI" to analyze with Gemini.</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto pt-6 space-y-3">
        <button 
          onClick={exportPDF}
          className="w-full flex items-center justify-center gap-2 py-3 bg-brand-accent text-white rounded-lg font-bold hover:bg-brand-accent/90 transition-colors shadow-lg"
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

function MetricBox({ label, value, color = 'text-white' }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-slate-800/50 border border-brand-border p-3 rounded-lg flex justify-between items-center">
      <span className="text-[11px] text-slate-500 uppercase font-medium">{label}</span>
      <span className={`text-sm font-mono ${color}`}>{value}</span>
    </div>
  );
}
