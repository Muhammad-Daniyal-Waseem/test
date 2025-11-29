import { useState } from 'react';
import { ArrowRight, Award, X, Download, Mail, CheckCircle2, Loader2 } from 'lucide-react';

interface ROICalculatorProps {
  currentARR: number;
  setCurrentARR: (value: number) => void;
  targetARR: number;
  setTargetARR: (value: number) => void;
  currentCAC: number;
  setCurrentCAC: (value: number) => void;
  currentLTV: number;
  setCurrentLTV: (value: number) => void;
  churnRate: number;
  setChurnRate: (value: number) => void;
  avgDealSize: number;
  setAvgDealSize: (value: number) => void;
  salesCycleLength: number;
  setSalesCycleLength: (value: number) => void;
  currentWinRate: number;
  setCurrentWinRate: (value: number) => void;
  salesTeamSize: number;
  setSalesTeamSize: (value: number) => void;
  calculateROIMetrics: () => any;
  formatNumberWithCommas: (num: number) => string;
  parseFormattedNumber: (str: string) => number;
}

export default function ROICalculator({
  currentARR,
  setCurrentARR,
  targetARR,
  setTargetARR,
  currentCAC,
  setCurrentCAC,
  currentLTV,
  setCurrentLTV,
  churnRate,
  setChurnRate,
  avgDealSize,
  setAvgDealSize,
  salesCycleLength,
  setSalesCycleLength,
  currentWinRate,
  setCurrentWinRate,
  salesTeamSize,
  setSalesTeamSize,
  calculateROIMetrics,
  formatNumberWithCommas,
  parseFormattedNumber
}: ROICalculatorProps) {
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const metrics = calculateROIMetrics();

  const handleDownloadReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const calculatorData = {
        currentARR,
        growthGoal: ((targetARR - currentARR) / currentARR * 100).toFixed(0),
        avgDealSize,
        salesCycle: (salesCycleLength / 30).toFixed(1),
        teamSize: salesTeamSize,
        projectedRevenue: metrics.improvedProjectedARR,
        monthlyDeals: ((targetARR - currentARR) / avgDealSize / 12).toFixed(1),
        pipelineValue: ((targetARR - currentARR) / avgDealSize / 12 * 4 * avgDealSize).toFixed(0),
      };

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-roi-report`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ email, calculatorData }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        setShowPDFModal(false);
        setSubmitSuccess(false);
        setEmail('');
      }, 3000);
    } catch (error) {
      console.error('Error:', error);
      setSubmitError('Failed to send report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="roi-calculator" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 bg-contech-orange/10 text-contech-orange text-sm font-bold rounded-full mb-4">
            Interactive ROI Tool
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Calculate Your Revenue Impact
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Model your ARR growth, pipeline velocity, and unit economics with board-ready assumptions
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Inputs */}
          <div className="bg-neutral-50 rounded-2xl p-8 border border-neutral-200">
            <h3 className="text-xl font-bold text-neutral-900 mb-6">Your Current State</h3>

            {/* Current ARR */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Current ARR
              </label>
              <div className="relative mb-2">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">$</span>
                <input
                  type="text"
                  value={formatNumberWithCommas(currentARR)}
                  onChange={(e) => setCurrentARR(parseFormattedNumber(e.target.value))}
                  className="w-full pl-8 pr-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-contech-orange focus:outline-none text-lg font-semibold"
                />
              </div>
              <input
                type="range"
                min="100000"
                max="50000000"
                step="100000"
                value={currentARR}
                onChange={(e) => setCurrentARR(parseInt(e.target.value))}
                className="w-full h-2 bg-neutral-300 rounded-lg appearance-none cursor-pointer accent-contech-orange"
              />
              <p className="text-xs text-neutral-500 mt-1">Annual Recurring Revenue</p>
            </div>

            {/* Target ARR */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Target ARR (12 months)
              </label>
              <div className="relative mb-2">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">$</span>
                <input
                  type="text"
                  value={formatNumberWithCommas(targetARR)}
                  onChange={(e) => setTargetARR(parseFormattedNumber(e.target.value))}
                  className="w-full pl-8 pr-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-contech-orange focus:outline-none text-lg font-semibold"
                />
              </div>
              <input
                type="range"
                min="100000"
                max="100000000"
                step="100000"
                value={targetARR}
                onChange={(e) => setTargetARR(parseInt(e.target.value))}
                className="w-full h-2 bg-neutral-300 rounded-lg appearance-none cursor-pointer accent-contech-orange"
              />
            </div>

            {/* Current CAC */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Current CAC
              </label>
              <div className="relative mb-2">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">$</span>
                <input
                  type="text"
                  value={formatNumberWithCommas(currentCAC)}
                  onChange={(e) => setCurrentCAC(parseFormattedNumber(e.target.value))}
                  className="w-full pl-8 pr-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-contech-orange focus:outline-none text-lg font-semibold"
                />
              </div>
              <input
                type="range"
                min="1000"
                max="50000"
                step="500"
                value={currentCAC}
                onChange={(e) => setCurrentCAC(parseInt(e.target.value))}
                className="w-full h-2 bg-neutral-300 rounded-lg appearance-none cursor-pointer accent-contech-orange"
              />
              <p className="text-xs text-neutral-500 mt-1">Customer Acquisition Cost</p>
            </div>

            {/* Current LTV */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Current LTV
              </label>
              <div className="relative mb-2">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">$</span>
                <input
                  type="text"
                  value={formatNumberWithCommas(currentLTV)}
                  onChange={(e) => setCurrentLTV(parseFormattedNumber(e.target.value))}
                  className="w-full pl-8 pr-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-contech-orange focus:outline-none text-lg font-semibold"
                />
              </div>
              <input
                type="range"
                min="5000"
                max="200000"
                step="1000"
                value={currentLTV}
                onChange={(e) => setCurrentLTV(parseInt(e.target.value))}
                className="w-full h-2 bg-neutral-300 rounded-lg appearance-none cursor-pointer accent-contech-orange"
              />
              <p className="text-xs text-neutral-500 mt-1">Customer Lifetime Value</p>
            </div>

            {/* Sales Team Size */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Sales Team Size: <span className="text-contech-orange">{salesTeamSize} reps</span>
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={salesTeamSize}
                onChange={(e) => setSalesTeamSize(parseInt(e.target.value))}
                className="w-full h-2 bg-neutral-300 rounded-lg appearance-none cursor-pointer accent-contech-orange"
              />
              <div className="flex justify-between text-xs text-neutral-500 mt-1">
                <span>1 rep</span>
                <span>20 reps</span>
              </div>
            </div>

            {/* Churn Rate */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Annual Churn Rate: <span className="text-contech-orange">{churnRate}%</span>
              </label>
              <input
                type="range"
                min="5"
                max="40"
                value={churnRate}
                onChange={(e) => setChurnRate(parseInt(e.target.value))}
                className="w-full h-2 bg-neutral-300 rounded-lg appearance-none cursor-pointer accent-contech-orange"
              />
              <div className="flex justify-between text-xs text-neutral-500 mt-1">
                <span>5% (Excellent)</span>
                <span>40% (Poor)</span>
              </div>
            </div>

            {/* Avg Deal Size */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Average Deal Size
              </label>
              <div className="relative mb-2">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">$</span>
                <input
                  type="text"
                  value={formatNumberWithCommas(avgDealSize)}
                  onChange={(e) => setAvgDealSize(parseFormattedNumber(e.target.value))}
                  className="w-full pl-8 pr-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-contech-orange focus:outline-none text-lg font-semibold"
                />
              </div>
              <input
                type="range"
                min="10000"
                max="500000"
                step="5000"
                value={avgDealSize}
                onChange={(e) => setAvgDealSize(parseInt(e.target.value))}
                className="w-full h-2 bg-neutral-300 rounded-lg appearance-none cursor-pointer accent-contech-orange"
              />
              <p className="text-xs text-neutral-500 mt-1">Annual Contract Value</p>
            </div>

            {/* Sales Cycle */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Sales Cycle Length: <span className="text-contech-orange">{salesCycleLength} days</span>
              </label>
              <input
                type="range"
                min="30"
                max="180"
                value={salesCycleLength}
                onChange={(e) => setSalesCycleLength(parseInt(e.target.value))}
                className="w-full h-2 bg-neutral-300 rounded-lg appearance-none cursor-pointer accent-contech-orange"
              />
              <div className="flex justify-between text-xs text-neutral-500 mt-1">
                <span>30 days</span>
                <span>180 days</span>
              </div>
            </div>

            {/* Win Rate */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Current Win Rate: <span className="text-contech-orange">{currentWinRate}%</span>
              </label>
              <input
                type="range"
                min="10"
                max="60"
                value={currentWinRate}
                onChange={(e) => setCurrentWinRate(parseInt(e.target.value))}
                className="w-full h-2 bg-neutral-300 rounded-lg appearance-none cursor-pointer accent-contech-orange"
              />
              <div className="flex justify-between text-xs text-neutral-500 mt-1">
                <span>10%</span>
                <span>60%</span>
              </div>
            </div>

            {/* View Assumptions Button */}
            <button
              onClick={() => setShowAssumptions(!showAssumptions)}
              className="mt-6 text-sm text-contech-navy hover:text-contech-orange transition-colors font-medium flex items-center"
            >
              <span className="mr-1">ⓘ</span> View Calculation Assumptions
            </button>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-4">
            {/* Current Trajectory */}
            <div className="bg-neutral-800 rounded-2xl p-6 text-white shadow-xl">
              <div className="text-xs font-semibold mb-2 opacity-75">Your Current 12-Month Trajectory</div>
              <div className="text-4xl font-bold mb-1">
                ${(metrics.projectedARRin12Months / 1000000).toFixed(2)}M
              </div>
              <div className="text-sm opacity-90 mb-3">
                +${(metrics.actualGrowthAchieved / 1000000).toFixed(2)}M growth ({currentARR > 0 ? ((metrics.actualGrowthAchieved / currentARR) * 100).toFixed(0) : 0}%)
              </div>
              <div className="text-xs bg-white/10 rounded px-3 py-2">
                {metrics.percentOfTargetAchieved >= 100 ? (
                  <span className="text-green-300">✓ On track to exceed target</span>
                ) : metrics.percentOfTargetAchieved >= 80 ? (
                  <span className="text-yellow-300">⚠ {metrics.percentOfTargetAchieved.toFixed(0)}% of target - needs acceleration</span>
                ) : (
                  <span className="text-red-300">🚨 Only {metrics.percentOfTargetAchieved.toFixed(0)}% of target - at risk</span>
                )}
              </div>
            </div>

            {/* With Mo Improvements */}
            <div className="bg-contech-orange rounded-2xl p-6 text-white shadow-xl">
              <div className="text-xs font-semibold mb-2 opacity-90">With Fractional Mo Daudi, CRO (12-Month Projection)</div>
              <div className="text-4xl font-bold mb-1">
                ${(metrics.improvedProjectedARR / 1000000).toFixed(2)}M
              </div>
              <div className="text-sm opacity-90 mb-3">
                +${(metrics.improvedGrowthAchieved / 1000000).toFixed(2)}M growth ({currentARR > 0 ? ((metrics.improvedGrowthAchieved / currentARR) * 100).toFixed(0) : 0}%)
              </div>
              <div className="text-xs bg-white/20 rounded px-3 py-2 font-semibold">
                +${(metrics.additionalARRfromMoDaudi / 1000000).toFixed(2)}M additional ARR from Mo Daudi, CRO impact
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-6 border-2 border-neutral-200 shadow-sm">
                <div className="text-xs font-semibold text-neutral-600 mb-2">Time to Target</div>
                <div className="text-3xl font-bold text-neutral-900">
                  {metrics.improvedMonthsToTarget < 999 ? metrics.improvedMonthsToTarget : '36+'}
                </div>
                <div className="text-xs text-neutral-500 mt-1">
                  {metrics.improvedMonthsToTarget < 999 ? 'months with Mo Daudi, CRO' : 'Target not achievable'}
                </div>
                <div className="text-xs text-neutral-400 mt-2">
                  vs {metrics.monthsToTarget < 999 ? metrics.monthsToTarget : '36+'} months current pace
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border-2 border-neutral-200 shadow-sm">
                <div className="text-xs font-semibold text-neutral-600 mb-2">Mo Daudi, CRO Investment ROI</div>
                <div className="text-3xl font-bold text-neutral-900">
                  {isNaN(metrics.roiMultiple) ? '0.0' : metrics.roiMultiple.toFixed(1)}x
                </div>
                <div className="text-xs text-neutral-500 mt-1">Return on $48K investment</div>
                <div className="text-xs text-neutral-400 mt-2">
                  ${isNaN(metrics.additionalARRfromMoDaudi) ? '0' : (metrics.additionalARRfromMoDaudi / 1000).toFixed(0)}K additional ARR
                </div>
              </div>
            </div>

            <div className="bg-contech-navy rounded-2xl p-6 text-white">
              <h4 className="font-bold mb-4 text-lg">Mo Daudi Revenue Rebuild:</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-white/20">
                  <span className="text-sm">Improved Win Rate</span>
                  <span className="font-bold text-contech-orange">{(metrics.improvedWinRate).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/20">
                  <span className="text-sm">Reduced Churn</span>
                  <span className="font-bold text-contech-orange">{(metrics.improvedChurn).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/20">
                  <span className="text-sm">Faster Sales Cycle</span>
                  <span className="font-bold text-contech-orange">{Math.round(metrics.improvedSalesCycle)} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Improved LTV</span>
                  <span className="font-bold text-contech-orange">${(metrics.improvedLTV / 1000).toFixed(0)}K</span>
                </div>
              </div>
            </div>

            <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
              <div className="text-xs font-semibold text-neutral-600 mb-2">Current LTV:CAC Ratio</div>
              <div className="text-3xl font-bold text-neutral-900 mb-3">{metrics.currentLTVtoCAC.toFixed(1)}:1</div>
              <div className="text-xs text-neutral-600">
                {metrics.currentLTVtoCAC >= 3 ? (
                  <span className="text-contech-orange font-semibold">✓ Healthy unit economics</span>
                ) : (
                  <span className="text-red-600 font-semibold">⚠ Below 3:1 benchmark</span>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowPDFModal(true)}
              className="w-full py-4 bg-contech-orange text-white text-center text-lg font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg flex items-center justify-center gap-2 group"
            >
              <Download className="h-5 w-5 group-hover:scale-110 transition-transform" />
              Download Your Custom Report
            </button>

            <a
              href="#lead-magnet"
              className="block w-full py-4 bg-contech-navy text-white text-center text-lg font-bold rounded-xl hover:bg-contech-navy/90 transition-all shadow-lg"
            >
              Unblock My Revenue Growth for FREE
            </a>

            {/* CEO Testimonial */}
            <div className="bg-white rounded-xl p-6 border-2 border-neutral-200 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <Award className="h-6 w-6 text-contech-orange" />
                </div>
                <div>
                  <p className="text-neutral-700 italic leading-relaxed mb-3">
                    "Mo is a leader who has genuinely elevated our entire revenue function to a remarkable new degree of maturity."
                  </p>
                  <p className="text-sm font-semibold text-neutral-900">
                    Josh Bowyer <span className="text-neutral-500 font-normal">— CEO</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assumptions Modal */}
        {showAssumptions && (
          <div className="mt-8 bg-neutral-50 rounded-xl p-8 border border-neutral-200">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-lg font-bold text-neutral-900">Calculation Assumptions & Methodology</h4>
              <button onClick={() => setShowAssumptions(false)} className="text-neutral-400 hover:text-neutral-900">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-neutral-700">
              <div>
                <h5 className="font-bold text-neutral-900 mb-2">📊 Data Sources & Benchmarks:</h5>
                <ul className="space-y-1 ml-4">
                  <li>• SaaS Capital Index (2024) - Industry benchmarks for ARR growth, churn, and unit economics</li>
                  <li>• KeyBanc Capital Markets - SaaS Survey data for win rates and sales cycle benchmarks</li>
                  <li>• OpenView Partners - CAC payback and LTV:CAC ratio standards</li>
                  <li>• ConTech GTM historical client data (20+ engagements, 2020-2024)</li>
                </ul>
              </div>

              <div>
                <h5 className="font-bold text-neutral-900 mb-2">🎯 Impact Assumptions (Conservative):</h5>
                <ul className="space-y-1 ml-4">
                  <li>• Win Rate Improvement: +50% (e.g., 25% → 37.5%, capped at 60%) based on pipeline discipline and deal coaching</li>
                  <li>• Churn Reduction: -40% (e.g., 15% → 9%) through improved customer success alignment</li>
                  <li>• Sales Cycle Acceleration: -32% (e.g., 90 days → 61 days) via better qualification and process</li>
                  <li>• LTV Enhancement: Calculated using LTV = ARPA ÷ Churn Rate formula</li>
                </ul>
              </div>

              <div className="bg-contech-orange/5 border border-contech-orange/20 rounded p-4">
                <p className="text-xs text-neutral-900">
                  <strong>Disclaimer:</strong> These projections are conservative estimates based on industry benchmarks and historical client outcomes. Actual results depend on execution quality, market conditions, product-market fit, and team capability.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PDF Download Modal */}
        {showPDFModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform transition-all">
              {/* Modal Header */}
              <div className="bg-contech-navy text-white p-6 rounded-t-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-contech-orange/10 rounded-full blur-3xl"></div>
                <button
                  onClick={() => setShowPDFModal(false)}
                  className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10"
                >
                  <X className="h-6 w-6" />
                </button>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-contech-orange/20 p-3 rounded-xl">
                      <Download className="h-8 w-8 text-contech-orange" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Get Your Report</h3>
                      <p className="text-sm text-white/80">Sent directly to your inbox</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {!submitSuccess ? (
                  <>
                    <div className="mb-6">
                      <h4 className="font-bold text-neutral-900 mb-3">Your Custom Revenue Report includes:</h4>
                      <ul className="space-y-2 text-sm text-neutral-700">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-contech-orange flex-shrink-0 mt-0.5" />
                          <span>Your complete revenue growth blueprint</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-contech-orange flex-shrink-0 mt-0.5" />
                          <span>Mo's personalized insights on your situation</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-contech-orange flex-shrink-0 mt-0.5" />
                          <span>Pipeline math & team capacity analysis</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-contech-orange flex-shrink-0 mt-0.5" />
                          <span>Recommended next steps for your growth stage</span>
                        </li>
                      </ul>
                    </div>

                    <form onSubmit={handleDownloadReport} className="space-y-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-neutral-700 mb-2">
                          Work Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                          <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@company.com"
                            required
                            className="w-full pl-11 pr-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-contech-orange focus:outline-none text-base"
                          />
                        </div>
                      </div>

                      {submitError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                          {submitError}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-contech-orange text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Generating Your Report...
                          </>
                        ) : (
                          <>
                            <Mail className="h-5 w-5" />
                            Send Report to My Email
                          </>
                        )}
                      </button>

                      <p className="text-xs text-center text-neutral-500">
                        No spam. Just your custom report. Unsubscribe anytime.
                      </p>
                    </form>
                  </>
                ) : (
                  <div className="py-8 text-center">
                    <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <h4 className="text-2xl font-bold text-neutral-900 mb-2">Report Sent!</h4>
                    <p className="text-neutral-600 mb-4">
                      Check your inbox at <span className="font-semibold text-contech-orange">{email}</span>
                    </p>
                    <p className="text-sm text-neutral-500">
                      Don't see it? Check your spam folder.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
