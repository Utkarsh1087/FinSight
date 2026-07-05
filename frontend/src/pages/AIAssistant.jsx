import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Search,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  FileText,
  Building,
  TrendingDown,
  AlertCircle,
} from 'lucide-react';
import api from '../services/api';

const PROMPT_SUGGESTIONS = [
  'Why did reconciliation fail this month?',
  'Show me all transactions above ₹50,000.',
  'Which vendors have the most mismatches?',
  'What are the biggest outstanding invoices?',
  'Which expenses increased the most this month?',
  'Explain duplicate transaction breaks.',
];

export const AIAssistant = () => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      observed_data: 'FinSight AI Telemetry Connected: Live financial models loaded for Reconciliation (June 2026), Invoices, Multi-Warehouse Stocks, and Financial Policy Rules.',
      possible_explanation: 'I analyze bounded application context to provide factual accounting explanations without modifying ledgers.',
      recommendation: 'Ask any question regarding discrepancies, high-exposure exceptions, aging invoices, or corporate disbursements.',
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || loading) return;

    const userQuery = prompt.trim();
    setPrompt('');
    setMessages((prev) => [...prev, { role: 'user', content: userQuery }]);
    setLoading(true);

    try {
      const res = await api.post('/ai/query/', { prompt: userQuery });
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          observed_data: res.data.observed_data,
          possible_explanation: res.data.possible_explanation,
          recommendation: res.data.recommendation,
          context_items: res.data.context_items,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          observed_data: 'Failed to complete query analysis.',
          possible_explanation: 'An error occurred while connecting to the backend context retrieval engine.',
          recommendation: 'Please verify the backend server is running and try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = (text) => {
    setPrompt(text);
  };

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-8">
      
      {/* Assistant Header */}
      <div className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-100 shadow-featureShadow flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-xs">
            <Bot className="w-7 h-7 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl lg:text-2xl font-extrabold text-midnight_text tracking-tight">AI Finance Assistant</h2>
              <span className="text-[11px] font-bold px-3 py-0.5 rounded-full bg-blue-50 text-primary border border-blue-100">
                Context-Bounded
              </span>
            </div>
            <p className="text-xs text-black/60 mt-1">
              Intelligent accounting explanation engine with strict separation of facts, hypotheses, and recommendations.
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-midnight_text flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-primary" /> Suggested Financial Investigations:
        </span>
        <div className="flex flex-wrap gap-2.5">
          {PROMPT_SUGGESTIONS.map((text, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectSuggestion(text)}
              className="px-4 py-2 rounded-full text-xs font-semibold bg-white hover:bg-blue-50 text-midnight_text border border-slate-200 hover:border-primary transition-all text-left shadow-xs cursor-pointer"
            >
              {text}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation Stream */}
      <div className="space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className="space-y-4">
            {msg.role === 'user' ? (
              <div className="flex justify-end">
                <div className="max-w-xl bg-primary text-white p-4 px-6 rounded-3xl text-xs font-semibold shadow-md leading-relaxed">
                  {msg.content}
                </div>
              </div>
            ) : (
              <div className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-100 shadow-featureShadow space-y-5">
                <div className="flex items-center gap-2 text-primary text-xs font-extrabold border-b border-slate-100 pb-3">
                  <Bot className="w-4 h-4" /> FinSight AI Financial Analysis
                </div>

                {/* 1. Observed Data */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 1. Observed Financial Data
                  </div>
                  <p className="text-xs text-midnight_text bg-[#edf5fc]/80 p-4 rounded-2xl border border-slate-200/60 leading-relaxed font-medium">
                    {msg.observed_data}
                  </p>
                </div>

                {/* 2. Possible Explanation */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5" /> 2. Possible Explanation & Root Cause
                  </div>
                  <p className="text-xs text-midnight_text bg-[#edf5fc]/80 p-4 rounded-2xl border border-slate-200/60 leading-relaxed font-medium">
                    {msg.possible_explanation}
                  </p>
                </div>

                {/* 3. Actionable Recommendation */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" /> 3. Actionable Recommendation
                  </div>
                  <div className="text-xs text-primary bg-blue-50 p-4 rounded-2xl border border-blue-100 whitespace-pre-line leading-relaxed font-mono font-medium">
                    {msg.recommendation}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-featureShadow flex items-center gap-3 text-midnight_text text-xs font-semibold">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Analyzing telemetry against accounting ledgers and rule engines...
          </div>
        )}
      </div>

      {/* Query Input Box */}
      <form onSubmit={handleSubmit} className="sticky bottom-6 z-20">
        <div className="bg-white p-2 rounded-full border border-slate-200 flex items-center gap-3 shadow-2xl">
          <input
            type="text"
            placeholder="Ask AI a finance question (e.g. 'Why did reconciliation fail this month?')..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1 bg-transparent px-5 py-2.5 text-xs text-midnight_text placeholder-black/40 font-medium focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="p-3 px-6 rounded-full bg-primary hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" /> Send
          </button>
        </div>
      </form>

    </div>
  );
};

export default AIAssistant;
