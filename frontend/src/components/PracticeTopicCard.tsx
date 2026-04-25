import type { TopicPriority } from '../types';

const TOPIC_COLORS = [
  {
    background: 'linear-gradient(130deg, rgba(255, 126, 95, 0.2), rgba(255, 88, 88, 0.13))',
    border: 'rgba(255, 123, 87, 0.52)',
    shadow: '0 20px 36px rgba(255, 122, 89, 0.16)',
  },
  {
    background: 'linear-gradient(130deg, rgba(255, 184, 108, 0.2), rgba(255, 132, 86, 0.13))',
    border: 'rgba(255, 173, 88, 0.45)',
    shadow: '0 20px 36px rgba(255, 172, 92, 0.14)',
  },
  {
    background: 'linear-gradient(130deg, rgba(112, 187, 255, 0.2), rgba(80, 146, 255, 0.14))',
    border: 'rgba(111, 175, 255, 0.44)',
    shadow: '0 20px 36px rgba(95, 160, 255, 0.14)',
  },
  {
    background: 'linear-gradient(130deg, rgba(93, 214, 195, 0.2), rgba(73, 186, 218, 0.14))',
    border: 'rgba(96, 208, 206, 0.44)',
    shadow: '0 20px 36px rgba(86, 197, 201, 0.14)',
  },
];

interface PracticeTopicCardProps {
  topic: TopicPriority;
  index: number;
  onClick?: () => void;
}

function formatTopicName(raw: string): string {
  return raw
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function PracticeTopicCard({ topic, index, onClick }: PracticeTopicCardProps) {
  const tone = TOPIC_COLORS[index % TOPIC_COLORS.length];

  return (
    <button
      type="button"
      onClick={onClick}
      className="topic-card"
      style={{
        background: tone.background,
        borderColor: tone.border,
        boxShadow: tone.shadow,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div className="topic-title">{formatTopicName(topic.topic)}</div>
      <div className="topic-sub-title">{topic.totalMistakes} errors this week</div>
    </button>
  );
}
