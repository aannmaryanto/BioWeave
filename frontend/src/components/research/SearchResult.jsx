import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import Card from '../ui/Card';
import DocumentTypeBadge from '../documents/DocumentTypeBadge';
import Badge from '../ui/Badge';

export default function SearchResult({ result, query = "" }) {
  const navigate = useNavigate();
  const { id, title, type, category, authors, journal, date, snippet, relevance, tags } = result;

  return (
    <Card hoverable className="space-y-3.5 border-slate-200">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <DocumentTypeBadge type={type} size="sm" />
          <span className="text-xs text-slate-500 font-medium">• {journal || category}</span>
        </div>
        
        <Badge variant="success" size="sm" className="bg-emerald-100/90 text-emerald-900 border-emerald-300">
          <Sparkles className="w-3 h-3 text-emerald-700" />
          <span>{relevance || 95}% Relevance Match</span>
        </Badge>
      </div>

      <div>
        <h3
          onClick={() => navigate(`/documents/${id}`)}
          className="text-base font-bold text-slate-900 hover:text-emerald-900 transition-colors cursor-pointer"
        >
          {title}
        </h3>
        <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
          <span>By {authors}</span>
          <span>•</span>
          <span>Published {date}</span>
        </p>
      </div>

      <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/60 rounded-lg text-xs text-slate-700 leading-relaxed space-y-1">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-900 uppercase tracking-wider mb-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
          Extracted Relevant Text Match:
        </div>
        <p className="italic text-slate-800">
          "{snippet}"
        </p>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="flex flex-wrap gap-1.5">
          {tags && tags.map((t, idx) => (
            <span key={idx} className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-700 rounded-md">
              #{t}
            </span>
          ))}
        </div>

        <button
          onClick={() => navigate(`/documents/${id}`)}
          className="text-xs font-semibold text-emerald-900 hover:text-emerald-950 flex items-center gap-1 hover:underline"
        >
          <span>View Source Document</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </Card>
  );
}
