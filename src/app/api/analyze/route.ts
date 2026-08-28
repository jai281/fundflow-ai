import { NextRequest, NextResponse } from 'next/server';

// Gemini API integration for pitch deck analysis
export async function POST(request: NextRequest) {
  try {
    const { deckText, fileName } = await request.json();

    if (!deckText) {
      return NextResponse.json(
        { error: 'Deck text is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI API key not configured' },
        { status: 500 }
      );
    }

    // Build analysis prompt
    const prompt = `You are an expert venture capital analyst. Analyze this pitch deck and provide:

1. An Investment Readiness Score (0-100)
2. Section scores (0-100) for: Problem, Market, Traction, Team, Financials, Ask
3. Specific feedback for each section
4. Top 3 strengths
5. Top 3 weaknesses
6. Top 5 actionable recommendations

Deck content:
${deckText}

Respond in valid JSON format with this exact structure:
{
  "readinessScore": number,
  "sections": {
    "problem": { "score": number, "feedback": string },
    "market": { "score": number, "feedback": string },
    "traction": { "score": number, "feedback": string },
    "team": { "score": number, "feedback": string },
    "financials": { "score": number, "feedback": string },
    "ask": { "score": number, "feedback": string }
  },
  "strengths": string[],
  "weaknesses": string[],
  "recommendations": string[]
}`;

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      return NextResponse.json(
        { error: 'AI analysis failed' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) {
      return NextResponse.json(
        { error: 'No analysis generated' },
        { status: 500 }
      );
    }

    // Parse JSON from response (Gemini may wrap in markdown)
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(textResponse);

    // Validate structure
    if (!analysis.readinessScore || !analysis.sections) {
      return NextResponse.json(
        { error: 'Invalid analysis format' },
        { status: 500 }
      );
    }

    return NextResponse.json({ analysis, fileName });
  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}
