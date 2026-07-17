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
import { downsamplePeakPreserve, calculateStats, parseFileName, calculateFFT, checkMILSTD } from './lib/analysis';

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
  const [xAxisParam, setXAxisParam] = useState<keyof DataPoint>('timestamp');
  const [yAxisParam, setYAxisParam] = useState<keyof DataPoint>('value');

  const [aiSummary, setAiSummary] = useState<string | undefined>(undefined);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleFileUpload = useCallback((file: File) => {
    setLoading(true);
    setMetadata(parseFileName(file.name));
    setAiSummary(undefined);

    // If it's a dummy file from "Load Sample", generate virtual data
    if (file.size === 0) {
      setTimeout(() => {
        const mock: DataPoint[] = [];
        for (let i = 0; i < 5000; i++) {
          const t = i * 0.1;
          const base = 28;
          const ripple = Math.sin(t * 0.4) * 0.5;
          const noise = (Math.random() - 0.5) * 0.3;
          const val = base + ripple + noise;
          
          // Simulated temperature starting at 25C and rising with load
          const temp = 25 + (i * 0.005) + Math.sin(t * 0.1) * 2;
          const current = 10 + Math.sin(t * 0.2) * 2 + (Math.random() - 0.5) * 0.5;
          const power = val * current;
          
          mock.push({
            timestamp: t,
            value: val,
            temperature: temp,
            current: current,
            power: power,
            simulation: base + ripple
          });
        }
        setRawData(mock);
        setLoading(false);
      }, 800);
      return;
    }

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

    let milStdResults = undefined;
    let isPass = stats.ripple < 5;

    if (mode === 'MIL_STD' || mode === 'FFT') {
      const fftData = calculateFFT(rawData);
      milStdResults = checkMILSTD(fftData);
      isPass = milStdResults.isPass;
    }

    return {
      ripple: stats.ripple,
      peakValue: stats.max - stats.min,
      rmsValue: stats.rms,
      passFail: isPass ? 'PASS' : 'FAIL',
      efficiency: metadata.load ? 92.4 : undefined, // Mock efficiency
      aiSummary: aiSummary,
      milStdResults
    };
  }, [rawData, metadata.load, aiSummary, mode]);

  const handleAiAnalyze = useCallback(async () => {
    if (!analysisResults) return;
    
    setIsAiLoading(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metadata,
          stats: analysisResults
        }),
      });
      
      const data = await response.json();
      if (data.summary) {
        setAiSummary(data.summary);
      }
    } catch (error) {
      console.error('AI Analysis Error:', error);
    } finally {
      setIsAiLoading(false);
    }
  }, [analysisResults, metadata]);

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
          xAxisParam={xAxisParam}
          setXAxisParam={setXAxisParam}
          yAxisParam={yAxisParam}
          setYAxisParam={setYAxisParam}
        />
        
        <MainChart 
          data={processedData} 
          mode={mode} 
          loading={loading}
          xAxisParam={xAxisParam}
          yAxisParam={yAxisParam}
        />

        <ResultsPanel 
          results={analysisResults} 
          fileName={metadata.fileName}
          onAiAnalyze={handleAiAnalyze}
          isAiLoading={isAiLoading}
        />
      </main>

      {/* Grid Pattern Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 opacity-[0.02]" 
        style={{ backgroundImage: 'radial-gradient(#f37321 1px, transparent 1px)', backgroundSize: '32px 32px' }} 
      />
    </div>
  );
}
