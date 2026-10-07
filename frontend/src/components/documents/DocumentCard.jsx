import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, ArrowRight } from 'lucide-react';
import Card from '../ui/Card';
import DocumentTypeBadge from './DocumentTypeBadge';
import Badge from '../ui/Badge';

export default function DocumentCard({ document }) {
  const navigate = useNavigate();
  const { id, title, type, authors, date, status, snippet, tags } = document;

  return (
    <Card hoverable className="flex flex-col justify-between h-full group border-slate-200/80">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <DocumentTypeBadge type={type} size="sm" />
          <Badge
            variant={status === 'Processed' ? 'success' : status === 'Pending' ? 'warning' : 'danger'}
            size="sm"
            dot
          >
            {status}
          </Badge>
        </div>

        <h4
          onClick={() => navigate(`/documents/${id}`)}
          className="text-sm font-semibold text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-2 cursor-pointer"
        >
          {title}
        </h4>

        {snippet && (
          <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
            {snippet}
          </p>
        )}

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 rounded-md">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="pt-3.5 mt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate max-w-[110px]">{authors.split(',')[0]}</span>
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{date}</span>
          </span>
        </div>

        <button
          onClick={() => navigate(`/documents/${id}`)}
          className="text-emerald-800 hover:text-emerald-950 font-medium inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
        >
          <span>View</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </Card>
  );
}
