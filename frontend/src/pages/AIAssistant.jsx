import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Paperclip,
  BookOpen,
  Bot,
  MessageSquarePlus
} from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/ui/Button';
import SourceCard from '../components/research/SourceCard';
import { fetchDocuments } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AIAssistant() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchDocuments().then(setDocuments);
  }, []);

  const [messages, setMessages] = useState([
    {
      id: "msg-1",
      sender: "user",
      text: "How does lipid nanoparticle (LNP) formulation affect mRNA transfection efficiency and cellular tropism in hepatocytes?",
      timestamp: "10:14 AM"
    },
    {
      id: "msg-2",
      sender: "ai",
      timestamp: "10:14 AM",
      text: `Based on **BioWeave Indexed Literature**, LNP transfection efficiency and hepatic tropism are governed primarily by **ionizable lipid molar ratios** and **surface PEGylation density**.

### Key Findings & Synthesis:
1. **Ionizable Cationic Lipid Ratio [1]:**
   Formulations containing **50 mol% ionizable cationic lipid** (e.g., *DLin-MC3-DMA* derivatives) demonstrated a **12-fold increase** in luciferase expression compared to standard 40 mol% formulations, achieving **>94% encapsulation efficiency**.

2. **ApoE Co-mediated Uptake Mechanism [1]:**
   Upon systemic delivery, ionizable lipids adsorb Apolipoprotein E (ApoE) in plasma, triggering receptor-mediated endocytosis via Low-Density Lipoprotein Receptors (LDLR) on primary hepatocytes.

3. **Particle Size & Stability [1]:**
   Maintaining hydrodynamic diameters below **80 nm** (PDI < 0.08) prevents splenic filtering and optimizes sinusoid fenestration passage in the liver.`,
      sources: [
        {
          id: "doc-1",
          title: "Optimizing Lipid Nanoparticle Formulations for mRNA Delivery to Primary Hepatocytes",
          type: "Research Paper",
          relevance: 98,
          snippet: "Ionizable cationic lipids were synthesized to evaluate liver-targeted transfection efficiency. Formulations containing 50 mol% ionizable lipid exhibited a 12-fold increase...",
          date: "2026-02-14"
        },
        {
          id: "doc-5",
          title: "Standard Operating Procedure: Automated High-Throughput LC-MS Sample Preparation",
          type: "Protocol",
          relevance: 81,
          snippet: "Yields >1,400 quantified plasma protein groups per 30-minute LC gradient for APOE biomarker tracking.",
          date: "2026-02-20"
        }
      ]
    }
  ]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    const promptQuery = inputText;
    setInputText('');
    setIsLoading(true);

    setTimeout(() => {
      const aiResponse = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Synthesizing indexed research for: **"${promptQuery}"**

### AI Research Synthesis:
- **Primary Mechanism:** Cross-referencing indexed protocols and papers confirms strong correlation with experimental parameters.
- **Protocol Optimization:** Electroporation pulse voltage of 160V for 15ms yields 78% indel efficiency with minimal cell loss.
- **Thermostability:** Computational predictions indicate variant EV-09 raises melting point by +13.9°C.`,
        sources: documents.slice(1, 3).map((d) => ({
          id: d.id,
          title: d.title,
          type: d.type,
          relevance: d.relevance || 91,
          snippet: d.snippet,
          date: d.date
        }))
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };

  const currentSources = messages.filter((m) => m.sender === 'ai' && m.sources).flatMap((m) => m.sources);

  return (
    <PageContainer title="AI Research Assistant">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)] min-h-[600px]">
        
        {/* Left/Middle Column (2 cols): Main Chat Interface */}
        <div className="lg:col-span-2 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          
          {/* Header Bar */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-800 text-emerald-100 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">BioWeave AI Research Agent</h3>
                <p className="text-[11px] text-emerald-800 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  RAG Multi-Document Mode Active
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              leftIcon={MessageSquarePlus}
              onClick={() => {
                setMessages([messages[0], messages[1]]);
              }}
            >
              New Chat
            </Button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3.5 max-w-3xl ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                    msg.sender === 'user'
                      ? 'bg-emerald-950 text-white'
                      : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  }`}
                >
                  {msg.sender === 'user' ? (user?.name ? user.name.slice(0, 2).toUpperCase() : 'ER') : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Content */}
                <div className={`space-y-2 ${msg.sender === 'user' ? 'items-end' : ''}`}>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-700">
                      {msg.sender === 'user' ? (user?.name || 'Dr. Elena Rostova') : 'BioWeave AI'}
                    </span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div
                    className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-emerald-800 text-white rounded-tr-xs shadow-xs'
                        : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-xs space-y-3'
                    }`}
                  >
                    {msg.sender === 'user' ? (
                      <p>{msg.text}</p>
                    ) : (
                      <div className="prose prose-sm prose-emerald max-w-none space-y-2">
                        {msg.text.split('\n').map((line, idx) => {
                          if (line.startsWith('### ')) {
                            return <h4 key={idx} className="text-xs font-bold text-slate-900 uppercase tracking-wider mt-2 mb-1">{line.replace('### ', '')}</h4>;
                          }
                          if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ')) {
                            return <p key={idx} className="text-xs text-slate-800 font-medium pl-2">{line}</p>;
                          }
                          return <p key={idx} className="text-xs text-slate-700">{line}</p>;
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 max-w-xl">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-xs text-xs text-slate-600 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-800 animate-pulse" />
                  <span>Synthesizing vector embeddings across literature...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompt Suggestions */}
          <div className="px-4 py-2 bg-slate-50/60 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">Suggested:</span>
            {[
              "Synthesize LNP delivery methods for mRNA",
              "Compare CRISPR-Cas12a vs Cas9 specificity",
              "Summarize thermal shift protocol parameters"
            ].map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => setInputText(prompt)}
                className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-950 rounded-lg border border-slate-200/80 text-[11px] whitespace-nowrap transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSend} className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2">
            <button
              type="button"
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              title="Attach document reference"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask BioWeave AI research questions or cite documents..."
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20"
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              leftIcon={Send}
              disabled={!inputText.trim()}
            >
              Ask AI
            </Button>
          </form>

        </div>

        {/* Right Column (1 col): Cited Sources & Active Context Panel */}
        <div className="flex flex-col space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-800" /> Cited Source Documents
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-900 rounded">
                {currentSources.length} Citations
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {currentSources.map((source, idx) => (
                <SourceCard key={idx} source={source} index={idx} />
              ))}
            </div>
          </div>
        </div>

      </div>
    </PageContainer>
  );
}
