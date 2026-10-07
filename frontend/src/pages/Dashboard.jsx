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
  CheckCircle2,
  AlertCircle,
  FilePlus
} from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import SearchBar from '../components/ui/SearchBar';
import Card, { CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import DocumentCard from '../components/documents/DocumentCard';
import { dashboardService, fetchDocuments, MOCK_RECENT_ACTIVITIES } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  const [statsData, setStatsData] = useState(null);
  const [recentDocs, setRecentDocs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadDashboardData = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        // Fetch stats from backend API
        const statsRes = await dashboardService.getStats();
        if (isMounted) {
          setStatsData(statsRes.stats || statsRes);
        }
      } catch (err) {
        console.warn('Dashboard stats API error:', err?.message);
        if (isMounted) {
          setErrorMessage('Unable to load dashboard data.');
        }
      }

      try {
        // Fetch recent documents from backend API
        const docsRes = await dashboardService.getRecentDocuments();
        if (isMounted) {
          const docsList = docsRes.documents || [];
          if (docsList.length > 0) {
            setRecentDocs(docsList);
          } else {
            // Fallback to sample literature if no uploads exist yet
            const mockDocs = await fetchDocuments();
            setRecentDocs(mockDocs);
          }
        }
      } catch (err) {
        console.warn('Dashboard recent docs API error:', err?.message);
        if (isMounted) {
          const mockDocs = await fetchDocuments();
          setRecentDocs(mockDocs);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearchSubmit = (query) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <PageContainer title="Dashboard Overview">
      
      {/* Optional Error Alert if API error occurs */}
      {errorMessage && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{errorMessage} Displaying offline cache metrics.</span>
          </div>
          <button
            onClick={() => setErrorMessage('')}
            className="text-amber-900 font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

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
              Welcome back, {user?.name || 'Dr. Elena Rostova'}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-2xl">
              Search across indexed biotech research papers, experimental protocols, and lab notebook entries.
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
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                {isLoading ? <span className="text-slate-300 animate-pulse">...</span> : statsData?.totalDocuments ?? 1248}
              </h3>
              <p className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" /> +12% this month
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
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                {isLoading ? <span className="text-slate-300 animate-pulse">...</span> : statsData?.activeProtocols ?? 342}
              </h3>
              <p className="text-[11px] text-teal-800 font-semibold flex items-center gap-1 mt-1">
                <Activity className="w-3 h-3" /> 48 active SOPs
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
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                {isLoading ? <span className="text-slate-300 animate-pulse">...</span> : statsData?.labNotes ?? 589}
              </h3>
              <p className="text-[11px] text-sky-800 font-semibold flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3" /> +24 this week
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
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                {isLoading ? <span className="text-slate-300 animate-pulse">...</span> : statsData?.publishedPapers ?? 317}
              </h3>
              <p className="text-[11px] text-indigo-800 font-semibold flex items-center gap-1 mt-1">
                <BookOpen className="w-3 h-3" /> 14 high impact
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

          {isLoading ? (
            <div className="p-8 bg-white rounded-xl border border-slate-200 text-center space-y-2">
              <div className="w-6 h-6 border-2 border-emerald-800 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Loading recent research documents...</p>
            </div>
          ) : recentDocs.length === 0 ? (
            <div className="p-8 bg-white rounded-xl border border-slate-200 text-center space-y-3 shadow-2xs">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto">
                <FilePlus className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">No research documents yet.</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Upload your first PDF, FASTA, or protocol document to start vector indexing and AI synthesis.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                leftIcon={UploadCloud}
                onClick={() => navigate('/upload')}
              >
                Upload First Document
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {recentDocs.slice(0, 4).map((doc) => (
                <DocumentCard key={doc.id} document={doc} />
              ))}
            </div>
          )}
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
