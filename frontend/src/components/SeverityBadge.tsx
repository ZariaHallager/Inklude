import type { IssueSeverity } from '../lib/types';

const COLORS: Record<IssueSeverity, string> = {
  low: 'bg-blue-bg text-blue border border-blue/20',
  medium: 'bg-yellow-bg text-yellow border border-yellow/20',
  high: 'bg-red-bg text-red border border-red/20',
};

export default function SeverityBadge({ severity }: { severity: IssueSeverity }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${COLORS[severity]}`}>
      {severity}
    </span>
  );
}
