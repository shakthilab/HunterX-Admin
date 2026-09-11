import { getPendingReviews } from '@/lib/api/tasks';
import { ReviewQueueClient } from './_components/review-queue-client';

export default async function TaskReviewPage() {
  const reviews = await getPendingReviews();
  return <ReviewQueueClient initialReviews={reviews} />;
}
