import React from 'react';
import { FileText, ClipboardList, BookOpen, Stethoscope, TestTube } from 'lucide-react';
import Badge from '../ui/Badge';

export default function DocumentTypeBadge({ type, size = "md" }) {
  const normalizedType = (type || '').toLowerCase();
  
  let current = { variant: 'default', icon: FileText, label: type };

  if (type === 'Research Paper' || normalizedType === 'literature' || normalizedType === 'research paper') {
    current = { variant: 'teal', icon: BookOpen, label: type === 'literature' ? 'Literature' : type };
  } else if (type === 'Protocol' || normalizedType === 'protocol') {
    current = { variant: 'primary', icon: ClipboardList, label: 'Protocol' };
  } else if (type === 'Lab Note' || normalizedType === 'lab_note' || normalizedType === 'lab note') {
    current = { variant: 'info', icon: TestTube, label: 'Lab Note' };
  } else if (type === 'Clinical Trial' || normalizedType === 'clinical trial') {
    current = { variant: 'purple', icon: Stethoscope, label: 'Clinical Trial' };
  }

  const Icon = current.icon;

  return (
    <Badge variant={current.variant} size={size}>
      <Icon className="w-3 h-3 inline mr-1" />
      {current.label || type}
    </Badge>
  );
}
