'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser, onAuthChange, logOut } from '@/lib/auth';
import { getUser, getUserDecks, getUserMatches } from '@/lib/firestore';
import { User } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [decks, setDecks] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
      
      // Load decks
      const userDecks = await getUserDecks(currentUser.uid);
      setDecks(userDecks);
      
      // Load matches
      const userMatches = await getUserMatches(currentUser.uid);
      setMatches(userMatches);
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  async function handleLogout() {
    await logOut();
    router.push('/');
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
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">FundFlow AI</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {profile?.name || 'Founder'}!
          </h2>
          <p className="text-gray-600">
            {profile?.sector} • {profile?.stage} • {profile?.geography}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/dashboard/analyze"
            className="p-6 bg-white border rounded-xl hover:shadow-lg transition"
          >
            <div className="text-3xl mb-2">📊</div>
            <h3 className="text-xl font-semibold mb-1">Analyze Deck</h3>
            <p className="text-gray-600">Upload and get AI feedback</p>
          </Link>
          
          <Link
            href="/dashboard/investors"
            className="p-6 bg-white border rounded-xl hover:shadow-lg transition"
          >
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="text-xl font-semibold mb-1">Find Investors</h3>
            <p className="text-gray-600">Get matched with VCs and angels</p>
          </Link>
          
          <Link
            href="/dashboard/outreach"
            className="p-6 bg-white border rounded-xl hover:shadow-lg transition"
          >
            <div className="text-3xl mb-2">📧</div>
            <h3 className="text-xl font-semibold mb-1">Outreach</h3>
            <p className="text-gray-600">Manage investor communications</p>
          </Link>
        </div>

        {/* Recent Decks */}
        <section className="mb-8">
          <h3 className="text-xl font-bold mb-4">Recent Decks</h3>
          {decks.length === 0 ? (
            <div className="bg-white border rounded-xl p-6 text-center text-gray-600">
              No decks yet.{' '}
              <Link href="/dashboard/analyze" className="text-blue-600 hover:underline">
                Upload your first deck
              </Link>
            </div>
          ) : (
            <div className="bg-white border rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4">Deck</th>
                    <th className="text-left p-4">Score</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {decks.map((deck) => (
                    <tr key={deck.id} className="border-t">
                      <td className="p-4">{deck.fileName}</td>
                      <td className="p-4">
                        {deck.readinessScore ? (
                          <span className={`px-2 py-1 rounded ${
                            deck.readinessScore >= 70 ? 'bg-green-100 text-green-700' :
                            deck.readinessScore >= 50 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {deck.readinessScore}/100
                          </span>
                        ) : '-'}
                      </td>
                      <td className="p-4">
                        <span className="capitalize">{deck.status}</span>
                      </td>
                      <td className="p-4">
                        {new Date(deck.createdAt?.seconds * 1000).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Top Investor Matches */}
        <section>
          <h3 className="text-xl font-bold mb-4">Top Investor Matches</h3>
          {matches.length === 0 ? (
            <div className="bg-white border rounded-xl p-6 text-center text-gray-600">
              No matches yet.{' '}
              <Link href="/dashboard/investors" className="text-blue-600 hover:underline">
                Find investors
              </Link>
            </div>
          ) : (
            <div className="bg-white border rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4">Investor</th>
                    <th className="text-left p-4">Firm</th>
                    <th className="text-left p-4">Match Score</th>
                    <th className="text-left p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.slice(0, 5).map((match) => (
                    <tr key={match.id} className="border-t">
                      <td className="p-4">{match.investor?.name || 'Unknown'}</td>
                      <td className="p-4">{match.investor?.firm || 'Unknown'}</td>
                      <td className="p-4">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {match.matchScore}/100
                        </span>
                      </td>
                      <td className="p-4 capitalize">{match.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
