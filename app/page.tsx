"use client";

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const TimeSeriesAnalysis = () => {
  const [activeTab, setActiveTab] = useState('original');
  const [showTable, setShowTable] = useState(false);

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

  // Calcul des tendances
  const calculateTrends = () => {
    return originalData.map(d => {
      // Méthode des moindres carrés
      const trendMC = 4854.625 + 233.5 * d.t;
      
      // Méthode semi-moyenne
      const trendSM = 5545.625 + 156.25 * d.t;
      
      return {
        ...d,
        label: `${d.year}-${d.quarter}`,
        trendMC: Math.round(trendMC * 100) / 100,
        trendSM: Math.round(trendSM * 100) / 100,
      };
    });
  };

  // Calcul de la moyenne mobile
  const calculateMovingAverage = () => {
    const data = [...originalData];
    const result = [];
    
    for (let i = 0; i < data.length; i++) {
      if (i >= 1 && i < data.length - 2) {
        const sum = data[i-1].sales + data[i].sales + data[i+1].sales + data[i+2].sales;
        const mm4 = sum / 4;
        result.push({
          ...data[i],
          label: `${data[i].year}-${data[i].quarter}`,
          sales: data[i].sales,
          mm4: Math.round(mm4 * 100) / 100
        });
      } else {
        result.push({
          ...data[i],
          label: `${data[i].year}-${data[i].quarter}`,
          sales: data[i].sales,
          mm4: null
        });
      }
    }
    
    return result;
  };

  // Coefficients saisonniers
  const seasonalCoefficients = [
    { quarter: 'T1', coefficient: -993.5, color: '#ef4444' },
    { quarter: 'T2', coefficient: 335.5, color: '#10b981' },
    { quarter: 'T3', coefficient: 1102, color: '#3b82f6' },
    { quarter: 'T4', coefficient: -444, color: '#f59e0b' },
  ];

  // Calcul de la série estimée
  const calculateEstimatedSeries = () => {
    const seasonalMap: Record<string, number> = { 'T1': -993.5, 'T2': 335.5, 'T3': 1102, 'T4': -444 };
    
    return originalData.map(d => {
      const trend = 4854.625 + 233.5 * d.t;
      const seasonal = seasonalMap[d.quarter];
      const estimated = trend + seasonal;
      const residual = d.sales - estimated;
      
      return {
        ...d,
        label: `${d.year}-${d.quarter}`,
        trend: Math.round(trend * 100) / 100,
        estimated: Math.round(estimated * 100) / 100,
        residual: Math.round(residual * 100) / 100,
      };
    });
  };

  // Série corrigée des variations saisonnières (CVS)
  const calculateCVS = () => {
    const seasonalMap: Record<string, number> = { 'T1': -993.5, 'T2': 335.5, 'T3': 1102, 'T4': -444 };
    
    return originalData.map(d => {
      const cvs = d.sales - seasonalMap[d.quarter];
      
      return {
        ...d,
        label: `${d.year}-${d.quarter}`,
        cvs: Math.round(cvs * 100) / 100,
      };
    });
  };

  // Prévisions 2022
  const forecasts2022 = [
    { t: 17, year: 2022, quarter: 'T1', forecast: 7830.625 },
    { t: 18, year: 2022, quarter: 'T2', forecast: 9393.125 },
    { t: 19, year: 2022, quarter: 'T3', forecast: 10393.125 },
    { t: 20, year: 2022, quarter: 'T4', forecast: 9080.625 },
  ];

  // Calcul complet du tableau
  const calculateCompleteTable = () => {
    const seasonalMap: Record<string, number> = { 'T1': -993.5, 'T2': 335.5, 'T3': 1102, 'T4': -444 };
    
    return originalData.map(d => {
      const trend = 4854.625 + 233.5 * d.t;
      const seasonal = seasonalMap[d.quarter];
      const estimated = trend + seasonal;
      const residual = d.sales - estimated;
      const cvs = d.sales - seasonal;
      const ytMinusTrend = d.sales - trend;
      
      return {
        t: d.t,
        year: d.year,
        quarter: d.quarter,
        sales: d.sales,
        trend: Math.round(trend * 100) / 100,
        ytMinusTrend: Math.round(ytMinusTrend * 100) / 100,
        seasonal: seasonal,
        estimated: Math.round(estimated * 100) / 100,
        residual: Math.round(residual * 100) / 100,
        cvs: Math.round(cvs * 100) / 100,
      };
    });
  };

  const completeTable = calculateCompleteTable();
  const trendData = calculateTrends();
  const movingAvgData = calculateMovingAverage();
  const estimatedData = calculateEstimatedSeries();
  const cvsData = calculateCVS();
  const forecastData = [...estimatedData, ...forecasts2022.map(f => ({
    ...f,
    label: `${f.year}-${f.quarter}`,
    estimated: f.forecast,
    sales: undefined,
    trend: undefined,
    residual: undefined,
  }))];

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-8 text-indigo-900">
        Analyse des Séries Chronologiques - Ventes Trimestrielles
      </h1>

      {/* Bouton pour afficher/masquer le tableau */}
      <div className="mb-4 text-center">
        <button
          onClick={() => setShowTable(!showTable)}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
        >
          {showTable ? '🔼 Masquer le Tableau des Calculs' : '🔽 Afficher le Tableau des Calculs Complet'}
        </button>
      </div>

      {/* Tableau des calculs */}
      {showTable && (
        <div className="mb-6 bg-white rounded-lg shadow-lg p-6 overflow-x-auto">
          <h2 className="text-2xl font-bold mb-4 text-indigo-800 text-center">Tableau Récapitulatif des Calculs</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-indigo-300">
              <thead>
                <tr className="bg-indigo-600 text-white">
                  <th className="border border-indigo-300 px-3 py-2">t</th>
                  <th className="border border-indigo-300 px-3 py-2">Année</th>
                  <th className="border border-indigo-300 px-3 py-2">Trim.</th>
                  <th className="border border-indigo-300 px-3 py-2">Ventes (Yt)</th>
                  <th className="border border-indigo-300 px-3 py-2">Tendance (Tt)</th>
                  <th className="border border-indigo-300 px-3 py-2">Yt - Tt</th>
                  <th className="border border-indigo-300 px-3 py-2">Coeff. Sais. (St)</th>
                  <th className="border border-indigo-300 px-3 py-2">Série Estimée (Ŷt)</th>
                  <th className="border border-indigo-300 px-3 py-2">Résidus (ε̂t)</th>
                  <th className="border border-indigo-300 px-3 py-2">CVS</th>
                </tr>
              </thead>
              <tbody>
                {completeTable.map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-indigo-50' : 'bg-white'}>
                    <td className="border border-indigo-300 px-3 py-2 text-center font-semibold">{row.t}</td>
                    <td className="border border-indigo-300 px-3 py-2 text-center">{row.year}</td>
                    <td className="border border-indigo-300 px-3 py-2 text-center font-semibold">{row.quarter}</td>
                    <td className="border border-indigo-300 px-3 py-2 text-center font-bold text-purple-700">{row.sales}</td>
                    <td className="border border-indigo-300 px-3 py-2 text-center">{row.trend}</td>
                    <td className="border border-indigo-300 px-3 py-2 text-center">{row.ytMinusTrend}</td>
                    <td className="border border-indigo-300 px-3 py-2 text-center font-semibold" style={{
                      color: row.seasonal > 0 ? '#10b981' : '#ef4444'
                    }}>
                      {row.seasonal > 0 ? '+' : ''}{row.seasonal}
                    </td>
                    <td className="border border-indigo-300 px-3 py-2 text-center font-bold text-green-700">{row.estimated}</td>
                    <td className="border border-indigo-300 px-3 py-2 text-center">{row.residual}</td>
                    <td className="border border-indigo-300 px-3 py-2 text-center">{row.cvs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calcul des coefficients saisonniers détaillé */}
          <div className="mt-6 bg-indigo-50 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-3 text-indigo-800">Calcul des Coefficients Saisonniers (Méthode des Moyennes Simples)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {[
                { trim: 'T1', years: ['2018: -58.13', '2019: -742.13', '2020: -1426.13', '2021: -1610.13'], avg: -959.125, final: -993.5 },
                { trim: 'T2', years: ['2018: 708.38', '2019: 524.38', '2020: 90.38', '2021: 156.38'], avg: 369.875, final: 335.5 },
                { trim: 'T3', years: ['2018: 1474.88', '2019: 1040.88', '2020: 1106.88', '2021: 922.88'], avg: 1136.375, final: 1102 },
                { trim: 'T4', years: ['2018: -8.63', '2019: -192.63', '2020: -626.63', '2021: -810.63'], avg: -409.625, final: -444 },
              ].map(item => (
                <div key={item.trim} className="bg-white p-3 rounded-lg border-2 border-indigo-200">
                  <div className="font-bold text-center text-lg mb-2">{item.trim}</div>
                  {item.years.map((y, i) => (
                    <div key={i} className="text-xs text-gray-600">{y}</div>
                  ))}
                  <div className="mt-2 pt-2 border-t border-indigo-200">
                    <div className="text-sm">Moyenne: <span className="font-semibold">{item.avg}</span></div>
                    <div className="text-sm font-bold text-indigo-700">Corrigé: {item.final}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-sm text-gray-700">
              <p><strong>Correction:</strong> Somme = {-959.125 + 369.875 + 1136.375 - 409.625} = 137.5</p>
              <p>Correction par trimestre = -137.5 / 4 = -34.375</p>
            </div>
          </div>

          {/* Formules */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
              <h4 className="font-bold mb-2">Formules Principales</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Tendance:</strong> Tt = 4854.625 + 233.5t</p>
                <p><strong>Série estimée:</strong> Ŷt = Tt + St</p>
                <p><strong>Résidus:</strong> ε̂t = Yt - Ŷt</p>
                <p><strong>CVS:</strong> CVSt = Yt - St</p>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
              <h4 className="font-bold mb-2">Prévisions 2022</h4>
              <div className="space-y-1 text-sm">
                <p><strong>T1:</strong> 7830.625 unités</p>
                <p><strong>T2:</strong> 9393.125 unités</p>
                <p><strong>T3:</strong> 10393.125 unités</p>
                <p><strong>T4:</strong> 9080.625 unités</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Menu des onglets */}
      <div className="flex flex-wrap gap-2 mb-6 bg-white p-2 rounded-lg shadow">
        {[
          { id: 'original', label: 'Données originales' },
          { id: 'trends', label: 'Comparaison des tendances' },
          { id: 'moving', label: 'Moyenne mobile' },
          { id: 'seasonal', label: 'Coefficients saisonniers' },
          { id: 'estimated', label: 'Série estimée' },
          { id: 'residuals', label: 'Résidus' },
          { id: 'cvs', label: 'Série CVS' },
          { id: 'forecast', label: 'Prévisions 2022' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* 1. Données originales */}
        {activeTab === 'original' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-indigo-800">Ventes Trimestrielles (2018-2021)</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={originalData.map(d => ({ ...d, label: `${d.year}-${d.quarter}` }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={3} name="Ventes" dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
            
            <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Commentaires :</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Tendance générale croissante claire dans les ventes</li>
                <li>Variations saisonnières récurrentes : le trimestre 3 enregistre les ventes les plus élevées</li>
                <li>Les trimestres 1 et 4 enregistrent une baisse des ventes</li>
                <li>Schéma saisonnier relativement stable au fil des années</li>
              </ul>
            </div>
          </div>
        )}

        {/* 2. Comparaison des tendances */}
        {activeTab === 'trends' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-indigo-800">Comparaison des Méthodes d&apos;Estimation de la Tendance</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={2} name="Ventes réelles" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="trendMC" stroke="#ef4444" strokeWidth={2} name="Moindres carrés" strokeDasharray="5 5" />
                <Line type="monotone" dataKey="trendSM" stroke="#10b981" strokeWidth={2} name="Semi-moyenne" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
                <h3 className="font-bold text-lg mb-2">Méthode des Moindres Carrés</h3>
                <p className="font-mono text-lg">T<sub>t</sub> = 4854.625 + 233.5t</p>
                <p className="text-sm mt-2">Méthode la plus précise statistiquement</p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                <h3 className="font-bold text-lg mb-2">Méthode Semi-Moyenne</h3>
                <p className="font-mono text-lg">T<sub>t</sub> = 5545.625 + 156.25t</p>
                <p className="text-sm mt-2">Méthode simple et rapide</p>
              </div>
            </div>
          </div>
        )}

        {/* 3. Moyenne mobile */}
        {activeTab === 'moving' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-indigo-800">Moyenne Mobile (Ordre 4)</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={movingAvgData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={2} name="Ventes réelles" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="mm4" stroke="#f59e0b" strokeWidth={3} name="Moyenne mobile" connectNulls />
              </LineChart>
            </ResponsiveContainer>
            
            <div className="mt-6 p-4 bg-orange-50 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Remarque :</h3>
              <p>La moyenne mobile élimine les fluctuations saisonnières et montre la tendance générale plus clairement</p>
            </div>
          </div>
        )}

        {/* 4. Coefficients saisonniers */}
        {activeTab === 'seasonal' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-indigo-800">Coefficients Saisonniers (Méthode des Moyennes Simples)</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={seasonalCoefficients}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="coefficient" fill="#8b5cf6" name="Coefficient saisonnier">
                  {seasonalCoefficients.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {seasonalCoefficients.map(sc => (
                <div key={sc.quarter} className="p-4 rounded-lg text-center" style={{ backgroundColor: sc.color + '20', borderColor: sc.color, borderWidth: 2 }}>
                  <div className="font-bold text-lg">{sc.quarter}</div>
                  <div className="text-2xl font-bold mt-2" style={{ color: sc.color }}>
                    {sc.coefficient > 0 ? '+' : ''}{sc.coefficient}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
              <p className="font-bold">Interprétation :</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Trimestre 3 : Saisonnalité la plus élevée (+1102)</li>
                <li>Trimestre 2 : Saisonnalité positive (+335.5)</li>
                <li>Trimestre 1 : Saisonnalité la plus basse (-993.5)</li>
                <li>Trimestre 4 : Saisonnalité négative (-444)</li>
              </ul>
            </div>
          </div>
        )}

        {/* 5. Série estimée */}
        {activeTab === 'estimated' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-indigo-800">Série Estimée vs Réelle</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={estimatedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={3} name="Ventes réelles" dot={{ r: 5 }} />
                <Line type="monotone" dataKey="estimated" stroke="#10b981" strokeWidth={2} name="Ventes estimées" strokeDasharray="5 5" />
                <Line type="monotone" dataKey="trend" stroke="#ef4444" strokeWidth={1} name="Tendance" strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
            
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <p className="font-bold">Équation :</p>
              <p className="font-mono text-lg mt-2">Ŷ<sub>t</sub> = T<sub>t</sub> + S<sub>t</sub></p>
              <p className="mt-2">où T<sub>t</sub> est la tendance et S<sub>t</sub> le coefficient saisonnier</p>
            </div>
          </div>
        )}

        {/* 6. Résidus */}
        {activeTab === 'residuals' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-indigo-800">Résidus (Variations Accidentelles)</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={estimatedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="residual" fill="#8b5cf6" name="Résidus (ε̂t)" />
              </BarChart>
            </ResponsiveContainer>
            
            <div className="mt-6 p-4 bg-purple-50 rounded-lg">
              <p className="font-bold">Équation :</p>
              <p className="font-mono text-lg mt-2">ε̂<sub>t</sub> = Y<sub>t</sub> - Ŷ<sub>t</sub></p>
              <p className="mt-2">Les résidus représentent la partie non expliquée par le modèle (variations accidentelles)</p>
            </div>
          </div>
        )}

        {/* 7. Série CVS */}
        {activeTab === 'cvs' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-indigo-800">Série Corrigée des Variations Saisonnières (CVS)</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={cvsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={2} name="Ventes originales" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="cvs" stroke="#06b6d4" strokeWidth={3} name="CVS (désaisonnalisée)" dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
            
            <div className="mt-6 p-4 bg-cyan-50 rounded-lg">
              <p className="font-bold">Équation :</p>
              <p className="font-mono text-lg mt-2">CVS<sub>t</sub> = Y<sub>t</sub> - S<sub>t</sub></p>
              <p className="mt-2">La série CVS élimine l&apos;effet saisonnier et révèle la tendance réelle</p>
            </div>
          </div>
        )}

        {/* 8. Prévisions 2022 */}
        {activeTab === 'forecast' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-indigo-800">Prévisions pour l&apos;année 2022</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={3} name="Ventes réelles" dot={{ r: 5 }} />
                <Line type="monotone" dataKey="estimated" stroke="#10b981" strokeWidth={3} name="Ventes estimées / Prévisions" strokeDasharray="5 5" dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
            
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {forecasts2022.map(f => (
                <div key={f.quarter} className="p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border-2 border-red-300">
                  <div className="font-bold text-lg text-center">{f.year} - {f.quarter}</div>
                  <div className="text-2xl font-bold text-center mt-2 text-red-600">
                    {Math.round(f.forecast)}
                  </div>
                  <div className="text-sm text-center text-gray-600 mt-1">unités</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pied de page */}
      <div className="mt-6 text-center text-sm text-gray-600">
        <p>Analyse des Séries Chronologiques - Pr. Soumaya FELLAJI - Année universitaire 2025/2026</p>
        <p className="mt-2 font-semibold text-indigo-700">Project managed by Mohamed Reda Touhami</p>
      </div>
    </div>
  );
};

export default function Home() {
  return <TimeSeriesAnalysis />;
}
