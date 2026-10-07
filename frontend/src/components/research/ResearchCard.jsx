import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Tag } from 'lucide-react';
import Card from '../ui/Card';
import DocumentTypeBadge from '../documents/DocumentTypeBadge';

export default function ResearchCard({ title, category, type, date, id }) {
  const navigate = useNavigate();

  return (
    <Card hoverable className="space-y-3 border-slate-200">
      <div className="flex items-center justify-between">
        <DocumentTypeBadge type={type} size="sm" />
        <span className="text-[11px] font-medium text-slate-400">{date}</span>
      </div>

      <h4
        onClick={() => navigate(`/documents/${id}`)}
        className="text-sm font-semibold text-slate-900 hover:text-emerald-900 cursor-pointer line-clamp-2"
      >
        {title}
      </h4>

      <div className="flex items-center justify-between pt-2 text-xs border-t border-slate-100">
        <span className="text-slate-500 font-medium flex items-center gap-1">
          <Tag className="w-3 h-3 text-slate-400" /> {category}
        </span>
        <button
          onClick={() => navigate(`/documents/${id}`)}
          className="text-emerald-800 hover:text-emerald-950 font-semibold flex items-center gap-1"
        >
          <span>Explore</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </Card>
  );
}
