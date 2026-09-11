import { ComingSoon } from '@/components/coming-soon';
import { Gift } from 'lucide-react';

export default function RewardsPage() {
  return (
    <ComingSoon
      title="Rewards & Coupons"
      description="Create and manage coupon codes, reward tiers, and partner redemptions in a future phase."
      icon={Gift}
    />
  );
}
