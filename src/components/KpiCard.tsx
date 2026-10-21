import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: {
    text: string;
    type?: 'neutral' | 'success' | 'teal' | 'amber';
  };
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-[#e6eaf0] p-5 sm:p-6 shadow-[0_2px_10px_rgba(16,36,58,0.035)] flex flex-col justify-between hover:border-slate-300 transition-all">
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
          {title}
        </span>
        {Icon && (
          <div className="p-2 rounded-xl bg-slate-50 text-[#0D9488]">
            <Icon size={18} />
          </div>
        )}
      </div>

      <div>
        <div className="text-2xl sm:text-3xl font-extrabold text-[#10243A] tracking-tight">
          {value}
        </div>

        {(subtitle || badge) && (
          <div className="mt-2.5 flex items-center flex-wrap gap-2 text-xs">
            {badge && (
              <span
                className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                  badge.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : badge.type === 'teal'
                    ? 'bg-[#0D9488]/10 text-[#0D9488] border border-[#0D9488]/20'
                    : badge.type === 'amber'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {badge.text}
              </span>
            )}
            {subtitle && <span className="text-slate-400 text-[11px]">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
