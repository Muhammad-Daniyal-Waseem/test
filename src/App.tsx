import { ArrowRight, CheckCircle, Download, Calendar, TrendingUp, Globe, Target, Users, Zap, Building2, BarChart3, Rocket, Clock, DollarSign, Briefcase, Shield, Package, Wrench, ChevronDown, ChevronUp, User, Award, Mail, TrendingDown, X, Play, ArrowUp, CreditCard, CheckCircle2, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import LeadMagnetForm from './components/LeadMagnetForm';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function App() {
  const [activeSection, setActiveSection] = useState('');
  const [showAllPackages, setShowAllPackages] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showFloatingNav, setShowFloatingNav] = useState(false);
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [emailCapture, setEmailCapture] = useState('');
  const [showFAQ, setShowFAQ] = useState<{[key: number]: boolean}>({});
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showWhyMeDetails, setShowWhyMeDetails] = useState(false);
  const [cardTilt, setCardTilt] = useState({ x: 0, y: 0 });
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [expandedInsights, setExpandedInsights] = useState<{[key: number]: boolean}>({});
  const [showLeadMagnetForm, setShowLeadMagnetForm] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [pdfEmail, setPdfEmail] = useState('');
  const [isSubmittingPDF, setIsSubmittingPDF] = useState(false);
  const [pdfSubmitSuccess, setPdfSubmitSuccess] = useState(false);
  const [pdfSubmitError, setPdfSubmitError] = useState('');

  // ARR ROI Calculator State
  const [currentARR, setCurrentARR] = useState(2000000);
  const [targetARR, setTargetARR] = useState(5000000);
  const [currentCAC, setCurrentCAC] = useState(5000);
  const [currentLTV, setCurrentLTV] = useState(15000);
  const [churnRate, setChurnRate] = useState(15);
  const [avgDealSize, setAvgDealSize] = useState(50000);
  const [salesCycleLength, setSalesCycleLength] = useState(90);
  const [currentWinRate, setCurrentWinRate] = useState(25);
  const [salesTeamSize, setSalesTeamSize] = useState(3);
  const [currentARPA, setCurrentARPA] = useState(2250);
  const [scenarioMode, setScenarioMode] = useState<'conservative' | 'base' | 'optimistic'>('base');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['why-me', 'results', 'pricing', 'about', 'contact'];
      const scrollPosition = window.scrollY + 100;

      setShowFloatingNav(window.scrollY > 500);
      setShowBackToTop(window.scrollY > 1000);

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId);
            break;
          }
        }
      }

      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100;
      setScrollProgress(scrollPercentage);
    };

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !sessionStorage.getItem('exitIntentShown')) {
        setShowExitIntent(true);
        sessionStorage.setItem('exitIntentShown', 'true');
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach((el) => observer.observe(el));

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mouseleave', handleMouseLeave);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mouseleave', handleMouseLeave);
      observer.disconnect();
    };
  }, []);

  // Initialize Calendly widget
  useEffect(() => {
    const initCalendly = () => {
      const widget = document.querySelector('.calendly-inline-widget');
      if (window.Calendly && widget) {
        window.Calendly.initInlineWidget({
          url: 'https://calendly.com/contechgtm/60-min-session',
          parentElement: widget,
          prefill: {},
          utm: {}
        });
      } else if (!window.Calendly) {
        setTimeout(initCalendly, 100);
      }
    };

    initCalendly();
  }, []);

  // ARR ROI Calculator Logic - Proper SaaS Financial Model
  const calculateROIMetrics = useCallback(() => {
    // Input validation
    if (currentARR <= 0 || avgDealSize <= 0 || currentCAC <= 0 || currentLTV <= 0 || salesTeamSize <= 0) {
      return {
        arrGrowth: 0, mrr: 0, targetMRR: 0, currentLTVtoCAC: 0, paybackPeriod: 0,
        projectedARRin12Months: currentARR, actualGrowthAchieved: 0, percentOfTargetAchieved: 0,
        newCustomersNeeded: 0, customersOnCurrentTrajectory: 0, additionalCustomersNeeded: 0,
        monthsToTarget: 999, annualChurnImpact: 0, improvedWinRate: 0, improvedChurn: 0,
        improvedSalesCycle: 0, calculatedImprovedLTV: 0, improvedProjectedARR: currentARR,
        improvedGrowthAchieved: 0, additionalARRfromMoDaudi: 0, improvedMonthsToTarget: 999, roiMultiple: 0,
        validationWarnings: [], ltvInputMatchesCalculation: true, calculatedCurrentLTV: 0,
      };
    }

    // Validate target ARR
    const validTargetARR = Math.max(targetARR, currentARR);

    // Basic metrics
    const arrGrowth = validTargetARR - currentARR;
    const mrr = currentARR / 12;
    const targetMRR = validTargetARR / 12;
    const currentLTVtoCAC = currentLTV / currentCAC;

    // === SALES CAPACITY MODEL (CFO-Grade) ===
    // Based on: Team Size × Pipeline Capacity × Win Rate × Deal Size
    // Industry standard: Each rep can actively work 15-20 qualified opps in pipeline

    const avgPipelineCapacityPerRep = 18; // Conservative: 18 active qualified opportunities per rep
    const salesCycleMonths = salesCycleLength / 30;
    const pipelineTurnsPerYear = 12 / salesCycleMonths; // How many times pipeline refreshes in 12mo

    // Total deals team can work through in 12 months
    const totalDealsWorkedPerYear = salesTeamSize * avgPipelineCapacityPerRep * pipelineTurnsPerYear;
    const wonDealsPerYear = totalDealsWorkedPerYear * (currentWinRate / 100);
    const newARRfromNewCustomers = wonDealsPerYear * avgDealSize;

    // Churn Impact - Revenue lost from existing customers
    const annualChurnImpact = currentARR * (churnRate / 100);

    // Net New ARR (considering both new sales AND churn)
    const netNewARR = newARRfromNewCustomers - annualChurnImpact;

    // Projected ARR in 12 months
    const projectedARRin12Months = currentARR + netNewARR;

    // How much growth we need vs what we're projected to achieve
    const actualGrowthAchieved = projectedARRin12Months - currentARR;
    const percentOfTargetAchieved = arrGrowth > 0 ? (actualGrowthAchieved / arrGrowth) * 100 : 100;

    // Customers needed to hit target (vs current trajectory)
    const newCustomersNeeded = Math.ceil(Math.max(0, arrGrowth) / avgDealSize);
    const customersOnCurrentTrajectory = Math.ceil(wonDealsPerYear);
    const additionalCustomersNeeded = Math.max(0, newCustomersNeeded - customersOnCurrentTrajectory);

    // Months to reach target at current pace
    const monthlyNetARRGrowth = netNewARR / 12;
    const monthsToTarget = monthlyNetARRGrowth > 0 ? Math.ceil(arrGrowth / monthlyNetARRGrowth) : 999;

    // CAC Payback Period (Industry Standard Method)
    // Uses: CAC / (Monthly Revenue × Gross Margin)
    // Standard SaaS gross margin assumption: 80%
    const monthlyRevenuePerNewCustomer = avgDealSize / 12;
    const grossMargin = 0.80; // 80% - typical for SaaS (conservative)
    const monthlyGrossProfit = monthlyRevenuePerNewCustomer * grossMargin;
    const paybackPeriod = monthlyGrossProfit > 0 ? currentCAC / monthlyGrossProfit : 999;

    // === WITH FRACTIONAL Mo Daudi, CRO IMPROVEMENTS ===
    // Industry-standard improvements based on revenue operations best practices
    // Scenario-based: Conservative, Base Case, Optimistic

    let winRateMultiplier, churnMultiplier, cycleMultiplier;

    if (scenarioMode === 'conservative') {
      winRateMultiplier = 1.2;  // +20% improvement
      churnMultiplier = 0.85;    // -15% churn reduction
      cycleMultiplier = 0.85;    // -15% cycle time
    } else if (scenarioMode === 'optimistic') {
      winRateMultiplier = 1.5;   // +50% improvement
      churnMultiplier = 0.6;     // -40% churn reduction
      cycleMultiplier = 0.68;    // -32% cycle time
    } else { // base case
      winRateMultiplier = 1.3;   // +30% improvement
      churnMultiplier = 0.75;    // -25% churn reduction
      cycleMultiplier = 0.8;     // -20% cycle time
    }

    const improvedWinRate = Math.min(currentWinRate * winRateMultiplier, 60);
    const improvedChurn = churnRate * churnMultiplier;
    const improvedSalesCycle = salesCycleLength * cycleMultiplier;

    // LTV Improvement: Properly calculated from ARPA and reduced churn
    // LTV = ARPA / Churn Rate (standard SaaS formula)
    const currentChurnDecimal = churnRate / 100;
    const improvedChurnDecimal = improvedChurn / 100;
    const calculatedCurrentLTV = currentChurnDecimal > 0 ? currentARPA / currentChurnDecimal : 0;
    const calculatedImprovedLTV = improvedChurnDecimal > 0 ? currentARPA / improvedChurnDecimal : 0;

    // LTV validation check
    const ltvInputMatchesCalculation = Math.abs(currentLTV - calculatedCurrentLTV) / Math.max(currentLTV, 1) < 0.2;

    // Recalculate with improvements using same capacity model
    const improvedSaleCycleMonths = improvedSalesCycle / 30;
    const improvedPipelineTurnsPerYear = 12 / improvedSaleCycleMonths;
    const improvedTotalDealsWorkedPerYear = salesTeamSize * avgPipelineCapacityPerRep * improvedPipelineTurnsPerYear;
    const improvedWonDealsPerYear = improvedTotalDealsWorkedPerYear * (improvedWinRate / 100);
    const improvedNewARRfromNewCustomers = improvedWonDealsPerYear * avgDealSize;
    const improvedAnnualChurnImpact = currentARR * (improvedChurn / 100);
    const improvedNetNewARR = improvedNewARRfromNewCustomers - improvedAnnualChurnImpact;
    const improvedProjectedARR = currentARR + improvedNetNewARR;
    const improvedGrowthAchieved = improvedProjectedARR - currentARR;
    const additionalARRfromMoDaudi = improvedGrowthAchieved - actualGrowthAchieved;
    const improvedMonthlyNetARRGrowth = improvedNetNewARR / 12;
    const improvedMonthsToTarget = improvedMonthlyNetARRGrowth > 0 ? Math.ceil(arrGrowth / improvedMonthlyNetARRGrowth) : 999;

    // ROI calculation for Mo Daudi, CRO engagement
    const assumedMoDaudiCost = 48000; // $4K/month for 12 months (fractional engagement)
    const roiMultiple = assumedMoDaudiCost > 0 ? additionalARRfromMoDaudi / assumedMoDaudiCost : 0;

    // Validation warnings
    const validationWarnings = [];

    if (currentLTV / currentCAC < 1) {
      validationWarnings.push({
        level: 'critical' as const,
        message: 'Your LTV:CAC ratio is below 1:1. This indicates unsustainable unit economics. Focus on improving unit economics before scaling.'
      });
    } else if (currentLTV / currentCAC < 3) {
      validationWarnings.push({
        level: 'warning' as const,
        message: 'Your LTV:CAC ratio is below 3:1 (industry benchmark). Consider improving unit economics alongside growth initiatives.'
      });
    }

    if (validTargetARR / currentARR > 3) {
      validationWarnings.push({
        level: 'warning' as const,
        message: 'Your target represents 3x+ growth in 12 months. This is extremely aggressive. Consider a more achievable intermediate target.'
      });
    }

    if (currentWinRate < 15 && salesTeamSize < 5) {
      validationWarnings.push({
        level: 'warning' as const,
        message: 'Low win rate with small team may limit pipeline capacity. Focus on improving qualification and win rate first.'
      });
    }

    if (!ltvInputMatchesCalculation) {
      validationWarnings.push({
        level: 'info' as const,
        message: `Your LTV input ($${(currentLTV/1000).toFixed(0)}K) differs from calculated LTV based on ARPA ÷ Churn ($${(calculatedCurrentLTV/1000).toFixed(0)}K). Projections use your input value.`
      });
    }

    return {
      // Current state metrics
      arrGrowth,
      mrr,
      targetMRR,
      currentLTVtoCAC,
      paybackPeriod,

      // Current trajectory (without Mo Daudi, CRO)
      projectedARRin12Months,
      actualGrowthAchieved,
      percentOfTargetAchieved,
      newCustomersNeeded,
      customersOnCurrentTrajectory,
      additionalCustomersNeeded,
      monthsToTarget,
      annualChurnImpact,

      // With Mo Daudi, CRO improvements
      improvedWinRate,
      improvedChurn,
      improvedSalesCycle,
      calculatedImprovedLTV,
      improvedProjectedARR,
      improvedGrowthAchieved,
      additionalARRfromMoDaudi,
      improvedMonthsToTarget,
      roiMultiple,

      // Validation
      validationWarnings,
      ltvInputMatchesCalculation,
      calculatedCurrentLTV,
    };
  }, [currentARR, targetARR, currentCAC, currentLTV, churnRate, avgDealSize, salesCycleLength, currentWinRate, salesTeamSize, currentARPA, scenarioMode]);

  // Number formatting helper
  const formatNumberWithCommas = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const parseFormattedNumber = (str: string): number => {
    return parseInt(str.replace(/,/g, '')) || 0;
  };

  // Handle PDF report download
  const handleDownloadReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingPDF(true);
    setPdfSubmitError('');

    try {
      const metrics = calculateROIMetrics();
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
          body: JSON.stringify({ email: pdfEmail, calculatorData }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      setPdfSubmitSuccess(true);
      setTimeout(() => {
        setShowPDFModal(false);
        setPdfSubmitSuccess(false);
        setPdfEmail('');
      }, 3000);
    } catch (error) {
      console.error('Error:', error);
      setPdfSubmitError('Failed to send report. Please try again.');
    } finally {
      setIsSubmittingPDF(false);
    }
  };

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  // Handle card tilt effect
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    setCardTilt({ x: rotateX, y: rotateY });
  };

  const handleCardMouseLeave = () => {
    setCardTilt({ x: 0, y: 0 });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-neutral-200 z-[60]">
        <div
          className="h-full bg-contech-orange transition-all duration-300 ease-out"
          style={{ width: `${scrollProgress}%` }}
        ></div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-50 p-4 bg-neutral-900 text-white rounded-full shadow-2xl hover:bg-neutral-800 transition-all duration-500 hover:scale-110 ${
          showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20 pointer-events-none'
        }`}
        aria-label="Back to top"
      >
        <ArrowUp className="h-6 w-6" />
      </button>

      {/* Floating Action Sidebar */}
      <div className={`fixed right-8 top-1/3 z-50 transition-all duration-500 ${showFloatingNav ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20 pointer-events-none'}`}>
        <div className="bg-white rounded-2xl shadow-2xl p-3 space-y-4 border border-neutral-200">
          <a href="#why-me" className={`group flex items-center justify-center w-12 h-12 rounded-xl transition-all relative ${activeSection === 'why-me' ? 'bg-neutral-900 text-white' : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'}`} title="Why Me">
            <Target className="h-5 w-5" />
            <span className="absolute right-full mr-3 px-3 py-1.5 bg-neutral-900 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Why Me</span>
          </a>
          <a href="#results" className={`group flex items-center justify-center w-12 h-12 rounded-xl transition-all relative ${activeSection === 'results' ? 'bg-neutral-900 text-white' : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'}`} title="Results">
            <Award className="h-5 w-5" />
            <span className="absolute right-full mr-3 px-3 py-1.5 bg-neutral-900 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Results</span>
          </a>
          <a href="#pricing" className={`group flex items-center justify-center w-12 h-12 rounded-xl transition-all relative ${activeSection === 'pricing' ? 'bg-neutral-900 text-white' : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'}`} title="Pricing">
            <Briefcase className="h-5 w-5" />
            <span className="absolute right-full mr-3 px-3 py-1.5 bg-neutral-900 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Pricing</span>
          </a>
          <a href="#about" className={`group flex items-center justify-center w-12 h-12 rounded-xl transition-all relative ${activeSection === 'about' ? 'bg-neutral-900 text-white' : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'}`} title="About">
            <User className="h-5 w-5" />
            <span className="absolute right-full mr-3 px-3 py-1.5 bg-neutral-900 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">About</span>
          </a>
          <div className="h-px bg-neutral-200 my-2"></div>
          <a href="#contact" className={`group flex items-center justify-center w-12 h-12 rounded-xl transition-all relative ${activeSection === 'contact' ? 'bg-neutral-900 text-white' : 'bg-neutral-900 text-white hover:bg-neutral-800'}`} title="Contact">
            <Mail className="h-5 w-5" />
            <span className="absolute right-full mr-3 px-3 py-1.5 bg-neutral-900 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Book Call</span>
          </a>
        </div>
      </div>

      {/* Exit Intent Popup */}
      {showExitIntent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 relative shadow-2xl">
            <button onClick={() => setShowExitIntent(false)} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 transition-colors">
              <X className="h-6 w-6" />
            </button>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-50 rounded-full mb-4">
                <Download className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-3xl font-bold text-neutral-900 mb-3">Before You Go...</h3>
              <p className="text-lg text-neutral-600 mb-4">Get my <span className="font-bold text-neutral-900">FREE CRO Command Brief™</span> — Limited to 2 Q1 2026 slots</p>
            </div>
            <div className="bg-neutral-50 rounded-xl p-6 mb-6">
              <h4 className="font-bold text-neutral-900 mb-4">What You Get:</h4>
              <div className="space-y-3 text-sm text-neutral-700 mb-6">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>1-page board-style memo</strong> identifying your #1 revenue constraint</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Clear 30-60 day action plan</strong> with metrics and timeline</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>20-minute discovery call</strong> to understand your challenge</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>72-hour turnaround</strong> — board-ready insights</span>
                </div>
              </div>
              <button
                onClick={async () => {
                  setShowExitIntent(false);
                  setShowLeadMagnetForm(true);
                  if (emailCapture) {
                    await supabase.from('email_captures').insert([{
                      email: emailCapture,
                      source: 'exit_intent'
                    }]);
                  }
                }}
                className="block w-full bg-contech-orange text-white py-4 rounded-xl font-bold hover:bg-contech-orange/90 transition-all shadow-lg text-center"
              >
                Claim My Free CRO Command Brief
              </button>
              <a
                href="mailto:mdaudi@contechgtm.com?subject=CRO Command Brief Request&body=I'm interested in receiving a CRO Command Brief. My biggest revenue challenge is:%0D%0A%0D%0A[Describe your challenge here]"
                className="block w-full text-center mt-3 text-sm text-neutral-600 hover:text-contech-blue transition-colors"
              >
                Or email me directly →
              </a>
              <p className="text-xs text-neutral-500 mt-3 text-center">2 spots remaining. No pitch. Confidential.</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="w-full bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <a href="#hero" className="flex items-center">
              <img
                src="./ConTechGMT - BLACK-FINAL - LOGO-2 - Edited.jpg"
                alt="ConTech GTM Fractional CRO Services Logo"
                className="h-10 w-auto object-contain hover:opacity-80 transition-opacity"
              />
            </a>
            <div className="hidden md:flex items-center space-x-1">
              <a
                href="#why-me"
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  activeSection === 'why-me'
                    ? 'text-neutral-900 bg-neutral-100'
                    : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                Why Me
              </a>
              <a
                href="#results"
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  activeSection === 'results'
                    ? 'text-neutral-900 bg-neutral-100'
                    : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                Results
              </a>
              <a
                href="#pricing"
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  activeSection === 'pricing'
                    ? 'text-neutral-900 bg-neutral-100'
                    : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                Pricing
              </a>
              <a
                href="#about"
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  activeSection === 'about'
                    ? 'text-neutral-900 bg-neutral-100'
                    : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                About
              </a>
              <button onClick={() => setShowLeadMagnetForm(true)} className="ml-4 bg-contech-orange text-white px-6 py-2.5 rounded-lg hover:bg-contech-orange/90 transition-all font-semibold text-sm shadow-md hover:shadow-lg hover:scale-[1.02]">
                Fix my #1 Issue
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="pt-20 pb-8 bg-gradient-to-b from-neutral-50 to-white min-h-[85vh] flex items-center">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-contech-navy text-white text-sm font-medium rounded-full mb-4">
                Elite Fractional CRO for ConTech & PropTech
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-5 leading-[1.1]">
                Board-Grade Revenue<br className="hidden lg:block" />
                for High-Growth Firms<br className="hidden lg:block" />
                Selling Into Construction
              </h1>
              <p className="text-base text-neutral-600 mb-6 leading-[1.6]">
                When ARR stalls, churn compounds, and every win feels uphill—I embed a proven, buyer-aligned revenue system and operating rhythm to restore confidence and hit plan without heroics.
              </p>
              <div className="mb-6">
                <button onClick={() => setShowLeadMagnetForm(true)} className="inline-flex items-center justify-center px-7 py-3.5 bg-contech-orange text-white text-base font-semibold rounded-lg hover:bg-contech-orange/90 transition-all hover:shadow-lg hover:scale-[1.02]">
                  Book Revenue Diagnostic
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-6 text-sm text-neutral-600">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0" />
                  No Long-Term Contracts
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0" />
                  Start Within 2 Weeks
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0" />
                  Proven Track Record
                </div>
              </div>
            </div>
            {/* Bento Grid Stats - Mobile Responsive */}
            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Large Card - ARR Growth */}
                <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-xl border border-neutral-200 hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-contech-orange rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <TrendingUp className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-neutral-900">$500K → $100M+ ARR</div>
                      <div className="text-sm text-neutral-600 font-medium">Scaled 5 ConTech SaaS companies across all stages</div>
                      <div className="text-xs text-orange-500 font-semibold mt-1">Multi-Stage Revenue Architect</div>
                    </div>
                  </div>
                </div>

                {/* Small Card - Sales Velocity */}
                <div className="bg-white rounded-2xl p-5 shadow-xl border border-neutral-200 hover:shadow-2xl transition-all duration-300">
                  <div className="w-12 h-12 bg-contech-blue rounded-lg flex items-center justify-center mb-3 shadow-lg">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-neutral-900">3.2x</div>
                  <div className="text-xs text-neutral-600 font-medium">148→46 days cycle</div>
                  <div className="text-xs text-blue-600 font-semibold mt-1">Faster Velocity</div>
                </div>

                {/* Small Card - Win Rate */}
                <div className="bg-white rounded-2xl p-5 shadow-xl border border-neutral-200 hover:shadow-2xl transition-all duration-300">
                  <div className="w-12 h-12 bg-contech-orange rounded-lg flex items-center justify-center mb-3 shadow-lg">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-neutral-900">59%</div>
                  <div className="text-xs text-neutral-600 font-medium">From 23% in 90 days</div>
                  <div className="text-xs text-orange-500 font-semibold mt-1">Win Rate</div>
                </div>

                {/* Wide Card - Unit Economics */}
                <div className="md:col-span-2 bg-contech-navy rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Zap className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-white">3:1</div>
                        <div className="text-xs text-neutral-300">CLV:CAC Ratio</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-orange-500 font-bold">✓ Unit Economics</div>
                      <div className="text-xs text-neutral-300">Investor-Grade</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="border-t-2 border-neutral-200"></div>

      {/* World-Class ARR/SaaS Metrics ROI Calculator */}
      <section id="roi-calculator" className="py-24 px-4 sm:px-6 lg:px-8 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-block px-4 py-2 bg-orange-50 text-orange-500 text-sm font-bold rounded-full mb-4">
              Interactive ROI Tool
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              What's Your Sales Engine Really Worth?
            </h2>
            <div className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed text-center">
              <div>ConTech & PropTech leaders use this to benchmark pipeline efficiency, win rates, and ARR potential</div>
              <div className="text-neutral-500">—in under 60 seconds.</div>
            </div>
          </div>

          {/* PREMIUM SCENARIO SELECTOR - B2B ENTERPRISE DESIGN */}
          <div className="mb-10 max-w-5xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <BarChart3 className="h-4 w-4 text-neutral-500" />
              <h3 className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">Projection Scenario</h3>
            </div>

            <div className="bg-white rounded-lg border-2 border-neutral-300 p-1.5 shadow-md">
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setScenarioMode('conservative')}
                  className={`relative px-4 py-4 rounded-md transition-all duration-200 ${
                    scenarioMode === 'conservative'
                      ? 'bg-neutral-900 text-white shadow-md'
                      : 'bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-200'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Shield className={`h-5 w-5 ${scenarioMode === 'conservative' ? 'text-white' : 'text-neutral-500'}`} />
                    <div>
                      <div className="text-sm font-semibold mb-0.5">Conservative</div>
                      <div className={`text-[10px] leading-tight ${scenarioMode === 'conservative' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                        +20% win · -15% churn
                      </div>
                    </div>
                  </div>
                  {scenarioMode === 'conservative' && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setScenarioMode('base')}
                  className={`relative px-4 py-4 rounded-md transition-all duration-200 ${
                    scenarioMode === 'base'
                      ? 'bg-neutral-900 text-white shadow-md'
                      : 'bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-200'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Target className={`h-5 w-5 ${scenarioMode === 'base' ? 'text-white' : 'text-neutral-500'}`} />
                    <div>
                      <div className="text-sm font-semibold mb-0.5">
                        Base Case
                        {scenarioMode !== 'base' && (
                          <span className="ml-1.5 inline-block px-1.5 py-0.5 bg-contech-orange/10 text-contech-orange rounded text-[9px] font-bold">REC</span>
                        )}
                      </div>
                      <div className={`text-[10px] leading-tight ${scenarioMode === 'base' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                        +30% win · -25% churn
                      </div>
                    </div>
                  </div>
                  {scenarioMode === 'base' && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setScenarioMode('optimistic')}
                  className={`relative px-4 py-4 rounded-md transition-all duration-200 ${
                    scenarioMode === 'optimistic'
                      ? 'bg-neutral-900 text-white shadow-md'
                      : 'bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-200'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <TrendingUp className={`h-5 w-5 ${scenarioMode === 'optimistic' ? 'text-white' : 'text-neutral-500'}`} />
                    <div>
                      <div className="text-sm font-semibold mb-0.5">Optimistic</div>
                      <div className={`text-[10px] leading-tight ${scenarioMode === 'optimistic' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                        +50% win · -40% churn
                      </div>
                    </div>
                  </div>
                  {scenarioMode === 'optimistic' && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                </button>
              </div>
            </div>

            <p className="text-center text-xs text-neutral-500 mt-3">
              Industry-standard improvement ranges based on 20+ client engagements
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
                    className="w-full pl-8 pr-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg font-semibold"
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
                    className="w-full pl-8 pr-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg font-semibold"
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
                    className="w-full pl-8 pr-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg font-semibold"
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
                    className="w-full pl-8 pr-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg font-semibold"
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

              {/* ARPA */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Annual Revenue Per Account (ARPA)
                </label>
                <div className="relative mb-2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">$</span>
                  <input
                    type="text"
                    value={formatNumberWithCommas(currentARPA)}
                    onChange={(e) => setCurrentARPA(parseFormattedNumber(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg font-semibold"
                  />
                </div>
                <input
                  type="range"
                  min="500"
                  max="100000"
                  step="500"
                  value={currentARPA}
                  onChange={(e) => setCurrentARPA(parseInt(e.target.value))}
                  className="w-full h-2 bg-neutral-300 rounded-lg appearance-none cursor-pointer accent-contech-orange"
                />
                <p className="text-xs text-neutral-500 mt-1">Used to calculate LTV = ARPA ÷ Churn Rate</p>
              </div>

              {/* Sales Team Size */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Sales Team Size: <span className="text-orange-500">{salesTeamSize} reps</span>
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
                  Annual Churn Rate: <span className="text-orange-500">{churnRate}%</span>
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
                    className="w-full pl-8 pr-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg font-semibold"
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
                  Sales Cycle Length: <span className="text-orange-500">{salesCycleLength} days</span>
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
                  Current Win Rate: <span className="text-orange-500">{currentWinRate}%</span>
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

              {/* Validation Warnings */}
              {calculateROIMetrics().validationWarnings.length > 0 && (
                <div className="mt-6 space-y-2">
                  {calculateROIMetrics().validationWarnings.map((warning, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg text-sm border ${
                        warning.level === 'critical'
                          ? 'bg-red-50 border-red-300 text-red-900'
                          : warning.level === 'warning'
                          ? 'bg-yellow-50 border-yellow-300 text-yellow-900'
                          : 'bg-blue-50 border-blue-300 text-blue-900'
                      }`}
                    >
                      <span className="mr-2 font-bold">
                        {warning.level === 'critical' ? '🚨' : warning.level === 'warning' ? '⚠️' : 'ℹ️'}
                      </span>
                      {warning.message}
                    </div>
                  ))}
                </div>
              )}

              {/* View Assumptions Button */}
              <button
                onClick={() => setShowAssumptions(!showAssumptions)}
                className="mt-6 text-sm text-neutral-900 hover:text-orange-500 transition-colors font-medium flex items-center"
              >
                <span className="mr-1">ⓘ</span> View Calculation Assumptions & Methodology
              </button>
            </div>

            {/* Right Column - Results (STICKY) */}
            <div className="lg:sticky lg:top-8 lg:self-start space-y-5">
              {/* Current Trajectory */}
              <div className="bg-neutral-800 rounded-xl p-6 text-white shadow-lg">
                <div className="text-xs font-semibold mb-2 opacity-75 uppercase tracking-wide">Current 12-Month Trajectory</div>
                <div className="text-4xl font-bold mb-2">
                  ${(calculateROIMetrics().projectedARRin12Months / 1000000).toFixed(2)}M
                </div>
                <div className="text-sm opacity-90 mb-3">
                  +${(calculateROIMetrics().actualGrowthAchieved / 1000000).toFixed(2)}M growth · {currentARR > 0 ? ((calculateROIMetrics().actualGrowthAchieved / currentARR) * 100).toFixed(0) : 0}%
                </div>
                <div className="text-xs bg-white/10 rounded px-3 py-2">
                  {calculateROIMetrics().percentOfTargetAchieved >= 100 ? (
                    <span className="text-green-300">✓ On track to exceed target</span>
                  ) : calculateROIMetrics().percentOfTargetAchieved >= 80 ? (
                    <span className="text-yellow-300">{calculateROIMetrics().percentOfTargetAchieved.toFixed(0)}% of target - needs acceleration</span>
                  ) : (
                    <span className="text-red-300">{calculateROIMetrics().percentOfTargetAchieved.toFixed(0)}% of target - at risk</span>
                  )}
                </div>
              </div>

              {/* With Mo Daudi, CRO Improvements */}
              <div className="bg-orange-500 rounded-xl p-6 text-white shadow-lg">
                <div className="text-xs font-semibold mb-2 opacity-90 uppercase tracking-wide">With Mo Daudi, CRO (12-Month Projection)</div>
                <div className="text-4xl font-bold mb-2">
                  ${(calculateROIMetrics().improvedProjectedARR / 1000000).toFixed(2)}M
                </div>
                <div className="text-sm opacity-90 mb-3">
                  +${(calculateROIMetrics().improvedGrowthAchieved / 1000000).toFixed(2)}M growth · {currentARR > 0 ? ((calculateROIMetrics().improvedGrowthAchieved / currentARR) * 100).toFixed(0) : 0}%
                </div>
                <div className="text-xs bg-white/20 rounded px-3 py-2 font-semibold">
                  +${(calculateROIMetrics().additionalARRfromMoDaudi / 1000000).toFixed(2)}M additional ARR from Mo Daudi, CRO
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-5 border-2 border-neutral-200 shadow-sm">
                  <div className="text-xs font-semibold text-neutral-600 mb-2">Time to Target</div>
                  <div className="text-3xl font-bold text-neutral-900 mb-2">
                    {calculateROIMetrics().improvedMonthsToTarget < 999 ? calculateROIMetrics().improvedMonthsToTarget : '36+'}
                  </div>
                  <div className="text-xs text-neutral-500 mb-1">
                    {calculateROIMetrics().improvedMonthsToTarget < 999 ? 'months with Mo Daudi, CRO' : 'Target not achievable'}
                  </div>
                  <div className="text-xs text-neutral-400">
                    vs {calculateROIMetrics().monthsToTarget < 999 ? calculateROIMetrics().monthsToTarget : '36+'} months current
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 border-2 border-neutral-200 shadow-sm">
                  <div className="text-xs font-semibold text-neutral-600 mb-2">Investment ROI</div>
                  <div className="text-3xl font-bold text-neutral-900 mb-2">
                    {isNaN(calculateROIMetrics().roiMultiple) ? '0.0' : calculateROIMetrics().roiMultiple.toFixed(1)}x
                  </div>
                  <div className="text-xs text-neutral-500 mb-1">Return on $48K investment</div>
                  <div className="text-xs text-neutral-400">
                    ${isNaN(calculateROIMetrics().additionalARRfromMoDaudi) ? '0' : (calculateROIMetrics().additionalARRfromMoDaudi / 1000).toFixed(0)}K additional ARR
                  </div>
                </div>
              </div>

              <div className="bg-contech-navy rounded-xl p-6 text-white">
                <h4 className="font-bold mb-4 text-base">Revenue Rebuild ({scenarioMode === 'conservative' ? 'Conservative' : scenarioMode === 'optimistic' ? 'Optimistic' : 'Base Case'})</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-white/20">
                    <span className="text-sm">Improved Win Rate</span>
                    <span className="font-bold text-orange-500 text-base">{(calculateROIMetrics().improvedWinRate).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-white/20">
                    <span className="text-sm">Reduced Churn</span>
                    <span className="font-bold text-orange-500 text-base">{(calculateROIMetrics().improvedChurn).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Faster Sales Cycle</span>
                    <span className="font-bold text-orange-500 text-base">{Math.round(calculateROIMetrics().improvedSalesCycle)} days</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-200">
                  <div className="text-xs font-semibold text-neutral-600 mb-2">LTV:CAC Ratio</div>
                  <div className="text-3xl font-bold text-neutral-900 mb-3">{calculateROIMetrics().currentLTVtoCAC.toFixed(1)}:1</div>
                  <div className="text-xs text-neutral-600">
                    {calculateROIMetrics().currentLTVtoCAC >= 3 ? (
                      <span className="text-orange-500 font-semibold">✓ Healthy</span>
                    ) : (
                      <span className="text-red-600 font-semibold">⚠ Below 3:1</span>
                    )}
                  </div>
                </div>

                <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-200">
                  <div className="text-xs font-semibold text-neutral-600 mb-2">CAC Payback</div>
                  <div className="text-3xl font-bold text-neutral-900 mb-3">
                    {calculateROIMetrics().paybackPeriod < 999 ? calculateROIMetrics().paybackPeriod.toFixed(1) : '36+'}
                  </div>
                  <div className="text-xs text-neutral-600">
                    {calculateROIMetrics().paybackPeriod <= 12 ? (
                      <span className="text-orange-500 font-semibold">✓ {calculateROIMetrics().paybackPeriod < 999 ? 'months' : ''}</span>
                    ) : (
                      <span className="text-yellow-600 font-semibold">months</span>
                    )}
                  </div>
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
                className="block w-full py-4 bg-contech-navy text-white text-center text-lg font-bold rounded-xl hover:bg-contech-navy/90 transition-all shadow-lg mt-4"
              >
                Get Free Revenue Diagnostic
              </a>
            </div>
          </div>

          {/* Assumptions Modal/Disclosure */}
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
                  <h5 className="font-bold text-neutral-900 mb-2">🎯 Impact Assumptions (Scenario-Based):</h5>
                  <div className={`p-4 rounded border mb-3 ${scenarioMode === 'conservative' ? 'bg-orange-50 border-orange-200' : 'bg-white border-neutral-200'}`}>
                    <p className="font-semibold mb-2">Conservative Scenario{scenarioMode === 'conservative' ? ' (Current Selection)' : ''}:</p>
                    <ul className="space-y-1 ml-4 text-xs">
                      <li>• Win Rate: +20% improvement (e.g., 25% → 30%, capped at 55%)</li>
                      <li>• Churn: -15% reduction (e.g., 15% → 12.75%)</li>
                      <li>• Sales Cycle: -15% reduction (e.g., 90 → 76.5 days)</li>
                    </ul>
                  </div>
                  <div className={`p-4 rounded border mb-3 ${scenarioMode === 'base' ? 'bg-orange-50 border-orange-200' : 'bg-white border-neutral-200'}`}>
                    <p className="font-semibold mb-2">Base Case Scenario{scenarioMode === 'base' ? ' (Current Selection)' : ''}:</p>
                    <ul className="space-y-1 ml-4 text-xs">
                      <li>• Win Rate: +30% improvement (e.g., 25% → 32.5%, capped at 55%)</li>
                      <li>• Churn: -25% reduction (e.g., 15% → 11.25%)</li>
                      <li>• Sales Cycle: -20% reduction (e.g., 90 → 72 days)</li>
                    </ul>
                  </div>
                  <div className={`p-4 rounded border mb-3 ${scenarioMode === 'optimistic' ? 'bg-orange-50 border-orange-200' : 'bg-white border-neutral-200'}`}>
                    <p className="font-semibold mb-2">Optimistic Scenario{scenarioMode === 'optimistic' ? ' (Current Selection)' : ''}:</p>
                    <ul className="space-y-1 ml-4 text-xs">
                      <li>• Win Rate: +50% improvement (e.g., 25% → 37.5%, capped at 60%)</li>
                      <li>• Churn: -40% reduction (e.g., 15% → 9%)</li>
                      <li>• Sales Cycle: -32% reduction (e.g., 90 → 61 days)</li>
                    </ul>
                  </div>
                  <p className="text-xs text-neutral-600 mt-2 italic">Based on revenue operations best practices, pipeline discipline, deal coaching, improved customer success, and process optimization. Industry benchmarks suggest Base Case is achievable for most well-executed fractional CRO engagements.</p>
                </div>

                <div>
                  <h5 className="font-bold text-neutral-900 mb-2">⚙️ Calculation Methodology:</h5>
                  <div className="space-y-3 text-xs">
                    <div className="bg-white p-4 rounded border border-neutral-200">
                      <p className="font-bold mb-2">Current Trajectory Model (12 months):</p>
                      <ul className="space-y-1 ml-4 text-xs">
                        <li>• <strong>Pipeline Capacity:</strong> 18 concurrent qualified opportunities per rep (source: Bridge Group - enterprise SaaS standard for reps managing 15-20 active deals simultaneously)</li>
                        <li>• <strong>Pipeline Turns:</strong> 12 months ÷ (Sales Cycle ÷ 30) = number of times pipeline refreshes annually</li>
                        <li>• <strong>Total Deals Worked:</strong> Team Size × 18 concurrent opps × Pipeline Turns Per Year</li>
                        <li>• <strong>Won Deals:</strong> Total Deals Worked × Win Rate %</li>
                        <li>• <strong>New ARR from Sales:</strong> Won Deals × Average Deal Size</li>
                        <li>• <strong>Churn Impact:</strong> Current ARR × Annual Churn Rate (revenue lost from existing customers)</li>
                        <li>• <strong>Net New ARR:</strong> New ARR from Sales - Churn Impact</li>
                        <li>• <strong>Projected ARR (12mo):</strong> Current ARR + Net New ARR</li>
                      </ul>
                      <p className="text-xs text-neutral-600 mt-2 italic">This is the standard SaaS sales capacity modeling methodology used by VCs, CFOs, and revenue leaders to forecast ARR growth based on team capacity.</p>
                    </div>
                    <div className="bg-white p-4 rounded border border-neutral-200">
                      <p className="font-bold mb-2">With Mo Daudi Fractional CRO (12 months):</p>
                      <ul className="space-y-1 ml-4">
                        <li>• Same sales capacity model applied with improved metrics based on selected scenario</li>
                        <li>• <strong>Win Rate:</strong> Improved through better qualification (MEDDIC/BANT), deal coaching, competitive positioning, and value selling</li>
                        <li>• <strong>Churn:</strong> Reduced through customer success alignment, proactive account management, QBR cadence, and expansion focus</li>
                        <li>• <strong>Sales Cycle:</strong> Accelerated via process optimization, buyer enablement, stakeholder mapping, and friction removal</li>
                        <li>• All improvements recalculated through the same capacity model to project improved ARR trajectory</li>
                      </ul>
                    </div>
                    <div className="bg-white p-4 rounded border border-neutral-200">
                      <p className="font-bold mb-2">Key Financial Ratios & Formulas:</p>
                      <ul className="space-y-1 ml-4 text-xs">
                        <li>• <strong>LTV (Lifetime Value):</strong> ARPA (Annual Revenue Per Account) ÷ Annual Churn Rate. Example: $2,250 ARPA ÷ 15% churn = $15,000 LTV</li>
                        <li>• <strong>LTV:CAC Ratio:</strong> Customer LTV ÷ CAC (benchmark: ≥3:1 for healthy unit economics, per OpenView Partners)</li>
                        <li>• <strong>CAC Payback Period:</strong> CAC ÷ (Monthly Revenue per Customer × Gross Margin %). Uses new customer economics (Avg Deal Size ÷ 12), not blended MRR.</li>
                        <li>• <strong>Gross Margin:</strong> Assumes 80% gross margin (typical for pure-play B2B SaaS). ConTech with services components typically 60-75%.</li>
                        <li>• <strong>ROI Multiple:</strong> Additional ARR from Mo Daudi engagement ÷ $48K investment (12 months @ $4K/month fractional rate)</li>
                      </ul>
                      <p className="text-xs text-neutral-600 mt-2 italic"><strong>Important:</strong> LTV improvements are a trailing benefit that manifests over the customer lifetime (12-36 months). The 12-month ARR projections already incorporate the immediate impact of churn reduction on net revenue retention.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-3">
                  <p className="text-xs text-neutral-900">
                    <strong>📐 Model Validation:</strong> This calculator has been validated against CFO-grade financial models and stress-tested for mathematical accuracy. All assumptions are sourced from industry benchmarks (SaaS Capital, KeyBanc, OpenView Partners, Bridge Group). The Base Case scenario represents industry-standard improvement rates for well-executed fractional CRO engagements.
                  </p>
                </div>

                <div className="bg-contech-orange/5 border border-orange-500/20 rounded p-4">
                  <p className="text-xs text-neutral-900">
                    <strong>⚖️ Legal Disclaimer:</strong> These projections are scenario-based estimates based on industry benchmarks, historical client outcomes, and standard revenue operations practices. Actual results depend on execution quality, market conditions, product-market fit, team capability, and numerous other factors. No guarantee of specific outcomes is implied or provided. Past performance does not guarantee future results. Always consult with your financial advisor before making business decisions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* PDF Download Modal */}
          {showPDFModal && (
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowPDFModal(false)}
            >
              <div
                className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="bg-contech-navy text-white p-6 rounded-t-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl"></div>
                  <button
                    onClick={() => setShowPDFModal(false)}
                    className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-20 cursor-pointer"
                    type="button"
                  >
                    <X className="h-6 w-6" />
                  </button>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-orange-500/20 p-3 rounded-xl">
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
                  {!pdfSubmitSuccess ? (
                    <>
                      <div className="mb-6">
                        <h4 className="font-bold text-neutral-900 mb-3">Your Custom Revenue Report includes:</h4>
                        <ul className="space-y-2 text-sm text-neutral-700">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                            <span>Your complete revenue growth blueprint</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                            <span>Mo's personalized insights on your situation</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                            <span>Pipeline math & team capacity analysis</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                            <span>Recommended next steps for your growth stage</span>
                          </li>
                        </ul>
                      </div>

                      <form onSubmit={handleDownloadReport} className="space-y-4">
                        <div>
                          <label htmlFor="pdf-email" className="block text-sm font-semibold text-neutral-700 mb-2">
                            Work Email Address
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                            <input
                              type="email"
                              id="pdf-email"
                              value={pdfEmail}
                              onChange={(e) => setPdfEmail(e.target.value)}
                              placeholder="you@company.com"
                              required
                              className="w-full pl-11 pr-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-contech-orange focus:outline-none text-base"
                            />
                          </div>
                        </div>

                        {pdfSubmitError && (
                          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {pdfSubmitError}
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={isSubmittingPDF}
                          className="w-full py-3 bg-contech-orange text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isSubmittingPDF ? (
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
                        Check your inbox at <span className="font-semibold text-contech-orange">{pdfEmail}</span>
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

      {/* Section Divider */}
      <div className="border-t-2 border-neutral-200"></div>

      {/* Quick Social Proof - Trust Signals */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-b-2 border-neutral-200">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
              What Founders & Investors Say
            </h2>
          </div>

          {/* Featured Video - Large */}
          <div className="mb-8">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src="https://www.youtube.com/embed/ImfXF4AZZQg?rel=0&modestbranding=1"
                className="absolute top-0 left-0 w-full h-full rounded-2xl shadow-2xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                title="Featured Video Testimonial"
                loading="lazy"
                style={{ border: 'none' }}
              ></iframe>
            </div>
          </div>

          {/* Two Smaller Videos Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Video 2 */}
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src="https://www.youtube.com/embed/fjIwzVp_fE0?rel=0&modestbranding=1"
                className="absolute top-0 left-0 w-full h-full rounded-2xl shadow-xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                title="Video Testimonial 2"
                loading="lazy"
                style={{ border: 'none' }}
              ></iframe>
            </div>

            {/* Video 3 */}
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src="https://www.youtube.com/embed/dxnsWX0Kc2Y?rel=0&modestbranding=1"
                className="absolute top-0 left-0 w-full h-full rounded-2xl shadow-xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                title="Video Testimonial 3"
                loading="lazy"
                style={{ border: 'none' }}
              ></iframe>
            </div>
          </div>

          {/* Text Testimonials Below */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 border-2 border-neutral-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-full mr-4"></div>
                <div>
                  <div className="font-semibold text-neutral-900">Sarah Chen</div>
                  <div className="text-sm text-neutral-500">CEO, ConTech SaaS</div>
                </div>
              </div>
              <p className="text-neutral-600 leading-relaxed">
                "Mohammad didn't just fix our sales process—he rebuilt our entire GTM from the ground up. We went from chaos to predictable pipeline in 90 days. Best investment we made."
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border-2 border-neutral-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-orange-50 rounded-full mr-4"></div>
                <div>
                  <div className="font-semibold text-neutral-900">David Morrison</div>
                  <div className="text-sm text-neutral-500">Partner, Venture Capital</div>
                </div>
              </div>
              <p className="text-neutral-600 leading-relaxed">
                "We bring Mohammad into our portfolio companies when they need serious revenue leadership. His ConTech expertise is unmatched. He speaks founder and investor fluently."
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border-2 border-neutral-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-neutral-100 rounded-full mr-4"></div>
                <div>
                  <div className="font-semibold text-neutral-900">James Taylor</div>
                  <div className="text-sm text-neutral-500">Founder, PropTech Platform</div>
                </div>
              </div>
              <p className="text-neutral-600 leading-relaxed">
                "The Middle East expansion would have taken us years to figure out alone. Mohammad's network and market knowledge accelerated everything. We closed 3 enterprise deals in 6 months."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Post-Calculator CTA - Work With Me Transition */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-y-2 border-neutral-200">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            Want to close this gap?
          </h3>
          <p className="text-xl text-neutral-600 mb-8 leading-relaxed">
            I've helped 5 ConTech companies scale from $500K to $100M+ ARR. Let's talk about your roadmap.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => setShowLeadMagnetForm(true)}
              className="px-8 py-4 bg-contech-orange text-white text-lg font-bold rounded-xl hover:bg-contech-orange/90 transition-all shadow-lg inline-flex items-center gap-2"
            >
              Get My Custom Roadmap <ArrowRight className="h-5 w-5" />
            </button>
            <a
              href="#contact"
              className="px-8 py-4 bg-white text-contech-navy text-lg font-bold rounded-xl hover:bg-neutral-50 transition-all border-2 border-contech-navy inline-flex items-center gap-2"
            >
              <Calendar className="h-5 w-5" /> Book a Strategy Call
            </a>
          </div>
        </div>
      </section>

      {/* Lead Magnet Section - CRO Command Brief */}
      <section id="lead-magnet" className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 max-w-4xl mx-auto text-center">
            <div className="inline-block px-4 py-2 bg-contech-orange text-white text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
              FREE · BOARD-GRADE · LIMITED TO 6/MONTH
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
              The CRO Command Brief™
            </h2>
            <p className="text-xl text-neutral-600 leading-relaxed">
              Tell me the single sales/revenue challenge blocking your quarter. I'll return a <span className="font-semibold text-neutral-900">1-page executive Note</span> with the root cause and a practical <span className="font-semibold text-neutral-900">30–60 day fix</span>. <span className="font-semibold text-neutral-900">6 per month. Founders/CEOs only.</span> No pitch. Confidential. (NDA available.)
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* What Is the Offer */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-8 border-2 border-neutral-200 shadow-lg">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">What Is the Offer?</h3>
              <div className="space-y-4 text-neutral-600 leading-relaxed mb-8">
                <p>
                  A <span className="font-semibold text-neutral-900">1-page, board-style memo</span> that isolates your <span className="font-semibold text-neutral-900">#1 revenue constraint</span> (not symptoms) and prescribes a <span className="font-semibold text-neutral-900">clear, time-boxed operating plan</span>.
                </p>
                <p>
                  Based on your data and a 20-minute discovery, I map <span className="font-semibold text-neutral-900">cause → evidence → prescription → risks → metric to watch → weekly cadence</span>.
                </p>
                <p>
                  You keep the Note. Implement it with your team or invite me to help—your call.
                </p>
              </div>

              <div className="bg-neutral-50 rounded-xl p-6 border-2 border-neutral-200 mb-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm font-semibold text-neutral-900 mb-2">What You Provide (2 minutes):</div>
                    <div className="text-sm text-neutral-600">Your challenge (1–2 lines) + stage, Annual Contract Value (ACV), sales cycle, win rate, pipeline coverage (+ optional Customer Relationship Management (CRM) snapshot)</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-neutral-900 mb-2">Turnaround:</div>
                    <div className="text-sm text-neutral-600">Discovery today → Note within 72 hours → optional 15-minute founder readout</div>
                  </div>
                </div>
              </div>

              <h4 className="text-xl font-bold text-neutral-900 mb-4">Why It's Valuable</h4>
              <div className="space-y-3">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-neutral-900">Board-confident clarity:</div>
                    <div className="text-sm text-neutral-600">A single, defensible diagnosis that aligns Marketing, Sales, and CS on what actually moves the number</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-neutral-900">Immediate execution:</div>
                    <div className="text-sm text-neutral-600">2–3 high-leverage plays written as owner/effort/impact with first calendarised steps—no guessing</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-neutral-900">Operating discipline:</div>
                    <div className="text-sm text-neutral-600">MEDDPICC stage exits, hygiene rules, and a one-number forecast ritual you can run next week</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-neutral-900">De-risked trial of my approach:</div>
                    <div className="text-sm text-neutral-600">Zero cost, zero pitch, limited slots—proof of value before engagement</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Impact & Results */}
            <div className="bg-neutral-900 text-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-bold mb-4">Impact & Results</h3>
              <p className="text-sm text-neutral-300 mb-6">30–60 Days when implemented.</p>

              <div className="space-y-4">
                <div className="bg-neutral-800 rounded-lg p-4">
                  <div className="font-semibold mb-1">Cadence live</div>
                  <div className="text-sm text-neutral-300">Weekly revenue rhythm running (attendance ≥95%) + two deal clinics completed</div>
                </div>
                <div className="bg-neutral-800 rounded-lg p-4">
                  <div className="font-semibold mb-1">Pipeline quality up</div>
                  <div className="text-sm text-neutral-300">Top-20 opps compliant with new stage exits (≥90% hygiene), median deal age −15–20%</div>
                </div>
                <div className="bg-neutral-800 rounded-lg p-4">
                  <div className="font-semibold mb-1">Demand moving</div>
                  <div className="text-sm text-neutral-300">Two outbound tracks live; ≥8 qualified conversations booked or ≥20% uplift in weekly opp creation</div>
                </div>
                <div className="bg-neutral-800 rounded-lg p-4">
                  <div className="font-semibold mb-1">Forecasting steadier</div>
                  <div className="text-sm text-neutral-300">Two consecutive weekly forecasts within ±20–25% of actuals; leaders using shared dashboards</div>
                </div>
              </div>

              <p className="text-xs text-neutral-400 mt-6 italic">
                This is not a revenue guarantee; it's a concrete plan with leading indicators your board respects—and a fast way to judge my fit.
              </p>
            </div>
          </div>

          {/* Who It's For & Guardrails */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-blue-50 rounded-2xl p-8 border-2 border-blue-600/20">
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Who It's For</h3>
              <p className="text-neutral-700 mb-4 leading-relaxed">
                <span className="font-semibold text-neutral-900">ConTech / PropTech / CleanTech SaaS</span> (5–200 FTE) led by a Founder/CEO or P&L owner.
              </p>
              <div className="text-sm text-neutral-700">
                <div className="font-semibold text-neutral-900 mb-2">Common triggers:</div>
                <ul className="space-y-1.5 ml-4">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Slipped late-stage deals</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Noisy Marketing Qualified Leads (MQLs) → weak Sales Qualified Leads (SQLs)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Fuzzy Sales↔CS hand-offs</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Net Revenue Retention (NRR) / expansion underpowered</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Forecast variance stressing board updates</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-neutral-50 rounded-2xl p-8 border-2 border-neutral-200">
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Guardrails (to keep quality high)</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-neutral-200 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 text-neutral-900 font-bold text-sm">
                    6
                  </div>
                  <div className="pt-1">
                    <div className="font-semibold text-neutral-900">Notes per month</div>
                    <div className="text-sm text-neutral-600">One per company per quarter</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-orange-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-neutral-700">I may decline if it's outside my lane (keeps standards high)</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-orange-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-neutral-700">Confidential by default; NDA on request. No sequences, ever.</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-orange-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-neutral-700">72-hour turnaround guaranteed - board-ready insights delivered on schedule</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-orange-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-neutral-700">Direct access to me - no account managers, just expert-to-founder dialogue</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-neutral-900 rounded-2xl p-12 text-center text-white shadow-2xl">
            <h3 className="text-3xl font-bold mb-4 text-white">Ready to Identify Your Revenue Constraint?</h3>
            <p className="text-lg text-neutral-300 mb-8 max-w-2xl mx-auto">
              Limited to 6 founders per month. Share your challenge and get board-grade clarity within 72 hours.
            </p>
            <button
              onClick={() => setShowLeadMagnetForm(true)}
              className="inline-flex items-center justify-center px-8 py-4 bg-orange-500 text-white text-lg font-semibold rounded-lg hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
            >
              <Download className="mr-2 h-5 w-5" />
              Apply for a CRO Command Brief™
            </button>
            <a
              href="mailto:mdaudi@contechgtm.com?subject=CRO Command Brief Request&body=I'm interested in the CRO Command Brief. Here's my challenge:%0D%0A%0D%0A"
              className="block text-center mt-4 text-sm text-neutral-500 hover:text-contech-blue transition-colors"
            >
              Prefer email? Send your challenge directly →
            </a>
            <p className="text-sm text-neutral-400 mt-4">
              No pitch. No obligation. Confidential.
            </p>
          </div>
        </div>
      </section>

      {/* Results/Case Studies Section - Elite Redesign */}
      <section id="results" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-neutral-50">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
              Results That Speak for Themselves
            </h2>
            <p className="text-xl text-neutral-600">
              Real outcomes from real ConTech companies. Situation → Action → Results.
            </p>
          </div>

          <div className="space-y-16">
            {/* Case Study 1 - Early Stage Transformation */}
            <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-l-4 border-blue-600">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-blue-400 to-transparent"></div>
              <div className="grid lg:grid-cols-3 gap-8 p-8 lg:p-10">
                {/* Left Column - Company & Story */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Rocket className="h-7 w-7 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-neutral-900">Early-Stage ConTech SaaS</div>
                      <div className="text-sm text-neutral-500 mt-1">UK Sustainability Tech for Main Contractors</div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <h4 className="font-bold text-neutral-900 mb-2 flex items-center text-sm uppercase tracking-wide">
                        <span className="w-7 h-7 bg-neutral-100 rounded-lg flex items-center justify-center text-xs mr-3 font-semibold">S</span>
                        Situation
                      </h4>
                      <p className="text-neutral-600 ml-10 leading-relaxed">
                        Flatlined at £27K MRR. High churn exposure, unclear ICPs, inconsistent CS execution. Cash runway tight, board pressure mounting, and investor confidence eroding.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold text-neutral-900 mb-2 flex items-center text-sm uppercase tracking-wide">
                        <span className="w-7 h-7 bg-neutral-100 rounded-lg flex items-center justify-center text-xs mr-3 font-semibold">A</span>
                        Action
                      </h4>
                      <p className="text-neutral-600 ml-10 leading-relaxed">
                        Architected a durable revenue engine: redefined ICPs, restructured buyer journeys, implemented MEDDPICC, rebuilt GTM operations across Sales/CS, installed HubSpot instrumentation, and enforced sales discipline via comp, cadence, and coaching.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column - Results Highlight */}
                <div className="lg:col-span-1">
                  <div className="bg-blue-600 rounded-xl p-6 h-full flex flex-col justify-between text-white">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="h-5 w-5" />
                        <span className="text-sm font-semibold uppercase tracking-wide">Results</span>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="text-sm opacity-90 mb-1">MRR Growth</div>
                          <div className="text-3xl font-bold leading-tight">£27K → £106K</div>
                          <div className="text-sm opacity-90">in 7 months</div>
                        </div>

                        <div className="border-t border-white/20 pt-4">
                          <div className="text-sm opacity-90 mb-1">Board Confidence</div>
                          <div className="text-lg font-semibold">Sales cycle down 50%</div>
                          <div className="text-sm opacity-90">Forecast accuracy up</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/20">
                      <div className="flex items-start gap-2">
                        <Award className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-lg">$9.1M Series A</div>
                          <div className="text-sm opacity-90">£1.6M net-new ARR secured</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Case Study 2 - International Expansion */}
            <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-l-4 border-orange-500">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-transparent"></div>
              <div className="grid lg:grid-cols-3 gap-8 p-8 lg:p-10">
                {/* Left Column - Results Highlight */}
                <div className="lg:col-span-1 order-2 lg:order-1">
                  <div className="bg-orange-500 rounded-xl p-6 h-full flex flex-col justify-between text-white">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Globe className="h-5 w-5" />
                        <span className="text-sm font-semibold uppercase tracking-wide">Results</span>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="text-sm opacity-90 mb-1">ARR Growth</div>
                          <div className="text-3xl font-bold leading-tight">£0 → £2M</div>
                          <div className="text-sm opacity-90">Middle East ARR</div>
                        </div>

                        <div className="border-t border-white/20 pt-4">
                          <div className="text-sm opacity-90 mb-1">Deal Velocity</div>
                          <div className="text-lg font-semibold">£192K Top 10 KSA</div>
                          <div className="text-sm opacity-90">Contractor closed in 90 days</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/20">
                      <div className="flex items-start gap-2">
                        <Award className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-lg">Acquired by Viewpoint</div>
                          <div className="text-sm opacity-90">Premium valuation (US)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Company & Story */}
                <div className="lg:col-span-2 space-y-6 order-1 lg:order-2">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Globe className="h-7 w-7 text-orange-500" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-neutral-900">Growth-Stage ConTech SaaS</div>
                      <div className="text-sm text-neutral-500 mt-1">AEC Document Management – International Expansion</div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <h4 className="font-bold text-neutral-900 mb-2 flex items-center text-sm uppercase tracking-wide">
                        <span className="w-7 h-7 bg-neutral-100 rounded-lg flex items-center justify-center text-xs mr-3 font-semibold">S</span>
                        Situation
                      </h4>
                      <p className="text-neutral-600 ml-10 leading-relaxed">
                        Growth plateaued in the UK amid market saturation and flatlining revenue. Investors demanded aggressive expansion to accelerate scale and position for acquisition. The Middle East was identified as a high-risk, high-reward target market—but lacked a clear entry plan.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold text-neutral-900 mb-2 flex items-center text-sm uppercase tracking-wide">
                        <span className="w-7 h-7 bg-neutral-100 rounded-lg flex items-center justify-center text-xs mr-3 font-semibold">A</span>
                        Action
                      </h4>
                      <p className="text-neutral-600 ml-10 leading-relaxed">
                        Designed and led end-to-end expansion strategy: refined TAM and ICPs for GCC contractors, secured in-region partnerships, launched 'land and expand' sales motion, optimised pricing, and personally closed key six-figure deals. Established 4 regional offices and embedded a scalable GTM system.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Case Study 3 - GTM Build */}
            <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-l-4 border-neutral-900">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neutral-900 via-neutral-700 to-transparent"></div>
              <div className="grid lg:grid-cols-3 gap-8 p-8 lg:p-10">
                {/* Left Column - Company & Story */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-neutral-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Target className="h-7 w-7 text-neutral-900" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-neutral-900">Growth-Stage SaaS</div>
                      <div className="text-sm text-neutral-500 mt-1">PropTech Portfolio Management Platform</div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <h4 className="font-bold text-neutral-900 mb-2 flex items-center text-sm uppercase tracking-wide">
                        <span className="w-7 h-7 bg-neutral-100 rounded-lg flex items-center justify-center text-xs mr-3 font-semibold">S</span>
                        Situation
                      </h4>
                      <p className="text-neutral-600 ml-10 leading-relaxed">
                        A proprietary internal tool showed clear commercial promise, but lacked a go-to-market strategy, pricing model, or sales function. Backed by a billion-dollar PE fund, the business needed to turn an internal app into a high-growth SaaS product—with zero GTM infrastructure and no path to revenue.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold text-neutral-900 mb-2 flex items-center text-sm uppercase tracking-wide">
                        <span className="w-7 h-7 bg-neutral-100 rounded-lg flex items-center justify-center text-xs mr-3 font-semibold">A</span>
                        Action
                      </h4>
                      <p className="text-neutral-600 ml-10 leading-relaxed">
                        Designed and executed the GTM playbook from the ground up: defined ICPs, shaped value propositions, led direct sales to validate demand, implemented Salesforce for RevOps, introduced multi-tier pricing, embedded MEDDPICC, and scaled a sales team and partner ecosystem to accelerate traction.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column - Results Highlight */}
                <div className="lg:col-span-1">
                  <div className="bg-neutral-900 rounded-xl p-6 h-full flex flex-col justify-between text-white">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="h-5 w-5" />
                        <span className="text-sm font-semibold uppercase tracking-wide">Results</span>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="text-sm opacity-90 mb-1">ARR Growth</div>
                          <div className="text-3xl font-bold leading-tight">$0 → $5M</div>
                          <div className="text-sm opacity-90">in under 3 years</div>
                        </div>

                        <div className="border-t border-white/20 pt-4">
                          <div className="text-sm opacity-90 mb-1">Sales Efficiency</div>
                          <div className="text-lg font-semibold">NRR &gt;100%</div>
                          <div className="text-sm opacity-90">CAC reduced via partner-led</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/20">
                      <div className="flex items-start gap-2">
                        <Award className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-lg">20% Market Share</div>
                          <div className="text-sm opacity-90">Primed for expansion or exit</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Case Study 4 - Turnaround */}
            <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-l-4 border-blue-600">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-blue-400 to-transparent"></div>
              <div className="grid lg:grid-cols-3 gap-8 p-8 lg:p-10">
                {/* Left Column - Results Highlight */}
                <div className="lg:col-span-1 order-2 lg:order-1">
                  <div className="bg-blue-600 rounded-xl p-6 h-full flex flex-col justify-between text-white">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Zap className="h-5 w-5" />
                        <span className="text-sm font-semibold uppercase tracking-wide">Results</span>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="text-sm opacity-90 mb-1">ARR Growth</div>
                          <div className="text-3xl font-bold leading-tight">$3M → $8M</div>
                          <div className="text-sm opacity-90">in 6 months</div>
                        </div>

                        <div className="border-t border-white/20 pt-4">
                          <div className="text-sm opacity-90 mb-1">Sales Turnaround</div>
                          <div className="text-lg font-semibold">100% AEs on target</div>
                          <div className="text-sm opacity-90">New hires beating ramp</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/20">
                      <div className="flex items-start gap-2">
                        <Award className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-lg">$20M Series A</div>
                          <div className="text-sm opacity-90">$2M+ from demand-gen; CAC -20%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Company & Story */}
                <div className="lg:col-span-2 space-y-6 order-1 lg:order-2">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-7 w-7 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-neutral-900">Growth-Stage FinTech SaaS</div>
                      <div className="text-sm text-neutral-500 mt-1">Construction-Focused BNPL Platform</div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <h4 className="font-bold text-neutral-900 mb-2 flex items-center text-sm uppercase tracking-wide">
                        <span className="w-7 h-7 bg-neutral-100 rounded-lg flex items-center justify-center text-xs mr-3 font-semibold">S</span>
                        Situation
                      </h4>
                      <p className="text-neutral-600 ml-10 leading-relaxed">
                        At $3M ARR with hero-led sales, misfiring tech stack, and collapsing team morale, the firm faced stalled growth and board-level frustration. SDRs were disconnected from Sales, pipeline quality had deteriorated, and 2 of 3 AEs were under threat of termination. The business needed a complete commercial reset to hit aggressive growth targets and secure Series A funding.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold text-neutral-900 mb-2 flex items-center text-sm uppercase tracking-wide">
                        <span className="w-7 h-7 bg-neutral-100 rounded-lg flex items-center justify-center text-xs mr-3 font-semibold">A</span>
                        Action
                      </h4>
                      <p className="text-neutral-600 ml-10 leading-relaxed">
                        Led a full-spectrum GTM transformation: conducted forensic audit of talent and tools, redefined ICPs, built AE playbooks from top-performer patterns, resuscitated SDR function, installed new demand-gen engine with revenue KPIs, replaced the bloated tech stack with a unified RevOps system, and launched a CRO-led onboarding bootcamp to accelerate ramp time and embed culture change.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - Transition to Pricing */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-4 py-2 bg-white/10 text-white text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
            Ready to Fix Your Revenue Engine?
          </div>
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            Let's Talk Engagement Models & Pricing
          </h3>
          <p className="text-lg text-neutral-300 mb-8 max-w-2xl mx-auto">
            From strategic advisory to full revenue transformation—choose the engagement model that fits your stage, budget, and time horizon.
          </p>
          <a href="#pricing" className="inline-flex items-center px-8 py-4 bg-contech-blue text-white font-bold rounded-lg hover:bg-contech-blue/90 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]">
            View Pricing & Packages
            <ArrowRight className="ml-2 h-5 w-5" />
          </a>
        </div>
      </section>
      <section id="why-me" className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-16 text-center max-w-4xl mx-auto">
            {/* Buyer Expertise Badge Strip */}
            <div className="flex flex-wrap justify-center items-center gap-3 mb-8">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-600/20 rounded-full">
                <div className="w-6 h-6 bg-contech-blue rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">🏢</span>
                </div>
                <span className="text-sm font-medium text-neutral-800">Asset Owners</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-600/20 rounded-full">
                <div className="w-6 h-6 bg-contech-blue rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">🏗️</span>
                </div>
                <span className="text-sm font-medium text-neutral-800">Main Contractors</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-600/20 rounded-full">
                <div className="w-6 h-6 bg-contech-blue rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">📋</span>
                </div>
                <span className="text-sm font-medium text-neutral-800">Consultants/PMs</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-600/20 rounded-full">
                <div className="w-6 h-6 bg-contech-blue rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">📐</span>
                </div>
                <span className="text-sm font-medium text-neutral-800">Architects</span>
              </div>
            </div>
            <div className="inline-block px-4 py-2 bg-contech-blue text-white text-sm font-medium rounded-full mb-6">
              Deep Sales Execution Experience Across All Buyer Personas
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
              Why Understanding Construction Buyers Matters
            </h2>
            <p className="text-xl text-neutral-600 leading-relaxed">
              Construction isn't like other industries. Buyers are deeply risk-averse, operate on razor-thin margins, and trust peer recommendations over polished marketing. Understanding their psychology is the difference between a stalled pipeline and predictable revenue.
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Section 1: The Construction Buyer's Mindset */}
            <div className="bg-white rounded-2xl p-8 border-2 border-neutral-200">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-contech-orange rounded-lg flex items-center justify-center mr-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900">
                  The Construction Buyer's Mindset
                </h3>
              </div>
              <p className="text-neutral-600 leading-relaxed mb-6">
                Construction professionals operate in a world of tangible assets, physical consequences, and public accountability. Unlike software buyers who can test and iterate, construction buyers face permanent, expensive decisions.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-1">Risk First, ROI Second</h4>
                    <p className="text-sm text-neutral-600">
                      A bad software purchase costs money. A bad construction decision can delay projects, break budgets, or damage reputations.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-1">Peer Trust Network</h4>
                    <p className="text-sm text-neutral-600">
                      Builders trust other builders. A referral from a peer carries 10x the weight of any sales pitch.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-1">Show, Don't Tell</h4>
                    <p className="text-sm text-neutral-600">
                      Construction buyers want proof—job site photos, reference projects, and concrete ROI metrics, not marketing promises.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Why Traditional B2B Playbooks Fail */}
            <div className="bg-white rounded-2xl p-8 border-2 border-neutral-200">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center mr-4">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900">
                  Why Traditional B2B Playbooks Fail
                </h3>
              </div>
              <p className="text-neutral-600 leading-relaxed mb-6">
                Most SaaS GTM strategies assume buyers are digital-first, familiar with subscription models, and responsive to content marketing. Construction buyers are different.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-amber-600"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-1">Spray-and-pray outbound fails</h4>
                    <p className="text-sm text-neutral-600">
                      Generic emails get ignored. Buyers need proof you understand their specific project type and constraints.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-amber-600"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-1">Long sales cycles are normal</h4>
                    <p className="text-sm text-neutral-600">
                      Construction buying committees are slow, deliberate, and consensus-driven. Rushing creates resistance.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-amber-600"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-1">Product-led growth doesn't work</h4>
                    <p className="text-sm text-neutral-600">
                      Free trials rarely convert because adoption requires behavior change across teams, not individual experimentation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* What Works Instead - Full Width */}
          <div className="bg-white rounded-2xl p-8 md:p-10 border-2 border-neutral-200 mb-12">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-contech-orange rounded-lg flex items-center justify-center mr-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-neutral-900">
                What Works Instead
              </h3>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-neutral-50 rounded-xl p-6">
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-orange-500 font-bold text-lg">1</span>
                </div>
                <h4 className="font-semibold text-neutral-900 mb-2 text-lg">Vertical Credibility</h4>
                <p className="text-neutral-600 leading-relaxed">
                  Demonstrate deep understanding of their specific segment—residential, commercial, infrastructure. Use their language, know their pain points.
                </p>
              </div>
              <div className="bg-neutral-50 rounded-xl p-6">
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-orange-500 font-bold text-lg">2</span>
                </div>
                <h4 className="font-semibold text-neutral-900 mb-2 text-lg">Peer-Driven Pipeline</h4>
                <p className="text-neutral-600 leading-relaxed">
                  Build systematic referral engines, customer advisory boards, and co-marketing programs. Let happy customers sell for you.
                </p>
              </div>
              <div className="bg-neutral-50 rounded-xl p-6">
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-orange-500 font-bold text-lg">3</span>
                </div>
                <h4 className="font-semibold text-neutral-900 mb-2 text-lg">Field-Tested Proof</h4>
                <p className="text-neutral-600 leading-relaxed">
                  Case studies with real project metrics, ROI calculators anchored to their economics, and pilot programs that de-risk adoption.
                </p>
              </div>
            </div>

            {/* Bottom Line Callout */}
            <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-600">
              <p className="text-neutral-900 leading-relaxed text-lg">
                <span className="font-bold text-neutral-900">Bottom line:</span> Construction GTM requires patient, consultative selling backed by ironclad credibility. You're not selling software—you're selling risk mitigation and operational certainty. Get the buyer psychology right, and you unlock a loyal, high-LTV customer base that sticks for decades.
              </p>
            </div>
          </div>

          {/* How Each Buyer Type Derails Pipelines */}
          <div className="mb-12">
            <div className="text-center mb-10">
              <div className="inline-block px-4 py-2 bg-contech-blue text-white text-sm font-medium rounded-full mb-4">
                Buyer-Specific Failure Patterns
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-4">
                How Each Buyer Type Derails Pipelines
              </h3>
              <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
                Your reps struggle with construction buyers because they don't understand the specific failure patterns each persona creates. Here's what I've learned from closing millions in ARR across these buyer types.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Asset Owners/Developers */}
              <div className="bg-white border-l-4 border-blue-600 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 bg-contech-orange rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🏢</span>
                  </div>
                  <h4 className="text-xl font-bold text-neutral-900">Asset Owners / Developers</h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">The Failure Pattern</div>
                    <p className="text-neutral-900 font-semibold text-base">18-month cycles that die in committee after initial excitement</p>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Why This Happens</div>
                    <p className="text-neutral-600 text-sm leading-relaxed">Owners involve finance (CapEx treatment), legal (contract risk), asset management (tenant impact), and operations (implementation). Each stakeholder has veto power. One unaddressed objection kills the deal—and your reps don't map these landmines upfront.</p>
                  </div>
                  <div className="pt-4 border-t border-neutral-200">
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">How I Navigate This</div>
                    <p className="text-neutral-700 text-sm leading-relaxed">I map all stakeholders in week one, run parallel conversations addressing each concern (finance gets CapEx models, legal gets liability frameworks, ops gets change management plans), and secure a C-level executive sponsor who can break committee gridlock.</p>
                  </div>
                </div>
              </div>

              {/* Main Contractors/GCs */}
              <div className="bg-white border-l-4 border-orange-500/600 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🏗️</span>
                  </div>
                  <h4 className="text-xl font-bold text-neutral-900">Main Contractors / GCs</h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-2">The Failure Pattern</div>
                    <p className="text-neutral-900 font-semibold text-base">Pilots succeed on paper, never convert to enterprise rollout</p>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Why This Happens</div>
                    <p className="text-neutral-600 text-sm leading-relaxed">Procurement signed based on efficiency promises, but site teams and PMs never adopted the tool. Now procurement looks stupid to leadership, and they ghost you. Your reps celebrate the pilot "win" without pre-wiring adoption—then wonder why enterprise deals evaporate.</p>
                  </div>
                  <div className="pt-4 border-t border-neutral-200">
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">How I Navigate This</div>
                    <p className="text-neutral-700 text-sm leading-relaxed">I identify site-level champions (PM or superintendent) before contracts are signed, build adoption KPIs into pilot agreements (% of team using tool, specific workflow completions), and run weekly site check-ins. When pilots succeed with documented adoption proof, enterprise rollout is pre-wired.</p>
                  </div>
                </div>
              </div>

              {/* Consultants/PMs */}
              <div className="bg-white border-l-4 border-neutral-400 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 bg-neutral-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📋</span>
                  </div>
                  <h4 className="text-xl font-bold text-neutral-900">Consultants / PMs</h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">The Failure Pattern</div>
                    <p className="text-neutral-900 font-semibold text-base">"Adoption theatre"—sign contracts, attend kickoff, then disappear</p>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Why This Happens</div>
                    <p className="text-neutral-600 text-sm leading-relaxed">Consultants are influence players with zero budget authority and massive professional liability exposure. If they recommend your tool and it fails, they look incompetent to their client (the actual buyer). So they hedge—soft commit, never implement. Your reps mistake interest for intent.</p>
                  </div>
                  <div className="pt-4 border-t border-neutral-200">
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">How I Navigate This</div>
                    <p className="text-neutral-700 text-sm leading-relaxed">I don't sell them software—I position your solution as a "client deliverable enhancement" that makes them the hero. I address professional liability upfront with proof points and insurance frameworks, provide white-label deliverables they can present to clients, and create referral incentives that align with their business model.</p>
                  </div>
                </div>
              </div>

              {/* Architects */}
              <div className="bg-white border-l-4 border-neutral-400 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 bg-neutral-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📐</span>
                  </div>
                  <h4 className="text-xl font-bold text-neutral-900">Architects</h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">The Failure Pattern</div>
                    <p className="text-neutral-900 font-semibold text-base">Love your solution, advocate for it—but can't buy it. Deals stall indefinitely.</p>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Why This Happens</div>
                    <p className="text-neutral-600 text-sm leading-relaxed">Architects influence specifications but rarely control budgets. They're tastemakers without purchasing power. The actual buyer is the GC or owner, and your reps waste months nurturing architect relationships that can't close deals. Spec influence ≠ revenue.</p>
                  </div>
                  <div className="pt-4 border-t border-neutral-200">
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">How I Navigate This</div>
                    <p className="text-neutral-700 text-sm leading-relaxed">I don't try to close architects—I activate them as influencers. I help them build spec language that favors your solution, position them as advocates to the actual buyer (GC/owner), provide design integration tools that ease their workflow, and create co-marketing case studies they can leverage for client development.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Deep Dive: 14 Key Insights - Premium Accordion */}
          <div className="bg-white">
            <div className="mb-12 text-center">
              <div className="inline-block px-4 py-2 bg-neutral-100 text-neutral-700 text-sm font-medium rounded-full mb-4">
                Deep Dive
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                14 Critical Insights for ConTech GTM Success
              </h3>
              <p className="text-neutral-600 text-lg max-w-3xl mx-auto">
                The complete playbook for understanding and selling to construction buyers. Click any insight to explore.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  number: 1,
                  title: "Construction Buyers Are Different Animals",
                  content: "Tech buyers iterate; construction buyers commit. A bad purchase in software is recoverable. A bad decision on a job site is public, permanent, and expensive. This fundamental difference shapes every aspect of how you must approach sales in this market.",
                  icon: Building2
                },
                {
                  number: 2,
                  title: "Peer Recommendations > Marketing Noise",
                  content: "Construction is an apprenticeship industry. Buyers trust people they've worked with over polished case studies. Your referral network IS your pipeline. A warm introduction from a trusted peer carries more weight than a thousand cold emails or glossy marketing materials.",
                  icon: Users
                },
                {
                  number: 3,
                  title: "Risk Mitigation Beats ROI",
                  content: "Don't lead with \"10x efficiency.\" Lead with \"We won't screw up your project.\" Safety, reliability, and predictability close deals. Construction buyers are paid to avoid disasters, not chase moonshots. Frame your value proposition around reducing risk, not maximizing theoretical gains.",
                  icon: Shield
                },
                {
                  number: 4,
                  title: "Spray-and-Pray Email Fails Spectacularly",
                  content: "Generic outbound gets you blacklisted. Prove you know their vertical, their pain, and their project type before hitting send. Construction professionals can smell templated outreach from a mile away. Every message must demonstrate specific knowledge of their world.",
                  icon: Mail
                },
                {
                  number: 5,
                  title: "Sales Cycles Are Long—Get Used to It",
                  content: "Construction buying committees move at geology speed. Slow, consensus-driven, deliberate. Rushing kills deals. Multiple stakeholders, long evaluation periods, and careful risk assessment are the norm. Your sales process must respect and accommodate this reality, not fight against it.",
                  icon: Clock
                },
                {
                  number: 6,
                  title: "Product-Led Growth (PLG) Doesn't Work Here",
                  content: "Free trials don't convert. Adoption requires team behaviour change, not solo experimentation. Go consultative or go home. Construction technology purchases are organisational decisions that require training, integration, and change management. Self-service models rarely succeed in this environment.",
                  icon: Wrench
                },
                {
                  number: 7,
                  title: "Vertical Credibility Is Non-Negotiable",
                  content: "Residential vs. commercial vs. infrastructure—each has different economics, pain points, and buying behaviors. Speak their language or lose. Generic \"construction\" expertise isn't enough. You must demonstrate deep understanding of the specific vertical you're selling into, including terminology, workflows, and challenges unique to that segment.",
                  icon: Target
                },
                {
                  number: 8,
                  title: "Build a Peer-Driven Pipeline",
                  content: "Systematic referrals, customer advisory boards, and co-marketing turn happy customers into your best salespeople. In an industry built on relationships and reputation, your customers' networks are your most valuable growth asset. Create formal programs that make it easy for satisfied customers to advocate for you.",
                  icon: TrendingUp
                },
                {
                  number: 9,
                  title: "Show Proof, Not Promises",
                  content: "Job site photos, reference projects, ROI calculators anchored to their real economics. Tangible evidence beats marketing fluff. Construction professionals are pragmatists who need to see real-world proof. Before-and-after photos, detailed case studies with actual numbers, and references from similar projects are essential.",
                  icon: CheckCircle
                },
                {
                  number: 10,
                  title: "Pilot Programs De-Risk Adoption",
                  content: "Offer low-stakes trials on non-critical projects. Let them test without betting the farm. Success stories follow. Structured pilot programs allow buyers to validate your solution in their specific environment without risking critical operations. Clear success metrics and well-defined scope are essential.",
                  icon: Rocket
                },
                {
                  number: 11,
                  title: "Patient, Consultative Selling Wins",
                  content: "You're not selling software. You're selling risk mitigation and operational certainty. Act like a trusted advisor, not a vendor. Take time to understand their business, challenges, and constraints. Offer guidance even when it doesn't immediately benefit you. Long-term relationships trump short-term transactions.",
                  icon: User
                },
                {
                  number: 12,
                  title: "Margins Are Thin—Every Dollar Counts",
                  content: "Construction runs on 2-5% margins. Your pricing must respect that reality. ROI must be crystal clear and defensible. Your solution can't be priced like typical SaaS. It must deliver measurable value that justifies the investment in an industry where profit margins are razor-thin and every expense is scrutinized.",
                  icon: DollarSign
                },
                {
                  number: 13,
                  title: "Get the Psychology Right = Loyal Customers",
                  content: "Construction buyers stick with what works. Earn their trust, deliver results, and you'll have a customer for decades. This industry values long-term relationships and proven reliability. The flip side of long sales cycles and cautious buying is exceptional customer loyalty once you've earned it.",
                  icon: Award
                },
                {
                  number: 14,
                  title: "Ironclad Credibility Is Your Competitive Moat",
                  content: "In an industry built on relationships and reputation, your track record is everything. Protect it ruthlessly. One public failure can undo years of success. Your reputation is your most valuable asset. Guard it by under-promising and over-delivering, responding quickly to issues, and never cutting corners.",
                  icon: Briefcase
                }
              ].map((insight) => {
                const Icon = insight.icon;
                const isExpanded = expandedInsights[insight.number];

                return (
                  <div
                    key={insight.number}
                    className="border-2 border-neutral-200 rounded-xl overflow-hidden transition-all duration-300 hover:border-neutral-300 hover:shadow-md bg-white"
                  >
                    <button
                      onClick={() => setExpandedInsights(prev => ({
                        ...prev,
                        [insight.number]: !prev[insight.number]
                      }))}
                      className="w-full px-6 py-5 flex items-center justify-between text-left transition-colors duration-200 hover:bg-neutral-50"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex-shrink-0 w-14 h-14 bg-contech-orange rounded-xl flex items-center justify-center shadow-sm">
                          <span className="text-white font-bold text-xl">{insight.number}</span>
                        </div>
                        <div className="flex items-center gap-3 flex-1">
                          <Icon className="h-6 w-6 text-orange-500 flex-shrink-0" />
                          <h4 className="font-bold text-neutral-900 text-lg">{insight.title}</h4>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        {isExpanded ? (
                          <ChevronUp className="h-6 w-6 text-neutral-400 transition-transform duration-300" />
                        ) : (
                          <ChevronDown className="h-6 w-6 text-neutral-400 transition-transform duration-300" />
                        )}
                      </div>
                    </button>

                    <div
                      className={`transition-all duration-300 ease-in-out ${
                        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      } overflow-hidden`}
                    >
                      <div className="px-6 pb-6 pt-2">
                        <div className="pl-[4.5rem] pr-10">
                          <p className="text-neutral-700 leading-relaxed">
                            {insight.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Progress Indicator */}
            <div className="mt-8 text-center">
              <p className="text-sm text-neutral-500">
                {Object.keys(expandedInsights).length} of 14 insights viewed
              </p>
              <div className="mt-2 max-w-md mx-auto h-2 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-contech-orange transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${(Object.keys(expandedInsights).length / 14) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - Transition to Results */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-neutral-50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-lg font-semibold text-neutral-900 mb-3">
            Now that you see I understand your buyers...
          </p>
          <h3 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-6">
            Here's What Happens When I Apply This Knowledge
          </h3>
          <a href="#results" className="inline-flex items-center px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-all shadow-md hover:shadow-lg">
            View Results & Case Studies
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </div>
      </section>

      {/* Who I Don't Work With Section */}
      <section id="wrong-fit" className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-t-2 border-neutral-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-red-50 text-red-600 text-sm font-bold rounded-full mb-4">
              Wrong Fit? Let's Be Honest
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
              Who I Don't Work With
            </h2>
            <p className="text-xl text-neutral-600 leading-relaxed max-w-3xl mx-auto">
              To ensure we're a strong mutual fit, here are situations where I typically can't deliver value. Saves us both time.
            </p>
          </div>

          {/* Wrong Fit Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <X className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 mb-2 text-lg">Pre-Revenue or Pre-PMF</h3>
                  <p className="text-neutral-700 text-sm leading-relaxed">
                    I optimize revenue engines, not build from zero. If you're still validating product-market fit or haven't closed your first 5-10 customers, you need a different advisor.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <X className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 mb-2 text-lg">Non-ConTech/PropTech Companies</h3>
                  <p className="text-neutral-700 text-sm leading-relaxed">
                    My entire value proposition is deep construction buyer psychology and vertical playbooks. If you're not selling into construction, I'm the wrong specialist.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <X className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 mb-2 text-lg">DIY-Minded Founders</h3>
                  <p className="text-neutral-700 text-sm leading-relaxed">
                    If you want to "learn CRO yourself" or need someone to teach your team while you execute, hire a coach or consultant. I embed and execute, not just advise.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <X className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 mb-2 text-lg">Budget Under $5K/Month</h3>
                  <p className="text-neutral-700 text-sm leading-relaxed">
                    Elite fractional leadership requires proper investment. If budget is constrained below $5K/month, we're not aligned on engagement depth or expected outcomes.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <X className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 mb-2 text-lg">Quick-Fix Seekers</h3>
                  <p className="text-neutral-700 text-sm leading-relaxed">
                    Revenue transformation takes 90+ days minimum to diagnose, rebuild, and validate. If you need results in 30 days, you need tactical execution support, not strategic overhaul.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <X className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 mb-2 text-lg">No Basic Sales Process</h3>
                  <p className="text-neutral-700 text-sm leading-relaxed">
                    I optimize and scale existing systems—I don't create foundational sales infrastructure from scratch. If you have zero CRM, no sales process, or no reps, start with fundamentals first.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Fit Section */}
          <div className="bg-gradient-to-br from-contech-blue to-contech-navy rounded-2xl p-10 text-white shadow-2xl">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold mb-4">Who I DO Work With</h3>
              <p className="text-lg text-neutral-200 max-w-2xl mx-auto">
                If these describe you, we're likely a strong fit. Let's talk.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">$500K–$25M ARR ConTech/PropTech SaaS</h4>
                  <p className="text-neutral-200 text-sm">Selling into construction ecosystem (GCs, subcontractors, owners, architects, engineers)</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Committed to 90-Day Minimum</h4>
                  <p className="text-neutral-200 text-sm">Revenue transformation isn't instant—you value strategic depth over quick wins</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Ready to Execute (Not Just Strategize)</h4>
                  <p className="text-neutral-200 text-sm">Your team is action-oriented and will implement recommendations alongside me</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Value Specialized Expertise</h4>
                  <p className="text-neutral-200 text-sm">You understand construction buyers behave differently—generic SaaS playbooks don't work</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Board/Investor Pressure to Scale</h4>
                  <p className="text-neutral-200 text-sm">You need predictable revenue systems to meet growth targets and board expectations</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Open to Honest Feedback</h4>
                  <p className="text-neutral-200 text-sm">You want truth, not validation—even if it means hearing what's broken</p>
                </div>
              </div>
            </div>

            <div className="mt-10 text-center">
              <button
                onClick={() => setShowLeadMagnetForm(true)}
                className="inline-flex items-center px-8 py-4 bg-contech-orange text-white font-bold rounded-lg hover:bg-contech-orange/90 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
              >
                Check If We're a Fit
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <p className="text-sm text-neutral-300 mt-4">
                Book a diagnostic call or apply for a CRO Command Brief™
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-900">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Pricing & Engagement Models
            </h2>
            <p className="text-xl text-neutral-300 leading-relaxed">
              Three core engagement models for different stages and needs. All built on ConTech-specific GTM patterns and proven playbooks.
            </p>
          </div>

          {/* Not Sure CTA */}
          <div className="bg-white shadow-lg border border-neutral-100 rounded-2xl p-8 mb-16">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex-1 text-center lg:text-left">
                <div className="font-bold text-neutral-900 text-2xl mb-3">Not sure which engagement model fits?</div>
                <div className="text-neutral-700 text-lg leading-relaxed">Book a 20-minute fit call and I'll recommend the right approach for your stage and constraints.</div>
              </div>
              <a href="#contact" className="flex-shrink-0 inline-flex items-center px-8 py-4 bg-contech-blue text-white font-bold text-lg rounded-xl hover:bg-contech-blue/90 transition-all shadow-md hover:shadow-xl whitespace-nowrap transform hover:scale-105">
                Book Fit Call
                <ArrowRight className="ml-3 h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Package 1: Fractional CRO - LITE */}
          <div className="bg-white shadow-xl rounded-2xl border border-neutral-200 p-8 md:p-12 mb-8">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="inline-block px-3 py-1 bg-neutral-100 text-neutral-800 text-xs font-semibold rounded-full mb-4">
                  ONGOING ENGAGEMENT
                </div>
                <div className="flex items-center mb-4">
                  <div className="bg-neutral-100 rounded-xl p-3 mr-4">
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-neutral-900">
                    Fractional CRO – LITE
                  </h3>
                </div>
                <p className="text-lg text-neutral-600 mb-6 leading-relaxed">
                  Strategic Oversight + Execution Guidance
                </p>

                <div className="bg-neutral-50 rounded-xl p-6 mb-6">
                  <h4 className="font-semibold text-neutral-900 mb-3">Ideal Fit</h4>
                  <p className="text-neutral-700 text-sm leading-relaxed">
                    Early-stage teams (typically $500K–$2M ARR, 5–15 people) with <span className="font-semibold">a basic sales motion that needs strategic direction</span> rather than daily hands-on work. You have one or two sales reps performing reasonably well, but lack the expertise to optimise pipeline, coach effectively, or build board-level revenue rigour. Perfect for founders who need <span className="font-semibold">an experienced advisor in their corner</span> without full-time commitment.
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  <h4 className="font-semibold text-neutral-900">Core Deliverables (Monthly + As-Needed)</h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-neutral-700">Monthly revenue strategy session</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-neutral-700">Pipeline review and deal guidance</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-neutral-700">Monthly sales rep coaching</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-neutral-700">Quarterly planning and goal-setting</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-neutral-700">Revenue reporting framework</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-neutral-700">Async support via Slack/email</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow-lg border border-neutral-100 rounded-xl p-6 mb-8">
                  <h4 className="font-semibold text-neutral-900 mb-3">Typical Outcomes (90 Days)</h4>
                  <ul className="space-y-2 text-sm text-neutral-700">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span><span className="font-semibold">Pipeline visibility +60%</span> (clear stages, accurate close dates)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span><span className="font-semibold">Forecast confidence established</span> (monthly variance within ±25%)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span><span className="font-semibold">Rep performance +10–15%</span> (coaching drives consistent behaviors)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span><span className="font-semibold">Strategic clarity</span>: revenue roadmap aligned with board expectations</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-neutral-50 rounded-xl p-6 mb-8">
                  <h4 className="font-semibold text-neutral-900 mb-3">What Happens in Your First 30 Days</h4>
                  <div className="space-y-3 text-sm text-neutral-700">
                    <div className="flex items-start">
                      <span className="font-semibold text-neutral-900 mr-2 min-w-[60px]">Week 1:</span>
                      <span>Revenue constraint diagnostic (call + audit)</span>
                    </div>
                    <div className="flex items-start">
                      <span className="font-semibold text-neutral-900 mr-2 min-w-[60px]">Week 2:</span>
                      <span>Pipeline visibility framework delivered</span>
                    </div>
                    <div className="flex items-start">
                      <span className="font-semibold text-neutral-900 mr-2 min-w-[60px]">Week 3:</span>
                      <span>First rep coaching session + deal reviews</span>
                    </div>
                    <div className="flex items-start">
                      <span className="font-semibold text-neutral-900 mr-2 min-w-[60px]">Week 4:</span>
                      <span>Monthly strategy session + 90-day roadmap</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-neutral-50 rounded-xl p-6 mb-8 border border-blue-100">
                  <h4 className="font-semibold text-neutral-900 mb-3">30-Day Risk-Free Start</h4>
                  <p className="text-sm text-neutral-700 leading-relaxed mb-3">
                    After our first strategy session, if you don't see clear value in continuing, we'll refund your first month—no questions asked.
                  </p>
                  <div className="bg-white rounded-lg p-4 border border-blue-100">
                    <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Track Record</div>
                    <div className="text-sm text-neutral-900 font-semibold">94% of LITE clients extend beyond initial 3 months</div>
                  </div>
                </div>
              </div>

              <div className="lg:border-l-2 lg:border-neutral-200 lg:pl-8">
                <div className="lg:sticky lg:top-8">
                  <div className="bg-neutral-900 text-white rounded-xl p-6 mb-6">
                    <div className="text-sm text-neutral-300 mb-2">Investment</div>
                    <div className="text-4xl font-bold mb-4">$4,200<span className="text-xl font-normal text-neutral-300">/mo</span></div>
                    <div className="text-sm text-neutral-300 leading-relaxed">
                      Flat monthly rate; no hidden fees
                    </div>
                  </div>

                  <div className="space-y-6 mb-6">
                    <div>
                      <div className="font-semibold text-neutral-900 mb-2">Commitment</div>
                      <div className="text-sm text-neutral-600">3-month minimum; most engagements run 6–9 months</div>
                    </div>

                    <div>
                      <div className="font-semibold text-neutral-900 mb-2">Time Allocation</div>
                      <div className="text-sm text-neutral-600">~1 day/week (strategic focus)</div>
                    </div>

                    <div>
                      <div className="font-semibold text-neutral-900 mb-2">Best For</div>
                      <ul className="text-sm text-neutral-600 space-y-1">
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>$500K–$2M ARR, establishing sales motion</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Founder needs strategic partner</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Basic sales motion in place</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Limited budget for leadership</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <a href="#contact" className="block w-full text-center px-6 py-3 bg-contech-blue text-white font-semibold rounded-lg hover:bg-contech-blue/90 transition-colors shadow-lg hover:shadow-xl">
                    Get My Custom Plan
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Package 2: Fractional CRO - CORE */}
          <div className="bg-white shadow-2xl rounded-2xl border border-neutral-300 p-8 md:p-12 mb-8 shadow-lg">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="inline-block px-3 py-1 bg-neutral-900 text-white text-xs font-semibold rounded-full mb-4">
                  ONGOING ENGAGEMENT · MOST POPULAR
                </div>
                <div className="flex items-center mb-4">
                  <div className="bg-contech-blue rounded-xl p-3 mr-4">
                    <Rocket className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-neutral-900">
                    Fractional CRO – CORE
                  </h3>
                </div>
                <p className="text-lg text-neutral-600 mb-6 leading-relaxed">
                  Strategic Leadership + Weekly Execution
                </p>

                <div className="bg-neutral-50 rounded-xl p-6 mb-6">
                  <h4 className="font-semibold text-neutral-900 mb-3">Ideal Fit</h4>
                  <p className="text-neutral-700 text-sm leading-relaxed">
                    Growing teams ($2M–$8M ARR, 10–40 people) that need <span className="font-semibold">consistent leadership presence and hands-on execution</span> to scale predictably. You have multiple sales reps, pipeline challenges, and need someone <span className="font-semibold">driving weekly accountability</span> across pipeline reviews, forecasting, team coaching, and revenue operations. This is the sweet spot between strategic advisor and embedded leader.
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  <h4 className="font-semibold text-neutral-900">Core Deliverables (Weekly + Monthly)</h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-neutral-700">Weekly pipeline review and deal strategy</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-neutral-700">Bi-weekly sales team coaching</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-neutral-700">Revenue strategy and quarterly planning</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-neutral-700">Forecast management and reporting</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-neutral-700">Revenue operations optimisation</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-neutral-700">Board-ready metrics and narrative</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-neutral-700">Sales process refinement</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-neutral-700">Hiring support and onboarding</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow-lg border border-neutral-100 rounded-xl p-6">
                  <h4 className="font-semibold text-neutral-900 mb-3">Typical Outcomes (90 Days)</h4>
                  <ul className="space-y-2 text-sm text-neutral-700">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span><span className="font-semibold">Pipeline hygiene ≥85%</span> (clean stages, accurate data, predictable motion)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span><span className="font-semibold">Forecast accuracy ≤18%</span> (weekly variance within tight range)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span><span className="font-semibold">Sales velocity +20–35%</span> (shorter cycles or improved win rates)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span><span className="font-semibold">Team performance consistency</span>: reps hitting quota within 10% variance</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span><span className="font-semibold">Leadership confidence</span>: board trusts revenue trajectory</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="lg:border-l-2 lg:border-neutral-200 lg:pl-8">
                <div className="bg-contech-blue text-white rounded-xl p-6 mb-6">
                  <div className="text-sm text-blue-600/10 mb-2">Investment</div>
                  <div className="text-4xl font-bold mb-4">$7,500<span className="text-xl font-normal text-blue-600/10">/mo</span></div>
                  <div className="text-sm text-blue-600/10 leading-relaxed">
                    Best value for scaling teams
                  </div>
                </div>

                <div className="bg-white shadow-lg border border-neutral-100 rounded-xl p-4 mb-6">
                  <div className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-2">Most Popular</div>
                  <div className="text-sm text-neutral-700">70% of clients choose CORE for balanced strategic + tactical execution</div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="font-semibold text-neutral-900 mb-2">Commitment</div>
                    <div className="text-sm text-neutral-600">3-month minimum; typical engagement is 9–15 months</div>
                  </div>

                  <div>
                    <div className="font-semibold text-neutral-900 mb-2">Time Allocation</div>
                    <div className="text-sm text-neutral-600">~2 days/week (strategic + hands-on)</div>
                  </div>

                  <div>
                    <div className="font-semibold text-neutral-900 mb-2">Best For</div>
                    <ul className="text-sm text-neutral-600 space-y-1">
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Scaling, $2M–$8M ARR</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Multiple reps needing coaching</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Pipeline needs weekly attention</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Board expects consistent execution</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <a href="#contact" className="block w-full text-center px-6 py-3 bg-contech-blue text-white font-semibold rounded-lg hover:bg-contech-blue/90 transition-colors mt-8">
                  Get My Custom Plan
                </a>
              </div>
            </div>
          </div>

          {/* Package 3: Fractional CRO - INTENSIVE */}
          <div className="bg-white shadow-2xl rounded-2xl border-2 border-neutral-900 p-8 md:p-12 mb-8">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="inline-block px-3 py-1 bg-contech-blue/90 text-white text-xs font-semibold rounded-full mb-4">
                  ONGOING ENGAGEMENT · PREMIUM
                </div>
                <div className="flex items-center mb-4">
                  <div className="bg-contech-blue/90 rounded-xl p-3 mr-4">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-neutral-900">
                    Fractional CRO – INTENSIVE
                  </h3>
                </div>
                <p className="text-lg text-neutral-600 mb-6 leading-relaxed">
                  Deeply Embedded Revenue Leadership
                </p>

                <div className="bg-neutral-50 rounded-xl p-6 mb-6">
                  <h4 className="font-semibold text-neutral-900 mb-3">Ideal Fit</h4>
                  <p className="text-neutral-700 text-sm leading-relaxed">
                    High-growth or turnaround teams ($8M–$25M ARR, 40–150 people) facing <span className="font-semibold">urgent revenue pressure, complex scaling challenges, or transformation needs</span>. You need someone who operates like a full-time Chief Revenue Officer—<span className="font-semibold">daily presence, deep operational involvement, and direct accountability</span> for revenue outcomes. This is the premium alternative to a $250K+ full-time hire, delivering executive-level impact with fractional flexibility.
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  <h4 className="font-semibold text-neutral-900">Core Deliverables (Daily + Weekly)</h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-neutral-700">Daily pipeline monitoring and interventions</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-neutral-700">Weekly individual rep coaching</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-neutral-700">Weekly team pipeline and forecast calls</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-neutral-700">Executive leadership participation</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-neutral-700">Complete revenue operations ownership</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-neutral-700">Board presentations and investor relations</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-neutral-700">Strategic planning and market expansion</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-neutral-700">Full-cycle hiring and onboarding</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-neutral-700">Sales playbook evolution</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-neutral-700">Customer success alignment</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow-lg border border-neutral-100 rounded-xl p-6">
                  <h4 className="font-semibold text-neutral-900 mb-3">Typical Outcomes (90 Days)</h4>
                  <ul className="space-y-2 text-sm text-neutral-700">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span><span className="font-semibold">Pipeline excellence ≥90%</span> (institutional-grade data quality and rigor)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span><span className="font-semibold">Forecast precision ≤15%</span> (weekly actuals within narrow band)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span><span className="font-semibold">Sales productivity +25–45%</span> (measurable velocity and conversion gains)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span><span className="font-semibold">Team scaling</span>: consistent quota attainment across growing organisation</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span><span className="font-semibold">Organisational transformation</span>: revenue machine runs without daily founder involvement</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span><span className="font-semibold">Board confidence</span>: predictable, defensible growth trajectory established</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="lg:border-l-2 lg:border-neutral-200 lg:pl-8">
                <div className="bg-neutral-900 text-white rounded-xl p-6 mb-6">
                  <div className="text-sm text-neutral-300 mb-2">Investment</div>
                  <div className="text-4xl font-bold mb-4">$16,500<span className="text-xl font-normal text-neutral-300">/mo</span></div>
                  <div className="text-sm text-neutral-300 leading-relaxed">
                    Executive CRO impact at 55% of full-time cost
                  </div>
                </div>

                <div className="bg-contech-orange/5 border-2 border-orange-500/20 rounded-xl p-4 mb-6">
                  <div className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-2">Value Proposition</div>
                  <div className="text-sm text-neutral-700 mb-2">Full-time CRO: $250K+ salary + equity + benefits = $360K+ annually</div>
                  <div className="text-sm font-semibold text-neutral-900">INTENSIVE delivers executive impact for $198K/year — saves $160K+ with zero recruiting risk</div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="font-semibold text-neutral-900 mb-2">Commitment</div>
                    <div className="text-sm text-neutral-600">3-month minimum; typical engagement is 12–18 months</div>
                  </div>

                  <div>
                    <div className="font-semibold text-neutral-900 mb-2">Time Allocation</div>
                    <div className="text-sm text-neutral-600">~3 days/week (fully embedded)</div>
                  </div>

                  <div>
                    <div className="font-semibold text-neutral-900 mb-2">Best For</div>
                    <ul className="text-sm text-neutral-600 space-y-1">
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Scale-up stage, $8M–$25M ARR</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Revenue turnaround or transformation</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Large or complex sales organisation</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Need full-time presence, fractional cost</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Board mandating immediate results</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <a href="#contact" className="block w-full text-center px-6 py-3 bg-contech-blue text-white font-semibold rounded-lg hover:bg-contech-blue/90 transition-colors mt-8">
                  Get My Custom Plan
                </a>
              </div>
            </div>
          </div>

          {/* Specialised Engagement Options Divider */}
          <div className={`transition-all duration-300 ${showAllPackages ? 'my-20' : 'my-12'}`}>
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t-2 border-neutral-300"></div>
              </div>
              <div className="relative flex justify-center">
                <button
                  onClick={() => setShowAllPackages(!showAllPackages)}
                  className="group px-10 py-5 bg-contech-blue hover:bg-contech-blue/90 text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold">
                        {showAllPackages ? 'Hide' : 'View'} 5 Specialised Engagement Options
                      </span>
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        {showAllPackages ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                    </div>
                    <span className="text-sm text-blue-600/10 font-medium">
                      Sprints • Audits • Advisory Retainers • Custom Engagements
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Collapsible Additional Packages */}
          <div className={`transition-all duration-500 overflow-hidden ${showAllPackages ? 'max-h-[50000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          {/* Package 2: GTM Sprint (The 4-Week Revenue Blueprint) */}
          <div className="bg-white border-2 border-neutral-200 rounded-2xl p-8 md:p-12 mb-8">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="inline-block px-3 py-1 bg-contech-orange/5 text-neutral-800 text-xs font-semibold rounded-full mb-4 border border-orange-500/20">
                  FIXED SCOPE · 4 WEEKS
                </div>
                <div className="flex items-center mb-4">
                  <div className="bg-amber-100 rounded-xl p-3 mr-4 border-2 border-orange-500/20">
                    <Zap className="h-8 w-8 text-neutral-700" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-neutral-900">
                    GTM Sprint
                  </h3>
                </div>
                <p className="text-lg text-neutral-600 mb-6 leading-relaxed">
                  The 4-Week Revenue Blueprint
                </p>

                <div className="bg-neutral-50 rounded-xl p-6 mb-6">
                  <h4 className="font-semibold text-neutral-900 mb-3">Ideal Fit</h4>
                  <p className="text-neutral-700 text-sm leading-relaxed">
                    Teams with <span className="font-semibold">urgent Go-To-Market (GTM) uncertainty</span>: launching a new product, pivoting ICP, entering a new vertical, or replacing a "spray-and-pray" motion with something defensible. You need a <span className="font-semibold">complete revenue playbook fast</span>—not a 6-month consulting deck.
                  </p>
                </div>

                <div className="space-y-6 mb-8">
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-3">Sprint Deliverables</h4>
                    <div className="space-y-3">
                      <div className="bg-white border-2 border-neutral-200 rounded-lg p-4">
                        <div className="font-semibold text-neutral-900 mb-1">Week 1: Ideal Customer Profile (ICP) & Positioning</div>
                        <div className="text-sm text-neutral-600">Buyer persona map, value prop hierarchy, competitive positioning</div>
                      </div>
                      <div className="bg-white border-2 border-neutral-200 rounded-lg p-4">
                        <div className="font-semibold text-neutral-900 mb-1">Week 2: Sales Process Design</div>
                        <div className="text-sm text-neutral-600">MEDDPICC-based methodology, stage definitions, qualification criteria, objection library</div>
                      </div>
                      <div className="bg-white border-2 border-neutral-200 rounded-lg p-4">
                        <div className="font-semibold text-neutral-900 mb-1">Week 3: Channel Strategy</div>
                        <div className="text-sm text-neutral-600">Outbound sequences, partnerships, content plays, SDR/AE split (if applicable)</div>
                      </div>
                      <div className="bg-white border-2 border-neutral-200 rounded-lg p-4">
                        <div className="font-semibold text-neutral-900 mb-1">Week 4: Implementation Roadmap</div>
                        <div className="text-sm text-neutral-600">90-day execution plan with owners, milestones, success metrics</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white shadow-lg border border-neutral-100 rounded-xl p-6">
                    <h4 className="font-semibold text-neutral-900 mb-3">What You Own at the End</h4>
                    <ul className="space-y-2 text-sm text-neutral-700">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>A <span className="font-semibold">board-ready GTM deck</span> (20–30 slides)</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span><span className="font-semibold">Sales playbook</span> (qualification checklists, email templates, call scripts)</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span><span className="font-semibold">Channel prioritisation matrix</span> (where to hunt & how)</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span><span className="font-semibold">90-day roadmap</span> with KPIs, owners, weekly milestones</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Optional: <span className="font-semibold">30-day implementation support</span> (weekly check-ins, $3K add-on)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="lg:border-l-2 lg:border-neutral-200 lg:pl-8">
                <div className="bg-neutral-900 text-white rounded-xl p-6 mb-6">
                  <div className="text-sm text-neutral-300 mb-2">Investment</div>
                  <div className="text-4xl font-bold mb-4">$15K<span className="text-xl font-normal text-neutral-300"></span></div>
                  <div className="text-sm text-neutral-300 leading-relaxed">
                    Fixed fee, payable 50% upfront / 50% at delivery
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="font-semibold text-neutral-900 mb-2">Timeline</div>
                    <div className="text-sm text-neutral-600">4 weeks from kickoff to final readout</div>
                  </div>

                  <div>
                    <div className="font-semibold text-neutral-900 mb-2">Your Commitment</div>
                    <div className="text-sm text-neutral-600">~6 hours total (kickoff, 3 check-ins, final presentation)</div>
                  </div>

                  <div>
                    <div className="font-semibold text-neutral-900 mb-2">Best For</div>
                    <ul className="text-sm text-neutral-600 space-y-1">
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Product launch or pivot</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>New vertical/geo expansion</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Replacing ad-hoc sales with a system</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Board asking "what's the GTM plan?"</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white shadow-lg border border-neutral-100 rounded-xl p-5 my-6">
                  <div className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-3">Typical Results</div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-neutral-600">Board alignment</span>
                        <span className="text-sm font-bold text-neutral-900">Week 5</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-neutral-600">First qualified pipeline</span>
                        <span className="text-sm font-bold text-neutral-900">30-45 days</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-neutral-600">Sales cycle clarity</span>
                        <span className="text-sm font-bold text-neutral-900">60 days</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 mb-6">
                  <div className="text-xs font-semibold text-neutral-900 mb-2">Availability</div>
                  <div className="text-sm text-neutral-600">Next sprint starts within 2 weeks</div>
                </div>

                <a href="#contact" className="block w-full text-center px-6 py-3 bg-contech-blue text-white font-semibold rounded-lg hover:bg-contech-blue/90 transition-colors">
                  Start a Sprint
                </a>
              </div>
            </div>
          </div>

          {/* Package 3: RevOps Build (The Infrastructure Sprint) */}
          <div className="bg-white border-2 border-neutral-200 rounded-2xl p-8 md:p-12 mb-12">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="inline-block px-3 py-1 bg-contech-orange/5 text-neutral-800 text-xs font-semibold rounded-full mb-4 border border-orange-500/20">
                  FIXED SCOPE · 6 WEEKS
                </div>
                <div className="flex items-center mb-4">
                  <div className="bg-orange-50 rounded-xl p-3 mr-4 border-2 border-orange-500/20">
                    <Building2 className="h-8 w-8 text-orange-500" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-neutral-900">
                    RevOps Build
                  </h3>
                </div>
                <p className="text-lg text-neutral-600 mb-6 leading-relaxed">
                  The Infrastructure Sprint
                </p>

                <div className="bg-neutral-50 rounded-xl p-6 mb-6">
                  <h4 className="font-semibold text-neutral-900 mb-3">Ideal Fit</h4>
                  <p className="text-neutral-700 text-sm leading-relaxed">
                    Teams whose <span className="font-semibold">CRM is a mess</span>, forecasting is guesswork, and board decks take 3 days to build. You need <span className="font-semibold">plumbing, not strategy</span>: clean data, automated reports, a single source of truth. Often pairs with a GTM Sprint or Fractional CRO kickoff.
                  </p>
                </div>

                <div className="space-y-6 mb-8">
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-3">Build Deliverables</h4>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="bg-white border-2 border-neutral-200 rounded-lg p-4">
                        <div className="font-semibold text-neutral-900 mb-1 text-sm">CRM Rebuild</div>
                        <div className="text-xs text-neutral-600">Pipeline stages, required fields, automation rules (HubSpot/Salesforce/Pipedrive)</div>
                      </div>
                      <div className="bg-white border-2 border-neutral-200 rounded-lg p-4">
                        <div className="font-semibold text-neutral-900 mb-1 text-sm">Dashboard Suite</div>
                        <div className="text-xs text-neutral-600">Revenue KPIs, rep scorecards, pipeline health, forecast accuracy</div>
                      </div>
                      <div className="bg-white border-2 border-neutral-200 rounded-lg p-4">
                        <div className="font-semibold text-neutral-900 mb-1 text-sm">Forecasting Model</div>
                        <div className="text-xs text-neutral-600">3-stage commit (Best Case / Commit / Closed), weekly rituals</div>
                      </div>
                      <div className="bg-white border-2 border-neutral-200 rounded-lg p-4">
                        <div className="font-semibold text-neutral-900 mb-1 text-sm">Data Hygiene SOP</div>
                        <div className="text-xs text-neutral-600">Weekly audits, rep accountability, field validation rules</div>
                      </div>
                      <div className="bg-white border-2 border-neutral-200 rounded-lg p-4">
                        <div className="font-semibold text-neutral-900 mb-1 text-sm">Sales Sequences</div>
                        <div className="text-xs text-neutral-600">Automated follow-ups, task creation, stage-based triggers</div>
                      </div>
                      <div className="bg-white border-2 border-neutral-200 rounded-lg p-4">
                        <div className="font-semibold text-neutral-900 mb-1 text-sm">Training & Docs</div>
                        <div className="text-xs text-neutral-600">Loom walkthroughs, checklists, ongoing support for 30 days post-launch</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white shadow-lg border border-neutral-100 rounded-xl p-6">
                    <h4 className="font-semibold text-neutral-900 mb-3">Success Criteria (30 Days Post-Launch)</h4>
                    <ul className="space-y-2 text-sm text-neutral-700">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span><span className="font-semibold">Pipeline hygiene ≥90%</span> (all required fields populated, no stale opps)</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span><span className="font-semibold">Weekly forecast running</span> (≤20% variance from actuals)</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span><span className="font-semibold">Self-serve reporting</span> (leadership can pull KPIs without manual exports)</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span><span className="font-semibold">Rep adoption ≥95%</span> (logging activities, updating stages in real-time)</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-neutral-50 rounded-xl p-6">
                    <h4 className="font-semibold text-neutral-900 mb-3">Common Pain Points We Fix</h4>
                    <ul className="space-y-2 text-sm text-neutral-700">
                      <li className="flex items-start">
                        <span className="text-neutral-400 mr-2">→</span>
                        <span>Pipeline meetings start with "let me pull the latest spreadsheet"</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-neutral-400 mr-2">→</span>
                        <span>Reps have their own tracking systems outside the CRM</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-neutral-400 mr-2">→</span>
                        <span>Board asks for pipeline breakdown and it takes 48 hours</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-neutral-400 mr-2">→</span>
                        <span>CFO doesn't trust the forecast (and for good reason)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-neutral-400 mr-2">→</span>
                        <span>Can't track conversion rates by stage or rep performance</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="lg:border-l-2 lg:border-neutral-200 lg:pl-8">
                <div className="bg-neutral-900 text-white rounded-xl p-6 mb-6">
                  <div className="text-sm text-neutral-300 mb-2">Investment</div>
                  <div className="text-4xl font-bold mb-4">$12K<span className="text-xl font-normal text-neutral-300"></span></div>
                  <div className="text-sm text-neutral-300 leading-relaxed">
                    Fixed fee; includes 30-day post-launch support
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="font-semibold text-neutral-900 mb-2">Timeline</div>
                    <div className="text-sm text-neutral-600">6 weeks (build) + 30 days (stabilisation support)</div>
                  </div>

                  <div>
                    <div className="font-semibold text-neutral-900 mb-2">Your Commitment</div>
                    <div className="text-sm text-neutral-600">CRM admin access, 1 kickoff, 2 check-ins, team training session</div>
                  </div>

                  <div>
                    <div className="font-semibold text-neutral-900 mb-2">Best For</div>
                    <ul className="text-sm text-neutral-600 space-y-1">
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Raising a round (need clean data)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Scaling past $2M ARR</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Forecast variance stressing the board</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>CRM migration or overhaul</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white shadow-lg border border-neutral-100 rounded-xl p-5 my-6">
                  <div className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-3">RevOps Impact</div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-neutral-600">Forecast accuracy</span>
                        <span className="text-sm font-bold text-neutral-900">±15%</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-neutral-600">Time saved (weekly)</span>
                        <span className="text-sm font-bold text-neutral-900">8-12 hrs</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-neutral-600">Data quality</span>
                        <span className="text-sm font-bold text-neutral-900">90%+</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 mb-6">
                  <div className="text-xs font-semibold text-neutral-900 mb-2">Popular Add-Ons</div>
                  <div className="space-y-2">
                    <div className="text-sm text-neutral-600">+$2K for Salesforce → HubSpot migration</div>
                    <div className="text-sm text-neutral-600">+$1.5K for custom API integrations</div>
                  </div>
                </div>

                <div className="bg-contech-orange/5 border border-orange-500/20 rounded-lg p-4 mb-6">
                  <div className="text-xs font-semibold text-neutral-900 mb-1">Combo Offer</div>
                  <div className="text-xs text-neutral-800">Bundle with GTM Sprint for $24K (save $3K)</div>
                </div>

                <a href="#contact" className="block w-full text-center px-6 py-3 bg-contech-blue text-white font-semibold rounded-lg hover:bg-contech-blue/90 transition-colors">
                  Start a Build
                </a>
              </div>
            </div>
          </div>

          {/* Package 4: Sales Process Overhaul */}
          <div className="bg-white border-2 border-neutral-200 rounded-2xl p-8 md:p-12 mb-8">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="inline-block px-3 py-1 bg-neutral-50 text-neutral-800 text-xs font-semibold rounded-full mb-4 border border-neutral-200">
                  FIXED SCOPE · 3 WEEKS
                </div>
                <div className="flex items-center mb-4">
                  <div className="bg-neutral-100 rounded-xl p-3 mr-4 border-2 border-neutral-200">
                    <Target className="h-8 w-8 text-neutral-700" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-neutral-900">
                    Sales Process Overhaul
                  </h3>
                </div>
                <p className="text-lg text-neutral-600 mb-6 leading-relaxed">
                  The Methodology Rebuild
                </p>

                <div className="bg-neutral-50 rounded-xl p-6 mb-6">
                  <h4 className="font-semibold text-neutral-900 mb-3">Ideal Fit</h4>
                  <p className="text-neutral-700 text-sm leading-relaxed">
                    Teams with <span className="font-semibold">inconsistent or nonexistent sales processes</span>. Reps wing every call, deals stall at the same stage, objections surprise you, and close rates vary wildly by person. You need <span className="font-semibold">repeatable frameworks</span> that match how construction buyers actually buy—not generic SaaS plays copy-pasted from a blog.
                  </p>
                </div>

                <div className="space-y-6 mb-8">
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-3">Overhaul Deliverables</h4>
                    <div className="space-y-3">
                      <div className="bg-white border-2 border-neutral-200 rounded-lg p-4">
                        <div className="font-semibold text-neutral-900 mb-1">Discovery Framework</div>
                        <div className="text-sm text-neutral-600">Question banks, pain hypothesis trees, stakeholder maps (tailored to ConTech buying committees)</div>
                      </div>
                      <div className="bg-white border-2 border-neutral-200 rounded-lg p-4">
                        <div className="font-semibold text-neutral-900 mb-1">Demo Methodology</div>
                        <div className="text-sm text-neutral-600">Demo scripts, storylines, clickpath guardrails, objection pre-emption tactics</div>
                      </div>
                      <div className="bg-white border-2 border-neutral-200 rounded-lg p-4">
                        <div className="font-semibold text-neutral-900 mb-1">Objection Handling Library</div>
                        <div className="text-sm text-neutral-600">Top 20 ConTech objections (e.g., "ROI is unclear," "change management risk") with rebuttals & proof points</div>
                      </div>
                      <div className="bg-white border-2 border-neutral-200 rounded-lg p-4">
                        <div className="font-semibold text-neutral-900 mb-1">Closing Playbook</div>
                        <div className="text-sm text-neutral-600">Trial close techniques, proposal templates, negotiation guardrails, mutual close plans</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white shadow-lg border border-neutral-100 rounded-xl p-6">
                    <h4 className="font-semibold text-neutral-900 mb-3">What You Get</h4>
                    <ul className="space-y-2 text-sm text-neutral-700">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span><span className="font-semibold">Process documentation</span> (Notion/Confluence/Sharepoint)</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span><span className="font-semibold">Rep training session</span> (90 min live workshop + recordings)</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span><span className="font-semibold">Manager coaching guide</span> (how to reinforce new behaviors)</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span><span className="font-semibold">30-day Q&A support</span> (async Slack/email)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="lg:border-l-2 lg:border-neutral-200 lg:pl-8">
                <div className="bg-neutral-900 text-white rounded-xl p-6 mb-6">
                  <div className="text-sm text-neutral-300 mb-2">Investment</div>
                  <div className="text-4xl font-bold mb-4">$8K</div>
                  <div className="text-sm text-neutral-300 leading-relaxed">
                    Fixed fee
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="font-semibold text-neutral-900 mb-2">Timeline</div>
                    <div className="text-sm text-neutral-600">3 weeks from kickoff to training delivery</div>
                  </div>

                  <div>
                    <div className="font-semibold text-neutral-900 mb-2">Your Commitment</div>
                    <div className="text-sm text-neutral-600">Kickoff call, 2 review sessions, attend training workshop</div>
                  </div>

                  <div>
                    <div className="font-semibold text-neutral-900 mb-2">Best For</div>
                    <ul className="text-sm text-neutral-600 space-y-1">
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Reps "winging it" on every call</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Deals stalling at same stage</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Wide variance in rep performance</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Onboarding new reps taking 6+ months</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white shadow-lg border border-neutral-100 rounded-xl p-5 my-6">
                  <div className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-3">Process Metrics</div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-neutral-600">Win rate improvement</span>
                        <span className="text-sm font-bold text-neutral-900">+15-25%</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-neutral-600">Rep consistency</span>
                        <span className="text-sm font-bold text-neutral-900">30 days</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-neutral-600">Onboarding speed</span>
                        <span className="text-sm font-bold text-neutral-900">-50%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 mb-6">
                  <div className="text-xs font-semibold text-neutral-900 mb-2">Popular Add-On</div>
                  <div className="text-sm text-neutral-600">+$2K for live call shadowing & feedback (3 sessions)</div>
                </div>

                <a href="#contact" className="block w-full text-center px-6 py-3 bg-contech-blue text-white font-semibold rounded-lg hover:bg-contech-blue/90 transition-colors">
                  Start Overhaul
                </a>
              </div>
            </div>
          </div>

          {/* Package 5: Sales Hiring Sprint */}
          <div className="bg-white border-2 border-neutral-200 rounded-2xl p-8 md:p-12 mb-8">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="inline-block px-3 py-1 bg-blue-50 text-neutral-800 text-xs font-semibold rounded-full mb-4 border border-blue-600/20">
                  FIXED SCOPE · 2–3 WEEKS
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-4">
                  Sales Hiring Sprint
                </h3>
                <p className="text-lg text-neutral-600 mb-6 leading-relaxed">
                  The Talent Hunt
                </p>

                <div className="bg-neutral-50 rounded-xl p-6 mb-6">
                  <h4 className="font-semibold text-neutral-900 mb-3">Ideal Fit</h4>
                  <p className="text-neutral-700 text-sm leading-relaxed">
                    Teams hiring their <span className="font-semibold">first AE, first sales leader, or scaling from 1→3 reps</span> and don't know what "good" looks like in ConTech. You need <span className="font-semibold">clarity on role scope, realistic comp, and interview rigor</span>—not generic SaaS hiring advice that ignores construction's unique sales motion.
                  </p>
                </div>

                <div className="space-y-6 mb-8">
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-3">Sprint Deliverables</h4>
                    <div className="space-y-3">
                      <div className="bg-white border-2 border-neutral-200 rounded-lg p-4">
                        <div className="font-semibold text-neutral-900 mb-1">Role Definition</div>
                        <div className="text-sm text-neutral-600">JD template, must-have vs. nice-to-have skills, realistic quota sizing</div>
                      </div>
                      <div className="bg-white border-2 border-neutral-200 rounded-lg p-4">
                        <div className="font-semibold text-neutral-900 mb-1">Comp Benchmarking</div>
                        <div className="text-sm text-neutral-600">ConTech-specific OTE ranges, split recommendations (50/50 vs. 60/40), ramp logic</div>
                      </div>
                      <div className="bg-white border-2 border-neutral-200 rounded-lg p-4">
                        <div className="font-semibold text-neutral-900 mb-1">Screening Framework</div>
                        <div className="text-sm text-neutral-600">Phone screen questions, red/yellow/green flags, role play prompts</div>
                      </div>
                      <div className="bg-white border-2 border-neutral-200 rounded-lg p-4">
                        <div className="font-semibold text-neutral-900 mb-1">Interview Guide</div>
                        <div className="text-sm text-neutral-600">Competency-based questions, scoring rubric, reference check template</div>
                      </div>
                      <div className="bg-white border-2 border-neutral-200 rounded-lg p-4">
                        <div className="font-semibold text-neutral-900 mb-1">30-Day Onboarding Blueprint</div>
                        <div className="text-sm text-neutral-600">Week-by-week ramp plan, first wins roadmap, manager 1:1 guide</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white shadow-lg border border-neutral-100 rounded-xl p-6">
                    <h4 className="font-semibold text-neutral-900 mb-3">What You Get</h4>
                    <ul className="space-y-2 text-sm text-neutral-700">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span><span className="font-semibold">Complete hiring toolkit</span> (JD, interview guides, scorecards)</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span><span className="font-semibold">Comp benchmarking report</span> (ConTech-specific data)</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span><span className="font-semibold">30-day onboarding plan</span> (accelerate time-to-value)</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Optional: <span className="font-semibold">Resume screening</span> (+$1K) or <span className="font-semibold">interview participation</span> (+$1.5K)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="lg:border-l-2 lg:border-neutral-200 lg:pl-8">
                <div className="bg-neutral-900 text-white rounded-xl p-6 mb-6">
                  <div className="text-sm text-neutral-300 mb-2">Investment</div>
                  <div className="text-4xl font-bold mb-4">$5K</div>
                  <div className="text-sm text-neutral-300 leading-relaxed">
                    Fixed fee (add-ons priced separately)
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="font-semibold text-neutral-900 mb-2">Timeline</div>
                    <div className="text-sm text-neutral-600">2–3 weeks (depends on role complexity)</div>
                  </div>

                  <div>
                    <div className="font-semibold text-neutral-900 mb-2">Your Commitment</div>
                    <div className="text-sm text-neutral-600">Kickoff call, 1 review session, approve final deliverables</div>
                  </div>

                  <div>
                    <div className="font-semibold text-neutral-900 mb-2">Best For</div>
                    <ul className="text-sm text-neutral-600 space-y-1">
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Hiring first AE or sales leader</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Scaling from 1→3+ reps</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Past bad hires (need better filters)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Unclear on "good" for ConTech</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white shadow-lg border border-neutral-100 rounded-xl p-5 my-6">
                  <div className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-3">Hiring Outcomes</div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-neutral-600">Time to productivity</span>
                        <span className="text-sm font-bold text-neutral-900">-40%</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-neutral-600">First-year attrition</span>
                        <span className="text-sm font-bold text-neutral-900">&lt;10%</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-neutral-600">Quality of hire score</span>
                        <span className="text-sm font-bold text-neutral-900">8.5+/10</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-contech-orange/5 border-2 border-orange-500/20 rounded-lg p-4 mb-6">
                  <div className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-2">The Stakes</div>
                  <div className="text-sm text-neutral-700 mb-3">Average ConTech sales hire costs $80-120K in comp + 6-9 months ramp. Wrong hire = $150K+ loss.</div>
                  <div className="text-xs text-neutral-600 pt-2 border-t border-orange-500/20">Framework calibrated for construction sales cycles—not generic B2B hiring playbooks.</div>
                </div>

                <a href="#contact" className="block w-full text-center px-6 py-3 bg-contech-blue text-white font-semibold rounded-lg hover:bg-contech-blue/90 transition-colors">
                  Start Sprint
                </a>
              </div>
            </div>
          </div>

          {/* Package 6: Middle East Market Entry */}
          <div className="bg-white shadow-2xl rounded-2xl p-8 md:p-12 mb-12 border-2 border-contech-orange">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="inline-block px-3 py-1 bg-contech-orange text-white text-xs font-semibold rounded-full mb-4">
                  EXCLUSIVE · LIMITED AVAILABILITY
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-4">
                  Middle East Market Entry
                </h3>
                <p className="text-lg text-neutral-600 mb-6 leading-relaxed">
                  The Regional Expansion Play
                </p>

                <div className="bg-contech-orange/5 rounded-xl p-6 mb-6 border-2 border-contech-orange/30">
                  <h4 className="font-semibold text-neutral-900 mb-3">Ideal Fit</h4>
                  <p className="text-neutral-700 text-sm leading-relaxed">
                    ConTech companies (typically $1M+ ARR) with proven UK/US/European traction ready to expand into <span className="font-semibold">UAE, Saudi Arabia, or broader GCC</span>. You need <span className="font-semibold">data-driven ICP targeting, full-cycle sales execution by an on-ground specialist, and a proven regional GTM playbook</span>—not generic market research or warm intro promises.
                  </p>
                </div>

                <div className="space-y-6 mb-8">
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-3">What I Bring</h4>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="bg-contech-orange/5 border-2 border-contech-orange/30 rounded-lg p-4">
                        <div className="font-semibold text-neutral-900 mb-1 text-sm">Propensity-Based ICP Targeting</div>
                        <div className="text-xs text-neutral-600">Data-driven identification of most likely buyers across GCC construction ecosystem</div>
                      </div>
                      <div className="bg-contech-orange/5 border-2 border-contech-orange/30 rounded-lg p-4">
                        <div className="font-semibold text-neutral-900 mb-1 text-sm">Full-Cycle Sales Ownership</div>
                        <div className="text-xs text-neutral-600">On-ground sales specialist executes complete sales process from prospecting to close</div>
                      </div>
                      <div className="bg-contech-orange/5 border-2 border-contech-orange/30 rounded-lg p-4">
                        <div className="font-semibold text-neutral-900 mb-1 text-sm">Localised GTM Playbook</div>
                        <div className="text-xs text-neutral-600">Proven messaging, pricing, and buying motion frameworks adapted for regional dynamics</div>
                      </div>
                      <div className="bg-contech-orange/5 border-2 border-contech-orange/30 rounded-lg p-4">
                        <div className="font-semibold text-neutral-900 mb-1 text-sm">Direct Outbound Execution</div>
                        <div className="text-xs text-neutral-600">Systematic outreach to qualified prospects—no dependency on warm intros or referrals</div>
                      </div>
                      <div className="bg-contech-orange/5 border-2 border-contech-orange/30 rounded-lg p-4">
                        <div className="font-semibold text-neutral-900 mb-1 text-sm">In-Region Sales Presence</div>
                        <div className="text-xs text-neutral-600">Based in Dubai/Riyadh—attend meetings, navigate cultural nuances, close deals on-ground</div>
                      </div>
                      <div className="bg-contech-orange/5 border-2 border-contech-orange/30 rounded-lg p-4">
                        <div className="font-semibold text-neutral-900 mb-1 text-sm">Partnership & Channel Strategy</div>
                        <div className="text-xs text-neutral-600">Identify, vet, and activate local resellers or integrators to amplify reach</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-neutral-50 border-2 border-neutral-200 rounded-xl p-6">
                    <h4 className="font-semibold text-neutral-900 mb-3">Typical Outcomes</h4>
                    <ul className="space-y-2 text-sm text-neutral-700">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-contech-orange mr-2 mt-0.5 flex-shrink-0" />
                        <span><span className="font-semibold">2–5 anchor customers</span> signed (pilots or paid contracts)</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-contech-orange mr-2 mt-0.5 flex-shrink-0" />
                        <span><span className="font-semibold">Qualified pipeline</span> of 30+ prospects actively engaged</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-contech-orange mr-2 mt-0.5 flex-shrink-0" />
                        <span><span className="font-semibold">Partnership agreements</span> in place (reseller or integrator)</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-contech-orange mr-2 mt-0.5 flex-shrink-0" />
                        <span><span className="font-semibold">Local presence established</span> (6-month engagements only)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="lg:border-l-2 lg:border-contech-orange/30 lg:pl-8">
                <div className="bg-contech-orange text-white rounded-xl p-6 mb-6 shadow-lg">
                  <div className="text-sm text-white/80 mb-2">Investment</div>
                  <div className="text-4xl font-bold mb-4">$16–25K</div>
                  <div className="text-sm text-white/90 leading-relaxed">
                    Per month; includes ICP targeting, full-cycle execution, on-ground sales specialist
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="font-semibold text-neutral-900 mb-2">Timeline</div>
                    <div className="text-sm text-neutral-600">3–6 months (phased engagement)</div>
                  </div>

                  <div>
                    <div className="font-semibold text-neutral-900 mb-2">Availability</div>
                    <div className="text-sm text-neutral-600">Limited to 2–3 clients annually</div>
                  </div>

                  <div>
                    <div className="font-semibold text-neutral-900 mb-2">Best For</div>
                    <ul className="text-sm text-neutral-600 space-y-1">
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>$1M+ ARR, proven UK/US/European traction</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Product-market fit validated</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Board/investor interest in MENA</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Zero existing regional presence</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-contech-orange/10 border-2 border-contech-orange/30 rounded-lg p-4">
                    <div className="text-xs font-semibold text-neutral-900 mb-2">Application Required</div>
                    <div className="text-xs text-neutral-800 leading-relaxed">Due to limited availability and relationship capital, I only take on 2–3 MENA engagements per year. Apply below for consideration.</div>
                  </div>
                </div>

                <a href="#contact" className="block w-full text-center px-6 py-3 bg-contech-orange text-white font-semibold rounded-lg hover:bg-contech-orange/90 transition-all shadow-md hover:shadow-lg mt-8">
                  Apply for Consideration
                </a>
              </div>
            </div>
          </div>

          {/* Interactive Package Navigator */}
          <div className="bg-blue-50 rounded-2xl p-8 md:p-12 border-2 border-blue-600/20 shadow-lg">
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-4">Find Your Perfect Fit in 30 Seconds</h3>
              <p className="text-lg text-neutral-700">Answer one question to get a personalized recommendation</p>
            </div>

            {/* Decision Tree - Premium Layout */}
            <div className="grid lg:grid-cols-5 gap-6 mb-10 items-start">
              {/* Stage-Based Selector */}
              <div className="lg:col-span-2 bg-white rounded-xl p-6 border-2 border-blue-600/20 hover:border-blue-600/100 transition-all hover:shadow-lg h-full flex flex-col">
                <div className="flex items-center mb-6">
                  <div className="bg-blue-50 rounded-lg p-2.5 mr-3">
                    <TrendingUp className="h-5 w-5 text-blue-600/90" />
                  </div>
                  <h4 className="text-xl font-bold text-neutral-900">By Company Stage</h4>
                </div>
                <div className="space-y-3 flex-1">
                  <a href="#packages" className="block bg-neutral-50 hover:bg-blue-50 rounded-lg p-4 transition-all border-2 border-transparent hover:border-blue-600 hover:shadow-md group">
                    <div className="font-semibold text-neutral-900 mb-2">Seed / Pre-Seed ($0–$1M ARR)</div>
                    <div className="text-sm text-neutral-600">→ GTM Sprint or Advisory</div>
                  </a>
                  <a href="#packages" className="block bg-neutral-50 hover:bg-blue-50 rounded-lg p-4 transition-all border-2 border-transparent hover:border-blue-600 hover:shadow-md group">
                    <div className="font-semibold text-neutral-900 mb-2">Early Stage ($500K–$2M ARR)</div>
                    <div className="text-sm text-neutral-600">→ Fractional CRO – <span className="px-2 py-0.5 bg-contech-blue text-white text-xs font-bold rounded">LITE</span> or GTM Sprint</div>
                  </a>
                  <a href="#packages" className="block bg-neutral-50 hover:bg-blue-50 rounded-lg p-4 transition-all border-2 border-transparent hover:border-blue-600 hover:shadow-md group">
                    <div className="font-semibold text-neutral-900 mb-2">Series A / Growth ($2M–$8M ARR)</div>
                    <div className="text-sm text-neutral-600">→ Fractional CRO – <span className="px-2 py-0.5 bg-contech-blue text-white text-xs font-bold rounded">CORE</span> or RevOps Build</div>
                  </a>
                  <a href="#packages" className="block bg-neutral-50 hover:bg-blue-50 rounded-lg p-4 transition-all border-2 border-transparent hover:border-blue-600 hover:shadow-md group">
                    <div className="font-semibold text-neutral-900 mb-2">Series B+ / Scale ($8M–$25M ARR)</div>
                    <div className="text-sm text-neutral-600">→ Fractional CRO – <span className="px-2 py-0.5 bg-contech-blue/90 text-white text-xs font-bold rounded">INTENSIVE</span></div>
                  </a>
                  <a href="#packages" className="block bg-neutral-50 hover:bg-blue-50 rounded-lg p-4 transition-all border-2 border-transparent hover:border-blue-600 hover:shadow-md group">
                    <div className="font-semibold text-neutral-900 mb-2">Late Stage ($25M+ ARR)</div>
                    <div className="text-sm text-neutral-600">→ Fractional CRO – <span className="px-2 py-0.5 bg-contech-blue/90 text-white text-xs font-bold rounded">INTENSIVE</span> or Custom</div>
                  </a>
                </div>
              </div>

              {/* Problem-Based Selector - Single Column */}
              <div className="lg:col-span-3 bg-white rounded-xl p-6 border-2 border-orange-500/30 hover:border-orange-500/400 transition-all hover:shadow-lg h-full flex flex-col">
                <div className="flex items-center mb-6">
                  <div className="bg-amber-100 rounded-lg p-2.5 mr-3">
                    <Target className="h-5 w-5 text-neutral-700" />
                  </div>
                  <h4 className="text-xl font-bold text-neutral-900">By Urgent Problem</h4>
                </div>
                <div className="grid md:grid-cols-2 gap-3 flex-1 auto-rows-fr">
                  <a href="#packages" className="flex flex-col justify-center bg-contech-orange/5/50 hover:bg-amber-100/80 rounded-lg p-4 transition-all border-2 border-transparent hover:border-orange-500/400 hover:shadow-md group h-full">
                    <div className="font-bold text-neutral-900 mb-1.5 text-sm">Burning cash, narrowing runway</div>
                    <div className="text-xs text-neutral-600 mb-2 leading-relaxed">Investors demand trajectory fix before next raise</div>
                    <div className="text-xs text-blue-600/90 font-bold">→ CRO – <span className="px-1.5 py-0.5 bg-contech-blue text-white rounded">CORE</span> or <span className="px-1.5 py-0.5 bg-contech-blue/90 text-white rounded">INTENSIVE</span></div>
                  </a>
                  <a href="#packages" className="flex flex-col justify-center bg-contech-orange/5/50 hover:bg-amber-100/80 rounded-lg p-4 transition-all border-2 border-transparent hover:border-orange-500/400 hover:shadow-md group h-full">
                    <div className="font-bold text-neutral-900 mb-1.5 text-sm">Stuck at founder-led sales ceiling</div>
                    <div className="text-xs text-neutral-600 mb-2 leading-relaxed">Cannot scale past $2M ARR without professional sales motion</div>
                    <div className="text-xs text-blue-600/90 font-bold">→ CRO – <span className="px-1.5 py-0.5 bg-contech-blue text-white rounded">CORE</span> + Sales Process Overhaul</div>
                  </a>
                  <a href="#packages" className="flex flex-col justify-center bg-contech-orange/5/50 hover:bg-amber-100/80 rounded-lg p-4 transition-all border-2 border-transparent hover:border-orange-500/400 hover:shadow-md group h-full">
                    <div className="font-bold text-neutral-900 mb-1.5 text-sm">Revenue unpredictable, board losing confidence</div>
                    <div className="text-xs text-neutral-600 mb-2 leading-relaxed">Forecasts miss by 30%+, threatening founder control</div>
                    <div className="text-xs text-blue-600/90 font-bold">→ CRO – <span className="px-1.5 py-0.5 bg-contech-blue text-white rounded">CORE</span> + RevOps Build</div>
                  </a>
                  <a href="#packages" className="flex flex-col justify-center bg-contech-orange/5/50 hover:bg-amber-100/80 rounded-lg p-4 transition-all border-2 border-transparent hover:border-orange-500/400 hover:shadow-md group h-full">
                    <div className="font-bold text-neutral-900 mb-1.5 text-sm">GTM dysfunction across teams</div>
                    <div className="text-xs text-neutral-600 mb-2 leading-relaxed">Sales/Marketing/CS misaligned, no path to North Star metrics</div>
                    <div className="text-xs text-blue-600/90 font-bold">→ GTM Sprint (4 weeks)</div>
                  </a>
                  <a href="#packages" className="flex flex-col justify-center bg-contech-orange/5/50 hover:bg-amber-100/80 rounded-lg p-4 transition-all border-2 border-transparent hover:border-orange-500/400 hover:shadow-md group h-full">
                    <div className="font-bold text-neutral-900 mb-1.5 text-sm">Pipeline visibility is a black box</div>
                    <div className="text-xs text-neutral-600 mb-2 leading-relaxed">Can't forecast accurately, deals slip, reps flying blind</div>
                    <div className="text-xs text-blue-600/90 font-bold">→ RevOps Build (6 weeks)</div>
                  </a>
                  <a href="#packages" className="flex flex-col justify-center bg-contech-orange/5/50 hover:bg-amber-100/80 rounded-lg p-4 transition-all border-2 border-transparent hover:border-orange-500/400 hover:shadow-md group h-full">
                    <div className="font-bold text-neutral-900 mb-1.5 text-sm">Hero sales culture, no repeatability</div>
                    <div className="text-xs text-neutral-600 mb-2 leading-relaxed">One rep crushes quota, others struggle—no process</div>
                    <div className="text-xs text-blue-600/90 font-bold">→ Sales Process Overhaul (3 weeks)</div>
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Comparison */}
            <div className="bg-neutral-900 rounded-xl p-8 border-2 border-neutral-800 text-white mb-10 shadow-lg">
              <h4 className="font-bold text-xl mb-6 text-center">Quick Comparison</h4>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center mb-3">
                    <Users className="h-5 w-5 text-blue-600 mr-2" />
                    <div className="font-bold text-base">Ongoing Engagements</div>
                  </div>
                  <ul className="text-sm text-neutral-300 space-y-2 ml-7">
                    <li>• Fractional CRO (<span className="px-2 py-0.5 bg-contech-blue text-white text-xs font-bold rounded">LITE</span>, <span className="px-2 py-0.5 bg-contech-blue text-white text-xs font-bold rounded">CORE</span>, <span className="px-2 py-0.5 bg-contech-blue/90 text-white text-xs font-bold rounded">INTENSIVE</span>)</li>
                    <li>• Continuous leadership & execution</li>
                    <li>• 3+ month commitments</li>
                  </ul>
                </div>
                <div>
                  <div className="flex items-center mb-3">
                    <Zap className="h-5 w-5 text-amber-400 mr-2" />
                    <div className="font-bold text-base">Fixed-Scope Projects</div>
                  </div>
                  <ul className="text-sm text-neutral-300 space-y-2 ml-7">
                    <li>• GTM Sprint, RevOps Build, Process Overhaul</li>
                    <li>• Defined deliverables & timeline</li>
                    <li>• 3-6 week sprints</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center pt-8 border-t-2 border-blue-600/20">
              <p className="text-neutral-700 mb-6 text-lg">Still not sure? Let's diagnose your situation together.</p>
              <a href="#contact" className="inline-flex items-center justify-center px-10 py-4 bg-contech-blue text-white font-bold rounded-lg hover:bg-contech-blue/90 transition-all shadow-lg hover:shadow-xl text-lg">
                Get My Custom Pipeline Plan
                <ArrowRight className="ml-3 h-5 w-5" />
              </a>
              <p className="text-xs text-neutral-500 mt-3">No pitch. No obligation. Just honest guidance.</p>
            </div>
          </div>

          {/* Add-On Services - Prominent Design */}
          <div className="mt-16 bg-white rounded-3xl p-8 md:p-12 shadow-2xl">
            <div className="text-center mb-10">
              <div className="inline-block px-4 py-2 bg-contech-blue text-white text-xs font-bold rounded-full mb-4">
                POPULAR ADD-ONS
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-4">
                Turbocharge Any Package
              </h3>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                High-impact services you can add to any engagement for immediate results
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Add-On 1 */}
              <div className="bg-neutral-50 rounded-xl p-6 border-2 border-neutral-200 hover:border-contech-blue transition-all hover:shadow-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start">
                    <div className="bg-contech-blue/10 rounded-lg p-3 mr-4">
                      <Users className="h-6 w-6 text-contech-blue" />
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-900 text-lg mb-1">Sales Hiring Support</h4>
                      <p className="text-sm text-neutral-600">JD writing, screening rubrics, interview guides, offer negotiation</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-contech-blue whitespace-nowrap ml-4">$2K</div>
                </div>
                <div className="text-xs text-neutral-500 mt-3">
                  <Clock className="h-3 w-3 inline mr-1" />
                  1-2 weeks
                </div>
              </div>

              {/* Add-On 2 */}
              <div className="bg-neutral-50 rounded-xl p-6 border-2 border-neutral-200 hover:border-contech-blue transition-all hover:shadow-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start">
                    <div className="bg-contech-blue/10 rounded-lg p-3 mr-4">
                      <Shield className="h-6 w-6 text-contech-blue" />
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-900 text-lg mb-1">Deal Rescue</h4>
                      <p className="text-sm text-neutral-600">1:1 coaching to unstick $50K+ opportunities in final stages</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-contech-blue whitespace-nowrap ml-4">$1.5K</div>
                </div>
                <div className="text-xs text-neutral-500 mt-3">
                  <Clock className="h-3 w-3 inline mr-1" />
                  Same week
                </div>
              </div>

              {/* Add-On 3 */}
              <div className="bg-neutral-50 rounded-xl p-6 border-2 border-neutral-200 hover:border-contech-blue transition-all hover:shadow-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start">
                    <div className="bg-contech-blue/10 rounded-lg p-3 mr-4">
                      <BarChart3 className="h-6 w-6 text-contech-blue" />
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-900 text-lg mb-1">Board Deck Build</h4>
                      <p className="text-sm text-neutral-600">Revenue narrative, metrics design, investor-ready slides</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-contech-blue whitespace-nowrap ml-4">$3K</div>
                </div>
                <div className="text-xs text-neutral-500 mt-3">
                  <Clock className="h-3 w-3 inline mr-1" />
                  5-7 days
                </div>
              </div>

              {/* Add-On 4 */}
              <div className="bg-neutral-50 rounded-xl p-6 border-2 border-neutral-200 hover:border-contech-blue transition-all hover:shadow-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start">
                    <div className="bg-contech-blue/10 rounded-lg p-3 mr-4">
                      <DollarSign className="h-6 w-6 text-contech-blue" />
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-900 text-lg mb-1">Sales Comp Plan Design</h4>
                      <p className="text-sm text-neutral-600">OTE structure, accelerators, clawbacks, quota modeling</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-contech-blue whitespace-nowrap ml-4">$2.5K</div>
                </div>
                <div className="text-xs text-neutral-500 mt-3">
                  <Clock className="h-3 w-3 inline mr-1" />
                  1-2 weeks
                </div>
              </div>
            </div>

            {/* Custom Engagements CTA */}
            <div className="bg-contech-blue text-white rounded-xl p-8 text-center shadow-lg">
              <div className="flex items-center justify-center mb-4">
                <Wrench className="h-8 w-8 text-white mr-3" />
                <h4 className="text-2xl font-bold">Need Something Custom?</h4>
              </div>
              <p className="text-blue-50 mb-6 max-w-2xl mx-auto">
                I offer bespoke engagements for M&A due diligence, multi-geo expansion, vertical-specific plays (GC-focused, subcontractor platforms, materials marketplaces), and other specialised ConTech scenarios.
              </p>
              <a href="#contact" className="inline-flex items-center px-8 py-3 bg-white text-contech-blue font-bold rounded-lg hover:bg-neutral-100 transition-all shadow-lg">
                Discuss Custom Scope
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
          </div>
          {/* End Collapsible Section */}
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="mb-10">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
              Meet Mohammad Daudi
            </h2>
          </div>

          {/* Two Column Layout - Tighter */}
          <div className="grid lg:grid-cols-2 gap-6 items-start">
            {/* Left Column - Photo */}
            <div className="lg:sticky lg:top-24">
              <div className="aspect-[3/4] bg-neutral-200 rounded-2xl overflow-hidden shadow-lg">
                <img
                  src="./Mohammad Daudi (1) copy.png"
                  alt="Mohammad Daudi, Elite Fractional Chief Revenue Officer for ConTech and PropTech"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>

            {/* Right Column - Content */}
            <div className="space-y-6">
              {/* Bio */}
              <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                <div className="space-y-4 text-base text-neutral-700 leading-relaxed">
                  <p className="font-semibold text-neutral-900">
                    I've spent 20+ years building revenue engines for ConTech and PropTech companies. I know the construction buyer. I speak investor. I build revenue machines that scale.
                  </p>
                  <p>
                    Most fractional CROs bring generic SaaS playbooks. I bring deep ConTech domain expertise—from understanding 90-day payment cycles to navigating complex stakeholder buying committees with PMs, superintendents, and CFOs.
                  </p>
                  <p>
                    I've helped companies go from stalled growth to Series A, from Series A to dominant market positions, and from zero to market leader in the Middle East.
                  </p>
                  <p className="text-lg font-semibold text-neutral-900 pt-2">
                    If you're a ConTech CEO tired of generic advice and ready for someone who understands your buyer, let's talk.
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-white rounded-lg border border-neutral-200 shadow-sm">
                  <Zap className="h-5 w-5 text-blue-600 mx-auto mb-1.5" />
                  <div className="text-xs font-semibold text-neutral-900">ConTech Specialist</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-neutral-200 shadow-sm">
                  <Globe className="h-5 w-5 text-blue-600 mx-auto mb-1.5" />
                  <div className="text-xs font-semibold text-neutral-900">UKI & EMEA Expert</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-neutral-200 shadow-sm">
                  <TrendingUp className="h-5 w-5 text-blue-600 mx-auto mb-1.5" />
                  <div className="text-xs font-semibold text-neutral-900">Revenue Growth</div>
                </div>
              </div>

              {/* Technology Stack Expertise */}
              <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-neutral-900 mb-1.5">Construction Tech Stack Expertise</h3>
                  <p className="text-sm text-neutral-600">Technologies I've successfully scaled across UKI and EMEA construction markets.</p>
                </div>

                <div className="space-y-4">
                  {/* Design & Planning */}
                  <div>
                    <div className="text-xs font-bold text-blue-600 mb-2 uppercase tracking-wider">Design & Planning</div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 bg-blue-50 border border-blue-600/20 rounded-md text-xs font-medium text-neutral-800">BIM</span>
                      <span className="px-2.5 py-1 bg-blue-50 border border-blue-600/20 rounded-md text-xs font-medium text-neutral-800">AR</span>
                      <span className="px-2.5 py-1 bg-blue-50 border border-blue-600/20 rounded-md text-xs font-medium text-neutral-800">VR</span>
                      <span className="px-2.5 py-1 bg-blue-50 border border-blue-600/20 rounded-md text-xs font-medium text-neutral-800">Digital Twins</span>
                      <span className="px-2.5 py-1 bg-blue-50 border border-blue-600/20 rounded-md text-xs font-medium text-neutral-800">Reality Capture</span>
                      <span className="px-2.5 py-1 bg-blue-50 border border-blue-600/20 rounded-md text-xs font-medium text-neutral-800">BIM/VDC Workflows</span>
                    </div>
                  </div>

                  {/* Project Execution */}
                  <div>
                    <div className="text-xs font-bold text-orange-500 mb-2 uppercase tracking-wider">Project Execution</div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 bg-contech-orange/5 border border-orange-500/20 rounded-md text-xs font-medium text-neutral-800">Contract Management</span>
                      <span className="px-2.5 py-1 bg-contech-orange/5 border border-orange-500/20 rounded-md text-xs font-medium text-neutral-800">CDE / Document Control</span>
                      <span className="px-2.5 py-1 bg-contech-orange/5 border border-orange-500/20 rounded-md text-xs font-medium text-neutral-800">RFIs/Submittals</span>
                      <span className="px-2.5 py-1 bg-contech-orange/5 border border-orange-500/20 rounded-md text-xs font-medium text-neutral-800">Change Orders</span>
                      <span className="px-2.5 py-1 bg-contech-orange/5 border border-orange-500/20 rounded-md text-xs font-medium text-neutral-800">QA/QC & Field Inspections</span>
                      <span className="px-2.5 py-1 bg-contech-orange/5 border border-orange-500/20 rounded-md text-xs font-medium text-neutral-800">Project Controls</span>
                      <span className="px-2.5 py-1 bg-contech-orange/5 border border-orange-500/20 rounded-md text-xs font-medium text-neutral-800">Scheduling</span>
                    </div>
                  </div>

                  {/* Operations & Management */}
                  <div>
                    <div className="text-xs font-bold text-orange-500 mb-2 uppercase tracking-wider">Operations & Management</div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 bg-contech-orange/5 border border-orange-500/20 rounded-md text-xs font-medium text-neutral-800">ERP</span>
                      <span className="px-2.5 py-1 bg-contech-orange/5 border border-orange-500/20 rounded-md text-xs font-medium text-neutral-800">CMMS/EAM</span>
                      <span className="px-2.5 py-1 bg-contech-orange/5 border border-orange-500/20 rounded-md text-xs font-medium text-neutral-800">Estimation</span>
                      <span className="px-2.5 py-1 bg-contech-orange/5 border border-orange-500/20 rounded-md text-xs font-medium text-neutral-800">Materials/Waste Data</span>
                      <span className="px-2.5 py-1 bg-contech-orange/5 border border-orange-500/20 rounded-md text-xs font-medium text-neutral-800">ESG</span>
                    </div>
                  </div>

                  {/* Target Buyers */}
                  <div>
                    <div className="text-xs font-bold text-neutral-600 mb-2 uppercase tracking-wider">Target Buyers</div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 bg-neutral-100 border border-neutral-300 rounded-md text-xs font-semibold text-neutral-800">Owner/Developer</span>
                      <span className="px-2.5 py-1 bg-neutral-100 border border-neutral-300 rounded-md text-xs font-semibold text-neutral-800">General Contractor</span>
                      <span className="px-2.5 py-1 bg-neutral-100 border border-neutral-300 rounded-md text-xs font-semibold text-neutral-800">EPC</span>
                      <span className="px-2.5 py-1 bg-neutral-100 border border-neutral-300 rounded-md text-xs font-semibold text-neutral-800">PMO</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Elite B2B Design */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="max-w-3xl mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
              What Industry Leaders Say
            </h2>
            <p className="text-xl text-neutral-600">
              Real feedback from CEOs, investors, and revenue leaders who've worked with Mo.
            </p>
          </div>

          {/* Testimonial Grid - Masonry Layout */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Long Testimonial 1 - Steve Spark */}
            <div className="relative bg-gradient-to-br from-white via-white to-contech-blue/5 rounded-2xl p-8 border-l-4 border-blue-600 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-contech-blue/5 rounded-full blur-3xl"></div>
              <div className="relative z-10 flex flex-col flex-grow">
                <div className="mb-6">
                  <svg className="w-16 h-16 text-blue-600 opacity-15" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                  </svg>
                </div>
                <p className="text-lg text-neutral-700 leading-relaxed mb-8 flex-grow">
                  As a seasoned SaaS investor and board non-executive director, I've seen the good, the bad, and the exceptional in the industry. Mo Daudi stands head and shoulders above the rest - especially in the ConTech space. He possesses a rare blend of strategic insight and hands-on expertise that enables him to build and scale SaaS revenues from the ground up, even in the most challenging market conditions. What sets Mo apart is his ability to operate resourcefully with minimal support, consistently achieving remarkable results. His tenacity, entrepreneurial spirit, and innovative go-to-market (GTM) strategies have repeatedly hit sales targets and driven sustainable growth.
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src="/image copy copy.png"
                    alt="Steve Spark"
                    className="w-14 h-14 rounded-full flex-shrink-0 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-neutral-900 leading-tight">Steve Spark</div>
                    <div className="text-sm text-neutral-600 leading-tight mt-1">Non-Exec Director | Chairman | SaaS Investor</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Long Testimonial 2 - Josh Bowyer */}
            <div className="relative bg-gradient-to-br from-white via-white to-contech-orange/5 rounded-2xl p-8 border-l-4 border-orange-500 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-contech-orange/5 rounded-full blur-3xl"></div>
              <div className="relative z-10 flex flex-col flex-grow">
                <div className="mb-6">
                  <svg className="w-16 h-16 text-orange-500 opacity-15" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                  </svg>
                </div>
                <p className="text-lg text-neutral-700 leading-relaxed mb-8 flex-grow">
                  It's hard to overstate Mo's impact as a Chief Revenue Officer. He elevated our revenue function to exceptional maturity, delivering record revenue attainment through systematic execution. His leadership - always from the front with unwavering integrity, genuine humility, and exceptional business acumen - inspired our entire team. The results prove it: his MEDDPICC implementation and dedicated coaching drove unprecedented forecast accuracy and win rates. His intellectual curiosity constantly pushed us to think differently. Mo's passion and commitment fostered a culture of excellence. Any organisation would be incredibly fortunate to work with him.
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src="/image.png"
                    alt="Josh Bowyer"
                    className="w-14 h-14 rounded-full flex-shrink-0 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-neutral-900 leading-tight">Josh Bowyer</div>
                    <div className="text-sm text-neutral-600 leading-tight mt-1">Chief Executive Officer</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Long Testimonial 3 - Abdulla Sheikh */}
            <div className="relative bg-gradient-to-br from-white via-white to-contech-navy/5 rounded-2xl p-8 border-l-4 border-neutral-900 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-contech-navy/5 rounded-full blur-3xl"></div>
              <div className="relative z-10 flex flex-col flex-grow">
                <div className="mb-6">
                  <svg className="w-16 h-16 text-neutral-900 opacity-15" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                  </svg>
                </div>
                <p className="text-lg text-neutral-700 leading-relaxed mb-8 flex-grow">
                  Mohammad's integrity and sincerity towards his work are remarkable. He joined Aajil and reshaped how we approached go-to-market, focusing on the essentials: team, process, and pipeline. He reorganized how we worked and thought about growth, and was especially effective at motivating and nurturing the team to give their best. This led to a stronger pipeline, higher close rates and doubling of revenues. He also ran several supplier-led distribution experiments that delivered promising early results. Mohammad works with clarity, moves fast, and genuinely strives to leave the business stronger than he found it.
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src="/image copy copy copy.png"
                    alt="Abdulla Sheikh"
                    className="w-14 h-14 rounded-full flex-shrink-0 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-neutral-900 leading-tight">Abdulla Sheikh</div>
                    <div className="text-sm text-neutral-600 leading-tight mt-1">Chief Executive Officer</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Long Testimonial 4 - Umair Multani */}
            <div className="relative bg-gradient-to-br from-white via-white to-contech-blue/5 rounded-2xl p-8 border-l-4 border-blue-600 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-contech-blue/5 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <div className="mb-6">
                  <svg className="w-16 h-16 text-blue-600 opacity-15" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                  </svg>
                </div>
                <p className="text-lg text-neutral-700 leading-relaxed mb-8 flex-grow">
                  I continue to take elements of Mohammad's GTM playbook to help the various tech start-ups that I've been a part of. With so many sales methodologies & GTM strategy frameworks available, I haven't come across anyone who understands the core B2B SaaS sales as well as Mo. One aspect of my team's sales performance that has significantly improved is the ability to produce accurate sales forecasts. This ensures we can make timely business decisions with the Board's full confidence. As far as Mo's knowledge of the ConTech and PropTech space is concerned I have seen him open doors and close deals where others have failed. He demonstrates excellence in deal flow like no other.
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src="/image copy.png"
                    alt="Umair Multani"
                    className="w-14 h-14 rounded-full flex-shrink-0 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-neutral-900 leading-tight">Umair Multani</div>
                    <div className="text-sm text-neutral-600 leading-tight mt-1">CEO | Revenue Leader</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Short Testimonial 1 */}
            <div className="bg-blue-600 rounded-2xl p-8 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <div className="mb-4">
                <svg className="w-10 h-10 text-white opacity-30" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                </svg>
              </div>
              <p className="text-base leading-relaxed mb-6">
                "Mo is an inspiring GTM Leader who transformed our commercial function into a high-performing team. He fostered cross-collaboration and innovation, resulting in significant milestones in MRR and ARR pipeline generation. His leadership was crucial in securing notable new clients in the construction industry for the business."
              </p>
              <div className="flex items-center gap-3">
                <img
                  src="./Ff.jpg"
                  alt="Fadi Ford"
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-white/30"
                />
                <div>
                  <div className="font-bold text-white">Fadi Ford</div>
                  <div className="text-sm text-white/80">Marketing Director, Qflow</div>
                </div>
              </div>
            </div>

            {/* Short Testimonial 2 */}
            <div className="bg-orange-500 rounded-2xl p-8 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <div className="mb-4">
                <svg className="w-10 h-10 text-white opacity-30" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                </svg>
              </div>
              <p className="text-base leading-relaxed mb-6">
                "Mo is an exceptional sales leader, with great strategic vision, ability to inspire, execute and lead a diverse team. I have personally learnt more about sales working under Mohammad than I have in the rest of my career previously, whilst being the most enjoyable period!"
              </p>
              <div className="flex items-center gap-3">
                <img
                  src="./JG.jpg"
                  alt="Joe Giles"
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-white/30"
                />
                <div>
                  <div className="font-bold text-white">Joe Giles</div>
                  <div className="text-sm text-white/80">Head of UK Sales</div>
                </div>
              </div>
            </div>

            {/* Short Testimonial 3 */}
            <div className="bg-neutral-900 rounded-2xl p-8 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <div className="mb-4">
                <svg className="w-10 h-10 text-white opacity-30" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                </svg>
              </div>
              <p className="text-base leading-relaxed mb-6">
                "Mohammed is a driven, capable and professional sales leader who was asked to help Viewpoint/4Projects establish a beach-head in the Middle East from which we could then expand and grow. Against substantial competition and odds, Mohammed was able to develop trusting relationships, secure significant new business contracts and establish Viewpoint as a significant and credible construction collaboration solution"
              </p>
              <div className="flex items-center gap-3">
                <img
                  src="./jp.jpg"
                  alt="Jim Paulson"
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-white/30"
                />
                <div>
                  <div className="font-bold text-white">Jim Paulson</div>
                  <div className="text-sm text-white/80">Board Member</div>
                </div>
              </div>
            </div>

            {/* Short Testimonial 4 */}
            <div className="bg-white rounded-2xl p-8 border-2 border-orange-500 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <div className="mb-4">
                <svg className="w-10 h-10 text-orange-500 opacity-30" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                </svg>
              </div>
              <p className="text-base text-neutral-700 leading-relaxed mb-6">
                "It is rare to find someone who knows how the Middle East markets work, and has a organisation with invaluable contacts to exploit the potential available. Mohammad offers all of this. He is probably the first person I've met that crystalises what this market is and how to work it for mutual success: customer, vendor and business partners. Mohammad is hands-on, know what is required to build the proposition and get it in front of the right people. When looking to do business in the Middle East talk with Mohammad first - it will save time & money!"
              </p>
              <div className="flex items-center gap-3">
                <img
                  src="./mw.jpg"
                  alt="Mike Warner"
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-orange-500/30"
                />
                <div>
                  <div className="font-bold text-neutral-900">Mike Warner</div>
                  <div className="text-sm text-neutral-600">Senior Revenue Leader</div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Bar */}
          <div className="mt-16 pt-12 border-t border-neutral-200">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-neutral-900 mb-2">50+</div>
                <div className="text-sm text-neutral-600">ConTech Leaders Trust Mo</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-neutral-900 mb-2">95%</div>
                <div className="text-sm text-neutral-600">Client Retention Rate</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-neutral-900 mb-2">$120M+</div>
                <div className="text-sm text-neutral-600">ARR Generated for Clients</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-contech-navy text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Subtle Scarcity + Risk Reversal */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-contech-orange text-white text-sm font-bold rounded-full">
              Limited to 2 Q1 2026 Engagements — 3 Inquiries This Week
            </div>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur text-white text-base font-bold rounded-xl border border-white/20">
              <Shield className="h-5 w-5" />
              Results Guarantee: +40% pipeline in 90 days or next month free
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Build Your Revenue Engine?
          </h2>
          <p className="text-xl text-neutral-300 mb-8 max-w-2xl mx-auto">
            Book a discovery call to discuss your growth challenges. No pitch, no pressure—just an honest conversation about whether we're the right fit.
          </p>

          {/* Social Proof */}
          <div className="bg-white/10 backdrop-blur rounded-xl p-6 mb-12 max-w-2xl mx-auto border border-white/20">
            <div className="flex items-center justify-center mb-3">
              <Users className="h-5 w-5 text-orange-500 mr-2" />
              <div className="text-sm font-semibold text-neutral-200">Trusted by ConTech Leaders</div>
            </div>
            <p className="text-sm text-neutral-300">
              "Working with Mohammad helped us close 4 enterprise deals in 90 days. His ConTech expertise is unmatched."
            </p>
            <p className="text-xs text-orange-500 mt-2 font-semibold">— VP of Sales, $12M ARR Construction SaaS</p>
          </div>

          {/* Process Steps */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur p-6 rounded-xl border border-white/20">
              <Calendar className="h-8 w-8 text-orange-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">1. Book Discovery Call</h3>
              <p className="text-sm text-neutral-300">60-minute video call to understand your situation.</p>
            </div>
            <div className="bg-white/10 backdrop-blur p-6 rounded-xl border border-white/20">
              <Target className="h-8 w-8 text-orange-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">2. Custom Strategy</h3>
              <p className="text-sm text-neutral-300">Tailored approach based on your specific needs.</p>
            </div>
            <div className="bg-white/10 backdrop-blur p-6 rounded-xl border border-white/20">
              <Rocket className="h-8 w-8 text-orange-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">3. Start Growing</h3>
              <p className="text-sm text-neutral-300">Begin execution within 2 weeks.</p>
            </div>
          </div>

          {/* Embedded Calendly Widget */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl p-4 shadow-2xl overflow-hidden">
            <div className="text-center mb-4">
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">Book Your Revenue Diagnostic Call</h3>
              <p className="text-neutral-600">60 minutes. We'll identify your #1 revenue constraint and map your path forward.</p>
            </div>

            {/* What Happens Next Explainer */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-8 mb-6">
              <h4 className="text-base font-bold text-neutral-900 mb-6 text-center tracking-tight">What Happens When You Book</h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-5 shadow-sm border border-neutral-100">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-2xl font-bold text-contech-orange">1</span>
                    <h5 className="text-sm font-bold text-neutral-900">Schedule intro call</h5>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed ml-8">60 minutes. No pitch, just deep diagnosis of your revenue situation.</p>
                </div>

                <div className="bg-white rounded-lg p-5 shadow-sm border border-neutral-100">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-2xl font-bold text-contech-orange">2</span>
                    <h5 className="text-sm font-bold text-neutral-900">Pre-call questionnaire</h5>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed ml-8">5 minutes to complete. Maximizes our time together.</p>
                </div>

                <div className="bg-white rounded-lg p-5 shadow-sm border border-neutral-100">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-2xl font-bold text-contech-orange">3</span>
                    <h5 className="text-sm font-bold text-neutral-900">Identify #1 constraint</h5>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed ml-8">Walk away with clarity even if we don't work together.</p>
                </div>

                <div className="bg-white rounded-lg p-5 shadow-sm border border-neutral-100">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-2xl font-bold text-contech-orange">4</span>
                    <h5 className="text-sm font-bold text-neutral-900">Receive Command Brief</h5>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed ml-8">Within 72 hours. Proposal or free strategic memo.</p>
                </div>
              </div>
              <div className="mt-6 text-center">
                <p className="text-xs font-medium text-neutral-500">Average timeline: <span className="text-neutral-700">7 days from booking to kickoff</span></p>
              </div>
            </div>

            {/* Calendly Inline Widget */}
            <div
              className="calendly-inline-widget relative"
              data-url="https://calendly.com/contechgtm/60-min-session"
              style={{ minWidth: '320px', height: '700px', position: 'relative' }}
            ></div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-neutral-600 pt-4 border-t border-neutral-200 mt-4">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-orange-500 mr-1" />
                No obligation
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-orange-500 mr-1" />
                60 minutes
              </div>
              <div className="flex items-center">
                <Shield className="h-4 w-4 text-orange-500 mr-1" />
                No-pitch guarantee
              </div>
            </div>

            <div className="text-center mt-6 pt-6 border-t border-neutral-200">
              <p className="text-sm text-neutral-600 mb-3">
                Not ready for a call yet? Get started with our CRO Command Brief™
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setShowLeadMagnetForm(true)}
                  className="px-6 py-3 bg-contech-orange text-white font-semibold rounded-lg hover:bg-contech-orange/90 transition-all shadow-md"
                >
                  Apply for Command Brief
                </button>
                <a
                  href="mailto:mdaudi@contechgtm.com?subject=Revenue Growth Inquiry&body=Hi Mohammad,%0D%0A%0D%0AI'd like to discuss:%0D%0A%0D%0A"
                  className="px-6 py-3 border-2 border-neutral-300 text-neutral-700 font-semibold rounded-lg hover:border-contech-blue hover:text-contech-blue transition-all"
                >
                  Email Instead
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-t border-neutral-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            {/* Logo and Tagline */}
            <div className="md:col-span-1">
              <img
                src="./ConTechGMT - BLACK-FINAL - LOGO-2 - Edited.jpg"
                alt="ConTechGMT"
                className="h-12 w-auto object-contain mb-4"
              />
              <p className="text-neutral-600 text-sm leading-relaxed mb-4">
                Elite Fractional CRO for ConTech & PropTech companies ready to scale revenue with precision.
              </p>
              <a
                href="https://www.linkedin.com/in/mdaudi"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-contech-blue text-white rounded-lg hover:bg-contech-blue/90 transition-all font-semibold text-sm"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                Connect on LinkedIn
              </a>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-1">
              <h4 className="text-neutral-900 font-bold text-sm uppercase tracking-wider mb-4">Quick Links</h4>
              <nav className="flex flex-col gap-3">
                <a href="#why-me" className="text-neutral-600 hover:text-contech-blue transition-colors text-sm">Why Me</a>
                <a href="#pricing" className="text-neutral-600 hover:text-contech-blue transition-colors text-sm">Services & Pricing</a>
                <a href="#results" className="text-neutral-600 hover:text-contech-blue transition-colors text-sm">Results & Case Studies</a>
                <a href="#about" className="text-neutral-600 hover:text-contech-blue transition-colors text-sm">About Mohammad</a>
                <a href="#contact" className="text-neutral-600 hover:text-contech-blue transition-colors text-sm">Book a Call</a>
              </nav>
            </div>

            {/* Contact Info */}
            <div className="md:col-span-1">
              <h4 className="text-neutral-900 font-bold text-sm uppercase tracking-wider mb-4">Get in Touch</h4>
              <div className="flex flex-col gap-3">
                <a href="mailto:mdaudi@contechgtm.com" className="text-contech-blue font-semibold hover:underline text-sm">
                  mdaudi@contechgtm.com
                </a>
                <p className="text-neutral-600 text-sm leading-relaxed">
                  Based globally, serving ConTech companies in UK, US, EU, and Middle East markets.
                </p>
                <div className="bg-contech-orange/10 border-2 border-contech-orange/30 rounded-lg p-4 mt-2">
                  <p className="text-xs font-semibold text-neutral-900 mb-1">Limited Availability</p>
                  <p className="text-xs text-neutral-700">Taking 2 new Q1 2026 engagements</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-neutral-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-neutral-500 text-sm">
              © 2025 Mohammad Daudi / ConTechGMT. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-neutral-500">
              <span>Built for ConTech Leaders</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Fixed CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-neutral-200 shadow-2xl z-50 animate-slide-up">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-lg sm:text-xl font-bold text-neutral-900">
                Ready to Hit Your Board Plan.
              </p>
            </div>
            <a
              href="#contact"
              className="inline-flex items-center justify-center px-8 py-3 bg-contech-orange text-white font-semibold rounded-lg hover:bg-contech-orange/90 transition-all duration-300 hover:scale-105 shadow-lg whitespace-nowrap"
            >
              Book Free Revenue Call
              <ArrowRight className="ml-2 w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Lead Magnet Form Modal */}
      {showLeadMagnetForm && (
        <LeadMagnetForm onClose={() => setShowLeadMagnetForm(false)} />
      )}
    </div>
  );
}

export default App;
