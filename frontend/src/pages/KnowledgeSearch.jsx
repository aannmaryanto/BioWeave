import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Loader2, Sparkles, HelpCircle } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import SearchBar from '../components/ui/SearchBar';
import SearchResult from '../components/research/SearchResult';
import Card from '../components/ui/Card';
import { Select } from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { searchService, fetchDocuments } from '../services/api';

export default function KnowledgeSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || 'Lipid nanoparticles mRNA transfection efficiency';
  const [query, setQuery] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [searchMode, setSearchMode] = useState('vector');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState('All');
  const [minRelevance, setMinRelevance] = useState('70');

  const executeSearch = useCallback(async (searchQuery, docType, minRel) => {
    if (!searchQuery || !searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await searchService.search(searchQuery.trim(), {
        limit: 10,
        type: docType === 'All' ? undefined : docType,
        minSimilarity: parseFloat(minRel) / 100,
      });

      setSearchMode(data.mode || 'vector');

      const mapped = (data.results || []).map((r) => ({
        id: r.documentId,
        chunkId: r.chunkId,
        title: r.documentTitle || 'Untitled Document',
        type: r.documentType || 'literature',
        category: r.documentType || 'Biotech Research',
        authors: 'BioWeave Researcher',
        journal: 'BioWeave Knowledge Base',
        date: '2026',
        snippet: r.text,
        relevance: Math.min(99, Math.max(60, Math.round((r.score || 0.85) * 100))),
        tags: [r.documentType || 'protocol', 'Knowledge Passages'],
      }));

      setResults(mapped);
    } catch (err) {
      console.warn('Search API failed, falling back to local search dataset:', err.message);
      try {
        const mockDocs = await fetchDocuments();
        const filtered = mockDocs
          .filter((doc) => {
            const matchesType = docType === 'All' || doc.type === docType || doc.category === docType;
            const textContent = `${doc.title} ${doc.extractedText || ''} ${doc.snippet || ''}`.toLowerCase();
            const matchesQuery = textContent.includes(searchQuery.toLowerCase().trim());
            return matchesType && matchesQuery;
          })
          .map((doc) => ({
            id: doc.id || doc._id,
            chunkId: `mock-chunk-${doc.id}`,
            title: doc.title,
            type: doc.type,
            category: doc.category || doc.type,
            authors: doc.authors || 'BioWeave Researcher',
            journal: doc.journal || 'BioWeave Library',
            date: doc.date || '2026',
            snippet: doc.extractedText || doc.snippet,
            relevance: doc.relevance || 88,
            tags: doc.tags || ['Knowledge Base'],
          }));

        setSearchMode('fallback');
        setResults(filtered);
      } catch (fallbackErr) {
        setError('Unable to perform search at this time.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    executeSearch(activeQuery, selectedType, minRelevance);
  }, [activeQuery, selectedType, minRelevance, executeSearch]);

  const handleSearch = (q) => {
    if (!q || !q.trim()) return;
    setActiveQuery(q.trim());
    setSearchParams({ q: q.trim() });
  };

  return (
    <PageContainer title="Knowledge Search">
      {/* Top Search Hero */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Biotech Knowledge Search</h2>
          <p className="text-xs text-slate-500 mt-1">
            Perform semantic vector search across scientific literature, protocols, sequence annotations, and lab notes.
          </p>
        </div>

        <SearchBar
          value={query}
          onChange={setQuery}
          onSearch={handleSearch}
          placeholder="Search genomic targets, LNPs, CRISPR vectors, or protocol steps..."
          size="lg"
          showAiBadge
        />

        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400 font-medium">Popular queries:</span>
          {['CRISPR-Cas12a plant protocol', 'LNP liver tropism', 'PETase thermostability', 'CAR-T exhaustion TOX'].map((tag, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(tag);
                handleSearch(tag);
              }}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-950 font-medium transition-colors border border-slate-200/80"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Main Results + Filters Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Filters Sidebar (1 col) */}
        <div className="space-y-4">
          <Card className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-emerald-800" /> Search Filters
              </span>
              <button
                onClick={() => {
                  setSelectedType('All');
                  setMinRelevance('70');
                }}
                className="text-[11px] text-emerald-800 font-medium hover:underline"
              >
                Reset
              </button>
            </div>

            <Select
              label="Document Type"
              id="searchDocType"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              options={[
                { value: 'All', label: 'All Document Types' },
                { value: 'Research Paper', label: 'Research Papers' },
                { value: 'Protocol', label: 'Protocols' },
                { value: 'Lab Note', label: 'Lab Notebook Entries' },
              ]}
            />

            <Select
              label="Min Relevance Match"
              id="minRelevance"
              value={minRelevance}
              onChange={(e) => setMinRelevance(e.target.value)}
              options={[
                { value: '70', label: '70% Match & Above' },
                { value: '80', label: '80% Match & Above' },
                { value: '90', label: '90% Match & Above' },
              ]}
            />

            <div className="pt-2 text-xs text-slate-500 space-y-2">
              <p className="font-semibold text-slate-700 uppercase tracking-wider text-[10px]">Organism Filter</p>
              <div className="space-y-1.5">
                {['Homo sapiens', 'Mus musculus', 'Arabidopsis thaliana', 'Ideonella sakaiensis'].map((org, i) => (
                  <label key={i} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-emerald-800 focus:ring-emerald-700" />
                    <span>{org}</span>
                  </label>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Results List (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs flex-wrap gap-2">
            <span>
              Found <strong className="text-slate-800">{results.length}</strong> passage result{results.length !== 1 ? 's' : ''} for{' '}
              <span className="text-emerald-900 font-semibold">"{activeQuery}"</span>
            </span>

            <div className="flex items-center gap-2">
              {searchMode === 'vector' ? (
                <Badge variant="success" size="sm" className="bg-emerald-100 text-emerald-900 border-emerald-300">
                  <Sparkles className="w-3 h-3 text-emerald-700" />
                  <span>Vector Cosine Search</span>
                </Badge>
              ) : (
                <Badge variant="warning" size="sm" className="bg-amber-50 text-amber-900 border-amber-300">
                  <HelpCircle className="w-3 h-3 text-amber-700" />
                  <span>Fallback Text Search</span>
                </Badge>
              )}
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <Loader2 className="w-7 h-7 border-2 border-emerald-800 border-t-transparent rounded-full animate-spin mx-auto text-emerald-800" />
              <p className="text-xs font-semibold text-slate-700">Searching research passages & vector embeddings...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-800 space-y-2">
              <p className="font-bold text-sm">Search Error</p>
              <p>{error}</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2 text-slate-500 shadow-xs">
              <p className="font-bold text-slate-800 text-sm">No Relevant Passages Found</p>
              <p className="text-xs">Try broadening your search query or selecting "All Document Types".</p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result) => (
                <SearchResult key={result.chunkId || result.id} result={result} query={activeQuery} />
              ))}
            </div>
          )}
        </div>

      </div>
    </PageContainer>
  );
}
