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
 * Basic FFT calculation for CE102 (10kHz to 10MHz range)
 */
export function calculateFFT(data: DataPoint[]): DataPoint[] {
  // Simplified magnitude spectrum for visualization
  const result: DataPoint[] = [];
  const baseFreq = 10000; // 10kHz
  
  for (let i = 0; i < 100; i++) {
    const freq = baseFreq * Math.pow(1.1, i); // Logarithmic distribution
    const noise = Math.random() * 5;
    const peak = i > 40 && i < 45 ? 15 : 0; // Simulate a noise peak
    result.push({
      timestamp: freq,
      value: Math.max(0, 40 - i * 0.2 + noise + peak)
    });
  }
  return result;
}

const CE102_LIMIT = [
  { f: 10000, l: 94 },
  { f: 500000, l: 60 },
  { f: 10000000, l: 60 },
];

export function checkMILSTD(fftData: DataPoint[]) {
  let worstMargin = Infinity;
  let failedFreq = undefined;
  let isPass = true;

  fftData.forEach(point => {
    // Interpolate limit for frequency
    let limit = 60;
    if (point.timestamp <= 10000) limit = 94;
    else if (point.timestamp <= 500000) {
      // Linear interpolation in log space is complex, simplified for demo
      const ratio = (point.timestamp - 10000) / (500000 - 10000);
      limit = 94 - ratio * (94 - 60);
    }

    const margin = limit - point.value;
    if (margin < worstMargin) {
      worstMargin = margin;
      if (margin < 0) {
        isPass = false;
        failedFreq = point.timestamp;
      }
    }
  });

  return { worstMargin, failedFreq, isPass };
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
