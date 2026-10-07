import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  X,
  Sparkles,
  Info,
  AlertCircle,
  Loader2
} from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import Card, { CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input, { Select, Textarea } from '../components/ui/Input';
import { documentService } from '../services/api';

export default function UploadDocument() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('literature');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Client-side file validation helper
  const validateFile = (file) => {
    if (!file) return false;

    const allowedExtensions = ['.pdf', '.txt', '.doc', '.docx'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      setError('Unsupported file type. Allowed formats: PDF, TXT, DOC, DOCX');
      return false;
    }

    const maxSizeBytes = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSizeBytes) {
      setError('File size exceeds the 10 MB limit');
      return false;
    }

    setError(null);
    return true;
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        if (!title) {
          setTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
      }
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        if (!title) {
          setTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
      }
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedFile) {
      setError('Please select a document file to upload');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a document title');
      return;
    }

    if (!validateFile(selectedFile)) {
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title.trim());
      formData.append('type', type);
      if (description.trim()) {
        formData.append('description', description.trim());
      }

      const response = await documentService.uploadDocument(formData);
      setSuccess('Document uploaded successfully!');
      
      // Clear form
      setSelectedFile(null);
      setTitle('');
      setDescription('');

      // Navigate to /documents after short delay
      setTimeout(() => {
        navigate('/documents');
      }, 800);
    } catch (err) {
      console.error('Upload Error:', err);
      setError(
        err.response?.data?.message || err.message || 'Failed to upload document'
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <PageContainer title="Upload Research Document">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Upload Research Document</h2>
        <p className="text-xs text-slate-500 mt-1">
          Import research papers, protocols, or lab notes to your BioWeave repository.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Upload Form (2 cols) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Feedback Messages */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3 text-rose-800 text-xs">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-emerald-900 text-xs font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleUploadSubmit} className="space-y-6">
            
            {/* Drag & Drop Area */}
            <Card padding="none" className="overflow-hidden">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
                className={`p-8 text-center border-2 border-dashed transition-all cursor-pointer ${
                  isDragging
                    ? 'border-emerald-700 bg-emerald-50/50'
                    : selectedFile
                    ? 'border-emerald-500/60 bg-emerald-50/20'
                    : 'border-slate-300 hover:border-emerald-600 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <input
                  type="file"
                  id="file-upload-input"
                  className="hidden"
                  onChange={handleFileSelect}
                  accept=".pdf,.txt,.doc,.docx"
                />

                {!selectedFile ? (
                  <label htmlFor="file-upload-input" className="cursor-pointer space-y-3 block">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
                      <UploadCloud className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Drag and drop your research file here, or{' '}
                        <span className="text-emerald-800 font-bold underline">browse files</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Supports PDF, TXT, DOC, DOCX (Up to 10MB)
                      </p>
                    </div>
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 text-left max-w-lg mx-auto">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-800">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate max-w-xs">{selectedFile.name}</p>
                        <p className="text-[10px] text-slate-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setError(null);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </Card>

            {/* Document Metadata Form */}
            <Card className="space-y-4">
              <CardTitle subtitle="Provide details for document organization">
                Document Details
              </CardTitle>

              <Input
                label="Document Title"
                id="docTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Optimizing Lipid Nanoparticle Formulations for mRNA Delivery"
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Document Type"
                  id="docType"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  options={[
                    { value: 'literature', label: 'Literature / Research Paper' },
                    { value: 'protocol', label: 'Protocol (SOP)' },
                    { value: 'lab_note', label: 'Lab Notebook Entry' },
                  ]}
                  required
                />
              </div>

              <Textarea
                label="Description & Research Notes (Optional)"
                id="docDescription"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add experimental background, sample batch IDs, or key notes..."
              />
            </Card>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="secondary"
                size="md"
                type="button"
                onClick={() => navigate('/documents')}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="md"
                leftIcon={uploading ? Loader2 : UploadCloud}
                isLoading={uploading}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload Document'}
              </Button>
            </div>

          </form>
        </div>

        {/* Right Info Panel (1 col) */}
        <div className="space-y-6">
          <Card className="space-y-4 bg-emerald-950 text-slate-100 border-emerald-900">
            <div className="flex items-center gap-2 text-emerald-400">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">Document Management</h3>
            </div>

            <ul className="space-y-3 text-xs text-emerald-100/80">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Secure File Storage:</strong> Files are stored safely with access controls restricted to your account.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Metadata Tracking:</strong> Organizes documents by type, filename, size, and creation timestamp.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Supported Formats:</strong> PDF, TXT, DOC, DOCX up to 10 MB per file.</span>
              </li>
            </ul>
          </Card>

          <Card className="space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs uppercase tracking-wider">
              <Info className="w-4 h-4 text-emerald-800" />
              Supported Formats
            </div>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                <span className="font-mono font-medium">.PDF</span>
                <span>Research papers & patents</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                <span className="font-mono font-medium">.DOC / .DOCX</span>
                <span>Microsoft Word documents</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                <span className="font-mono font-medium">.TXT</span>
                <span>Plain text lab notes</span>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </PageContainer>
  );
}
