export type Position = 'agree' | 'neutral' | 'disagree';

export interface Party {
  id: string;
  name: string;
  longName: string;
  color: string;
  positions: Record<string, Position>;
  description?: string;
}

export interface Question {
  id: string;
  text: string;
  category?: string;
  explanation?: string;
}

export interface UserAnswer {
  questionId: string;
  value: Position | 'skip';
  weight: number; // 1 for normal, 2 for double
}

export interface MatchResult {
  partyId: string;
  score: number; // Percentage match
  maxScore: number;
  userScore: number;
}
