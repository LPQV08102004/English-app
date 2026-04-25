import type { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  subLabel: string;
  tone: 'ember' | 'azure' | 'rose';
}

export default function StatCard({
  icon,
  label,
  value,
  subLabel,
  tone,
}: StatCardProps) {
  return (
    <article className={`stat-card stat-card-${tone}`}>
      <div className="stat-card-header">
        <span className="stat-card-icon">{icon}</span>
        <span className="stat-card-label">{label}</span>
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-sub-label">{subLabel}</div>
    </article>
  );
}
