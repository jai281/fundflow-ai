'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser, onAuthChange } from '@/lib/auth';
import { getUser, getUserMatches, createOutreach, Timestamp } from '@/lib/firestore';
import { User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function OutreachPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [emailTemplate, setEmailTemplate] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
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

      // Load matches
      const userMatches = await getUserMatches(currentUser.uid);
      setMatches(userMatches);

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  async function generateEmail(match: any) {
    setSelectedMatch(match);
    setGenerating(true);

    try {
      const response = await fetch('/api/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          founderName: profile?.name || 'Founder',
          startupName: 'My Startup',
          investorName: match.investor?.name || 'Investor',
          sector: profile?.sector || 'Technology',
          stage: profile?.stage || 'Seed',
          oneLiner: 'We are building an AI-powered platform to automate fundraising for startups.',
        }),
      });

      const data = await response.json();
      setEmailTemplate(data.email || '');
    } catch (error: any) {
      console.error('Email generation error:', error);
    } finally {
      setGenerating(false);
    }
  }

  async function copyEmail() {
    await navigator.clipboard.writeText(emailTemplate);
    alert('Email copied to clipboard!');
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
          <h1 className="text-2xl font-bold mt-2">Outreach</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Matches List */}
          <div className="bg-white border rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">Your Matches</h2>
            {matches.length === 0 ? (
              <p className="text-gray-600">
                No matches yet.{' '}
                <Link href="/dashboard/investors" className="text-blue-600 hover:underline">
                  Find investors
                </Link>
              </p>
            ) : (
              <div className="space-y-2">
                {matches.map((match) => (
                  <button
                    key={match.id}
                    onClick={() => generateEmail(match)}
                    className={`w-full text-left p-3 border rounded-lg hover:bg-gray-50 ${
                      selectedMatch?.id === match.id ? 'bg-blue-50 border-blue-600' : ''
                    }`}
                  >
                    <div className="font-semibold">{match.investor?.name || 'Unknown'}</div>
                    <div className="text-sm text-gray-600">{match.investor?.firm}</div>
                    <div className="text-xs mt-1">
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        {match.matchScore}/100
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Email Template */}
          <div className="bg-white border rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">Email Template</h2>
            {generating ? (
              <div className="text-center py-8 text-gray-600">Generating template...</div>
            ) : emailTemplate ? (
              <div>
                <div className="text-sm text-gray-600 mb-2">
                  To: {selectedMatch?.investor?.name || 'Investor'}
                </div>
                <textarea
                  value={emailTemplate}
                  onChange={(e) => setEmailTemplate(e.target.value)}
                  className="w-full border rounded-lg p-4 h-96 font-mono text-sm"
                />
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={copyEmail}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                  >
                    Copy to Clipboard
                  </button>
                  <button
                    onClick={() => alert('In production, this would send via Resend/Postmark')}
                    className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Send Email
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600">
                Select a match to generate an email template
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
