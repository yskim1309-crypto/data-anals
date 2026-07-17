/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DataPoint, TestMetadata } from '../types';

/**
 * Parses test conditions from filename using regex
 * Example: Test_28V_80C_Load50.csv -> { voltage: '28V', temperature: '80C', load: '50' }
 */
export function parseFileName(name: string): TestMetadata {
  const meta: TestMetadata = {
    fileName: name,
    voltage: '',
    temperature: '',
    load: '',
    other: ''
  };

  const voltageMatch = name.match(/(\d+)V/i);
  const tempMatch = name.match(/(\d+)(C|Deg)/i);
  const loadMatch = name.match(/Load(\d+)/i);

  if (voltageMatch) meta.voltage = voltageMatch[0];
  if (tempMatch) meta.temperature = tempMatch[1] + '°C';
  if (loadMatch) meta.load = loadMatch[1] + '%';

  return meta;
}

/**
 * Min-Max Decimation (Peak-Preserve Downsampling)
 * Reduces data points while keeping local extrema to ensure noise/peaks are not missed.
 */
export function downsamplePeakPreserve(data: DataPoint[], threshold: number): DataPoint[] {
  if (data.length <= threshold) return data;

  const sampled: DataPoint[] = [];
  const bucketSize = Math.floor(data.length / threshold);

  for (let i = 0; i < threshold; i++) {
    const start = i * bucketSize;
    const end = Math.min(start + bucketSize, data.length);
    
    let minIdx = start;
    let maxIdx = start;

    for (let j = start + 1; j < end; j++) {
      if (data[j].value < data[minIdx].value) minIdx = j;
      if (data[j].value > data[maxIdx].value) maxIdx = j;
    }

    // Add min and max in chronological order
    if (minIdx < maxIdx) {
      sampled.push(data[minIdx]);
      sampled.push(data[maxIdx]);
    } else if (minIdx > maxIdx) {
      sampled.push(data[maxIdx]);
      sampled.push(data[minIdx]);
    } else {
      sampled.push(data[minIdx]);
    }
  }

  return sampled;
}

/**
 * Basic FFT calculation (mock/placeholder for full implementation)
 * In a real production environment, this would use a dedicated library or WASM.
 */
export function calculateFFT(data: DataPoint[]): { frequency: number; amplitude: number }[] {
  // Simplified magnitude spectrum for visualization
  const result = [];
  const sampleRate = 1000; // Example
  for (let i = 1; i < 50; i++) {
    result.push({
      frequency: i * 10,
      amplitude: Math.random() * 10 / i
    });
  }
  return result;
}

export function calculateStats(data: DataPoint[]) {
  if (data.length === 0) return null;
  
  const values = data.map(d => d.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  
  // Simple RMS
  const rms = Math.sqrt(values.reduce((a, b) => a + b * b, 0) / values.length);
  
  // Ripple % (Peak-to-Peak / Avg)
  const ripple = avg !== 0 ? ((max - min) / avg) * 100 : 0;

  return { max, min, avg, rms, ripple };
}
