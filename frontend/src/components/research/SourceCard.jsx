import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ExternalLink, Sparkles } from 'lucide-react';
import DocumentTypeBadge from '../documents/DocumentTypeBadge';

export default function SourceCard({ source, index }) {
  const navigate = useNavigate();
  const { id, title, type, relevance, snippet, date } = source;

  return (
    <div className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-emerald-600/40 hover:shadow-xs transition-all space-y-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center text-[10px]">
            [{index + 1}]
          </span>
          <DocumentTypeBadge type={type} size="sm" />
        </div>
        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
          {relevance || 92}% Match
        </span>
      </div>

      <h4
        onClick={() => navigate(`/documents/${id}`)}
        className="text-xs font-bold text-slate-900 hover:text-emerald-900 cursor-pointer line-clamp-2"
      >
        {title}
      </h4>

      {snippet && (
        <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight italic bg-slate-50 p-2 rounded">
          "{snippet}"
        </p>
      )}

      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
        <span>Added {date}</span>
        <button
          onClick={() => navigate(`/documents/${id}`)}
          className="text-emerald-800 hover:text-emerald-950 font-medium inline-flex items-center gap-1 hover:underline"
        >
          <span>View Source</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
