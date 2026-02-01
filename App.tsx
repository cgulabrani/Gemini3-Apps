
import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  TrendingUp, 
  AlertCircle, 
  LineChart, 
  PieChart, 
  Loader2,
  Info,
  ArrowUpRight,
  ShieldCheck,
  DollarSign,
  Wallet
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { Holding, AnalysisResult } from './types';
import { getPortfolioPrediction } from './services/geminiService';

const InfoTooltip = ({ text }: { text: string }) => (
  <div className="group relative inline-block">
    <Info className="w-3.5 h-3.5 text-slate-500 cursor-help hover:text-indigo-400 transition-colors" />
    <div className="invisible group-hover:visible absolute z-[100] w-64 p-3 mt-2 text-[11px] leading-relaxed text-slate-200 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl left-1/2 transform -translate-x-1/2 backdrop-blur-md">
      {text}
      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-800 border-l border-t border-slate-700 rotate-45"></div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [holdings, setHoldings] = useState<Holding[]>([
    { id: '1', symbol: 'VOO', weight: 60 },
    { id: '2', symbol: 'Apple', weight: 40 }
  ]);
  const [initialInvestment, setInitialInvestment] = useState<number>(10000);
  const [newSymbol, setNewSymbol] = useState('');
  const [newWeight, setNewWeight] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalWeight = holdings.reduce((sum, h) => sum + h.weight, 0);

  const sanitizeInput = (val: string) => {
    return val.replace(/[^a-zA-Z0-9.\- ]/g, '').substring(0, 50);
  };

  const addHolding = () => {
    const cleanSymbol = sanitizeInput(newSymbol).trim();
    if (!cleanSymbol) return;
    if (holdings.length >= 10) {
      setError('Maximum of 10 holdings allowed for stability.');
      return;
    }
    
    const weight = Number(newWeight);
    if (isNaN(weight) || weight <= 0) return;
    if (weight > 100) return;

    setHoldings(prev => [
      ...prev, 
      { id: Math.random().toString(36).substr(2, 9), symbol: cleanSymbol, weight }
    ]);
    setNewSymbol('');
    setNewWeight(0);
    setError(null);
  };

  const removeHolding = (id: string) => {
    setHoldings(prev => prev.filter(h => h.id !== id));
    setError(null);
  };

  const handlePredict = async () => {
    if (totalWeight !== 100) {
      setError('Total portfolio weight must equal 100%');
      return;
    }
    if (initialInvestment < 100) {
      setError('Please enter a minimum investment of $100.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const data = await getPortfolioPrediction(holdings, initialInvestment);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  // Derive accurate ROI metrics from the actual prediction data
  const finalValue = result?.predictionData[result.predictionData.length - 1].expected || 0;
  const totalRoi = result ? ((finalValue - initialInvestment) / initialInvestment) * 100 : 0;
  const cagr = result ? (Math.pow(finalValue / initialInvestment, 1 / 5) - 1) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
      {/* Header */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              WealthVision AI
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-emerald-500 font-medium bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Safety Guard Active
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar: Input Controls */}
          <div className="lg:col-span-4 space-y-6">
            <section className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-semibold">Portfolio Builder</h2>
                </div>
                <InfoTooltip text="Define your asset mix and starting capital. Our AI models the performance of this specific capital amount." />
              </div>

              <div className="space-y-6">
                {/* Investment Amount Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Wallet className="w-3 h-3" />
                      Initial Investment
                    </label>
                    <InfoTooltip text="The starting dollar amount for your portfolio. The growth forecast and final value will be calculated based on this figure." />
                  </div>
                  <div className="relative group">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                      type="number"
                      placeholder="Investment Amount"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-3 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                      value={initialInvestment}
                      onChange={(e) => setInitialInvestment(Number(e.target.value))}
                      min="100"
                    />
                  </div>
                </div>

                <div className="h-px bg-slate-800 w-full" />

                {/* Asset Input */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Add Holdings</label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="Company or Ticker"
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      value={newSymbol}
                      onChange={(e) => setNewSymbol(sanitizeInput(e.target.value))}
                      onKeyPress={(e) => e.key === 'Enter' && addHolding()}
                    />
                    <input 
                      type="number"
                      placeholder="%"
                      className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      value={newWeight || ''}
                      onChange={(e) => setNewWeight(Number(e.target.value))}
                      onKeyPress={(e) => e.key === 'Enter' && addHolding()}
                    />
                    <button 
                      onClick={addHolding}
                      className="bg-indigo-600 hover:bg-indigo-700 p-2 rounded-lg transition-colors"
                      title="Add to Portfolio"
                    >
                      <Plus className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {holdings.map(holding => (
                    <div key={holding.id} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                      <div>
                        <span className="font-bold text-indigo-300 truncate max-w-[120px] inline-block align-middle">{holding.symbol}</span>
                        <span className="ml-2 text-xs text-slate-500">{holding.weight}%</span>
                      </div>
                      <button 
                        onClick={() => removeHolding(holding.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {holdings.length === 0 && (
                    <p className="text-center py-4 text-xs text-slate-600 italic">No holdings added yet.</p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800 mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-slate-400">Total Weight:</span>
                    <span className={`text-sm font-bold ${totalWeight === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {totalWeight}%
                    </span>
                  </div>
                  
                  <button 
                    disabled={isLoading || totalWeight !== 100}
                    onClick={handlePredict}
                    className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                      isLoading || totalWeight !== 100 
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:scale-[1.02] shadow-lg shadow-indigo-500/20'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing Markets...
                      </>
                    ) : (
                      <>
                        <LineChart className="w-5 h-5" />
                        Run AI Forecast
                      </>
                    )}
                  </button>

                  {error && (
                    <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg flex gap-2 items-start">
                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-red-400">{error}</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-2xl p-6">
              <div className="flex gap-3">
                <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
                <p className="text-[10px] text-indigo-300/80 leading-relaxed">
                  WealthVision AI implements real-time prompt sanitation. The model specifically simulates the performance of $${initialInvestment.toLocaleString()} across your selected assets.
                </p>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-6">
            {!result && !isLoading && (
              <div className="bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-3xl h-[600px] flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-6">
                  <TrendingUp className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-400 mb-2">Secure Financial Simulation</h3>
                <p className="text-slate-500 max-w-md">
                  Enter your initial investment and portfolio mix on the left. Our AI uses 20 years of historical data to project your path.
                </p>
              </div>
            )}

            {isLoading && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-3xl h-[600px] flex flex-col items-center justify-center p-8 space-y-8">
                <div className="relative">
                   <div className="w-24 h-24 border-4 border-indigo-500/20 rounded-full animate-ping absolute"></div>
                   <div className="w-24 h-24 border-t-4 border-indigo-500 rounded-full animate-spin"></div>
                </div>
                <div className="text-center space-y-4 max-w-sm">
                  <h3 className="text-xl font-bold text-white">Projecting Capital Growth</h3>
                  <p className="text-slate-400 text-sm italic">
                    "Simulating a starting investment of ${initialInvestment.toLocaleString()} through your weighted holdings..."
                  </p>
                </div>
              </div>
            )}

            {result && !isLoading && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl border-indigo-500/20">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Final Value</p>
                      <InfoTooltip text="The estimated total value of your portfolio after 5 years, starting from your specified initial amount." />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-indigo-400">${Math.round(finalValue).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Total ROI</p>
                      <InfoTooltip text="The total percentage increase in your portfolio value based on the starting vs. ending projected amounts." />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-emerald-400">+{totalRoi.toFixed(2)}%</span>
                      <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                    </div>
                  </div>
                  <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Annualized</p>
                      <InfoTooltip text="Compound Annual Growth Rate (CAGR) over the 5-year period." />
                    </div>
                    <span className="text-xl font-bold text-slate-300">{cagr.toFixed(2)}%</span>
                  </div>
                  <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl relative">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Risk Profile</p>
                      <InfoTooltip text="Qualitative risk assessment based on volatility and concentration." />
                    </div>
                    <span className={`text-xl font-bold ${
                      result.summary.riskLevel === 'Low' ? 'text-emerald-400' :
                      result.summary.riskLevel === 'Medium' ? 'text-amber-400' :
                      'text-rose-400'
                    }`}>{result.summary.riskLevel}</span>
                  </div>
                </div>

                {/* Main Forecast Chart */}
                <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                      <LineChart className="w-5 h-5 text-indigo-400" />
                      <h2 className="text-lg font-semibold">5-Year Growth Path</h2>
                      <InfoTooltip text={`Projecting the growth of your $${initialInvestment.toLocaleString()} investment. Shaded range represents market variance.`} />
                    </div>
                  </div>
                  
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={result.predictionData}>
                        <defs>
                          <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#64748b" 
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          interval={11}
                        />
                        <YAxis 
                          stroke="#64748b" 
                          fontSize={10} 
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                          labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontWeight: 'bold' }}
                          formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                        />
                        <Area type="monotone" dataKey="optimistic" stroke="transparent" fill="#6366f1" fillOpacity={0.05} />
                        <Area type="monotone" dataKey="pessimistic" stroke="transparent" fill="#6366f1" fillOpacity={0.05} />
                        <Area type="monotone" dataKey="expected" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorExpected)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* AI Analysis Insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Strategic Insights</h3>
                      <InfoTooltip text="AI-generated executive summary analyzing secular growth trends and macroeconomic impact." />
                    </div>
                    <div className="text-sm text-slate-300 space-y-4 leading-relaxed whitespace-pre-line text-justify">
                      {result.insights}
                    </div>
                  </div>

                  <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                          <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                          Top Performance Drivers
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.summary.topPerformers.map(ticker => (
                          <span key={ticker} className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20">
                            {ticker}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 text-rose-400">
                          <AlertCircle className="w-4 h-4" />
                          Risk Assessment
                        </h3>
                      </div>
                      <p className="text-xs text-slate-400 mb-4 leading-relaxed italic">
                        {result.summary.riskReasoning}
                      </p>
                      <ul className="space-y-2">
                        {result.summary.potentialRisks.map((risk, idx) => (
                          <li key={idx} className="flex gap-2 text-xs text-slate-400">
                            <span className="text-indigo-500 font-bold">•</span>
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-[10px] mb-4 uppercase tracking-widest flex items-center justify-center gap-2">
            <ShieldCheck className="w-3 h-3" />
            Secure Analysis Environment
          </p>
          <p className="text-slate-600 text-xs mb-8 max-w-2xl mx-auto">
            DISCLAIMER: This is an AI-powered simulation. Market forecasting involves substantial risk. We do not store your portfolio data. All simulations are performed in-memory.
          </p>
          <div className="flex items-center justify-center gap-6">
            <span className="text-slate-700 text-[9px] uppercase tracking-[0.3em]">Gemini 3 Pro</span>
            <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
            <span className="text-slate-700 text-[9px] uppercase tracking-[0.3em]">Real-Time Grounding</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
