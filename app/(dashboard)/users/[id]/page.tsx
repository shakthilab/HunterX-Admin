import { notFound } from 'next/navigation';
import { getUserById } from '@/lib/api/users';
import { UserDetailClient } from './_components/user-detail-client';

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUserById(id);

  if (!user) {
    notFound();
  }

  return <UserDetailClient user={user} />;
}
