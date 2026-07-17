/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useMemo } from 'react';
import Papa from 'papaparse';
import { DashboardHeader } from './components/DashboardHeader';
import { AnalysisSidebar } from './components/AnalysisSidebar';
import { MainChart } from './components/MainChart';
import { ResultsPanel } from './components/ResultsPanel';
import { TestMetadata, AnalysisMode, DataPoint, AnalysisResult } from './types';
import { downsamplePeakPreserve, calculateStats } from './lib/analysis';

export default function App() {
  const [metadata, setMetadata] = useState<TestMetadata>({
    fileName: '',
    voltage: '',
    temperature: '',
    load: '',
    other: ''
  });

  const [mode, setMode] = useState<AnalysisMode>('WAVEFORM');
  const [rawData, setRawData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [downsampleRate, setDownsampleRate] = useState(2000);

  const handleFileUpload = useCallback((file: File) => {
    setLoading(true);
    setMetadata(prev => ({ ...prev, fileName: file.name }));

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Assume first column is time/timestamp and second is value
        const parsed: DataPoint[] = results.data.map((row: any, idx: number) => {
          const keys = Object.keys(row);
          return {
            timestamp: typeof row[keys[0]] === 'number' ? row[keys[0]] : idx,
            value: typeof row[keys[1]] === 'number' ? row[keys[1]] : 0,
            simulation: typeof row[keys[2]] === 'number' ? row[keys[2]] : undefined,
          };
        });
        
        setRawData(parsed);
        setLoading(false);
      },
      error: (error) => {
        console.error('CSV Parsing Error:', error);
        setLoading(false);
      }
    });
  }, []);

  const processedData = useMemo(() => {
    if (rawData.length === 0) return [];
    return downsamplePeakPreserve(rawData, downsampleRate);
  }, [rawData, downsampleRate]);

  const analysisResults = useMemo((): AnalysisResult | null => {
    if (rawData.length === 0) return null;
    
    const stats = calculateStats(rawData);
    if (!stats) return null;

    // Logic for PASS/FAIL (Example: Ripple < 5% is PASS)
    const isPass = stats.ripple < 5;

    return {
      ripple: stats.ripple,
      peakValue: stats.max - stats.min,
      rmsValue: stats.rms,
      passFail: isPass ? 'PASS' : 'FAIL',
      efficiency: metadata.load ? 92.4 : undefined // Mock efficiency
    };
  }, [rawData, metadata.load]);

  return (
    <div className="min-h-screen flex flex-col selection:bg-brand-accent selection:text-slate-900">
      <DashboardHeader 
        metadata={metadata} 
        onMetadataChange={setMetadata} 
        onFileUpload={handleFileUpload} 
      />

      <main className="flex flex-1 min-h-0">
        <AnalysisSidebar 
          mode={mode} 
          setMode={setMode} 
          downsampleRate={downsampleRate}
          setDownsampleRate={setDownsampleRate}
        />
        
        <MainChart 
          data={processedData} 
          mode={mode} 
          loading={loading} 
        />

        <ResultsPanel 
          results={analysisResults} 
          fileName={metadata.fileName} 
        />
      </main>

      {/* Grid Pattern Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 opacity-[0.03]" 
        style={{ backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)', backgroundSize: '32px 32px' }} 
      />
    </div>
  );
}
