"use client";

import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell, AreaChart, Area } from 'recharts';

type Language = 'fr' | 'en';

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

interface Translations {
  title: string;
  seasonalMethod: string;
  seasonalMethodInfo: string;
  productLabel: string;
  correctionLabel: string;
  originalAccuracy: string;
  originalAccuracyInfo: string;
  reestimatedModel: string;
  reestimatedModelInfo: string;
  showLabel: string;
  trendLabel: string;
  hideTable: string;
  showTable: string;
  calculationTable: string;
  exportCSV: string;
  copy: string;
  year: string;
  quarter: string;
  sales: string;
  trend: string;
  seasonalIndex: string;
  estimated: string;
  residualRatio: string;
  seasonalIndices: string;
  modelAccuracy: string;
  meanAbsoluteError: string;
  meanSquaredError: string;
  rootMeanSquaredError: string;
  mainFormulas: string;
  multiplicativeModel: string;
  model: string;
  estimatedSeries: string;
  residuals: string;
  cvs: string;
  forecasts2022: string;
  originalData: string;
  trendComparison: string;
  movingAverage: string;
  seasonalCoefficients: string;
  accuracyComparison: string;
  estimatedSeriesTab: string;
  residualsTab: string;
  cvsSeriesTab: string;
  forecastTab: string;
  comments: string;
  interpretation: string;
  units: string;
  confidenceInterval: string;
  method: string;
  status: string;
  selected: string;
  bestMAE: string;
  simpleAverages: string;
  ratioToTrend: string;
  ratioToMovingAverage: string;
  quarterlySales: string;
  clearUpwardTrend: string;
  strongSeasonalPattern: string;
  q3HighestSales: string;
  q1LowestSales: string;
  seasonalAmplitude: string;
  ratioStable: string;
  trendEstimation: string;
  leastSquares: string;
  semiAverage: string;
  actualSales: string;
  centeredMA: string;
  forQuarterlyData: string;
  eliminatesSeasonal: string;
  seasonalIndicesComparison: string;
  product: string;
  correction: string;
  interpretationMultiplicative: string;
  aboveAverage: string;
  belowAverage: string;
  noSeasonalEffect: string;
  methodLabel: string;
  accuracyComparisonAll: string;
  bias: string;
  originalModelAcc: string;
  selectedMethodLabel: string;
  reestimatedModelAcc: string;
  trendRefitted: string;
  betterFitCVS: string;
  originalMoreAccurate: string;
  interpretationLabel: string;
  biasExplanation: string;
  maeExplanation: string;
  mseExplanation: string;
  rmseExplanation: string;
  lowerValues: string;
  estimatedVsActual: string;
  multiplicativeEquation: string;
  estimatedSeriesFormula: string;
  whereLabel: string;
  modelAccuracyLabel: string;
  residualsRandomComponent: string;
  multiplicativeResiduals: string;
  residualsRepresent: string;
  interpretationResiduals: string;
  higherThanPredicted: string;
  lowerThanPredicted: string;
  perfectPrediction: string;
  seasonallyAdjusted: string;
  multiplicativeDeseasonalization: string;
  cvsSeriesRemoves: string;
  purposeLabel: string;
  allowsComparison: string;
  forecasts2022Title: string;
  forecastFormula: string;
  linearTrend: string;
  seasonalIndexFor: string;
  footerLine1: string;
  footerLine2: string;
  discussionTab: string;
  iterativeProcess: string;
  iterativeDescription: string;
  stoppingCriteria: string;
  stoppingDescription: string;
  additionalImprovements: string;
  improvementsDescription: string;
  nonLinearModels: string;
  residualAutocorrelation: string;
  outlierDetection: string;
  arimaComparison: string;
  flowchartTitle: string;
  flowchartStep1: string;
  flowchartStep2: string;
  flowchartStep3: string;
  flowchartStep4: string;
  flowchartStep5: string;
  convergenceAchieved: string;
  algorithm: string;
  step: string;
  updateCoefficients: string;
  reestimateTrend: string;
  calculateNewCVS: string;
  checkConvergence: string;
  maxIterations: string;
  MAEThreshold: string;
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

const translations: Record<Language, Translations> = {
  fr: {
    title: "Analyse de Séries Temporelles - Ventes Trimestrielles (Modèle Multiplicatif)",
    seasonalMethod: "Méthode saisonnière",
    seasonalMethodInfo: "Sélectionnez la méthode de décomposition saisonnière",
    productLabel: "Produit",
    correctionLabel: "Facteur de correction",
    originalAccuracy: "Précision du modèle original",
    originalAccuracyInfo: "Métriques d'erreur pour le modèle basé sur la tendance originale",
    reestimatedModel: "Modèle ré-estimé (CVS)",
    reestimatedModelInfo: "Modèle ré-estimé après désaisonnalisation",
    showLabel: "afficher",
    trendLabel: "Tendance (CVS)",
    hideTable: "🔼 Masquer le tableau de calcul",
    showTable: "🔽 Afficher le tableau de calcul complet",
    calculationTable: "Tableau Récapitulatif des Calculs - Modèle Multiplicatif",
    exportCSV: "📥 Exporter CSV",
    copy: "📋 Copier",
    year: "Année",
    quarter: "Trimestre",
    sales: "Ventes (Yt)",
    trend: "Tendance (Tt)",
    seasonalIndex: "Indice Saisonnier (St)",
    estimated: "Estimé (Ŷt = Tt×St)",
    residualRatio: "Ratio Résiduel (εt)",
    cvs: "CVS (Yt/St)",
    seasonalIndices: "Indices Saisonniers - Méthode des Rapports à la Moyenne Mobile",
    modelAccuracy: "Précision du Modèle",
    meanAbsoluteError: "Erreur Absolue Moyenne",
    meanSquaredError: "Erreur Quadratique Moyenne",
    rootMeanSquaredError: "Racine de l'Erreur Quadratique Moyenne",
    mainFormulas: "Formules Principales (Modèle Multiplicatif)",
    multiplicativeModel: "Modèle Multiplicatif",
    model: "Modèle",
    estimatedSeries: "Série estimée",
    residuals: "Résidus",
    forecasts2022: "Prévisions 2022",
    originalData: "Données Originales",
    trendComparison: "Comparaison des Tendances",
    movingAverage: "Moyenne Mobile",
    seasonalCoefficients: "Coefficients Saisonniers",
    accuracyComparison: "Comparaison de Précision",
    estimatedSeriesTab: "Série Estimée",
    residualsTab: "Résidus",
    cvsSeriesTab: "Série CVS",
    forecastTab: "Prévisions 2022",
    comments: "Commentaires :",
    interpretation: "Interprétation :",
    units: "unités",
    confidenceInterval: "IC à 95%",
    method: "Méthode",
    status: "Statut",
    selected: "✓ Sélectionné",
    bestMAE: "🏆 Meilleur MAE",
    simpleAverages: "Moyennes Simples (Y/T)",
    ratioToTrend: "Rapport à la Tendance",
    ratioToMovingAverage: "Rapport à la Moyenne Mobile",
    quarterlySales: "Ventes Trimestrielles (2018-2021)",
    clearUpwardTrend: "Tendance haussière claire des ventes sur la période de 4 ans",
    strongSeasonalPattern: "Modèle saisonnier fort : T3 a systématiquement les ventes les plus élevées",
    q3HighestSales: "T3 affiche les ventes les plus élevées sur toutes les années",
    q1LowestSales: "T1 affiche les ventes les plus faibles sur toutes les années",
    seasonalAmplitude: "L'amplitude saisonnière augmente avec le niveau de tendance → Le modèle multiplicatif est approprié",
    ratioStable: "Le ratio Yt / Tendance reste relativement stable, confirmant la décomposition multiplicative",
    trendEstimation: "Estimation de la Tendance - Méthode des Moindres Carrés",
    leastSquares: "Moindres Carrés",
    semiAverage: "Semi-Moyenne",
    actualSales: "Ventes réelles",
    centeredMA: "Moyenne Mobile Centrée (MMc4)",
    forQuarterlyData: "Pour les données trimestrielles (nombre pair de périodes), nous utilisons une moyenne mobile centrée :",
    eliminatesSeasonal: "Cela élimine les fluctuations saisonnières et montre plus clairement la tendance générale.",
    seasonalIndicesComparison: "Indices Saisonniers - Comparaison",
    product: "Produit",
    correction: "Correction",
    interpretationMultiplicative: "Interprétation (Modèle Multiplicatif) :",
    aboveAverage: "Indice saisonnier > 1 : Période au-dessus de la moyenne (saisonnalité positive)",
    belowAverage: "Indice saisonnier < 1 : Période en-dessous de la moyenne (saisonnalité négative)",
    noSeasonalEffect: "Indice saisonnier = 1 : Aucun effet saisonnier",
    methodLabel: "Méthode : Calculer Yt/MMc4 pour chaque observation, moyenner par trimestre, puis ajuster pour que le produit égale 1.",
    accuracyComparisonAll: "Comparaison de Précision - Les Trois Méthodes",
    bias: "Biais",
    originalModelAcc: "📊 Précision du Modèle Original",
    selectedMethodLabel: "Méthode sélectionnée",
    reestimatedModelAcc: "🔄 Précision du Modèle Ré-estimé (CVS)",
    trendRefitted: "Tendance réajustée via série désaisonnalisée",
    betterFitCVS: "✓ Meilleur ajustement via ré-estimation CVS",
    originalMoreAccurate: "✗ La tendance originale est plus précise",
    interpretationLabel: "📋 Interprétation :",
    biasExplanation: "Biais : Moyenne de toutes les erreurs. Proche de 0 est meilleur. Positif = surestimation systématique.",
    maeExplanation: "MAE : Erreur Absolue Moyenne - magnitude moyenne des erreurs de prédiction (en unités)",
    mseExplanation: "MSE (EQM) : Erreur Quadratique Moyenne - pénalise davantage les grandes erreurs",
    rmseExplanation: "RMSE : Racine de l'Erreur Quadratique Moyenne - mêmes unités que les données, plus facile à interpréter",
    lowerValues: "Des valeurs plus faibles dans toutes les métriques indiquent un meilleur ajustement du modèle",
    estimatedVsActual: "Série Estimée vs Réelle (Modèle Multiplicatif)",
    multiplicativeEquation: "Équation du Modèle Multiplicatif :",
    estimatedSeriesFormula: "Série estimée :",
    whereLabel: "où",
    modelAccuracyLabel: "Précision du Modèle :",
    residualsRandomComponent: "Résidus - Composante Aléatoire (εt)",
    multiplicativeResiduals: "Résidus du Modèle Multiplicatif :",
    residualsRepresent: "Les résidus représentent la composante aléatoire/accidentelle non expliquée par la tendance et la saisonnalité",
    interpretationResiduals: "Interprétation :",
    higherThanPredicted: "εt > 1 : La valeur réelle est supérieure à la prédiction",
    lowerThanPredicted: "εt < 1 : La valeur réelle est inférieure à la prédiction",
    perfectPrediction: "εt = 1 : Prédiction parfaite",
    seasonallyAdjusted: "Série Corrigée des Variations Saisonnières (CVS)",
    multiplicativeDeseasonalization: "Désaisonnalisation Multiplicative :",
    cvsSeriesRemoves: "La série CVS (Corrigée des Variations Saisonnières) élimine l'effet saisonnier en divisant par l'indice saisonnier, révélant la tendance sous-jacente et la composante aléatoire.",
    purposeLabel: "Objectif :",
    allowsComparison: "Permet la comparaison entre différents trimestres sans distorsion saisonnière.",
    forecasts2022Title: "Prévisions pour 2022 (Modèle Multiplicatif)",
    forecastFormula: "Formule de Prévision (Multiplicatif) :",
    linearTrend: "tendance linéaire",
    seasonalIndexFor: "indice saisonnier pour le trimestre correspondant",
    footerLine1: "Analyse de Séries Temporelles - Prof. Soumaya FELLAJI - Année Académique 2025/2026",
    footerLine2: "Projet géré par Mohamed Reda Touhami",
    discussionTab: "Discussion & Améliorations",
    iterativeProcess: "🔄 Processus Itératif",
    iterativeDescription: "Le modèle multiplicatif peut être raffiné en ré-estimant les coefficients saisonniers avec la nouvelle tendance, puis en recalculant la série CVS. Ce processus itératif améliore l'ajustement du modèle jusqu'à convergence.",
    stoppingCriteria: "🛑 Critères d'Arrêt",
    stoppingDescription: "L'algorithme converge lorsque le changement de MAE entre deux itérations est inférieur à 0.01, ou après N itérations maximum (généralement 10-20).",
    additionalImprovements: "💡 Améliorations Supplémentaires",
    improvementsDescription: "Pour renforcer l'analyse, considérez les extensions suivantes :",
    nonLinearModels: "Modèles non-linéaires (exponentiels, logarithmiques)",
    residualAutocorrelation: "Analyse d'autocorrélation des résidus (test Durbin-Watson)",
    outlierDetection: "Détection et traitement des valeurs aberrantes",
    arimaComparison: "Comparaison avec modèles ARIMA/SARIMA",
    flowchartTitle: "Processus d'Optimisation Itérative",
    flowchartStep1: "Tendance initiale",
    flowchartStep2: "Coefficients saisonniers",
    flowchartStep3: "Série CVS",
    flowchartStep4: "Nouvelle tendance",
    flowchartStep5: "Comparaison et convergence",
    convergenceAchieved: "Convergence atteinte ✓",
    algorithm: "Algorithme Détaillé",
    step: "Étape",
    updateCoefficients: "Ré-estimer les coefficients saisonniers à partir de la série CVS",
    reestimateTrend: "Ré-estimer la tendance par décomposition",
    calculateNewCVS: "Calculer la nouvelle série CVS",
    checkConvergence: "Vérifier la convergence : ΔMAE < 0.01 ou N_iter ≥ N_max",
    maxIterations: "Nombre maximum d'itérations",
    MAEThreshold: "Seuil de changement MAE",
  },
  en: {
    title: "Time Series Analysis - Quarterly Sales (Multiplicative Model)",
    seasonalMethod: "Seasonal method",
    seasonalMethodInfo: "Select which method to use for seasonal decomposition",
    productLabel: "Product",
    correctionLabel: "Correction factor",
    originalAccuracy: "Original model accuracy",
    originalAccuracyInfo: "Error metrics for the original trend-based model",
    reestimatedModel: "Re-estimated model (CVS)",
    reestimatedModelInfo: "Model re-estimated after deseasonalization",
    showLabel: "show",
    trendLabel: "Trend (CVS)",
    hideTable: "🔼 Hide Calculation Table",
    showTable: "🔽 Show Complete Calculation Table",
    calculationTable: "Calculation Summary Table - Multiplicative Model",
    exportCSV: "📥 Export CSV",
    copy: "📋 Copy",
    year: "Year",
    quarter: "Quarter",
    sales: "Sales (Yt)",
    trend: "Trend (Tt)",
    seasonalIndex: "Seasonal Index (St)",
    estimated: "Estimated (Ŷt = Tt×St)",
    residualRatio: "Residual Ratio (εt)",
    cvs: "CVS (Yt/St)",
    seasonalIndices: "Seasonal Indices - Ratio-to-Moving-Average Method",
    modelAccuracy: "Model Accuracy",
    meanAbsoluteError: "Mean Absolute Error",
    meanSquaredError: "Mean Squared Error",
    rootMeanSquaredError: "Root Mean Squared Error",
    mainFormulas: "Main Formulas (Multiplicative Model)",
    multiplicativeModel: "Multiplicative Model",
    model: "Model",
    estimatedSeries: "Estimated series",
    residuals: "Residuals",
    forecasts2022: "2022 Forecasts",
    originalData: "Original Data",
    trendComparison: "Trend Comparison",
    movingAverage: "Moving Average",
    seasonalCoefficients: "Seasonal Coefficients",
    accuracyComparison: "Accuracy Comparison",
    estimatedSeriesTab: "Estimated Series",
    residualsTab: "Residuals",
    cvsSeriesTab: "CVS Series",
    forecastTab: "2022 Forecasts",
    comments: "Comments:",
    interpretation: "Interpretation:",
    units: "units",
    confidenceInterval: "95% CI",
    method: "Method",
    status: "Status",
    selected: "✓ Selected",
    bestMAE: "🏆 Best MAE",
    simpleAverages: "Simple Averages (Y/T)",
    ratioToTrend: "Ratio to Trend",
    ratioToMovingAverage: "Ratio to Moving Average",
    quarterlySales: "Quarterly Sales (2018-2021)",
    clearUpwardTrend: "Clear upward trend in sales over the 4-year period",
    strongSeasonalPattern: "Strong seasonal pattern: Q3 consistently has highest sales",
    q3HighestSales: "Q3 shows highest sales across all years",
    q1LowestSales: "Q1 shows lowest sales across all years",
    seasonalAmplitude: "Seasonal amplitude increases with the trend level → Multiplicative model is appropriate",
    ratioStable: "The ratio Yt / Trend remains relatively stable, confirming multiplicative decomposition",
    trendEstimation: "Trend Estimation - Least Squares Method",
    leastSquares: "Least Squares",
    semiAverage: "Semi-Average",
    actualSales: "Actual sales",
    centeredMA: "Centered Moving Average (MMc4)",
    forQuarterlyData: "For quarterly data (even number of periods), we use a centered moving average:",
    eliminatesSeasonal: "This eliminates seasonal fluctuations and shows the general trend more clearly.",
    seasonalIndicesComparison: "Seasonal Indices - Comparison",
    product: "Product",
    correction: "Correction",
    interpretationMultiplicative: "Interpretation (Multiplicative Model):",
    aboveAverage: "Seasonal index > 1: Above-average period (positive seasonality)",
    belowAverage: "Seasonal index < 1: Below-average period (negative seasonality)",
    noSeasonalEffect: "Seasonal index = 1: No seasonal effect",
    methodLabel: "Method: Calculate Yt/MMc4 for each observation, average by quarter, then adjust so product equals 1.",
    accuracyComparisonAll: "Accuracy Comparison - All Three Methods",
    bias: "Bias",
    originalModelAcc: "📊 Original Model Accuracy",
    selectedMethodLabel: "Selected Method",
    reestimatedModelAcc: "🔄 Re-estimated Model Accuracy (CVS)",
    trendRefitted: "Trend re-fitted via deseasonalized series",
    betterFitCVS: "✓ Better fit via CVS re-estimation",
    originalMoreAccurate: "✗ Original trend is more accurate",
    interpretationLabel: "📋 Interpretation:",
    biasExplanation: "Bias: Mean of all errors. Close to 0 is best. Positive = systematic overestimation.",
    maeExplanation: "MAE: Mean Absolute Error - average magnitude of prediction errors (in units)",
    mseExplanation: "MSE (EQM): Mean Squared Error - penalizes large errors more heavily",
    rmseExplanation: "RMSE: Root Mean Squared Error - same units as data, easier to interpret",
    lowerValues: "Lower values in all metrics indicate better model fit",
    estimatedVsActual: "Estimated Series vs Actual (Multiplicative Model)",
    multiplicativeEquation: "Multiplicative Model Equation:",
    estimatedSeriesFormula: "Estimated series:",
    whereLabel: "where",
    modelAccuracyLabel: "Model Accuracy:",
    residualsRandomComponent: "Residuals - Random Component (εt)",
    multiplicativeResiduals: "Multiplicative Model Residuals:",
    residualsRepresent: "Residuals represent the random/accidental component not explained by trend and seasonality",
    interpretationResiduals: "Interpretation:",
    higherThanPredicted: "εt > 1: Actual value is higher than predicted",
    lowerThanPredicted: "εt < 1: Actual value is lower than predicted",
    perfectPrediction: "εt = 1: Perfect prediction",
    seasonallyAdjusted: "Seasonally Adjusted Series (CVS)",
    multiplicativeDeseasonalization: "Multiplicative Deseasonalization:",
    cvsSeriesRemoves: "The CVS (Corrigée des Variations Saisonnières) series removes the seasonal effect by dividing by the seasonal index, revealing the underlying trend and random component.",
    purposeLabel: "Purpose:",
    allowsComparison: "Allows comparison across different quarters without seasonal distortion.",
    forecasts2022Title: "Forecasts for 2022 (Multiplicative Model)",
    forecastFormula: "Forecast Formula (Multiplicative):",
    linearTrend: "linear trend",
    seasonalIndexFor: "seasonal index for the corresponding quarter",
    footerLine1: "Time Series Analysis - Prof. Soumaya FELLAJI - Academic Year 2025/2026",
    footerLine2: "Project managed by Mohamed Reda Touhami",
    discussionTab: "Discussion & Improvements",
    iterativeProcess: "🔄 Iterative Process",
    iterativeDescription: "The multiplicative model can be refined by re-estimating seasonal coefficients with the new trend, then recalculating the CVS series. This iterative process improves model fit until convergence.",
    stoppingCriteria: "🛑 Stopping Criteria",
    stoppingDescription: "The algorithm converges when the MAE change between two iterations is less than 0.01, or after maximum N iterations (typically 10-20).",
    additionalImprovements: "💡 Additional Improvements",
    improvementsDescription: "To strengthen the analysis, consider the following extensions:",
    nonLinearModels: "Non-linear models (exponential, logarithmic)",
    residualAutocorrelation: "Residual autocorrelation analysis (Durbin-Watson test)",
    outlierDetection: "Outlier detection and treatment",
    arimaComparison: "Comparison with ARIMA/SARIMA models",
    flowchartTitle: "Iterative Optimization Process",
    flowchartStep1: "Initial trend",
    flowchartStep2: "Seasonal coefficients",
    flowchartStep3: "CVS series",
    flowchartStep4: "New trend",
    flowchartStep5: "Comparison & convergence",
    convergenceAchieved: "Convergence achieved ✓",
    algorithm: "Detailed Algorithm",
    step: "Step",
    updateCoefficients: "Re-estimate seasonal coefficients from CVS series",
    reestimateTrend: "Re-estimate trend by decomposition",
    calculateNewCVS: "Calculate new CVS series",
    checkConvergence: "Check convergence: ΔMAE < 0.01 or N_iter ≥ N_max",
    maxIterations: "Maximum number of iterations",
    MAEThreshold: "MAE change threshold",
  }
};

const TimeSeriesAnalysis = () => {
  const [language, setLanguage] = useState<Language>('fr');
  const [activeTab, setActiveTab] = useState('original');
  const [showTable, setShowTable] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<SeasonalMethodName>('ratio-to-moving-average');
  const [showReestimated, setShowReestimated] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showFormulas, setShowFormulas] = useState(false);

  const t = translations[language];

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

  const formatCoefficient = (value: number): string => value.toFixed(4);
  const formatSales = (value: number): string => value.toFixed(2);
  const formatAccuracyMetric = (value: number): string => value.toFixed(2);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg border-2 border-indigo-500 shadow-lg">
          <p className="font-semibold text-sm text-gray-800">{payload[0].payload.label || label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {typeof entry.value === 'number' ? formatSales(entry.value) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

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
        label: t.simpleAverages,
        coefficients: simple.corrected,
        product: simple.product,
        correctionFactor: simple.factor,
        accuracy: calculateAccuracy(simple.corrected),
      },
      {
        name: 'ratio-to-trend',
        label: t.ratioToTrend,
        coefficients: ratioTrend.corrected,
        product: ratioTrend.product,
        correctionFactor: ratioTrend.factor,
        accuracy: calculateAccuracy(ratioTrend.corrected),
      },
      {
        name: 'ratio-to-moving-average',
        label: t.ratioToMovingAverage,
        coefficients: ratioMA.corrected,
        product: ratioMA.product,
        correctionFactor: ratioMA.factor,
        accuracy: calculateAccuracy(ratioMA.corrected),
      },
    ];
  };

  const seasonalMethods = useMemo(() => buildSeasonalMethods(), [movingAvgData, language]);
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
      alert(language === 'fr' ? 'Données copiées !' : 'Data copied!');
    }).catch((err: Error) => {
      console.error(language === 'fr' ? 'Erreur : ' : 'Failed to copy: ', err);
    });
  };

  const exportToHTML = () => {
    const reportHTML = `
    <!DOCTYPE html>
    <html lang="${language}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${language === 'fr' ? 'Rapport - Analyse de Séries Temporelles' : 'Report - Time Series Analysis'}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; color: #333; }
        h1 { color: #4f46e5; text-align: center; margin-bottom: 10px; }
        .subtitle { text-align: center; color: #666; margin-bottom: 40px; font-size: 14px; }
        h2 { color: #5b21b6; border-bottom: 2px solid #5b21b6; padding-bottom: 10px; margin-top: 30px; }
        h3 { color: #7c3aed; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #4f46e5; color: white; }
        tr:nth-child(even) { background-color: #f5f5f5; }
        .metric-box { background-color: #f9fafb; border-left: 4px solid #4f46e5; padding: 15px; margin: 10px 0; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .card { background-color: #f0f4ff; border: 1px solid #d1d5db; padding: 15px; border-radius: 8px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
        .timestamp { color: #999; }
      </style>
    </head>
    <body>
      <h1>${language === 'fr' ? '📊 Analyse de Séries Temporelles' : '📊 Time Series Analysis'}</h1>
      <div class="subtitle">${language === 'fr' ? 'Ventes Trimestrielles (2018-2021) - Modèle Multiplicatif' : 'Quarterly Sales (2018-2021) - Multiplicative Model'}</div>
      
      <h2>${language === 'fr' ? 'Résumé Exécutif' : 'Executive Summary'}</h2>
      <div class="grid">
        <div class="card">
          <strong>${language === 'fr' ? 'Méthode Sélectionnée' : 'Selected Method'}:</strong> ${selectedSeasonal.label}
        </div>
        <div class="card">
          <strong>${language === 'fr' ? 'Produit des Indices' : 'Product of Indices'}:</strong> ${formatCoefficient(selectedSeasonal.product)}
        </div>
      </div>

      <h2>${language === 'fr' ? 'Métriques de Précision' : 'Accuracy Metrics'}</h2>
      <table>
        <tr><th>${language === 'fr' ? 'Métrique' : 'Metric'}</th><th>${language === 'fr' ? 'Modèle Original' : 'Original Model'}</th><th>${language === 'fr' ? 'Modèle Ré-estimé' : 'Re-estimated Model'}</th></tr>
        <tr><td>${t.bias}</td><td>${formatAccuracyMetric(accuracyMetrics.bias)}</td><td>${formatAccuracyMetric(reestimatedMetrics.bias)}</td></tr>
        <tr><td>MAE</td><td>${formatAccuracyMetric(accuracyMetrics.mae)}</td><td>${formatAccuracyMetric(reestimatedMetrics.mae)}</td></tr>
        <tr><td>MSE</td><td>${formatAccuracyMetric(accuracyMetrics.mse)}</td><td>${formatAccuracyMetric(reestimatedMetrics.mse)}</td></tr>
        <tr><td>RMSE</td><td>${formatAccuracyMetric(accuracyMetrics.rmse)}</td><td>${formatAccuracyMetric(reestimatedMetrics.rmse)}</td></tr>
      </table>

      <h2>${language === 'fr' ? 'Indices Saisonniers' : 'Seasonal Indices'}</h2>
      <table>
        <tr><th>${t.quarter}</th><th>${language === 'fr' ? 'Coefficient' : 'Coefficient'}</th><th>${language === 'fr' ? 'Pourcentage' : 'Percentage'}</th></tr>
        ${quarters.map(q => `<tr><td>${q}</td><td>${formatCoefficient(selectedSeasonal.coefficients[q])}</td><td>${(selectedSeasonal.coefficients[q] * 100).toFixed(2)}%</td></tr>`).join('')}
      </table>

      <h2>${language === 'fr' ? 'Prévisions 2022' : '2022 Forecasts'}</h2>
      <table>
        <tr><th>${t.quarter}</th><th>${language === 'fr' ? 'Prévision' : 'Forecast'}</th><th>${t.confidenceInterval}</th></tr>
        ${forecastsOriginal.map(f => `<tr><td>${f.quarter}</td><td>${formatSales(f.forecast)}</td><td>[${formatSales(f.lowerCI || 0)}, ${formatSales(f.upperCI || 0)}]</td></tr>`).join('')}
      </table>

      <h2>${language === 'fr' ? 'Données de Base' : 'Base Data'}</h2>
      <table>
        <tr><th>t</th><th>${t.year}</th><th>${t.quarter}</th><th>${t.sales}</th><th>${t.trend}</th><th>${t.estimated}</th></tr>
        ${estimatedData.slice(0, 8).map((row, i) => `<tr><td>${row.t}</td><td>${row.year}</td><td>${row.quarter}</td><td>${formatSales(row.sales || 0)}</td><td>${formatSales(row.trend || 0)}</td><td>${formatSales(row.estimated)}</td></tr>`).join('')}
      </table>

      <div class="footer">
        <p><strong>${language === 'fr' ? 'Rapport généré' : 'Report generated'}:</strong> <span class="timestamp">${new Date().toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')}</span></p>
        <p>${t.footerLine1}</p>
        <p>${t.footerLine2}</p>
      </div>
    </body>
    </html>
    `;

    const blob = new Blob([reportHTML], { type: 'text/html;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `time-series-report-${new Date().toISOString().split('T')[0]}.html`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(99,102,241,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.05),transparent_70%)]"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto p-4 md:p-6">
        {/* Header with language toggle */}
        <div className="flex justify-between items-start mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-900 via-purple-900 to-violet-900 flex-1">
            {t.title}
          </h1>
          <div className="flex gap-2 ml-4">
            <button
              onClick={exportToHTML}
              className="px-3 md:px-4 py-2 bg-white/80 backdrop-blur-sm border-2 border-emerald-300 rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-105 font-bold text-emerald-700 text-xs md:text-sm"
              title={language === 'fr' ? 'Exporter le rapport' : 'Export report'}
            >
              📥 {language === 'fr' ? 'Rapport' : 'Report'}
            </button>
            <button
              onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
              className="px-4 py-2 bg-white/80 backdrop-blur-sm border-2 border-indigo-300 rounded-lg shadow-md hover:shadow-xl transition-all hover:scale-105 font-bold text-indigo-700 text-sm"
              title={language === 'fr' ? 'Switch to English' : 'Passer au français'}
            >
              {language === 'fr' ? 'EN' : 'FR'}
            </button>
          </div>
        </div>

      {/* Method selection & toggles */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white/90 backdrop-blur-sm p-3 md:p-4 rounded-xl shadow-lg border-2 border-indigo-200/50 hover:shadow-xl transition-shadow">
          <div className="text-xs md:text-sm font-semibold text-indigo-700 mb-2 flex items-center gap-1">
            {t.seasonalMethod}
            <span className="text-gray-400 cursor-help" title={t.seasonalMethodInfo}>ℹ️</span>
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
          <div className="text-xs text-gray-500 mt-2">{t.productLabel} = {selectedSeasonal.product.toFixed(4)} | {t.correctionLabel} {selectedSeasonal.correctionFactor.toFixed(6)}</div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm p-3 md:p-4 rounded-xl shadow-lg border-2 border-emerald-200/50 hover:shadow-xl transition-shadow">
          <div className="text-xs md:text-sm font-semibold text-emerald-700 mb-2 flex items-center gap-1">
            {t.originalAccuracy}
            <span className="text-gray-400 cursor-help" title={t.originalAccuracyInfo}>ℹ️</span>
          </div>
          <div className="text-xs text-gray-600">Bias: <span className="font-semibold">{accuracyMetrics.bias}</span></div>
          <div className="text-xs text-gray-600">MAE: <span className="font-semibold">{accuracyMetrics.mae}</span></div>
          <div className="text-xs text-gray-600">MSE (EQM): <span className="font-semibold">{accuracyMetrics.mse}</span></div>
          <div className="text-xs text-gray-600">RMSE: <span className="font-semibold">{accuracyMetrics.rmse}</span></div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm p-3 md:p-4 rounded-xl shadow-lg border-2 border-purple-200/50 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs md:text-sm font-semibold text-purple-700 flex items-center gap-1">
              {t.reestimatedModel}
              <span className="text-gray-400 cursor-help" title={t.reestimatedModelInfo}>ℹ️</span>
            </div>
            <label className="text-xs text-gray-500 flex items-center gap-1">
              <input type="checkbox" checked={showReestimated} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShowReestimated(e.target.checked)} /> {t.showLabel}
            </label>
          </div>
          <div className="text-xs text-gray-600">Bias: <span className="font-semibold">{reestimatedMetrics.bias}</span></div>
          <div className="text-xs text-gray-600">MAE: <span className="font-semibold">{reestimatedMetrics.mae}</span></div>
          <div className="text-xs text-gray-600">MSE (EQM): <span className="font-semibold">{reestimatedMetrics.mse}</span></div>
          <div className="text-xs text-gray-600">RMSE: <span className="font-semibold">{reestimatedMetrics.rmse}</span></div>
          <div className="text-xs text-gray-500 mt-1">{t.trendLabel}: {reestimatedTrend.b.toFixed(2)} + {reestimatedTrend.a.toFixed(2)}t</div>
        </div>
      </div>

      {/* Button to show/hide calculation table */}
      <div className="mb-4 text-center">
        <button
          onClick={() => setShowTable(!showTable)}
          className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white text-sm md:text-base font-bold rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all"
        >
          {showTable ? t.hideTable : t.showTable}
        </button>
      </div>

      {/* Calculation table */}
      {showTable && (
        <div className="mb-6 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-6 overflow-x-auto border-2 border-indigo-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-700">{t.calculationTable}</h2>
            <div className="flex gap-2">
              <button
                onClick={() => exportToCSV(estimatedData, 'time-series-calculations')}
                className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white text-sm rounded-lg hover:shadow-lg transition-all hover:scale-105"
                title={t.exportCSV}
              >
                {t.exportCSV}
              </button>
              <button
                onClick={() => copyTableToClipboard(estimatedData)}
                className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm rounded-lg hover:shadow-lg transition-all hover:scale-105"
                title={t.copy}
              >
                {t.copy}
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">

            <table className="min-w-full border-collapse border border-indigo-300">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <th className="border border-indigo-300 px-3 py-2">t</th>
                  <th className="border border-indigo-300 px-3 py-2">{t.year}</th>
                  <th className="border border-indigo-300 px-3 py-2">{t.quarter}</th>
                  <th className="border border-indigo-300 px-3 py-2">{t.sales}</th>
                  <th className="border border-indigo-300 px-3 py-2">{t.trend}</th>
                  <th className="border border-indigo-300 px-3 py-2">Yt / Tt</th>
                  <th className="border border-indigo-300 px-3 py-2">{t.seasonalIndex}</th>
                  <th className="border border-indigo-300 px-3 py-2">{t.estimated}</th>
                  <th className="border border-indigo-300 px-3 py-2">{t.residualRatio}</th>
                  <th className="border border-indigo-300 px-3 py-2">{t.cvs}</th>
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
          <div className="mt-6 bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border-2 border-indigo-200 shadow-lg">
            <h3 className="font-bold text-lg mb-3 text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-700">{t.seasonalIndices}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {Object.entries(selectedSeasonal.coefficients).map(([quarter, index]) => (
                <div key={quarter} className="bg-white p-3 rounded-lg border-2 border-indigo-200">
                  <div className="font-bold text-center text-lg mb-2">{quarter}</div>
                  <div className="text-sm">Seasonal Index:</div>
                  <div className="text-lg font-bold text-indigo-700 text-center">{formatCoefficient(index)}</div>
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
          <div className="mt-6 bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-xl border-2 border-emerald-200 shadow-lg">
            <h3 className="font-bold text-lg mb-3 text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-green-700">{t.modelAccuracy}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg text-center shadow-md">
                <div className="text-sm text-gray-600">{t.meanAbsoluteError}</div>
                <div className="text-2xl font-bold text-emerald-700">{accuracyMetrics.mae}</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg text-center shadow-md">
                <div className="text-sm text-gray-600">{t.meanSquaredError}</div>
                <div className="text-2xl font-bold text-emerald-700">{accuracyMetrics.mse}</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg text-center shadow-md">
                <div className="text-sm text-gray-600">{t.rootMeanSquaredError}</div>
                <div className="text-2xl font-bold text-emerald-700">{accuracyMetrics.rmse}</div>
              </div>
            </div>
          </div>

          {/* Formulas Reference Section */}
          <div className="mt-6 bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl border-2 border-slate-300 shadow-lg overflow-hidden">
            <button
              onClick={() => setShowFormulas(!showFormulas)}
              className="w-full p-4 flex justify-between items-center bg-gradient-to-r from-slate-600 to-gray-600 text-white hover:from-slate-700 hover:to-gray-700 transition-all"
            >
              <h3 className="font-bold text-lg">📐 {language === 'fr' ? 'Référence des Formules' : 'Formulas Reference'}</h3>
              <span className="text-2xl">{showFormulas ? '▼' : '▶'}</span>
            </button>
            
            {showFormulas && (
              <div className="p-6 space-y-6">
                {/* Trend Formulas */}
                <div className="bg-gradient-to-br from-red-50 to-rose-50 p-4 rounded-lg border-l-4 border-red-500">
                  <h4 className="font-bold text-red-800 mb-3">📈 {language === 'fr' ? 'Tendance (Moindres Carrés)' : 'Trend (Least Squares)'}</h4>
                  <div className="space-y-2 text-sm font-mono bg-white p-3 rounded border border-red-200">
                    <p><strong>a</strong> = Σ(t<sub>i</sub> - t̄)(Y<sub>i</sub> - Ȳ) / Σ(t<sub>i</sub> - t̄)²</p>
                    <p><strong>b</strong> = Ȳ - a·t̄</p>
                    <p><strong>T<sub>t</sub></strong> = b + a·t</p>
                    <p className="mt-2 text-gray-700">{language === 'fr' ? 'Valeurs observées :' : 'Observed values:'} a = {trendA.toFixed(2)}, b = {trendB.toFixed(2)}</p>
                  </div>
                </div>

                {/* Multiplicative Model */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="font-bold text-blue-800 mb-3">⚙️ {language === 'fr' ? 'Modèle Multiplicatif' : 'Multiplicative Model'}</h4>
                  <div className="space-y-2 text-sm font-mono bg-white p-3 rounded border border-blue-200">
                    <p><strong>Y<sub>t</sub></strong> = T<sub>t</sub> × S<sub>t</sub> × ε<sub>t</sub></p>
                    <p><strong>Ŷ<sub>t</sub></strong> = T<sub>t</sub> × S<sub>t</sub></p>
                    <p><strong>ε<sub>t</sub></strong> = Y<sub>t</sub> / Ŷ<sub>t</sub></p>
                    <p className="mt-2 text-gray-700">{language === 'fr' ? 'où T = tendance, S = saisonnier, ε = résidu' : 'where T = trend, S = seasonal, ε = residual'}</p>
                  </div>
                </div>

                {/* Seasonal Methods */}
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-lg border-l-4 border-purple-500">
                  <h4 className="font-bold text-purple-800 mb-3">🔄 {language === 'fr' ? 'Méthodes Saisonnières' : 'Seasonal Methods'}</h4>
                  
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-purple-200">
                      <p className="font-semibold text-sm mb-1">1. {t.simpleAverages}</p>
                      <p className="text-xs font-mono">S<sub>t</sub> = moyenne(Y<sub>i</sub> / T<sub>i</sub>) {language === 'fr' ? 'par trimestre' : 'per quarter'}</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-purple-200">
                      <p className="font-semibold text-sm mb-1">2. {t.ratioToTrend}</p>
                      <p className="text-xs font-mono">{language === 'fr' ? 'Identique à méthode 1' : 'Identical to method 1'}</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-purple-200">
                      <p className="font-semibold text-sm mb-1">3. {t.ratioToMovingAverage}</p>
                      <p className="text-xs font-mono">S<sub>t</sub> = moyenne(Y<sub>i</sub> / MMc4<sub>i</sub>) {language === 'fr' ? 'par trimestre' : 'per quarter'}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 bg-white p-3 rounded border border-purple-200">
                    <p className="font-semibold text-sm mb-1">⚖️ {language === 'fr' ? 'Correction du produit' : 'Product correction'}</p>
                    <p className="text-xs font-mono">S<sub>t</sub> {language === 'fr' ? 'corrigé' : 'adjusted'} = S<sub>t</sub> × (1 / Π S<sub>i</sub>)<sup>1/4</sup></p>
                    <p className="text-xs text-gray-600 mt-1">{language === 'fr' ? 'Garantit: Π S<sub>i</sub> = 1' : 'Ensures: Π S<sub>i</sub> = 1'}</p>
                  </div>
                </div>

                {/* CVS */}
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-4 rounded-lg border-l-4 border-cyan-500">
                  <h4 className="font-bold text-cyan-800 mb-3">💧 {language === 'fr' ? 'Série CVS (Désaisonnalisée)' : 'CVS Series (Deseasonalized)'}</h4>
                  <div className="space-y-2 text-sm font-mono bg-white p-3 rounded border border-cyan-200">
                    <p><strong>CVS<sub>t</sub></strong> = Y<sub>t</sub> / S<sub>t</sub></p>
                    <p className="mt-2 text-gray-700">{language === 'fr' ? 'Contient: tendance + résidus' : 'Contains: trend + residuals'}</p>
                  </div>
                </div>

                {/* Accuracy Metrics */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border-l-4 border-green-500">
                  <h4 className="font-bold text-green-800 mb-3">📊 {language === 'fr' ? 'Métriques de Précision' : 'Accuracy Metrics'}</h4>
                  <div className="space-y-2 text-sm font-mono bg-white p-3 rounded border border-green-200">
                    <p><strong>Biais:</strong> (1/n)·Σ(Ŷ<sub>t</sub> - Y<sub>t</sub>)</p>
                    <p><strong>MAE:</strong> (1/n)·Σ|Ŷ<sub>t</sub> - Y<sub>t</sub>|</p>
                    <p><strong>MSE:</strong> (1/n)·Σ(Ŷ<sub>t</sub> - Y<sub>t</sub>)²</p>
                    <p><strong>RMSE:</strong> √MSE</p>
                    <p className="mt-2 text-gray-700 normal">{language === 'fr' ? '⬇️ Valeurs basses = meilleur ajustement' : '⬇️ Lower values = better fit'}</p>
                  </div>
                </div>

                {/* Moving Average */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-lg border-l-4 border-orange-500">
                  <h4 className="font-bold text-orange-800 mb-3">📈 {language === 'fr' ? 'Moyenne Mobile Centrée' : 'Centered Moving Average'}</h4>
                  <div className="space-y-2 text-sm font-mono bg-white p-3 rounded border border-orange-200">
                    <p><strong>MM4<sub>t</sub></strong> = (Y<sub>t-1</sub> + Y<sub>t</sub> + Y<sub>t+1</sub> + Y<sub>t+2</sub>) / 4</p>
                    <p><strong>MMc4<sub>t</sub></strong> = (MM4<sub>t</sub> + MM4<sub>t+1</sub>) / 2</p>
                    <p className="mt-2 text-gray-700 normal">{language === 'fr' ? 'Lisse les données trimestrielles' : 'Smooths quarterly data'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-200 shadow-lg">
                <h4 className="font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700">{t.mainFormulas}</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Trend (Least Squares):</strong> Tt = {trendB.toFixed(3)} + {trendA.toFixed(3)}t</p>
                  <p><strong>Model:</strong> Yt = Tt × St × εt</p>
                  <p><strong>Estimated series:</strong> Ŷt = Tt × St</p>
                  <p><strong>Residuals:</strong> εt = Yt / Ŷt</p>
                  <p><strong>CVS:</strong> CVSt = Yt / St</p>
                  <p><strong>Re-estimated Trend (CVS):</strong> Tt = {reestimatedTrend.b.toFixed(2)} + {reestimatedTrend.a.toFixed(2)}t</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-xl border-2 border-emerald-200 shadow-lg">
                <h4 className="font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-green-700">{t.forecasts2022} (Ŷt = Tt × St)</h4>
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
      <div className="flex flex-wrap gap-1 md:gap-2 mb-4 md:mb-6 bg-white/80 backdrop-blur-sm p-2 rounded-xl shadow-lg border border-indigo-100 overflow-x-auto">
        {[
          { id: 'original', label: t.originalData },
          { id: 'trends', label: t.trendComparison },
          { id: 'moving', label: t.movingAverage },
          { id: 'seasonal', label: t.seasonalCoefficients },
          { id: 'accuracy', label: t.accuracyComparison },
          { id: 'estimated', label: t.estimatedSeriesTab },
          { id: 'residuals', label: t.residualsTab },
          { id: 'cvs', label: t.cvsSeriesTab },
          { id: 'forecast', label: t.forecastTab },
          { id: 'discussion', label: t.discussionTab },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-2 md:px-4 py-1.5 md:py-2 text-xs md:text-sm rounded-lg transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-4 md:p-6 border-2 border-indigo-100">
        {/* 1. Original data */}
        {activeTab === 'original' && (
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-700">{t.quarterlySales}</h2>
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
            
            <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 shadow-lg">
              <h3 className="font-bold text-base md:text-lg mb-2">{t.comments}</h3>
              <ul className="list-disc list-inside space-y-1 md:space-y-2 text-xs md:text-sm">
                <li>{t.clearUpwardTrend}</li>
                <li>{t.strongSeasonalPattern}</li>
                <li>{t.q1LowestSales}</li>
                <li>{t.seasonalAmplitude}</li>
                <li>{t.ratioStable}</li>
              </ul>
            </div>
          </div>
        )}

        {/* 2. Trend comparison */}
        {activeTab === 'trends' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-700">{t.trendEstimation}</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={originalData.map(d => ({ ...d, label: `${d.year}-${d.quarter}`, trendMC: getTrend(d.t), trendSM: calculateTrendSemiAverage().a * d.t + calculateTrendSemiAverage().b, mmc4: movingAvgData.find(m => m.t === d.t)?.mmc4 }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={2} name={t.actualSales} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="trendMC" stroke="#ef4444" strokeWidth={2} name={`${t.trend} (${t.leastSquares})`} strokeDasharray="5 5" />
                <Line type="monotone" dataKey="trendSM" stroke="#10b981" strokeWidth={2} name={`${t.trend} (${t.semiAverage})`} strokeDasharray="6 4" />
                <Line type="monotone" dataKey="mmc4" stroke="#f59e0b" strokeWidth={2} name={`${t.movingAverage} (MMc4)`} strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border-2 border-red-200 shadow-lg">
                <h3 className="font-bold text-lg mb-2">{t.leastSquares}</h3>
                <p className="font-mono text-lg mb-3">T<sub>t</sub> = {trendB.toFixed(3)} + {trendA.toFixed(3)}t</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 shadow-lg">
                <h3 className="font-bold text-lg mb-2">{t.semiAverage}</h3>
                <p className="font-mono text-lg mb-3">T<sub>t</sub> = {calculateTrendSemiAverage().b.toFixed(2)} + {calculateTrendSemiAverage().a.toFixed(2)}t</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200 shadow-lg">
                <h3 className="font-bold text-lg mb-2">{t.movingAverage} (MMc4)</h3>
                <p className="text-sm">{language === 'fr' ? 'Affiché comme ligne orange pointillée (centrée ordre 4)' : 'Displayed as orange dashed line (centered order 4)'}</p>
              </div>
            </div>
          </div>
        )}

        {/* 3. Moving average */}
        {activeTab === 'moving' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-700">{t.centeredMA}</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={movingAvgData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={2} name={t.actualSales} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="mmc4" stroke="#f59e0b" strokeWidth={3} name={`${t.centeredMA} (MMc4)`} connectNulls />
              </LineChart>
            </ResponsiveContainer>
            
            <div className="mt-6 p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200 shadow-lg">
              <h3 className="font-bold text-lg mb-2">{t.centeredMA} - {language === 'fr' ? 'Ordre 4' : 'Order 4'}</h3>
              <p className="mb-2">{t.forQuarterlyData}</p>
              <p className="font-mono text-sm">MMc4<sub>t</sub> = (MM4<sub>t</sub> + MM4<sub>t+1</sub>) / 2</p>
              <p className="mt-2">{t.eliminatesSeasonal}</p>
            </div>
          </div>
        )}

        {/* 4. Seasonal coefficients */}
        {activeTab === 'seasonal' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-700">{t.seasonalIndicesComparison}</h2>
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
                <div key={m.name} className="p-4 rounded-xl border-2 shadow-lg bg-gradient-to-br from-white to-indigo-50 hover:shadow-xl transition-shadow" style={{ borderColor: '#e0e7ff' }}>
                  <div className="font-bold text-indigo-700 mb-2">{m.label}</div>
                  <div className="text-xs text-gray-600">{t.product}: {formatCoefficient(m.product)}</div>
                  <div className="text-xs text-gray-600">{t.correction}: {formatCoefficient(m.correctionFactor)}</div>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                    {quarters.map(q => (
                      <div key={`${m.name}-${q}`} className="flex justify-between">
                        <span className="font-semibold">{q}</span>
                        <span>{formatCoefficient(m.coefficients[q])} ({(m.coefficients[q] * 100).toFixed(2)}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 shadow-lg">
              <p className="font-bold mb-2">{t.interpretationMultiplicative}</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>{t.aboveAverage}</li>
                <li>{t.belowAverage}</li>
                <li>{t.noSeasonalEffect}</li>
                <li>{t.product} = {selectedSeasonal.product.toFixed(4)} ≈ 1.0000 ✓</li>
              </ul>
              <p className="mt-3 text-sm"><strong>{t.method}</strong> {t.methodLabel}</p>
            </div>
          </div>
        )}

        {/* 4b. Accuracy Comparison */}
        {activeTab === 'accuracy' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-700">{t.accuracyComparisonAll}</h2>
            
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full border-collapse border border-indigo-300 bg-white rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <th className="border border-indigo-300 px-4 py-3 text-left">{t.method}</th>
                    <th className="border border-indigo-300 px-4 py-3 text-center">{t.bias}</th>
                    <th className="border border-indigo-300 px-4 py-3 text-center">MAE</th>
                    <th className="border border-indigo-300 px-4 py-3 text-center">MSE (EQM)</th>
                    <th className="border border-indigo-300 px-4 py-3 text-center">RMSE</th>
                    <th className="border border-indigo-300 px-4 py-3 text-center">{t.status}</th>
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
                          {isSelected && <span className="ml-2 text-purple-600">{t.selected}</span>}
                        </td>
                        <td className="border border-indigo-300 px-4 py-3 text-center">{formatAccuracyMetric(m.accuracy.bias)}</td>
                        <td className="border border-indigo-300 px-4 py-3 text-center font-semibold">{formatAccuracyMetric(m.accuracy.mae)}</td>
                        <td className="border border-indigo-300 px-4 py-3 text-center">{formatAccuracyMetric(m.accuracy.mse)}</td>
                        <td className="border border-indigo-300 px-4 py-3 text-center">{formatAccuracyMetric(m.accuracy.rmse)}</td>
                        <td className="border border-indigo-300 px-4 py-3 text-center">
                          {isBest && <span className="bg-green-200 text-green-800 px-2 py-1 rounded font-bold text-sm">{t.bestMAE}</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200 shadow-lg">
                <h3 className="font-bold text-lg mb-2 text-emerald-800">{t.originalModelAcc}</h3>
                <div className="space-y-2 text-sm">
                  <p>{t.selectedMethodLabel}: <span className="font-bold text-indigo-700">{selectedSeasonal.label}</span></p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>{t.bias}: <span className="font-bold">{formatAccuracyMetric(accuracyMetrics.bias)}</span></div>
                    <div>MAE: <span className="font-bold">{formatAccuracyMetric(accuracyMetrics.mae)}</span></div>
                    <div>MSE: <span className="font-bold">{formatAccuracyMetric(accuracyMetrics.mse)}</span></div>
                    <div>RMSE: <span className="font-bold">{formatAccuracyMetric(accuracyMetrics.rmse)}</span></div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border-2 border-purple-200 shadow-lg">
                <h3 className="font-bold text-lg mb-2 text-purple-800">{t.reestimatedModelAcc}</h3>
                <div className="space-y-2 text-sm">
                  <p>{t.trendRefitted}</p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>{t.bias}: <span className="font-bold">{formatAccuracyMetric(reestimatedMetrics.bias)}</span></div>
                    <div>MAE: <span className="font-bold">{formatAccuracyMetric(reestimatedMetrics.mae)}</span></div>
                    <div>MSE: <span className="font-bold">{formatAccuracyMetric(reestimatedMetrics.mse)}</span></div>
                    <div>RMSE: <span className="font-bold">{formatAccuracyMetric(reestimatedMetrics.rmse)}</span></div>
                  </div>
                  <div className="mt-2 text-xs text-purple-700 font-semibold">
                    {reestimatedMetrics.mae < accuracyMetrics.mae ? t.betterFitCVS : t.originalMoreAccurate}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 shadow-lg">
              <h3 className="font-bold mb-2">{t.interpretationLabel}</h3>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>{t.biasExplanation}</li>
                <li>{t.maeExplanation}</li>
                <li>{t.mseExplanation}</li>
                <li>{t.rmseExplanation}</li>
                <li>{t.lowerValues}</li>
              </ul>
            </div>
          </div>
        )}

        {/* 5. Estimated series */}
        {activeTab === 'estimated' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-700">{t.estimatedVsActual}</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={estimatedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={3} name={t.actualSales} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="estimated" stroke="#10b981" strokeWidth={2} name={`${t.estimated} (Ŷt)`} strokeDasharray="5 5" />
                <Line type="monotone" dataKey="trend" stroke="#ef4444" strokeWidth={1} name={`${t.trend} (Tt)`} strokeDasharray="3 3" />
                {showReestimated && (
                  <Line type="monotone" dataKey="estimated" data={reestimatedData} stroke="#7c3aed" strokeWidth={2} name={language === 'fr' ? 'Ré-estimé (CVS)' : 'Re-estimated (CVS)'} strokeDasharray="4 4" />
                )}
              </LineChart>
            </ResponsiveContainer>
            
            <div className="mt-6 p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200 shadow-lg">
              <p className="font-bold">{t.multiplicativeEquation}</p>
              <p className="font-mono text-lg mt-2">Y<sub>t</sub> = T<sub>t</sub> × S<sub>t</sub> × ε<sub>t</sub></p>
              <p className="mt-2"><strong>{t.estimatedSeriesFormula}</strong> Ŷ<sub>t</sub> = T<sub>t</sub> × S<sub>t</sub></p>
              <p className="mt-2">{t.whereLabel} T<sub>t</sub> {language === 'fr' ? 'est la tendance et' : 'is the trend and'} S<sub>t</sub> {language === 'fr' ? "est l'indice saisonnier" : 'is the seasonal index'}</p>
              <div className="mt-4 p-3 bg-white rounded border border-emerald-300">
                <p className="font-bold">{t.modelAccuracyLabel}</p>
                <p>{t.bias}: {accuracyMetrics.bias} | MAE: {accuracyMetrics.mae} | MSE (EQM): {accuracyMetrics.mse} | RMSE: {accuracyMetrics.rmse}</p>
                {showReestimated && (
                  <p className="mt-1 text-purple-700">{language === 'fr' ? 'Ré-estimé' : 'Re-estimated'} → {t.bias}: {reestimatedMetrics.bias} | MAE: {reestimatedMetrics.mae} | MSE: {reestimatedMetrics.mse} | RMSE: {reestimatedMetrics.rmse}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 6. Residuals */}
        {activeTab === 'residuals' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-700">{t.residualsRandomComponent}</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={showReestimated ? [...estimatedData, ...reestimatedData.map(d => ({ ...d, label: `${d.label} (re)` }))] : estimatedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="residualRatio" fill="#8b5cf6" name={`${t.residualRatio} (εt = Yt/Ŷt)`} />
              </BarChart>
            </ResponsiveContainer>
            
            <div className="mt-6 p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border-2 border-purple-200 shadow-lg">
              <p className="font-bold">{t.multiplicativeResiduals}</p>
              <p className="font-mono text-lg mt-2">ε<sub>t</sub> = Y<sub>t</sub> / Ŷ<sub>t</sub></p>
              <p className="mt-2">{t.residualsRepresent}</p>
              <p className="mt-2"><strong>{t.interpretationResiduals}</strong></p>
              <ul className="list-disc list-inside mt-1 text-sm">
                <li>{t.higherThanPredicted}</li>
                <li>{t.lowerThanPredicted}</li>
                <li>{t.perfectPrediction}</li>
              </ul>
            </div>
          </div>
        )}

        {/* 7. CVS series */}
        {activeTab === 'cvs' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-700">{t.seasonallyAdjusted}</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={cvsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={2} name={language === 'fr' ? 'Ventes originales' : 'Original sales'} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="cvs" stroke="#06b6d4" strokeWidth={3} name={`CVS (${language === 'fr' ? 'désaisonnnalisée' : 'deseasonalized'})`} dot={{ r: 5 }} />
                {showReestimated && (
                  <Line type="monotone" dataKey="cvs" data={reestimatedData} stroke="#7c3aed" strokeWidth={2} name={`CVS (${language === 'fr' ? 'ré-estimée' : 're-estimated'})`} strokeDasharray="4 4" />
                )}
              </LineChart>
            </ResponsiveContainer>
            
            <div className="mt-6 p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border-2 border-cyan-200 shadow-lg">
              <p className="font-bold">{t.multiplicativeDeseasonalization}</p>
              <p className="font-mono text-lg mt-2">CVS<sub>t</sub> = Y<sub>t</sub> / S<sub>t</sub></p>
              <p className="mt-2">{t.cvsSeriesRemoves}</p>
              <p className="mt-2"><strong>{t.purposeLabel}</strong> {t.allowsComparison}</p>
            </div>
          </div>
        )}

        {/* 8. 2022 Forecasts */}
        {activeTab === 'forecast' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-700">{t.forecasts2022Title}</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={[...estimatedData, ...(showReestimated ? reestimatedData : []), ...forecastsOriginal, ...(showReestimated ? forecastsReestimated : [])]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={3} name={t.actualSales} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="estimated" stroke="#10b981" strokeWidth={3} name={`${t.estimated}/${language === 'fr' ? 'Prévision' : 'Forecast'} (Ŷt = Tt×St)`} strokeDasharray="5 5" dot={{ r: 5 }} />
                {showReestimated && (
                  <Line type="monotone" dataKey="estimated" data={[...reestimatedData, ...forecastsReestimated]} stroke="#7c3aed" strokeWidth={2} name={language === 'fr' ? 'Prévision Ré-estimée' : 'Re-estimated Forecast'} strokeDasharray="4 4" dot={{ r: 4 }} />
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
                  <div className="text-xs md:text-sm text-center text-gray-600 mt-1">{t.units}</div>
                  {f.lowerCI !== undefined && f.upperCI !== undefined && (
                    <div className="text-[10px] md:text-xs text-center text-gray-500 mt-1 md:mt-2 font-semibold">
                      {t.confidenceInterval}: [{Math.round(f.lowerCI)}, {Math.round(f.upperCI)}]
                    </div>
                  )}
                  <div className="text-[10px] md:text-xs text-center text-gray-500 mt-1">
                    {language === 'fr' ? 'Tendance × Saisonnier' : 'Trend × Seasonal'}
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
                    <div className="text-xs md:text-sm text-center text-gray-600 mt-1">{t.units}</div>
                    {f.lowerCI !== undefined && f.upperCI !== undefined && (
                      <div className="text-[10px] md:text-xs text-center text-gray-500 mt-1 md:mt-2 font-semibold">
                        {t.confidenceInterval}: [{Math.round(f.lowerCI)}, {Math.round(f.upperCI)}]
                      </div>
                    )}
                    <div className="text-[10px] md:text-xs text-center text-gray-500 mt-1">
                      {language === 'fr' ? 'Tendance Ré-estimée × Saisonnier' : 'Re-estimated Trend × Seasonal'}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
        {/* 9. Discussion & Improvements (Q17) */}
        {activeTab === 'discussion' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-700">
              {language === 'fr' ? 'Discussion et Question 17' : 'Discussion and Question 17'}
            </h2>

            {/* Iterative Process Card */}
            <div className="mb-6 p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border-2 border-purple-200 shadow-lg">
              <h3 className="font-bold text-xl mb-3 flex items-center gap-2 text-purple-800">
                {t.iterativeProcess}
              </h3>
              <p className="text-sm text-gray-700 mb-4">{t.iterativeDescription}</p>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 bg-white/80 p-3 rounded-lg">
                  <span className="text-2xl">1️⃣</span>
                  <div>
                    <p className="font-semibold text-sm">Tendance Initiale / Initial Trend</p>
                    <p className="text-xs text-gray-600">T<sub>t</sub> = {trendB.toFixed(3)} + {trendA.toFixed(3)}t</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white/80 p-3 rounded-lg">
                  <span className="text-2xl">2️⃣</span>
                  <div>
                    <p className="font-semibold text-sm">{t.updateCoefficients}</p>
                    <p className="text-xs text-gray-600">S<sub>t</sub> = moyenne(Yt / MMc4<sub>t</sub>) par trimestre</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white/80 p-3 rounded-lg">
                  <span className="text-2xl">3️⃣</span>
                  <div>
                    <p className="font-semibold text-sm">{t.calculateNewCVS}</p>
                    <p className="text-xs text-gray-600">CVS<sub>t</sub> = Yt / S<sub>t</sub></p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white/80 p-3 rounded-lg">
                  <span className="text-2xl">4️⃣</span>
                  <div>
                    <p className="font-semibold text-sm">{t.reestimateTrend}</p>
                    <p className="text-xs text-gray-600">T<sub>t</sub> = MCO(CVS<sub>t</sub>)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white/80 p-3 rounded-lg">
                  <span className="text-2xl">5️⃣</span>
                  <div>
                    <p className="font-semibold text-sm">{t.checkConvergence}</p>
                    <p className="text-xs text-gray-600">Itérer jusqu'à ΔMAE &lt; 0.01</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stopping Criteria Card */}
            <div className="mb-6 p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border-2 border-red-200 shadow-lg">
              <h3 className="font-bold text-xl mb-3 flex items-center gap-2 text-red-800">
                {t.stoppingCriteria}
              </h3>
              <p className="text-sm text-gray-700 mb-4">{t.stoppingDescription}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/80 p-4 rounded-lg border-l-4 border-red-500">
                  <p className="font-semibold text-sm mb-1">{t.MAEThreshold}</p>
                  <p className="text-lg font-bold text-red-700">ΔMAE &lt; 0.01</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {language === 'fr' ? 'Changement du MAE entre deux itérations' : 'MAE change between iterations'}
                  </p>
                </div>
                <div className="bg-white/80 p-4 rounded-lg border-l-4 border-orange-500">
                  <p className="font-semibold text-sm mb-1">{t.maxIterations}</p>
                  <p className="text-lg font-bold text-orange-700">N ≤ 20</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {language === 'fr' ? 'Arrêter après 20 itérations maximum' : 'Stop after maximum 20 iterations'}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Improvements Card */}
            <div className="mb-6 p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200 shadow-lg">
              <h3 className="font-bold text-xl mb-3 flex items-center gap-2 text-emerald-800">
                {t.additionalImprovements}
              </h3>
              <p className="text-sm text-gray-700 mb-4">{t.improvementsDescription}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start gap-2 bg-white/80 p-3 rounded-lg">
                  <span className="text-xl">📈</span>
                  <div>
                    <p className="font-semibold text-sm">{t.nonLinearModels}</p>
                    <p className="text-xs text-gray-600">Log(Yt) = log(Tt) + log(St) + log(εt)</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-white/80 p-3 rounded-lg">
                  <span className="text-xl">🔗</span>
                  <div>
                    <p className="font-semibold text-sm">{t.residualAutocorrelation}</p>
                    <p className="text-xs text-gray-600">Durbin-Watson: d ∈ [1.5, 2.5]</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-white/80 p-3 rounded-lg">
                  <span className="text-xl">🎯</span>
                  <div>
                    <p className="font-semibold text-sm">{t.outlierDetection}</p>
                    <p className="text-xs text-gray-600">{language === 'fr' ? 'Méthode de Tukey (IQR)' : 'Tukey method (IQR)'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-white/80 p-3 rounded-lg">
                  <span className="text-xl">🔄</span>
                  <div>
                    <p className="font-semibold text-sm">{t.arimaComparison}</p>
                    <p className="text-xs text-gray-600">ARIMA(p,d,q) × (P,D,Q)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Algorithm Flowchart */}
            <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 shadow-lg">
              <h3 className="font-bold text-xl mb-4 text-blue-800">{t.algorithm}</h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1 bg-white/80 p-3 rounded-lg text-center font-semibold text-sm border-2 border-blue-300">
                    {t.flowchartStep1}
                  </div>
                  <div className="mx-2 text-2xl">→</div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex-1 bg-white/80 p-3 rounded-lg text-center font-semibold text-sm border-2 border-purple-300">
                    {t.flowchartStep2}
                  </div>
                  <div className="mx-2 text-2xl">→</div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex-1 bg-white/80 p-3 rounded-lg text-center font-semibold text-sm border-2 border-indigo-300">
                    {t.flowchartStep3}
                  </div>
                  <div className="mx-2 text-2xl">→</div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex-1 bg-white/80 p-3 rounded-lg text-center font-semibold text-sm border-2 border-violet-300">
                    {t.flowchartStep4}
                  </div>
                  <div className="mx-2 text-2xl">→</div>
                </div>

                <div className="flex items-center">
                  <div className="flex-1 bg-gradient-to-r from-green-200 to-emerald-200 p-3 rounded-lg text-center font-bold text-sm border-2 border-green-500">
                    {t.convergenceAchieved}
                  </div>
                </div>

                <div className="mt-3 p-3 bg-white/80 rounded-lg border-2 border-dashed border-blue-300 text-xs text-gray-700">
                  <p className="font-semibold mb-1">⚙️ {language === 'fr' ? 'Critère' : 'Criterion'}:</p>
                  <p>ΔMAE(i) = |MAE(i) - MAE(i-1)| &lt; 0.01</p>
                </div>
              </div>
            </div>

            {/* Summary Box */}
            <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-300 shadow-lg">
              <h3 className="font-bold text-lg mb-3">📊 {language === 'fr' ? 'Résumé' : 'Summary'}</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span>✅</span>
                  <span>
                    {language === 'fr'
                      ? 'Le processus itératif affine le modèle multiplicatif'
                      : 'The iterative process refines the multiplicative model'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span>✅</span>
                  <span>
                    {language === 'fr'
                      ? 'Converge rapidement (généralement 3-5 itérations)'
                      : 'Converges quickly (typically 3-5 iterations)'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span>✅</span>
                  <span>
                    {language === 'fr'
                      ? 'Améliore la précision de prévision'
                      : 'Improves forecast accuracy'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span>✅</span>
                  <span>
                    {language === 'fr'
                      ? 'Peut être combiné avec d\'autres techniques (ARIMA, ML)'
                      : 'Can be combined with other techniques (ARIMA, ML)'}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 md:mt-6 text-center text-xs md:text-sm text-gray-600">
        <p>{t.footerLine1}</p>
        <p className="mt-1 md:mt-2 font-semibold text-indigo-700">{t.footerLine2}</p>
      </div>
    </div>
    </div>
  );
};

export default function Home() {
  return <TimeSeriesAnalysis />;
}
