import { ComingSoon } from '@/components/coming-soon';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <ComingSoon
      title="Settings & Permissions"
      description="Admin roles, permission scopes, and workspace configuration are coming in a future phase."
      icon={Settings}
    />
  );
}
