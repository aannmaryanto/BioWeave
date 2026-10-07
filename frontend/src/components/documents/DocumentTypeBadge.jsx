import React from 'react';
import { FileText, ClipboardList, BookOpen, Stethoscope, TestTube } from 'lucide-react';
import Badge from '../ui/Badge';

export default function DocumentTypeBadge({ type, size = "md" }) {
  const config = {
    'Research Paper': { variant: 'teal', icon: BookOpen },
    'Protocol': { variant: 'primary', icon: ClipboardList },
    'Lab Note': { variant: 'info', icon: TestTube },
    'Clinical Trial': { variant: 'purple', icon: Stethoscope },
  };

  const current = config[type] || { variant: 'default', icon: FileText };
  const Icon = current.icon;

  return (
    <Badge variant={current.variant} size={size}>
      <Icon className="w-3 h-3 inline mr-1" />
      {type}
    </Badge>
  );
}
