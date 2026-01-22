"use client";

import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell, AreaChart, Area } from 'recharts';

type QuarterId = 'T1' | 'T2' | 'T3' | 'T4';

type SeasonalMethodName = 'simple-averages' | 'ratio-to-trend' | 'ratio-to-moving-average';

interface SeasonalMethod {
  name: SeasonalMethodName;
  label: string;
  coefficients: Record<QuarterId, number>;
  product: number;
  correctionFactor: number;
  accuracy: AccuracyMetrics;
}

interface AccuracyMetrics {
  bias: number;
  mae: number;
  mse: number;
  rmse: number;
}

interface EstimatedPoint {
  t: number;
  year: number;
  quarter: QuarterId;
  label: string;
  sales?: number;
  trend?: number;
  seasonal: number;
  estimated: number;
  residualRatio?: number;
  cvs?: number;
}

interface Forecast {
  t: number;
  year: number;
  quarter: QuarterId;
  forecast: number;
  label: string;
  estimated: number;
  lowerCI?: number;
  upperCI?: number;
}

const TimeSeriesAnalysis = () => {
  const [activeTab, setActiveTab] = useState('original');
  const [showTable, setShowTable] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<SeasonalMethodName>('ratio-to-moving-average');
  const [showReestimated, setShowReestimated] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);

  // Données originales
  const originalData = [
    { t: 1, year: 2018, quarter: 'T1', sales: 5030 },
    { t: 2, year: 2018, quarter: 'T2', sales: 6030 },
    { t: 3, year: 2018, quarter: 'T3', sales: 7030 },
    { t: 4, year: 2018, quarter: 'T4', sales: 5780 },
    { t: 5, year: 2019, quarter: 'T1', sales: 5280 },
    { t: 6, year: 2019, quarter: 'T2', sales: 6780 },
    { t: 7, year: 2019, quarter: 'T3', sales: 7530 },
    { t: 8, year: 2019, quarter: 'T4', sales: 6530 },
    { t: 9, year: 2020, quarter: 'T1', sales: 5530 },
    { t: 10, year: 2020, quarter: 'T2', sales: 7280 },
    { t: 11, year: 2020, quarter: 'T3', sales: 8530 },
    { t: 12, year: 2020, quarter: 'T4', sales: 7030 },
    { t: 13, year: 2021, quarter: 'T1', sales: 6280 },
    { t: 14, year: 2021, quarter: 'T2', sales: 8280 },
    { t: 15, year: 2021, quarter: 'T3', sales: 9280 },
    { t: 16, year: 2021, quarter: 'T4', sales: 7780 },
  ];

  // ==========================================
  // ==========================================
  // CORE CALCULATIONS (multiplicative model)
  // ==========================================

  const quarters: QuarterId[] = ['T1', 'T2', 'T3', 'T4'];

  // Least squares trend (baseline)
  const calculateLeastSquaresTrend = () => {
    const n = originalData.length;
    const sumT = originalData.reduce((sum, d) => sum + d.t, 0);
    const sumY = originalData.reduce((sum, d) => sum + d.sales, 0);
    const sumT2 = originalData.reduce((sum, d) => sum + d.t * d.t, 0);
    const sumTY = originalData.reduce((sum, d) => sum + d.t * d.sales, 0);
    const a = (n * sumTY - sumT * sumY) / (n * sumT2 - sumT * sumT);
    const b = (sumY - a * sumT) / n;
    return { a, b };
  };

  const { a: trendA, b: trendB } = calculateLeastSquaresTrend();
  const getTrend = (t: number) => trendB + trendA * t;

  // Semi-average trend (two halves)
  const calculateTrendSemiAverage = () => {
    const mid = originalData.length / 2;
    const firstHalf = originalData.filter(d => d.t <= mid);
    const secondHalf = originalData.filter(d => d.t > mid);
    const avgFirst = firstHalf.reduce((s, d) => s + d.sales, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((s, d) => s + d.sales, 0) / secondHalf.length;
    const tFirst = (firstHalf[0].t + firstHalf[firstHalf.length - 1].t) / 2;
    const tSecond = (secondHalf[0].t + secondHalf[secondHalf.length - 1].t) / 2;
    const a = (avgSecond - avgFirst) / (tSecond - tFirst);
    const b = avgFirst - a * tFirst;
    return { a, b };
  };

  // Moving average trend (order 4 centered)
  const calculateMovingAverage = () => {
    const data = [...originalData];
    const result = [] as Array<{
      t: number;
      year: number;
      quarter: QuarterId;
      sales: number;
      label: string;
      mm4: number | null;
      mmc4: number | null;
    }>;
    for (let i = 0; i < data.length; i++) {
      if (i >= 1 && i < data.length - 2) {
        const sum = data[i - 1].sales + data[i].sales + data[i + 1].sales + data[i + 2].sales;
        const mm4 = sum / 4;
        result.push({
          t: data[i].t,
          year: data[i].year,
          quarter: data[i].quarter as QuarterId,
          sales: data[i].sales,
          label: `${data[i].year}-${data[i].quarter}`,
          mm4: Math.round(mm4 * 100) / 100,
          mmc4: null,
        });
      } else {
        result.push({
          t: data[i].t,
          year: data[i].year,
          quarter: data[i].quarter as QuarterId,
          sales: data[i].sales,
          label: `${data[i].year}-${data[i].quarter}`,
          mm4: null,
          mmc4: null,
        });
      }
    }
    for (let i = 0; i < result.length; i++) {
      if (i > 0 && i < result.length - 1 && result[i].mm4 !== null && result[i + 1].mm4 !== null) {
        const mmc4 = (result[i].mm4! + result[i + 1].mm4!) / 2;
        result[i].mmc4 = Math.round(mmc4 * 100) / 100;
      }
    }
    return result;
  };

  const movingAvgData = useMemo(() => calculateMovingAverage(), []);

  const correctProduct = (coeffs: Record<QuarterId, number>) => {
    const product = quarters.reduce((p, q) => p * coeffs[q], 1);
    const factor = Math.pow(1 / product, 1 / 4);
    const corrected: Record<QuarterId, number> = { ...coeffs };
    quarters.forEach(q => {
      corrected[q] = coeffs[q] * factor;
    });
    const finalProduct = quarters.reduce((p, q) => p * corrected[q], 1);
    return { corrected, product: finalProduct, factor };
  };

  // Seasonal - Simple Averages (Y / T)
  const calculateSeasonalSimpleAverages = () => {
    const ratios: Record<QuarterId, number[]> = { T1: [], T2: [], T3: [], T4: [] };
    originalData.forEach((d: { t: number; year: number; quarter: string; sales: number }) => {
      ratios[d.quarter as QuarterId].push(d.sales / getTrend(d.t));
    });
    const raw: Record<QuarterId, number> = { T1: 1, T2: 1, T3: 1, T4: 1 };
    quarters.forEach(q => {
      const arr = ratios[q];
      raw[q] = arr.reduce((s, v) => s + v, 0) / arr.length;
    });
    return correctProduct(raw);
  };

  // Seasonal - Ratio to Trend (same ratios but kept distinct for clarity)
  const calculateSeasonalRatioToTrend = () => {
    return calculateSeasonalSimpleAverages();
  };

  // Seasonal - Ratio to Moving Average (MMc4)
  const calculateSeasonalRatioToMA = () => {
    const ratios: Record<QuarterId, number[]> = { T1: [], T2: [], T3: [], T4: [] };
    movingAvgData.forEach((d: { t: number; year: number; quarter: QuarterId; sales: number; label: string; mm4: number | null; mmc4: number | null }) => {
      if (d.mmc4 && d.mmc4 > 0) {
        ratios[d.quarter].push(d.sales / d.mmc4);
      }
    });
    const raw: Record<QuarterId, number> = { T1: 1, T2: 1, T3: 1, T4: 1 };
    quarters.forEach(q => {
      const arr = ratios[q];
      raw[q] = arr.reduce((s, v) => s + v, 0) / arr.length;
    });
    return correctProduct(raw);
  };

  const formatAccuracy = (metrics: AccuracyMetrics): AccuracyMetrics => ({
    bias: Math.round(metrics.bias * 100) / 100,
    mae: Math.round(metrics.mae * 100) / 100,
    mse: Math.round(metrics.mse * 100) / 100,
    rmse: Math.round(metrics.rmse * 100) / 100,
  });

  const calculateAccuracy = (coeffs: Record<QuarterId, number>): AccuracyMetrics => {
    const errors = originalData.map((d: { t: number; year: number; quarter: string; sales: number }) => {
      const est = getTrend(d.t) * coeffs[d.quarter as QuarterId];
      return est - d.sales;
    });
    const n = errors.length;
    const bias = errors.reduce((s, e) => s + e, 0) / n;
    const mae = errors.reduce((s, e) => s + Math.abs(e), 0) / n;
    const mse = errors.reduce((s, e) => s + e * e, 0) / n;
    const rmse = Math.sqrt(mse);
    return formatAccuracy({ bias, mae, mse, rmse });
  };

  const buildSeasonalMethods = (): SeasonalMethod[] => {
    const simple = calculateSeasonalSimpleAverages();
    const ratioTrend = calculateSeasonalRatioToTrend();
    const ratioMA = calculateSeasonalRatioToMA();
    return [
      {
        name: 'simple-averages',
        label: 'Simple Averages (Y/T)',
        coefficients: simple.corrected,
        product: simple.product,
        correctionFactor: simple.factor,
        accuracy: calculateAccuracy(simple.corrected),
      },
      {
        name: 'ratio-to-trend',
        label: 'Ratio to Trend',
        coefficients: ratioTrend.corrected,
        product: ratioTrend.product,
        correctionFactor: ratioTrend.factor,
        accuracy: calculateAccuracy(ratioTrend.corrected),
      },
      {
        name: 'ratio-to-moving-average',
        label: 'Ratio to Moving Average',
        coefficients: ratioMA.corrected,
        product: ratioMA.product,
        correctionFactor: ratioMA.factor,
        accuracy: calculateAccuracy(ratioMA.corrected),
      },
    ];
  };

  const seasonalMethods = useMemo(() => buildSeasonalMethods(), [movingAvgData]);
  const selectedSeasonal = seasonalMethods.find((m: SeasonalMethod) => m.name === selectedMethod) || seasonalMethods[0];

  // Build estimated series for a given seasonal method and trend params
  const buildEstimatedSeries = (coeffs: Record<QuarterId, number>, trendGetter: (t: number) => number) => {
    return originalData.map((d: { t: number; year: number; quarter: string; sales: number }) => {
      const trend = trendGetter(d.t);
      const seasonal = coeffs[d.quarter as QuarterId];
      const estimated = trend * seasonal;
      const residualRatio = d.sales / estimated;
      const cvs = d.sales / seasonal;
      return {
        ...d,
        label: `${d.year}-${d.quarter}`,
        trend: Math.round(trend * 100) / 100,
        seasonal,
        estimated: Math.round(estimated * 100) / 100,
        residualRatio: Math.round(residualRatio * 10000) / 10000,
        cvs: Math.round(cvs * 100) / 100,
      } as EstimatedPoint;
    });
  };

  // Deseasonalize and refit trend on CVS
  const reestimateTrendFromCVS = (coeffs: Record<QuarterId, number>) => {
    const cvs = originalData.map((d: { t: number; year: number; quarter: string; sales: number }) => ({ t: d.t, y: d.sales / coeffs[d.quarter as QuarterId] }));
    const n = cvs.length;
    const sumT = cvs.reduce((s, d) => s + d.t, 0);
    const sumY = cvs.reduce((s, d) => s + d.y, 0);
    const sumT2 = cvs.reduce((s, d) => s + d.t * d.t, 0);
    const sumTY = cvs.reduce((s, d) => s + d.t * d.y, 0);
    const a = (n * sumTY - sumT * sumY) / (n * sumT2 - sumT * sumT);
    const b = (sumY - a * sumT) / n;
    return { a, b };
  };

  const calculateMetricsForSeries = (series: EstimatedPoint[]): AccuracyMetrics => {
    const errors = series.map(p => (p.estimated ?? 0) - (p.sales ?? 0));
    const n = errors.length;
    const bias = errors.reduce((s, e) => s + e, 0) / n;
    const mae = errors.reduce((s, e) => s + Math.abs(e), 0) / n;
    const mse = errors.reduce((s, e) => s + e * e, 0) / n;
    const rmse = Math.sqrt(mse);
    return formatAccuracy({ bias, mae, mse, rmse });
  };

  const calculateStandardErrorOfEstimate = (series: EstimatedPoint[]): number => {
    const errors = series.map(p => (p.estimated ?? 0) - (p.sales ?? 0));
    const n = errors.length;
    const sse = errors.reduce((s, e) => s + e * e, 0);
    const k = 2; // 2 parameters: intercept + slope
    const se = Math.sqrt(sse / (n - k));
    return se;
  };

  const buildForecasts = (
    coeffs: Record<QuarterId, number>,
    trendGetter: (t: number) => number,
    standardError?: number,
  ): Forecast[] => {
    const se = standardError || 0;
    const criticalValue = 1.96; // 95% CI
    const forecasts = [17, 18, 19, 20].map(t => {
      const quarter = (`T${((t - 1) % 4) + 1}`) as QuarterId;
      const trend = trendGetter(t);
      const seasonal = coeffs[quarter];
      const forecast = trend * seasonal;
      const marginOfError = se > 0 ? criticalValue * se : 0;
      return {
        t,
        year: 2022,
        quarter,
        forecast: Math.round(forecast * 100) / 100,
        label: `2022-${quarter}`,
        estimated: Math.round(forecast * 100) / 100,
        lowerCI: marginOfError > 0 ? Math.round((forecast - marginOfError) * 100) / 100 : undefined,
        upperCI: marginOfError > 0 ? Math.round((forecast + marginOfError) * 100) / 100 : undefined,
      };
    });
    return forecasts;
  };

  // Pipelines for selected seasonal method
  const estimatedData = useMemo(() => buildEstimatedSeries(selectedSeasonal.coefficients, getTrend), [selectedSeasonal]);
  const accuracyMetrics = useMemo(() => calculateMetricsForSeries(estimatedData), [estimatedData]);
  const standardErrorOriginal = useMemo(() => calculateStandardErrorOfEstimate(estimatedData), [estimatedData]);
  const cvsData = useMemo(() => estimatedData.map((p: EstimatedPoint) => ({ ...p, cvs: p.cvs })), [estimatedData]);

  const reestimatedTrend = useMemo(() => reestimateTrendFromCVS(selectedSeasonal.coefficients), [selectedSeasonal]);
  const getReTrend = (t: number) => reestimatedTrend.b + reestimatedTrend.a * t;
  const reestimatedData = useMemo(() => buildEstimatedSeries(selectedSeasonal.coefficients, getReTrend), [selectedSeasonal, reestimatedTrend]);
  const reestimatedMetrics = useMemo(() => calculateMetricsForSeries(reestimatedData), [reestimatedData]);
  const standardErrorReestimated = useMemo(() => calculateStandardErrorOfEstimate(reestimatedData), [reestimatedData]);

  const forecastsOriginal = useMemo(() => buildForecasts(selectedSeasonal.coefficients, getTrend, standardErrorOriginal), [selectedSeasonal, standardErrorOriginal]);
  const forecastsReestimated = useMemo(() => buildForecasts(selectedSeasonal.coefficients, getReTrend, standardErrorReestimated), [selectedSeasonal, reestimatedTrend, standardErrorReestimated]);

  const forecastData = [...estimatedData, ...forecastsOriginal];

  // Export functions
  const exportToCSV = (data: any[], filename: string) => {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((row: any) => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const copyTableToClipboard = (data: any[]) => {
    const text = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      alert('Data copied to clipboard!');
    }).catch((err: Error) => {
      console.error('Failed to copy:', err);
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8 text-indigo-900">
        Time Series Analysis - Quarterly Sales (Multiplicative Model)
      </h1>

      {/* Method selection & toggles */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white p-3 md:p-4 rounded-lg shadow border border-indigo-100">
          <div className="text-xs md:text-sm font-semibold text-indigo-700 mb-2 flex items-center gap-1">
            Seasonal method
            <span className="text-gray-400 cursor-help" title="Select which method to use for seasonal decomposition">ℹ️</span>
          </div>
          <select
            value={selectedMethod}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedMethod(e.target.value as SeasonalMethodName)}
            className="w-full border border-indigo-200 rounded px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm"
          >
            {seasonalMethods.map((m: SeasonalMethod) => (
              <option key={m.name} value={m.name}>{m.label}</option>
            ))}
          </select>
          <div className="text-xs text-gray-500 mt-2">Product = {selectedSeasonal.product.toFixed(4)} | Correction factor {selectedSeasonal.correctionFactor.toFixed(6)}</div>
        </div>

        <div className="bg-white p-3 md:p-4 rounded-lg shadow border border-green-100">
          <div className="text-xs md:text-sm font-semibold text-green-700 mb-2 flex items-center gap-1">
            Original model accuracy
            <span className="text-gray-400 cursor-help" title="Error metrics for the original trend-based model">ℹ️</span>
          </div>
          <div className="text-xs text-gray-600">Bias: <span className="font-semibold">{accuracyMetrics.bias}</span></div>
          <div className="text-xs text-gray-600">MAE: <span className="font-semibold">{accuracyMetrics.mae}</span></div>
          <div className="text-xs text-gray-600">MSE (EQM): <span className="font-semibold">{accuracyMetrics.mse}</span></div>
          <div className="text-xs text-gray-600">RMSE: <span className="font-semibold">{accuracyMetrics.rmse}</span></div>
        </div>

        <div className="bg-white p-3 md:p-4 rounded-lg shadow border border-purple-100">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs md:text-sm font-semibold text-purple-700 flex items-center gap-1">
              Re-estimated model (CVS)
              <span className="text-gray-400 cursor-help" title="Model re-estimated after deseasonalization">ℹ️</span>
            </div>
            <label className="text-xs text-gray-500 flex items-center gap-1">
              <input type="checkbox" checked={showReestimated} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShowReestimated(e.target.checked)} /> show
            </label>
          </div>
          <div className="text-xs text-gray-600">Bias: <span className="font-semibold">{reestimatedMetrics.bias}</span></div>
          <div className="text-xs text-gray-600">MAE: <span className="font-semibold">{reestimatedMetrics.mae}</span></div>
          <div className="text-xs text-gray-600">MSE (EQM): <span className="font-semibold">{reestimatedMetrics.mse}</span></div>
          <div className="text-xs text-gray-600">RMSE: <span className="font-semibold">{reestimatedMetrics.rmse}</span></div>
          <div className="text-xs text-gray-500 mt-1">Trend (CVS): {reestimatedTrend.b.toFixed(2)} + {reestimatedTrend.a.toFixed(2)}t</div>
        </div>
      </div>

      {/* Button to show/hide calculation table */}
      <div className="mb-4 text-center">
        <button
          onClick={() => setShowTable(!showTable)}
          className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm md:text-base font-bold rounded-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
        >
          {showTable ? '🔼 Hide Calculation Table' : '🔽 Show Complete Calculation Table'}
        </button>
      </div>

      {/* Calculation table */}
      {showTable && (
        <div className="mb-6 bg-white rounded-lg shadow-lg p-6 overflow-x-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-indigo-800">Calculation Summary Table - Multiplicative Model</h2>
            <div className="flex gap-2">
              <button
                onClick={() => exportToCSV(estimatedData, 'time-series-calculations')}
                className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                title="Export table as CSV"
              >
                📥 Export CSV
              </button>
              <button
                onClick={() => copyTableToClipboard(estimatedData)}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                title="Copy data to clipboard"
              >
                📋 Copy
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">

            <table className="min-w-full border-collapse border border-indigo-300">
              <thead>
                <tr className="bg-indigo-600 text-white">
                  <th className="border border-indigo-300 px-3 py-2">t</th>
                  <th className="border border-indigo-300 px-3 py-2">Year</th>
                  <th className="border border-indigo-300 px-3 py-2">Quarter</th>
                  <th className="border border-indigo-300 px-3 py-2">Sales (Yt)</th>
                  <th className="border border-indigo-300 px-3 py-2">Trend (Tt)</th>
                  <th className="border border-indigo-300 px-3 py-2">Yt / Tt</th>
                  <th className="border border-indigo-300 px-3 py-2">Seasonal Index (St)</th>
                  <th className="border border-indigo-300 px-3 py-2">Estimated (Ŷt = Tt×St)</th>
                  <th className="border border-indigo-300 px-3 py-2">Residual Ratio (εt)</th>
                  <th className="border border-indigo-300 px-3 py-2">CVS (Yt/St)</th>
                </tr>
              </thead>
              <tbody>
                  {estimatedData.map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-indigo-50' : 'bg-white'}>
                    <td className="border border-indigo-300 px-3 py-2 text-center font-semibold">{row.t}</td>
                    <td className="border border-indigo-300 px-3 py-2 text-center">{row.year}</td>
                    <td className="border border-indigo-300 px-3 py-2 text-center font-semibold">{row.quarter}</td>
                    <td className="border border-indigo-300 px-3 py-2 text-center font-bold text-purple-700">{row.sales}</td>
                      <td className="border border-indigo-300 px-3 py-2 text-center">{row.trend}</td>
                      <td className="border border-indigo-300 px-3 py-2 text-center">{row.sales && row.trend ? (row.sales / row.trend).toFixed(4) : '-'}</td>
                    <td className="border border-indigo-300 px-3 py-2 text-center font-semibold" style={{
                      color: row.seasonal > 1 ? '#10b981' : '#ef4444'
                    }}>
                        {row.seasonal.toFixed(4)}
                    </td>
                      <td className="border border-indigo-300 px-3 py-2 text-center font-bold text-green-700">{row.estimated}</td>
                      <td className="border border-indigo-300 px-3 py-2 text-center">{row.residualRatio}</td>
                      <td className="border border-indigo-300 px-3 py-2 text-center">{row.cvs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Seasonal coefficients calculation details */}
          <div className="mt-6 bg-indigo-50 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-3 text-indigo-800">Seasonal Indices - Ratio-to-Moving-Average Method</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {Object.entries(selectedSeasonal.coefficients).map(([quarter, index]) => (
                <div key={quarter} className="bg-white p-3 rounded-lg border-2 border-indigo-200">
                  <div className="font-bold text-center text-lg mb-2">{quarter}</div>
                  <div className="text-sm">Seasonal Index:</div>
                  <div className="text-lg font-bold text-indigo-700 text-center">{(index * 100).toFixed(2)}%</div>
                  <div className="text-xs text-gray-600 text-center mt-1">
                    {index > 1 ? `+${((index - 1) * 100).toFixed(2)}%` : `${((index - 1) * 100).toFixed(2)}%`}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-sm text-gray-700 space-y-1">
                <p><strong>Product of indices:</strong> {(selectedSeasonal.product).toFixed(6)} ≈ 1.0000 ✓</p>
                <p><strong>Correction factor applied:</strong> {selectedSeasonal.correctionFactor.toFixed(6)}</p>
              <p className="text-xs italic">Note: In multiplicative model, product of seasonal indices must equal 1</p>
            </div>
          </div>

          {/* Model Accuracy Metrics */}
          <div className="mt-6 bg-green-50 p-4 rounded-lg border-2 border-green-200">
            <h3 className="font-bold text-lg mb-3 text-green-800">Model Accuracy Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded-lg text-center">
                <div className="text-sm text-gray-600">Mean Absolute Error</div>
                <div className="text-2xl font-bold text-green-700">{accuracyMetrics.mae}</div>
              </div>
              <div className="bg-white p-3 rounded-lg text-center">
                <div className="text-sm text-gray-600">Mean Squared Error</div>
                <div className="text-2xl font-bold text-green-700">{accuracyMetrics.mse}</div>
              </div>
              <div className="bg-white p-3 rounded-lg text-center">
                <div className="text-sm text-gray-600">Root Mean Squared Error</div>
                <div className="text-2xl font-bold text-green-700">{accuracyMetrics.rmse}</div>
              </div>
            </div>
          </div>

          {/* Formulas */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                <h4 className="font-bold mb-2">Main Formulas (Multiplicative Model)</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Trend (Least Squares):</strong> Tt = {trendB.toFixed(3)} + {trendA.toFixed(3)}t</p>
                  <p><strong>Model:</strong> Yt = Tt × St × εt</p>
                  <p><strong>Estimated series:</strong> Ŷt = Tt × St</p>
                  <p><strong>Residuals:</strong> εt = Yt / Ŷt</p>
                  <p><strong>CVS:</strong> CVSt = Yt / St</p>
                  <p><strong>Re-estimated Trend (CVS):</strong> Tt = {reestimatedTrend.b.toFixed(2)} + {reestimatedTrend.a.toFixed(2)}t</p>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                <h4 className="font-bold mb-2">2022 Forecasts (Ŷt = Tt × St)</h4>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-indigo-700">Original trend</p>
                  {forecastsOriginal.map(f => (
                    <p key={`o-${f.quarter}`}><strong>{f.quarter}:</strong> {f.forecast} units</p>
                  ))}
                  {showReestimated && (
                    <div className="mt-2">
                      <p className="font-semibold text-purple-700">Re-estimated trend (CVS)</p>
                      {forecastsReestimated.map(f => (
                        <p key={`r-${f.quarter}`}><strong>{f.quarter}:</strong> {f.forecast} units</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
        </div>
      )}

      {/* Tab menu */}
      <div className="flex flex-wrap gap-1 md:gap-2 mb-4 md:mb-6 bg-white p-2 rounded-lg shadow overflow-x-auto">
        {[
          { id: 'original', label: 'Original Data' },
          { id: 'trends', label: 'Trend Comparison' },
          { id: 'moving', label: 'Moving Average' },
          { id: 'seasonal', label: 'Seasonal Coefficients' },
          { id: 'accuracy', label: 'Accuracy Comparison' },
          { id: 'estimated', label: 'Estimated Series' },
          { id: 'residuals', label: 'Residuals' },
          { id: 'cvs', label: 'CVS Series' },
          { id: 'forecast', label: '2022 Forecasts' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-2 md:px-4 py-1.5 md:py-2 text-xs md:text-sm rounded-md transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
        {/* 1. Original data */}
        {activeTab === 'original' && (
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-indigo-800">Quarterly Sales (2018-2021)</h2>
            <ResponsiveContainer width="100%" height={300} className="md:hidden">
              <LineChart data={originalData.map((d: { t: number; year: number; quarter: string; sales: number }) => ({ ...d, label: `${d.year}-${d.quarter}` }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={2} name="Sales" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height={400} className="hidden md:block">
              <LineChart data={originalData.map((d: { t: number; year: number; quarter: string; sales: number }) => ({ ...d, label: `${d.year}-${d.quarter}` }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={3} name="Sales" dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
            
            <div className="mt-4 md:mt-6 p-3 md:p-4 bg-indigo-50 rounded-lg">
              <h3 className="font-bold text-base md:text-lg mb-2">Comments:</h3>
              <ul className="list-disc list-inside space-y-1 md:space-y-2 text-xs md:text-sm">
                <li>Clear upward trend in sales over the 4-year period</li>
                <li>Strong seasonal pattern: Q3 consistently has highest sales</li>
                <li>Q1 shows lowest sales across all years</li>
                <li>Seasonal amplitude increases with the trend level → Multiplicative model is appropriate</li>
                <li>The ratio Yt / Trend remains relatively stable, confirming multiplicative decomposition</li>
              </ul>
            </div>
          </div>
        )}

        {/* 2. Trend comparison */}
        {activeTab === 'trends' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-indigo-800">Trend Estimation - Least Squares Method</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={originalData.map(d => ({ ...d, label: `${d.year}-${d.quarter}`, trendMC: getTrend(d.t), trendSM: calculateTrendSemiAverage().a * d.t + calculateTrendSemiAverage().b, mmc4: movingAvgData.find(m => m.t === d.t)?.mmc4 }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={2} name="Actual sales" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="trendMC" stroke="#ef4444" strokeWidth={2} name="Trend (Least squares)" strokeDasharray="5 5" />
                <Line type="monotone" dataKey="trendSM" stroke="#10b981" strokeWidth={2} name="Trend (Semi-average)" strokeDasharray="6 4" />
                <Line type="monotone" dataKey="mmc4" stroke="#f59e0b" strokeWidth={2} name="Moving average (MMc4)" strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
                <h3 className="font-bold text-lg mb-2">Least Squares</h3>
                <p className="font-mono text-lg mb-3">T<sub>t</sub> = {trendB.toFixed(3)} + {trendA.toFixed(3)}t</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                <h3 className="font-bold text-lg mb-2">Semi-Average</h3>
                <p className="font-mono text-lg mb-3">T<sub>t</sub> = {calculateTrendSemiAverage().b.toFixed(2)} + {calculateTrendSemiAverage().a.toFixed(2)}t</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                <h3 className="font-bold text-lg mb-2">Moving Average (MMc4)</h3>
                <p className="text-sm">Displayed as orange dashed line (centered order 4)</p>
              </div>
            </div>
          </div>
        )}

        {/* 3. Moving average */}
        {activeTab === 'moving' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-indigo-800">Centered Moving Average (MMc4)</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={movingAvgData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={2} name="Actual sales" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="mmc4" stroke="#f59e0b" strokeWidth={3} name="Centered MA (MMc4)" connectNulls />
              </LineChart>
            </ResponsiveContainer>
            
            <div className="mt-6 p-4 bg-orange-50 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Centered Moving Average - Order 4</h3>
              <p className="mb-2">For quarterly data (even number of periods), we use a centered moving average:</p>
              <p className="font-mono text-sm">MMc4<sub>t</sub> = (MM4<sub>t</sub> + MM4<sub>t+1</sub>) / 2</p>
              <p className="mt-2">This eliminates seasonal fluctuations and shows the general trend more clearly.</p>
            </div>
          </div>
        )}

        {/* 4. Seasonal coefficients */}
        {activeTab === 'seasonal' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-indigo-800">Seasonal Indices - Comparison</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={seasonalMethods.map(m => ({
                method: m.label,
                ...m.coefficients,
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="method" />
                <YAxis domain={[0.7, 1.3]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="T1" fill="#ef4444" name="T1" />
                <Bar dataKey="T2" fill="#10b981" name="T2" />
                <Bar dataKey="T3" fill="#3b82f6" name="T3" />
                <Bar dataKey="T4" fill="#f59e0b" name="T4" />
              </BarChart>
            </ResponsiveContainer>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {seasonalMethods.map(m => (
                <div key={m.name} className="p-4 rounded-lg border shadow-sm" style={{ borderColor: '#e0e7ff' }}>
                  <div className="font-bold text-indigo-700 mb-2">{m.label}</div>
                  <div className="text-xs text-gray-600">Product: {m.product.toFixed(4)}</div>
                  <div className="text-xs text-gray-600">Correction: {m.correctionFactor.toFixed(6)}</div>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                    {quarters.map(q => (
                      <div key={`${m.name}-${q}`} className="flex justify-between">
                        <span className="font-semibold">{q}</span>
                        <span>{(m.coefficients[q] * 100).toFixed(2)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
              <p className="font-bold mb-2">Interpretation (Multiplicative Model):</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Seasonal index &gt; 1: Above-average period (positive seasonality)</li>
                <li>Seasonal index &lt; 1: Below-average period (negative seasonality)</li>
                <li>Seasonal index = 1: No seasonal effect</li>
                <li>Product of all indices = {selectedSeasonal.product.toFixed(4)} ≈ 1.0000 ✓</li>
              </ul>
              <p className="mt-3 text-sm"><strong>Method:</strong> Calculate Yt/MMc4 for each observation, average by quarter, then adjust so product equals 1.</p>
            </div>
          </div>
        )}

        {/* 4b. Accuracy Comparison */}
        {activeTab === 'accuracy' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-indigo-800">Accuracy Comparison - All Three Methods</h2>
            
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full border-collapse border border-indigo-300 bg-white rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-indigo-600 text-white">
                    <th className="border border-indigo-300 px-4 py-3 text-left">Method</th>
                    <th className="border border-indigo-300 px-4 py-3 text-center">Bias</th>
                    <th className="border border-indigo-300 px-4 py-3 text-center">MAE</th>
                    <th className="border border-indigo-300 px-4 py-3 text-center">MSE (EQM)</th>
                    <th className="border border-indigo-300 px-4 py-3 text-center">RMSE</th>
                    <th className="border border-indigo-300 px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {seasonalMethods.map((m, idx) => {
                    const isSelected = m.name === selectedMethod;
                    const isBest = seasonalMethods.reduce((best, method) => method.accuracy.mae < best.accuracy.mae ? method : best, seasonalMethods[0]).name === m.name;
                    return (
                      <tr 
                        key={m.name}
                        className={`${idx % 2 === 0 ? 'bg-indigo-50' : 'bg-white'} ${isSelected ? 'border-l-4 border-l-purple-600' : ''}`}
                      >
                        <td className="border border-indigo-300 px-4 py-3 font-bold text-indigo-700">
                          {m.label}
                          {isSelected && <span className="ml-2 text-purple-600">✓ Selected</span>}
                        </td>
                        <td className="border border-indigo-300 px-4 py-3 text-center">{m.accuracy.bias}</td>
                        <td className="border border-indigo-300 px-4 py-3 text-center font-semibold">{m.accuracy.mae}</td>
                        <td className="border border-indigo-300 px-4 py-3 text-center">{m.accuracy.mse}</td>
                        <td className="border border-indigo-300 px-4 py-3 text-center">{m.accuracy.rmse}</td>
                        <td className="border border-indigo-300 px-4 py-3 text-center">
                          {isBest && <span className="bg-green-200 text-green-800 px-2 py-1 rounded font-bold text-sm">🏆 Best MAE</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                <h3 className="font-bold text-lg mb-2 text-green-800">📊 Original Model Accuracy</h3>
                <div className="space-y-2 text-sm">
                  <p>Selected Method: <span className="font-bold text-indigo-700">{selectedSeasonal.label}</span></p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>Bias: <span className="font-bold">{accuracyMetrics.bias}</span></div>
                    <div>MAE: <span className="font-bold">{accuracyMetrics.mae}</span></div>
                    <div>MSE: <span className="font-bold">{accuracyMetrics.mse}</span></div>
                    <div>RMSE: <span className="font-bold">{accuracyMetrics.rmse}</span></div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                <h3 className="font-bold text-lg mb-2 text-purple-800">🔄 Re-estimated Model Accuracy (CVS)</h3>
                <div className="space-y-2 text-sm">
                  <p>Trend re-fitted via deseasonalized series</p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>Bias: <span className="font-bold">{reestimatedMetrics.bias}</span></div>
                    <div>MAE: <span className="font-bold">{reestimatedMetrics.mae}</span></div>
                    <div>MSE: <span className="font-bold">{reestimatedMetrics.mse}</span></div>
                    <div>RMSE: <span className="font-bold">{reestimatedMetrics.rmse}</span></div>
                  </div>
                  <div className="mt-2 text-xs text-purple-700 font-semibold">
                    {reestimatedMetrics.mae < accuracyMetrics.mae ? '✓ Better fit via CVS re-estimation' : '✗ Original trend is more accurate'}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-bold mb-2">📋 Interpretation:</h3>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li><strong>Bias:</strong> Mean of all errors. Close to 0 is best. Positive = systematic overestimation.</li>
                <li><strong>MAE:</strong> Mean Absolute Error - average magnitude of prediction errors (in units)</li>
                <li><strong>MSE (EQM):</strong> Mean Squared Error - penalizes large errors more heavily</li>
                <li><strong>RMSE:</strong> Root Mean Squared Error - same units as data, easier to interpret</li>
                <li><strong>Lower values</strong> in all metrics indicate better model fit</li>
              </ul>
            </div>
          </div>
        )}

        {/* 5. Estimated series */}
        {activeTab === 'estimated' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-indigo-800">Estimated Series vs Actual (Multiplicative Model)</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={estimatedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={3} name="Actual sales" dot={{ r: 5 }} />
                <Line type="monotone" dataKey="estimated" stroke="#10b981" strokeWidth={2} name="Estimated sales (Ŷt)" strokeDasharray="5 5" />
                <Line type="monotone" dataKey="trend" stroke="#ef4444" strokeWidth={1} name="Trend (Tt)" strokeDasharray="3 3" />
                {showReestimated && (
                  <Line type="monotone" dataKey="estimated" data={reestimatedData} stroke="#7c3aed" strokeWidth={2} name="Re-estimated (CVS)" strokeDasharray="4 4" />
                )}
              </LineChart>
            </ResponsiveContainer>
            
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <p className="font-bold">Multiplicative Model Equation:</p>
              <p className="font-mono text-lg mt-2">Y<sub>t</sub> = T<sub>t</sub> × S<sub>t</sub> × ε<sub>t</sub></p>
              <p className="mt-2"><strong>Estimated series:</strong> Ŷ<sub>t</sub> = T<sub>t</sub> × S<sub>t</sub></p>
              <p className="mt-2">where T<sub>t</sub> is the trend and S<sub>t</sub> is the seasonal index</p>
              <div className="mt-4 p-3 bg-white rounded border border-green-300">
                <p className="font-bold">Model Accuracy:</p>
                <p>Bias: {accuracyMetrics.bias} | MAE: {accuracyMetrics.mae} | MSE (EQM): {accuracyMetrics.mse} | RMSE: {accuracyMetrics.rmse}</p>
                {showReestimated && (
                  <p className="mt-1 text-purple-700">Re-estimated → Bias: {reestimatedMetrics.bias} | MAE: {reestimatedMetrics.mae} | MSE: {reestimatedMetrics.mse} | RMSE: {reestimatedMetrics.rmse}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 6. Residuals */}
        {activeTab === 'residuals' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-indigo-800">Residuals - Random Component (εt)</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={showReestimated ? [...estimatedData, ...reestimatedData.map(d => ({ ...d, label: `${d.label} (re)` }))] : estimatedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="residualRatio" fill="#8b5cf6" name="Residual Ratio (εt = Yt/Ŷt)" />
              </BarChart>
            </ResponsiveContainer>
            
            <div className="mt-6 p-4 bg-purple-50 rounded-lg">
              <p className="font-bold">Multiplicative Model Residuals:</p>
              <p className="font-mono text-lg mt-2">ε<sub>t</sub> = Y<sub>t</sub> / Ŷ<sub>t</sub></p>
              <p className="mt-2">Residuals represent the random/accidental component not explained by trend and seasonality</p>
              <p className="mt-2"><strong>Interpretation:</strong></p>
              <ul className="list-disc list-inside mt-1 text-sm">
                <li>ε<sub>t</sub> &gt; 1: Actual value is higher than predicted</li>
                <li>ε<sub>t</sub> &lt; 1: Actual value is lower than predicted</li>
                <li>ε<sub>t</sub> = 1: Perfect prediction</li>
              </ul>
            </div>
          </div>
        )}

        {/* 7. CVS series */}
        {activeTab === 'cvs' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-indigo-800">Seasonally Adjusted Series (CVS)</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={cvsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={2} name="Original sales" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="cvs" stroke="#06b6d4" strokeWidth={3} name="CVS (deseasonalized)" dot={{ r: 5 }} />
                {showReestimated && (
                  <Line type="monotone" dataKey="cvs" data={reestimatedData} stroke="#7c3aed" strokeWidth={2} name="CVS (re-estimated)" strokeDasharray="4 4" />
                )}
              </LineChart>
            </ResponsiveContainer>
            
            <div className="mt-6 p-4 bg-cyan-50 rounded-lg">
              <p className="font-bold">Multiplicative Deseasonalization:</p>
              <p className="font-mono text-lg mt-2">CVS<sub>t</sub> = Y<sub>t</sub> / S<sub>t</sub></p>
              <p className="mt-2">The CVS (Corrigée des Variations Saisonnières) series removes the seasonal effect by dividing by the seasonal index, revealing the underlying trend and random component.</p>
              <p className="mt-2"><strong>Purpose:</strong> Allows comparison across different quarters without seasonal distortion.</p>
            </div>
          </div>
        )}

        {/* 8. 2022 Forecasts */}
        {activeTab === 'forecast' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-indigo-800">Forecasts for 2022 (Multiplicative Model)</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={[...estimatedData, ...(showReestimated ? reestimatedData : []), ...forecastsOriginal, ...(showReestimated ? forecastsReestimated : [])]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={3} name="Actual sales" dot={{ r: 5 }} />
                <Line type="monotone" dataKey="estimated" stroke="#10b981" strokeWidth={3} name="Estimated/Forecast (Ŷt = Tt×St)" strokeDasharray="5 5" dot={{ r: 5 }} />
                {showReestimated && (
                  <Line type="monotone" dataKey="estimated" data={[...reestimatedData, ...forecastsReestimated]} stroke="#7c3aed" strokeWidth={2} name="Re-estimated Forecast" strokeDasharray="4 4" dot={{ r: 4 }} />
                )}
              </LineChart>
            </ResponsiveContainer>
            
            <div className="mt-4 md:mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {forecastsOriginal.map((f: Forecast) => (
                <div key={f.quarter} className="p-3 md:p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border-2 border-red-300">
                  <div className="font-bold text-sm md:text-lg text-center">{f.year} - {f.quarter}</div>
                  <div className="text-xl md:text-2xl font-bold text-center mt-1 md:mt-2 text-red-600">
                    {Math.round(f.forecast)}
                  </div>
                  <div className="text-xs md:text-sm text-center text-gray-600 mt-1">units</div>
                  {f.lowerCI !== undefined && f.upperCI !== undefined && (
                    <div className="text-[10px] md:text-xs text-center text-gray-500 mt-1 md:mt-2 font-semibold">
                      95% CI: [{Math.round(f.lowerCI)}, {Math.round(f.upperCI)}]
                    </div>
                  )}
                  <div className="text-[10px] md:text-xs text-center text-gray-500 mt-1">
                    Trend × Seasonal
                  </div>
                </div>
              ))}
            </div>
            {showReestimated && (
              <div className="mt-4 md:mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {forecastsReestimated.map((f: Forecast) => (
                  <div key={`r-${f.quarter}`} className="p-3 md:p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border-2 border-purple-300">
                    <div className="font-bold text-sm md:text-lg text-center">{f.year} - {f.quarter}</div>
                    <div className="text-xl md:text-2xl font-bold text-center mt-1 md:mt-2 text-purple-700">
                      {Math.round(f.forecast)}
                    </div>
                    <div className="text-xs md:text-sm text-center text-gray-600 mt-1">units</div>
                    {f.lowerCI !== undefined && f.upperCI !== undefined && (
                      <div className="text-[10px] md:text-xs text-center text-gray-500 mt-1 md:mt-2 font-semibold">
                        95% CI: [{Math.round(f.lowerCI)}, {Math.round(f.upperCI)}]
                      </div>
                    )}
                    <div className="text-[10px] md:text-xs text-center text-gray-500 mt-1">
                      Re-estimated Trend × Seasonal
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="font-bold">Forecast Formula (Multiplicative):</p>
              <p className="font-mono text-lg mt-2">Ŷ<sub>t</sub> = T<sub>t</sub> × S<sub>t</sub></p>
              <p className="mt-2">Where:</p>
              <ul className="list-disc list-inside text-sm mt-1">
                <li>T<sub>t</sub> = {trendB.toFixed(3)} + {trendA.toFixed(3)}t (linear trend)</li>
                <li>S<sub>t</sub> = seasonal index for the corresponding quarter</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 md:mt-6 text-center text-xs md:text-sm text-gray-600">
        <p>Time Series Analysis - Prof. Soumaya FELLAJI - Academic Year 2025/2026</p>
        <p className="mt-1 md:mt-2 font-semibold text-indigo-700">Project managed by Mohamed Reda Touhami</p>
      </div>
    </div>
  );
};

export default function Home() {
  return <TimeSeriesAnalysis />;
}
