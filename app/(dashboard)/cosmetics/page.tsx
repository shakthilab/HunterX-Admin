import { ComingSoon } from '@/components/coming-soon';
import { Gem } from 'lucide-react';

export default function CosmeticsPage() {
  return (
    <ComingSoon
      title="Cosmetics & Dragons"
      description="Manage unlockable dragon stages, skins, and cosmetic drops in a future phase."
      icon={Gem}
    />
  );
}
