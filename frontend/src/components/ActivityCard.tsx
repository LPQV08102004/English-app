import type { ReactNode } from 'react';

interface ActivityCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  linkLabel: string;
  tone: 'cyan' | 'sunset' | 'violet';
  onClick?: () => void;
}

const TONE_BADGES = {
  cyan: 'linear-gradient(135deg, #17b6d2, #44d8c5)',
  sunset: 'linear-gradient(135deg, #ff7f52, #f6b34c)',
  violet: 'linear-gradient(135deg, #6f88ff, #8b6cf0)',
};

const TONE_LINKS = {
  cyan: '#63e4df',
  sunset: '#ffc96f',
  violet: '#9fb2ff',
};

export default function ActivityCard({
  icon,
  title,
  description,
  linkLabel,
  tone,
  onClick,
}: ActivityCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="activity-card"
    >
      <div className="activity-icon" style={{ background: TONE_BADGES[tone] }}>
        {icon}
      </div>

      <div className="activity-title">{title}</div>
      <div className="activity-description">{description}</div>
      <div className="activity-link" style={{ color: TONE_LINKS[tone] }}>{linkLabel}</div>
    </button>
  );
}
