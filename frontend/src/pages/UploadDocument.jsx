import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  X,
  Sparkles,
  Info
} from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import Card, { CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input, { Select, Textarea } from '../components/ui/Input';

export default function UploadDocument() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Research Paper');
  const [category, setCategory] = useState('Lipid Nanoparticles');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile && !title) return;

    setUploading(true);
    let current = 0;
    const interval = setInterval(() => {
      current += 20;
      setProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setUploading(false);
          navigate('/documents');
        }, 400);
      }
    }, 200);
  };

  return (
    <PageContainer title="Upload Research Document">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Upload Research Document</h2>
        <p className="text-xs text-slate-500 mt-1">
          Import PDF research papers, FASTA sequence files, PDB protein structures, or lab protocols for AI vector indexing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Upload Form (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
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
                  accept=".pdf,.fasta,.pdb,.docx,.txt,.csv"
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
                        Supports PDF, FASTA, PDB, DOCX, TXT, CSV (Up to 50MB)
                      </p>
                    </div>
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 text-left max-w-lg mx-auto">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-800">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900 truncate max-w-xs">{selectedFile.name}</p>
                        <p className="text-[10px] text-slate-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
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
              <CardTitle subtitle="Provide details for automatic metadata indexing">
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
                    'Research Paper',
                    'Protocol',
                    'Lab Note',
                    'Genomic Sequence Report',
                    'Clinical Trial Data',
                  ]}
                  required
                />

                <Select
                  label="Research Domain / Category"
                  id="docCategory"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  options={[
                    'Lipid Nanoparticles',
                    'Gene Editing & CRISPR',
                    'Enzymology & Protein Folding',
                    'Immunology & CAR-T',
                    'Analytical Chemistry & LC-MS',
                  ]}
                />
              </div>

              <Textarea
                label="Description & Research Notes (Optional)"
                id="docDescription"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add experimental background, sample batch IDs, or key hypotheses..."
              />
            </Card>

            {/* Upload Progress Bar if Uploading */}
            {uploading && (
              <Card className="space-y-2 bg-emerald-50/50 border-emerald-200">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-900">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-700 animate-spin" />
                    Processing and indexing document vectors...
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-700 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </Card>
            )}

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate('/documents')}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="md"
                leftIcon={UploadCloud}
                isLoading={uploading}
              >
                Upload & Process with AI
              </Button>
            </div>

          </form>
        </div>

        {/* Right Info Panel (1 col) */}
        <div className="space-y-6">
          <Card className="space-y-4 bg-emerald-950 text-slate-100 border-emerald-900">
            <div className="flex items-center gap-2 text-emerald-400">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">AI Processing Pipeline</h3>
            </div>

            <ul className="space-y-3 text-xs text-emerald-100/80">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>OCR & Layout Extraction:</strong> Extracts structural sections, figures, tables, and references.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Entity Recognition:</strong> Automatically tags Genes, Proteins, Chemical Molecules, and Organisms.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Dense Vector Embedding:</strong> Indexes text chunks for semantic research retrieval.</span>
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
                <span className="font-mono font-medium">.FASTA / .PDB</span>
                <span>Genomic & protein files</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                <span className="font-mono font-medium">.DOCX / .TXT</span>
                <span>Lab notes & protocol drafts</span>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </PageContainer>
  );
}
