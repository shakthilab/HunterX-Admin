import type { Mission, MissionStats } from '@/types/mission';

const MOCK_MISSIONS: Mission[] = [
  {
    id: 'msn_2001',
    title: 'Morning Run',
    description: 'Complete a 5km run before 9am.',
    category: 'Fitness',
    difficulty: 'medium',
    xpReward: 150,
    status: 'active',
    completions: 342,
    createdAt: '2025-01-05T07:00:00.000Z',
  },
  {
    id: 'msn_2002',
    title: '10-Minute Meditation',
    description: 'Practice mindful breathing for 10 minutes.',
    category: 'Mindfulness',
    difficulty: 'easy',
    xpReward: 60,
    status: 'active',
    completions: 891,
    createdAt: '2025-01-10T07:00:00.000Z',
  },
  {
    id: 'msn_2003',
    title: 'Deep Work Block',
    description: 'Focus on a single task for 90 minutes, distraction-free.',
    category: 'Productivity',
    difficulty: 'hard',
    xpReward: 250,
    status: 'active',
    completions: 214,
    createdAt: '2025-02-14T07:00:00.000Z',
  },
  {
    id: 'msn_2004',
    title: 'Read 20 Pages',
    description: 'Read at least 20 pages of any book.',
    category: 'Learning',
    difficulty: 'easy',
    xpReward: 80,
    status: 'active',
    completions: 567,
    createdAt: '2025-03-01T07:00:00.000Z',
  },
  {
    id: 'msn_2005',
    title: 'Cold Shower Challenge',
    description: 'Take a 3-minute cold shower.',
    category: 'Fitness',
    difficulty: 'hard',
    xpReward: 200,
    status: 'draft',
    completions: 0,
    createdAt: '2025-08-20T07:00:00.000Z',
  },
  {
    id: 'msn_2006',
    title: 'Weekly Journal Entry',
    description: 'Write a reflection on the past week.',
    category: 'Mindfulness',
    difficulty: 'medium',
    xpReward: 120,
    status: 'archived',
    completions: 128,
    createdAt: '2024-10-11T07:00:00.000Z',
  },
];

export async function getMissions(): Promise<Mission[]> {
  // TODO: API - replace with real endpoint. Expected: GET /api/v1/admin/missions -> { success: true, data: Mission[] }
  return MOCK_MISSIONS;
}

export async function getMissionStats(): Promise<MissionStats> {
  // TODO: API - replace with real endpoint. Expected: GET /api/v1/admin/missions/stats -> { success: true, data: { totalMissions: number, activeMissions: number, completionsToday: number, avgXpReward: number } }
  const active = MOCK_MISSIONS.filter((m) => m.status === 'active');
  return {
    totalMissions: MOCK_MISSIONS.length,
    activeMissions: active.length,
    completionsToday: 47,
    avgXpReward: Math.round(
      MOCK_MISSIONS.reduce((sum, m) => sum + m.xpReward, 0) / MOCK_MISSIONS.length
    ),
  };
}
