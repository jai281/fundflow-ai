// AI Analysis Engine for Pitch Decks
// This simulates LLM-based deck scoring and feedback

export interface DeckAnalysis {
  readinessScore: number;
  sections: {
    problem: SectionScore;
    market: SectionScore;
    traction: SectionScore;
    team: SectionScore;
    financials: SectionScore;
    ask: SectionScore;
  };
  feedback: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

interface SectionScore {
  score: number;
  feedback: string;
}

// Mock AI analysis - in production, call LLM API
export async function analyzeDeck(text: string): Promise<DeckAnalysis> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Generate scores based on text length and keywords (mock logic)
  const wordCount = text.split(' ').length;
  const hasMarket = text.toLowerCase().includes('market');
  const hasTraction = text.toLowerCase().includes('traction') || text.toLowerCase().includes('revenue');
  const hasTeam = text.toLowerCase().includes('team') || text.toLowerCase().includes('founder');
  const hasFinancials = text.toLowerCase().includes('financial') || text.toLowerCase().includes('revenue');
  
  const sections = {
    problem: {
      score: Math.min(100, 60 + Math.floor(wordCount / 50)),
      feedback: wordCount > 100 
        ? 'Problem statement is well-articulated with sufficient detail.' 
        : 'Consider expanding the problem statement with specific examples and pain points.',
    },
    market: {
      score: hasMarket ? 75 : 50,
      feedback: hasMarket 
        ? 'Market analysis is present. Consider adding TAM/SAM/SOM breakdown.' 
        : 'Add market size data (TAM, SAM, SOM) to strengthen investor confidence.',
    },
    traction: {
      score: hasTraction ? 80 : 40,
      feedback: hasTraction 
        ? 'Good traction metrics. Include MoM growth rates and key milestones.' 
        : 'Add traction metrics: users, revenue, partnerships, or pilot customers.',
    },
    team: {
      score: hasTeam ? 70 : 50,
      feedback: hasTeam 
        ? 'Team background is covered. Highlight relevant domain expertise and past exits.' 
        : 'Strengthen team section with founder backgrounds and relevant achievements.',
    },
    financials: {
      score: hasFinancials ? 65 : 45,
      feedback: hasFinancials 
        ? 'Financial projections included. Add unit economics and burn rate.' 
        : 'Include 3-5 year financial projections with key assumptions.',
    },
    ask: {
      score: 60,
      feedback: 'Clearly state funding amount, use of funds, and expected milestones.',
    },
  };
  
  const avgScore = Math.round(
    Object.values(sections).reduce((sum, s) => sum + s.score, 0) / 6
  );
  
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];
  
  if (avgScore > 70) strengths.push('Strong overall deck structure');
  if (avgScore < 60) weaknesses.push('Deck needs significant improvement');
  
  if (sections.traction.score > 70) strengths.push('Solid traction metrics');
  if (sections.traction.score < 50) weaknesses.push('Limited traction evidence');
  
  if (sections.market.score > 70) strengths.push('Clear market opportunity');
  if (sections.market.score < 50) weaknesses.push('Market analysis is weak');
  
  recommendations.push('Add customer testimonials or case studies');
  recommendations.push('Include competitive landscape matrix');
  recommendations.push('Specify clear use of funds breakdown');
  
  return {
    readinessScore: avgScore,
    sections,
    feedback: Object.values(sections).map(s => s.feedback),
    strengths,
    weaknesses,
    recommendations,
  };
}

// Investor matching algorithm
export interface InvestorMatch {
  investorId: string;
  investor: any;
  matchScore: number;
  reasons: string[];
}

export function matchInvestors(
  userProfile: { stage: string; sector: string; geography: string },
  investors: any[]
): InvestorMatch[] {
  const matches: InvestorMatch[] = [];
  
  investors.forEach(investor => {
    let score = 50; // Base score
    const reasons: string[] = [];
    
    // Stage match
    if (investor.stages?.includes(userProfile.stage)) {
      score += 20;
      reasons.push(`Invests in ${userProfile.stage} stage`);
    }
    
    // Sector match
    if (investor.sectors?.some((s: string) => 
      s.toLowerCase().includes(userProfile.sector.toLowerCase())
    )) {
      score += 20;
      reasons.push(`Focuses on ${userProfile.sector} sector`);
    }
    
    // Geography match
    if (investor.geography?.some((g: string) => 
      g.toLowerCase().includes(userProfile.geography.toLowerCase())
    )) {
      score += 10;
      reasons.push(`Active in ${userProfile.geography}`);
    }
    
    // Type preference
    if (investor.type === 'vc') score += 5;
    
    matches.push({
      investorId: investor.id,
      investor,
      matchScore: Math.min(100, score),
      reasons,
    });
  });
  
  // Sort by match score descending
  return matches.sort((a, b) => b.matchScore - a.matchScore);
}

// Email template generator
export function generateOutreachEmail(
  founderName: string,
  startupName: string,
  investorName: string,
  sector: string,
  stage: string,
  oneLiner: string
): string {
  return `Subject: ${startupName} - ${sector} ${stage} Opportunity\n\nHi ${investorName},\n\nI'm ${founderName}, founder of ${startupName}.\n\n${oneLiner}\n\nWe're raising a ${stage} round and given your focus on ${sector}, I thought this might be of interest.\n\nWould you be open to a brief 15-minute call next week?\n\nBest,\n${founderName}\n${startupName}`;
}
