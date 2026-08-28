import { NextRequest, NextResponse } from 'next/server';

// Email template generation API
export async function POST(request: NextRequest) {
  try {
    const { founderName, startupName, investorName, sector, stage, oneLiner } = await request.json();

    if (!founderName || !startupName || !investorName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate email template
    const email = `Subject: ${startupName} - ${sector} ${stage} Opportunity

Hi ${investorName},

I'm ${founderName}, founder of ${startupName}.

${oneLiner}

We're raising a ${stage} round and given your focus on ${sector}, I thought this might be of interest.

Would you be open to a brief 15-minute call next week?

Best,
${founderName}
${startupName}`;

    // In production, send via Resend/Postmark/SendGrid here
    // For now, return the template
    return NextResponse.json({ email, status: 'template_generated' });
  } catch (error: any) {
    console.error('Outreach error:', error);
    return NextResponse.json(
      { error: error.message || 'Template generation failed' },
      { status: 500 }
    );
  }
}
