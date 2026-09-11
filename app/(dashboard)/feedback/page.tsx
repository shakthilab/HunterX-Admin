import { ComingSoon } from '@/components/coming-soon';
import { MessageSquare } from 'lucide-react';

export default function FeedbackPage() {
  return (
    <ComingSoon
      title="Feedback & Support"
      description="A unified inbox for support tickets and in-app feedback is coming in a future phase."
      icon={MessageSquare}
    />
  );
}
