'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { User } from 'firebase/auth';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">FundFlow AI</h1>
          <nav className="flex gap-4">
            {user ? (
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-blue-600">
                  Login
                </Link>
                <Link href="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-5xl font-bold mb-6 text-gray-900">
            AI-Powered Fundraising Automation
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Analyze your pitch deck, match with perfect investors, and automate outreach.
            Raise faster with FundFlow AI.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup" className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-700">
              Get Started Free
            </Link>
            <Link href="#features" className="border border-gray-300 px-8 py-3 rounded-lg text-lg hover:bg-gray-50">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 border rounded-xl">
              <div className="text-4xl mb-4">📊</div>
              <h4 className="text-xl font-semibold mb-2">Deck Analysis</h4>
              <p className="text-gray-600">
                Upload your pitch deck and get an AI-powered Investment Readiness Score with actionable feedback.
              </p>
            </div>
            <div className="p-6 border rounded-xl">
              <div className="text-4xl mb-4">🎯</div>
              <h4 className="text-xl font-semibold mb-2">Investor Matching</h4>
              <p className="text-gray-600">
                Access 10,000+ investors and get ranked matches based on stage, sector, and geography.
              </p>
            </div>
            <div className="p-6 border rounded-xl">
              <div className="text-4xl mb-4">📧</div>
              <h4 className="text-xl font-semibold mb-2">Outreach Automation</h4>
              <p className="text-gray-600">
                Generate personalized emails and track responses. Close meetings faster.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">Simple Pricing</h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="p-6 border rounded-xl bg-white">
              <h4 className="text-2xl font-bold mb-2">Starter</h4>
              <p className="text-4xl font-bold mb-4">Free</p>
              <ul className="space-y-2 text-gray-600 mb-6">
                <li>✓ 3 deck analyses</li>
                <li>✓ 30 investor matches</li>
                <li>✓ Email templates</li>
              </ul>
              <Link href="/signup" className="block text-center border border-blue-600 text-blue-600 py-2 rounded-lg hover:bg-blue-50">
                Get Started
              </Link>
            </div>
            <div className="p-6 border-2 border-blue-600 rounded-xl bg-white relative">
              <span className="absolute top-4 right-4 bg-blue-600 text-white text-xs px-2 py-1 rounded">Popular</span>
              <h4 className="text-2xl font-bold mb-2">Pro</h4>
              <p className="text-4xl font-bold mb-4">$10<span className="text-lg text-gray-600">/mo</span></p>
              <ul className="space-y-2 text-gray-600 mb-6">
                <li>✓ 10 deck analyses</li>
                <li>✓ 10,000+ investors</li>
                <li>✓ Priority support</li>
                <li>✓ Monthly coaching</li>
              </ul>
              <Link href="/signup" className="block text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                Start Free Trial
              </Link>
            </div>
            <div className="p-6 border rounded-xl bg-white">
              <h4 className="text-2xl font-bold mb-2">Managed</h4>
              <p className="text-4xl font-bold mb-4">Custom</p>
              <ul className="space-y-2 text-gray-600 mb-6">
                <li>✓ 500+ pipeline</li>
                <li>✓ Weekly coaching</li>
                <li>✓ Custom templates</li>
                <li>✓ Warm intros</li>
              </ul>
              <Link href="/contact" className="block text-center border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white border-t">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>Build your fundraising automation with FundFlow AI</p>
        </div>
      </footer>
    </div>
  );
}
