import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  colorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, subValue, icon: Icon, colorClass }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 flex items-center space-x-4 transition hover:shadow-md">
      <div className={`p-3 rounded-full ${colorClass} bg-opacity-10 shrink-0`}>
        <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-500 truncate">{label}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        {subValue && <p className="text-xs text-slate-400 mt-1 truncate" title={subValue}>{subValue}</p>}
      </div>
    </div>
  );
};

export default StatCard;