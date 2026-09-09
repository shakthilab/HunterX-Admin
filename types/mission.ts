export type MissionDifficulty = 'easy' | 'medium' | 'hard';
export type MissionStatus = 'active' | 'draft' | 'archived';

export type Mission = {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: MissionDifficulty;
  xpReward: number;
  status: MissionStatus;
  completions: number;
  createdAt: string;
};

export type MissionStats = {
  totalMissions: number;
  activeMissions: number;
  completionsToday: number;
  avgXpReward: number;
};
