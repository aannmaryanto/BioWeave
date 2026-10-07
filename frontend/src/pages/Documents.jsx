import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/ui/Button';
import SearchBar from '../components/ui/SearchBar';
import { Select } from '../components/ui/Input';
import DocumentTable from '../components/documents/DocumentTable';
import { documentService } from '../services/api';

export default function Documents() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const fetchDocumentsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (selectedType && selectedType !== 'All') {
        params.type = selectedType;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const data = await documentService.getDocuments(params);
      setDocuments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError(err.response?.data?.message || 'Failed to load documents from backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDocumentsData();
    }, 250);

    return () => clearTimeout(timer);
  }, [selectedType, searchQuery]);

  // Client-side filtering fallback for status if selected
  const displayedDocuments = documents.filter((doc) => {
    if (selectedStatus === 'All') return true;
    const lowerStatus = String(doc.status || '').toLowerCase();
    return lowerStatus === selectedStatus.toLowerCase();
  });

  return (
    <PageContainer title="Document Library">
      {/* Header & Primary Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Document Library</h2>
          <p className="text-xs text-slate-500 mt-1">
            Browse, search, and manage research literature, protocols, and internal lab notes.
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
            placeholder="Search documents by title..."
            showAiBadge={false}
            className="flex-1"
          />

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              options={[
                { value: 'All', label: 'All Document Types' },
                { value: 'protocol', label: 'Protocols' },
                { value: 'lab_note', label: 'Lab Notes' },
                { value: 'literature', label: 'Literature' },
              ]}
              className="py-1.5 text-xs font-medium min-w-[160px]"
            />

            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={[
                { value: 'All', label: 'All Statuses' },
                { value: 'uploaded', label: 'Uploaded' },
                { value: 'processing', label: 'Processing' },
                { value: 'processed', label: 'Processed' },
                { value: 'failed', label: 'Failed' },
              ]}
              className="py-1.5 text-xs font-medium min-w-[140px]"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Showing <strong className="text-slate-800">{displayedDocuments.length}</strong> of{' '}
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

      {/* Loading & Error States */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 shadow-xs">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-800 mx-auto mb-2" />
          <p className="text-xs font-medium">Loading documents from BioWeave backend...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center text-rose-800 space-y-2">
          <AlertCircle className="w-6 h-6 text-rose-600 mx-auto" />
          <h3 className="text-sm font-semibold">Error Loading Documents</h3>
          <p className="text-xs text-rose-600 max-w-md mx-auto">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchDocumentsData} className="mt-2">
            Retry Loading
          </Button>
        </div>
      ) : (
        /* Main Document Table / Empty State handled internally */
        <DocumentTable documents={displayedDocuments} />
      )}
    </PageContainer>
  );
}
