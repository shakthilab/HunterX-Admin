import { ComingSoon } from '@/components/coming-soon';
import { CreditCard } from 'lucide-react';

export default function SubscriptionsPage() {
  return (
    <ComingSoon
      title="Subscriptions & Billing"
      description="Manage plans, billing cycles, and payment history for every subscriber in a future phase."
      icon={CreditCard}
    />
  );
}
