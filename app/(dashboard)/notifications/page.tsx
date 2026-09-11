import { ComingSoon } from '@/components/coming-soon';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  return (
    <ComingSoon
      title="Notifications"
      description="Compose and schedule push notifications and in-app announcements in a future phase."
      icon={Bell}
    />
  );
}
