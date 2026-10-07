import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import SearchBar from '../components/ui/SearchBar';
import SearchResult from '../components/research/SearchResult';
import Card from '../components/ui/Card';
import { Select } from '../components/ui/Input';
import { fetchDocuments } from '../services/api';

export default function KnowledgeSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || 'Lipid nanoparticles mRNA transfection efficiency';
  const [query, setQuery] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [documents, setDocuments] = useState([]);
  const [selectedType, setSelectedType] = useState('All');
  const [minRelevance, setMinRelevance] = useState('70');

  useEffect(() => {
    fetchDocuments().then(setDocuments);
  }, []);

  const handleSearch = (q) => {
    setActiveQuery(q);
    setSearchParams({ q });
  };

  const filteredResults = documents.filter((doc) => {
    const matchesType = selectedType === 'All' || doc.type === selectedType;
    const matchesRel = (doc.relevance || 85) >= parseInt(minRelevance);
    return matchesType && matchesRel;
  });

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
          <div className="flex items-center justify-between text-xs text-slate-500 bg-white px-4 py-2.5 rounded-xl border border-slate-200">
            <span>
              Found <strong className="text-slate-800">{filteredResults.length}</strong> vector-matched results for{' '}
              <span className="text-emerald-900 font-semibold">"{activeQuery}"</span>
            </span>
            <span className="text-[11px]">Ranked by Semantic Cosine Similarity</span>
          </div>

          <div className="space-y-4">
            {filteredResults.map((result) => (
              <SearchResult key={result.id} result={result} query={activeQuery} />
            ))}
          </div>
        </div>

      </div>
    </PageContainer>
  );
}
