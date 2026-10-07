import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, RefreshCw } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/ui/Button';
import SearchBar from '../components/ui/SearchBar';
import { Select } from '../components/ui/Input';
import DocumentTable from '../components/documents/DocumentTable';
import { fetchDocuments } from '../services/api';

export default function Documents() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  useEffect(() => {
    fetchDocuments().then(setDocuments);
  }, []);

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedType === 'All' || doc.type === selectedType;
    const matchesStatus = selectedStatus === 'All' || doc.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <PageContainer title="Document Library">
      {/* Header & Primary Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Document Library</h2>
          <p className="text-xs text-slate-500 mt-1">
            Browse, search, and manage vector-indexed research literature, protocols, and internal lab notes.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="primary"
            size="md"
            leftIcon={UploadCloud}
            onClick={() => navigate('/upload')}
          >
            Upload Document
          </Button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search documents by title, author, gene target, or keyword tag..."
            showAiBadge={false}
            className="flex-1"
          />

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              options={[
                { value: 'All', label: 'All Document Types' },
                { value: 'Research Paper', label: 'Research Papers' },
                { value: 'Protocol', label: 'Protocols (SOP)' },
                { value: 'Lab Note', label: 'Lab Notebook Entries' },
              ]}
              className="py-1.5 text-xs font-medium min-w-[160px]"
            />

            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={[
                { value: 'All', label: 'All Statuses' },
                { value: 'Processed', label: 'Processed' },
                { value: 'Pending', label: 'Pending' },
                { value: 'Error', label: 'Error' },
              ]}
              className="py-1.5 text-xs font-medium min-w-[140px]"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Showing <strong className="text-slate-800">{filteredDocuments.length}</strong> of{' '}
            <strong className="text-slate-800">{documents.length}</strong> documents
          </span>

          {(searchQuery || selectedType !== 'All' || selectedStatus !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('All');
                setSelectedStatus('All');
              }}
              className="text-emerald-800 font-medium hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Main Document Table */}
      <DocumentTable documents={filteredDocuments} />
    </PageContainer>
  );
}
