export enum RiskLevel {
  SAFE = 'SAFE',
  WARNING = 'WARNING',
  DANGER = 'DANGER',
  UNKNOWN = 'UNKNOWN'
}

export interface ScanResult {
  riskLevel: RiskLevel;
  content: string;
  summary: string;
  reasoning: string[];
  safetyTips: string[];
}

export interface FraudCase {
  id: string;
  title: string;
  description: string;
  lossAmount: string;
  technique: string;
  prevention: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export enum AppView {
  SCANNER = 'SCANNER',
  EDUCATION = 'EDUCATION',
  TEST_LAB = 'TEST_LAB',
  HISTORY = 'HISTORY'
}