import React from 'react';
import { Calendar, User, BookOpen, Hash, FileCode, Dna, FlaskConical, Globe } from 'lucide-react';
import Card, { CardTitle } from '../ui/Card';

export default function DocumentMetadata({ document }) {
  if (!document) return null;

  const authors = document.authors || document.uploadedBy?.name || 'BioWeave Researcher';
  const journal = document.journal || 'BioWeave Knowledge Base';
  const date = document.createdAt
    ? new Date(document.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : document.date || 'N/A';

  const formatSize = (size) => {
    if (!size) return '1.2 MB';
    if (typeof size === 'number') {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }
    return size;
  };

  const fileSize = formatSize(document.fileSize);
  const pageCount = document.pageCount || 4;
  const doi = document.doi || document._id || document.id;
  const entities = document.entities;

  return (
    <Card className="space-y-4">
      <CardTitle subtitle="Document Technical Specifications & Indexing Data">
        Metadata Overview
      </CardTitle>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3.5 text-xs">
        <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
          <User className="w-4 h-4 text-emerald-800 shrink-0" />
          <div className="min-w-0">
            <p className="font-medium text-slate-500 uppercase text-[10px]">Authors</p>
            <p className="font-semibold text-slate-800 truncate">{authors}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
          <BookOpen className="w-4 h-4 text-emerald-800 shrink-0" />
          <div className="min-w-0">
            <p className="font-medium text-slate-500 uppercase text-[10px]">Journal / Collection</p>
            <p className="font-semibold text-slate-800 truncate">{journal || 'BioWeave Library'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
          <Calendar className="w-4 h-4 text-emerald-800 shrink-0" />
          <div className="min-w-0">
            <p className="font-medium text-slate-500 uppercase text-[10px]">Publication Date</p>
            <p className="font-semibold text-slate-800">{date}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
          <Hash className="w-4 h-4 text-emerald-800 shrink-0" />
          <div className="min-w-0">
            <p className="font-medium text-slate-500 uppercase text-[10px]">DOI / ID Reference</p>
            <p className="font-semibold text-slate-800 truncate">{doi || 'N/A'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
          <FileCode className="w-4 h-4 text-emerald-800 shrink-0" />
          <div className="min-w-0">
            <p className="font-medium text-slate-500 uppercase text-[10px]">File Specifications</p>
            <p className="font-semibold text-slate-800">{fileSize} • {pageCount} pages</p>
          </div>
        </div>
      </div>

      {entities && (
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            AI-Extracted Biological Entities
          </h4>

          {entities.genes && entities.genes.length > 0 && (
            <div>
              <p className="text-[11px] text-slate-500 mb-1.5 flex items-center gap-1 font-medium">
                <Dna className="w-3 h-3 text-emerald-700 inline" /> Genes / Proteins:
              </p>
              <div className="flex flex-wrap gap-1">
                {entities.genes.map((gene, idx) => (
                  <span key={idx} className="px-2 py-0.5 text-xs font-mono font-medium bg-emerald-50 text-emerald-900 border border-emerald-200/60 rounded">
                    {gene}
                  </span>
                ))}
              </div>
            </div>
          )}

          {entities.molecules && entities.molecules.length > 0 && (
            <div>
              <p className="text-[11px] text-slate-500 mb-1.5 flex items-center gap-1 font-medium">
                <FlaskConical className="w-3 h-3 text-teal-700 inline" /> Chemical Compounds:
              </p>
              <div className="flex flex-wrap gap-1">
                {entities.molecules.map((mol, idx) => (
                  <span key={idx} className="px-2 py-0.5 text-xs font-mono font-medium bg-teal-50 text-teal-900 border border-teal-200/60 rounded">
                    {mol}
                  </span>
                ))}
              </div>
            </div>
          )}

          {entities.organisms && entities.organisms.length > 0 && (
            <div>
              <p className="text-[11px] text-slate-500 mb-1.5 flex items-center gap-1 font-medium">
                <Globe className="w-3 h-3 text-sky-700 inline" /> Target Organisms:
              </p>
              <div className="flex flex-wrap gap-1">
                {entities.organisms.map((org, idx) => (
                  <span key={idx} className="px-2 py-0.5 text-xs font-medium italic bg-sky-50 text-sky-900 border border-sky-200/60 rounded">
                    {org}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
