
export interface Holding {
  id: string;
  symbol: string;
  weight: number;
}

export interface PredictionPoint {
  date: string;
  optimistic: number;
  expected: number;
  pessimistic: number;
}

export interface AnalysisResult {
  predictionData: PredictionPoint[];
  summary: {
    expectedReturn: number;
    annualizedReturn: number;
    riskLevel: 'Low' | 'Medium' | 'High' | 'Extreme';
    riskReasoning: string;
    topPerformers: string[];
    potentialRisks: string[];
  };
  insights: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}
