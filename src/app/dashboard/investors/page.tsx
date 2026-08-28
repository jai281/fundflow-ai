'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser, onAuthChange } from '@/lib/auth';
import { getUser, searchInvestors, createMatch, Timestamp } from '@/lib/firestore';
import { User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function InvestorsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [investors, setInvestors] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    stage: '',
    sector: '',
  });
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthChange(async (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }

      setUser(currentUser);

      // Load user profile
      const userProfile = await getUser(currentUser.uid);
      setProfile(userProfile);

      // Load investors
      const allInvestors = await searchInvestors({});
      setInvestors(allInvestors);

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  async function handleMatch() {
    if (!profile || !user) return;

    setMatching(true);

    try {
      // Call matching API
      const response = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfile: {
            stage: profile.stage,
            sector: profile.sector,
            geography: profile.geography,
          },
        }),
      });

      const data = await response.json();

      if (data.matches) {
        setMatches(data.matches);

        // Save top matches to Firestore
        const topMatches = data.matches.slice(0, 10);
        for (const match of topMatches) {
          await createMatch({
            userId: user.uid,
            deckId: 'pending', // Will be updated after deck analysis
            investorId: match.investorId,
            matchScore: match.matchScore,
            reasons: match.reasons,
            status: 'pending',
            createdAt: Timestamp.now(),
          });
        }
      }
    } catch (error: any) {
      console.error('Matching error:', error);
    } finally {
      setMatching(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold mt-2">Find Investors</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Profile Summary */}
        <div className="bg-white border rounded-xl p-6 mb-6">
          <h2 className="text-lg font-bold mb-2">Your Profile</h2>
          <p className="text-gray-600">
            {profile?.stage} • {profile?.sector} • {profile?.geography}
          </p>
          <button
            onClick={handleMatch}
            disabled={matching}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {matching ? 'Finding Matches...' : 'Find My Best Matches'}
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white border rounded-xl p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">Filter Investors</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="border rounded-lg px-4 py-2"
            >
              <option value="all">All Types</option>
              <option value="angel">Angels</option>
              <option value="vc">VCs</option>
              <option value="accelerator">Accelerators</option>
            </select>
            <select
              value={filters.stage}
              onChange={(e) => setFilters({ ...filters, stage: e.target.value })}
              className="border rounded-lg px-4 py-2"
            >
              <option value="">All Stages</option>
              <option value="pre-seed">Pre-seed</option>
              <option value="seed">Seed</option>
              <option value="series-a">Series A</option>
            </select>
            <input
              type="text"
              placeholder="Filter by sector..."
              value={filters.sector}
              onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
              className="border rounded-lg px-4 py-2"
            />
          </div>
        </div>

        {/* Results */}
        {matches.length > 0 ? (
          <div className="bg-white border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4">Investor</th>
                  <th className="text-left p-4">Firm</th>
                  <th className="text-left p-4">Type</th>
                  <th className="text-left p-4">Match Score</th>
                  <th className="text-left p-4">Stages</th>
                  <th className="text-left p-4">Sectors</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match) => (
                  <tr key={match.investorId} className="border-t hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-semibold">{match.investor.name}</div>
                      {match.reasons.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {match.reasons.join(' • ')}
                        </div>
                      )}
                    </td>
                    <td className="p-4">{match.investor.firm}</td>
                    <td className="p-4 capitalize">{match.investor.type}</td>
                    <td className="p-4">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {match.matchScore}/100
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      {match.investor.stages?.join(', ')}
                    </td>
                    <td className="p-4 text-sm">
                      {match.investor.sectors?.slice(0, 3).join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white border rounded-xl p-8 text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-2">No Matches Yet</h3>
            <p className="text-gray-600 mb-4">
              Click "Find My Best Matches" to see personalized investor recommendations.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
