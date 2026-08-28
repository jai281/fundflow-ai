'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser, onAuthChange } from '@/lib/auth';
import { createDeck, updateDeck, Timestamp } from '@/lib/firestore';
import { uploadDeck } from '@/lib/storage';
import { User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import Link from 'next/link';

export default function AnalyzePage() {
  const [user, setUser] = useState<User | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.ms-powerpoint': ['.ppt', '.pptx'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        setError('');
      }
    },
  });

  async function handleAnalyze() {
    if (!file || !user) return;

    setAnalyzing(true);
    setError('');
    setUploadProgress(0);

    try {
      // Step 1: Create deck record
      const deckId = await createDeck({
        userId: user.uid,
        fileName: file.name,
        status: 'analyzing',
        createdAt: Timestamp.now(),
      });

      setUploadProgress(20);

      // Step 2: Upload file to Firebase Storage
      const fileUrl = await uploadDeck(file, deckId);
      
      setUploadProgress(40);

      // Step 3: Read file content for analysis
      const text = await file.text();
      
      setUploadProgress(60);

      // Step 4: Call AI analysis API
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deckText: text, fileName: file.name }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setUploadProgress(80);

      // Step 5: Update deck with results
      await updateDeck(deckId, {
        readinessScore: data.analysis.readinessScore,
        feedback: data.analysis,
        status: 'completed',
        fileUrl,
      });

      setUploadProgress(100);
      setResult(data.analysis);
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold mt-2">Deck Analysis</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Upload Section */}
        {!result && (
          <div className="bg-white border rounded-xl p-8">
            <h2 className="text-xl font-bold mb-4">Upload Your Pitch Deck</h2>
            <p className="text-gray-600 mb-6">
              Supported formats: PDF, PPT, PPTX (max 10MB)
            </p>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition ${
                isDragActive ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-blue-600'
              }`}
            >
              <input {...getInputProps()} />
              <div className="text-4xl mb-4">📄</div>
              {isDragActive ? (
                <p className="text-blue-600">Drop your deck here...</p>
              ) : file ? (
                <div>
                  <p className="font-semibold">{file.name}</p>
                  <p className="text-sm text-gray-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <p className="text-gray-600">Drag & drop or click to browse</p>
              )}
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-4">
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">Processing: {uploadProgress}%</p>
              </div>
            )}

            {error && (
              <div className="mt-4 bg-red-50 text-red-600 p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={!file || analyzing}
              className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {analyzing ? 'Analyzing...' : 'Analyze Deck'}
            </button>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Score Card */}
            <div className="bg-white border rounded-xl p-8">
              <h2 className="text-2xl font-bold mb-4">Investment Readiness Score</h2>
              <div className="flex items-center gap-6">
                <div className={`text-6xl font-bold ${
                  result.readinessScore >= 70 ? 'text-green-600' :
                  result.readinessScore >= 50 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {result.readinessScore}/100
                </div>
                <div>
                  {result.readinessScore >= 70 ? (
                    <p className="text-green-600 font-semibold">Excellent! Your deck is investor-ready.</p>
                  ) : result.readinessScore >= 50 ? (
                    <p className="text-yellow-600 font-semibold">Good, but needs some improvements.</p>
                  ) : (
                    <p className="text-red-600 font-semibold">Needs significant work before pitching.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section Scores */}
            <div className="bg-white border rounded-xl p-8">
              <h3 className="text-xl font-bold mb-4">Section Breakdown</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(result.sections).map(([key, section]: [string, any]) => (
                  <div key={key} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold capitalize">{key}</span>
                      <span className={`px-2 py-1 rounded ${
                        section.score >= 70 ? 'bg-green-100 text-green-700' :
                        section.score >= 50 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {section.score}/100
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{section.feedback}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths */}
            {result.strengths.length > 0 && (
              <div className="bg-white border rounded-xl p-8">
                <h3 className="text-xl font-bold mb-4">✅ Strengths</h3>
                <ul className="space-y-2">
                  {result.strengths.map((strength: string, i: number) => (
                    <li key={i} className="text-gray-700">• {strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Weaknesses */}
            {result.weaknesses.length > 0 && (
              <div className="bg-white border rounded-xl p-8">
                <h3 className="text-xl font-bold mb-4">⚠️ Areas to Improve</h3>
                <ul className="space-y-2">
                  {result.weaknesses.map((weakness: string, i: number) => (
                    <li key={i} className="text-gray-700">• {weakness}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            <div className="bg-white border rounded-xl p-8">
              <h3 className="text-xl font-bold mb-4">💡 Recommendations</h3>
              <ul className="space-y-2">
                {result.recommendations.map((rec: string, i: number) => (
                  <li key={i} className="text-gray-700">• {rec}</li>
                ))}
              </ul>
            </div>

            {/* Next Steps */}
            <div className="flex gap-4">
              <button
                onClick={() => setResult(null)}
                className="flex-1 border border-gray-300 py-3 rounded-lg hover:bg-gray-50"
              >
                Analyze Another Deck
              </button>
              <Link
                href="/dashboard/investors"
                className="flex-1 bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700"
              >
                Find Investors →
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
