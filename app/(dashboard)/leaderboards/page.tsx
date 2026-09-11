import { ComingSoon } from '@/components/coming-soon';
import { Trophy } from 'lucide-react';

export default function LeaderboardsPage() {
  return (
    <ComingSoon
      title="Leaderboards"
      description="Global and friend leaderboards ranked by XP, level, and streak are coming in a future phase."
      icon={Trophy}
    />
  );
}
