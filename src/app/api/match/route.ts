import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';

// Investor matching API
export async function POST(request: NextRequest) {
  try {
    const { userProfile } = await request.json();

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile is required' },
        { status: 400 }
      );
    }

    // Fetch all investors from Firestore
    const investorsSnapshot = await getDocs(collection(db, 'investors'));
    const investors = investorsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Match algorithm
    const matches = investors.map((investor) => {
      let score = 50; // Base score
      const reasons: string[] = [];

      // Stage match (+20)
      if (investor.stages?.includes(userProfile.stage)) {
        score += 20;
        reasons.push(`Invests in ${userProfile.stage} stage`);
      }

      // Sector match (+20)
      if (investor.sectors?.some((s: string) =>
        s.toLowerCase().includes(userProfile.sector.toLowerCase())
      )) {
        score += 20;
        reasons.push(`Focuses on ${userProfile.sector} sector`);
      }

      // Geography match (+10)
      if (investor.geography?.some((g: string) =>
        g.toLowerCase().includes(userProfile.geography.toLowerCase())
      )) {
        score += 10;
        reasons.push(`Active in ${userProfile.geography}`);
      }

      // Type preference (+5 for VC)
      if (investor.type === 'vc') score += 5;

      return {
        investorId: investor.id,
        investor,
        matchScore: Math.min(100, score),
        reasons,
      };
    });

    // Sort by match score descending
    matches.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({ matches });
  } catch (error: any) {
    console.error('Matching error:', error);
    return NextResponse.json(
      { error: error.message || 'Matching failed' },
      { status: 500 }
    );
  }
}
