/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TestMetadata {
  fileName: string;
  voltage: string;
  temperature: string;
  load: string;
  other: string;
}

export interface DataPoint {
  timestamp: number;
  value: number; // Output Voltage
  valueInput?: number;
  temperature?: number;
  current?: number; // Output Current
  currentInput?: number;
  power?: number; // Output Power
  powerInput?: number;
  simulation?: number;
}

export interface AnalysisResult {
  ripple: number;
  efficiency?: number;
  peakValue: number;
  rmsValue: number;
  passFail: 'PASS' | 'FAIL' | 'PENDING';
  aiSummary?: string;
  milStdResults?: {
    worstMargin: number;
    failedFrequency?: number;
    isPass: boolean;
  };
}

export type AnalysisMode = 'WAVEFORM' | 'FFT' | 'MIL_STD' | 'SIMULATION';

export interface LimitLinePoint {
  frequency: number;
  limit: number;
}
