import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Sparkles,
  FileText,
  CheckCircle2,
  Layers,
  MessageSquare
} from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/ui/Button';
import Card, { CardTitle } from '../components/ui/Card';
import DocumentTypeBadge from '../components/documents/DocumentTypeBadge';
import DocumentMetadata from '../components/documents/DocumentMetadata';
import Badge from '../components/ui/Badge';
import { fetchDocumentById } from '../services/api';

export default function DocumentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [activeTab, setActiveTab] = useState('insights');

  useEffect(() => {
    fetchDocumentById(id).then(setDoc);
  }, [id]);

  if (!doc) {
    return (
      <PageContainer title="Loading Document...">
        <div className="p-12 text-center text-slate-500">
          <div className="w-8 h-8 border-2 border-emerald-800 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Fetching document details & AI embeddings...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={`Document Details - ${doc.title}`}>
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/documents')}
          className="text-xs font-semibold text-slate-600 hover:text-emerald-900 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Document Library</span>
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={Download}
          >
            Download PDF
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={MessageSquare}
            onClick={() => navigate(`/ai-assistant?doc=${doc.id}`)}
          >
            Ask AI About Document
          </Button>
        </div>
      </div>

      {/* Main Document Header Card */}
      <Card className="space-y-4 border-slate-200 shadow-xs">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <DocumentTypeBadge type={doc.type} size="md" />
            <span className="text-xs font-semibold text-slate-500">• {doc.category}</span>
          </div>

          <Badge
            variant={doc.status === 'Processed' ? 'success' : 'warning'}
            size="md"
            dot
          >
            {doc.status} & Indexed
          </Badge>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
          {doc.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span><strong>Authors:</strong> {doc.authors}</span>
          <span>•</span>
          <span><strong>Journal:</strong> {doc.journal}</span>
          <span>•</span>
          <span><strong>Published:</strong> {doc.date}</span>
        </div>
      </Card>

      {/* Main Content & Metadata Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 cols): Tabbed Document Content Viewer */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Navigation Tabs */}
          <div className="bg-white p-1.5 rounded-xl border border-slate-200 flex items-center gap-1 text-xs shadow-xs">
            {[
              { id: 'insights', label: 'AI Key Insights', icon: Sparkles },
              { id: 'content', label: 'Extracted Content', icon: FileText },
              { id: 'related', label: 'Related Research', icon: Layers },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                    isActive
                      ? 'bg-emerald-950 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: AI Key Insights */}
          {activeTab === 'insights' && (
            <Card className="space-y-4">
              <CardTitle subtitle="Synthesized by BioWeave Neural Models">
                Executive Synthesis & Insights
              </CardTitle>

              <div className="space-y-3">
                {doc.aiInsights && doc.aiInsights.map((insight, idx) => (
                  <div key={idx} className="p-3.5 bg-emerald-50/60 border border-emerald-200/70 rounded-xl flex items-start gap-3 text-xs text-slate-800 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
                    <span>{insight}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Summary & Key Methodology
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {doc.snippet}
                </p>
              </div>
            </Card>
          )}

          {/* Tab 2: Extracted Text Content */}
          {activeTab === 'content' && (
            <Card className="space-y-4">
              <CardTitle subtitle="Full text extracted via OCR engine">
                Document Body Content
              </CardTitle>

              <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs leading-relaxed space-y-3 whitespace-pre-wrap overflow-x-auto border border-slate-800">
                {doc.extractedText}
              </div>
            </Card>
          )}

          {/* Tab 3: Related Research */}
          {activeTab === 'related' && (
            <Card className="space-y-4">
              <CardTitle subtitle="Semantic vector similarity matches">
                Related Research Papers & SOPs
              </CardTitle>

              <div className="space-y-3 text-xs">
                {[
                  { title: "Lipid Nanoparticle Delivery of mRNA for Gene Editing", match: "96%", date: "2025-11-12" },
                  { title: "High-Throughput Microfluidic Synthesis of Ionizable Lipids", match: "91%", date: "2025-12-04" },
                  { title: "ApoE Receptor Targeting in Hepatic Cell Cultures", match: "87%", date: "2026-01-15" }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between hover:border-emerald-700/40 transition-colors">
                    <div>
                      <h4 className="font-semibold text-slate-900">{item.title}</h4>
                      <span className="text-[10px] text-slate-400">Added {item.date}</span>
                    </div>
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-900 font-bold text-[11px] rounded">
                      {item.match} Match
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

        </div>

        {/* Right Column (1 col): Technical Metadata */}
        <div>
          <DocumentMetadata document={doc} />
        </div>

      </div>
    </PageContainer>
  );
}
