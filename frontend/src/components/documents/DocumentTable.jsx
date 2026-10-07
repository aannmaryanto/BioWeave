import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Download, FileText } from 'lucide-react';
import DocumentTypeBadge from './DocumentTypeBadge';
import Badge from '../ui/Badge';

export default function DocumentTable({ documents = [] }) {
  const navigate = useNavigate();

  if (documents.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-10 text-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <FileText className="w-5 h-5" />
        </div>
        <h3 className="text-xs font-semibold text-slate-800">No documents found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          No research documents match your search criteria. Try clearing search filters or uploading a new file.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50/90 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200/80">
            <tr>
              <th scope="col" className="px-4 py-3">Document Title & Details</th>
              <th scope="col" className="px-3.5 py-3">Type</th>
              <th scope="col" className="px-3.5 py-3">Category</th>
              <th scope="col" className="px-3.5 py-3">Date Added</th>
              <th scope="col" className="px-3.5 py-3">Status</th>
              <th scope="col" className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {documents.map((doc) => (
              <tr
                key={doc.id}
                className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                onClick={() => navigate(`/documents/${doc.id}`)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 group-hover:bg-emerald-100 transition-colors mt-0.5 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 group-hover:text-emerald-900 transition-colors line-clamp-1">
                        {doc.title}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span>{doc.authors}</span>
                        <span>•</span>
                        <span>{doc.fileSize}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-3.5 py-3 whitespace-nowrap">
                  <DocumentTypeBadge type={doc.type} size="sm" />
                </td>
                <td className="px-3.5 py-3 whitespace-nowrap text-xs font-medium text-slate-700">
                  {doc.category || 'General'}
                </td>
                <td className="px-3.5 py-3 whitespace-nowrap text-xs text-slate-500">
                  {doc.date}
                </td>
                <td className="px-3.5 py-3 whitespace-nowrap">
                  <Badge
                    variant={doc.status === 'Processed' ? 'success' : doc.status === 'Pending' ? 'warning' : 'danger'}
                    size="sm"
                    dot
                  >
                    {doc.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-xs" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => navigate(`/documents/${doc.id}`)}
                      className="p-1.5 text-slate-500 hover:text-emerald-800 hover:bg-emerald-50 rounded-md transition-colors"
                      title="View details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      className="p-1.5 text-slate-500 hover:text-emerald-800 hover:bg-emerald-50 rounded-md transition-colors"
                      title="Download file"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
