import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  ClipboardList,
  TestTube,
  BookOpen,
  UploadCloud,
  Sparkles,
  Search,
  ArrowRight,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle2
} from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import SearchBar from '../components/ui/SearchBar';
import Card, { CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import DocumentCard from '../components/documents/DocumentCard';
import { fetchDocuments, fetchStats, MOCK_RECENT_ACTIVITIES } from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchDocuments().then(setDocuments);
    fetchStats().then(setStats);
  }, []);

  const handleSearchSubmit = (query) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <PageContainer title="Dashboard Overview">
      {/* 1. Welcome Section & Main AI Search Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 rounded-2xl p-5 sm:p-7 text-white shadow-md border border-emerald-800/50 relative overflow-hidden space-y-5">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-800/60 border border-emerald-700/60 text-[11px] font-semibold text-emerald-200 mb-2">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>BioWeave AI v2.4 Knowledge Synthesis</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Welcome back, Dr. Elena Rostova
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-2xl">
              Search across 1,248 indexed biotech research papers, experimental protocols, and lab notebook entries.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              leftIcon={UploadCloud}
              onClick={() => navigate('/upload')}
              className="bg-emerald-900/60 text-emerald-100 border-emerald-700/60 hover:bg-emerald-800"
            >
              Upload Document
            </Button>
            <Button
              variant="accent"
              size="sm"
              leftIcon={Sparkles}
              onClick={() => navigate('/ai-assistant')}
            >
              Ask AI Assistant
            </Button>
          </div>
        </div>

        {/* Big Search Bar inside hero */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearchSubmit}
          placeholder="Ask AI or search literature (e.g., 'Lipid nanoparticles LNP mRNA delivery in hepatocytes')..."
          size="lg"
        />
      </div>

      {/* 2. Statistics Cards Grid (4 Key Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="border-l-4 border-l-emerald-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Documents</p>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{stats?.documentsCount || 1248}</h3>
              <p className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" /> {stats?.documentsGrowth}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-teal-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Protocols</p>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{stats?.protocolsCount || 342}</h3>
              <p className="text-[11px] text-teal-800 font-semibold flex items-center gap-1 mt-1">
                <Activity className="w-3 h-3" /> {stats?.protocolsGrowth}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-800 shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-sky-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lab Notes</p>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{stats?.labNotesCount || 589}</h3>
              <p className="text-[11px] text-sky-800 font-semibold flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3" /> {stats?.labNotesGrowth}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-800 shrink-0">
              <TestTube className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-indigo-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Published Papers</p>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{stats?.publishedPapersCount || 317}</h3>
              <p className="text-[11px] text-indigo-800 font-semibold flex items-center gap-1 mt-1">
                <BookOpen className="w-3 h-3" /> {stats?.publishedPapersGrowth}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-800 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* 3. Main Dashboard Content Grid: Recent Research & Quick Actions / Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left Column (2 cols): Recent Research Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Recent Research & Documents</h3>
              <p className="text-xs text-slate-500">Latest vector-indexed literature and lab protocols</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={ArrowRight}
              onClick={() => navigate('/documents')}
            >
              View Library
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {documents.slice(0, 4).map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        </div>

        {/* Right Column (1 col): Quick Actions & Activity Feed */}
        <div className="space-y-5">
          
          {/* Quick Actions Panel */}
          <Card className="space-y-3">
            <CardTitle subtitle="Common Research Tasks">Quick Actions</CardTitle>

            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => navigate('/upload')}
                className="w-full p-2.5 bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-950 rounded-xl border border-slate-200/80 hover:border-emerald-300 transition-all flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 group-hover:bg-emerald-800 group-hover:text-white transition-colors">
                    <UploadCloud className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold block">Upload Research PDF</span>
                    <span className="text-[10px] text-slate-500">Parse papers, SOPs, FASTA</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-800 transition-colors" />
              </button>

              <button
                onClick={() => navigate('/ai-assistant')}
                className="w-full p-2.5 bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-950 rounded-xl border border-slate-200/80 hover:border-emerald-300 transition-all flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-teal-100 text-teal-800 group-hover:bg-teal-700 group-hover:text-white transition-colors">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold block">New AI Assistant Query</span>
                    <span className="text-[10px] text-slate-500">Ask multi-doc questions</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-800 transition-colors" />
              </button>

              <button
                onClick={() => navigate('/search')}
                className="w-full p-2.5 bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-950 rounded-xl border border-slate-200/80 hover:border-emerald-300 transition-all flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-sky-100 text-sky-800 group-hover:bg-sky-700 group-hover:text-white transition-colors">
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold block">Knowledge Search</span>
                    <span className="text-[10px] text-slate-500">Semantic & gene search</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-800 transition-colors" />
              </button>
            </div>
          </Card>

          {/* Activity Feed */}
          <Card className="space-y-3">
            <CardTitle subtitle="Real-time workspace logs">Recent Activity</CardTitle>

            <div className="space-y-2.5">
              {MOCK_RECENT_ACTIVITIES.map((act) => (
                <div key={act.id} className="flex items-start gap-2.5 p-2 bg-slate-50/80 rounded-lg text-xs">
                  <div className="p-1 rounded-full bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-800 leading-snug">{act.title}</p>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>

      </div>
    </PageContainer>
  );
}
