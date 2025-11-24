import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { month, themes, events, highlightedDates } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Build prompt for OpenAI
    const themesList = themes.length > 0 ? themes.join(', ') : 'None specified';
    const keyDates = highlightedDates
      .map((e: any) => e.date)
      .slice(0, 5)
      .join(', ');
    const dailyEvents = events
      .map((e: any) => e.date)
      .slice(0, 10)
      .join(', ');

    const prompt = `You are a marketing expert helping small businesses create promotional campaigns. 

For the month of ${month}, here are the relevant details:
- Monthly Themes: ${themesList}
- Key Dates: ${keyDates}
- Daily Opportunities: ${dailyEvents}

Generate 5 creative marketing campaign ideas that a small business can use during ${month}. Each idea should:
1. Be specific and actionable
2. Leverage the monthly themes or specific dates
3. Include a campaign title, brief description, and suggested marketing channels
4. Be suitable for small businesses with limited budgets

Format the response as a JSON array with objects containing: title, description, channels (array), and targetDate (if applicable).`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful marketing expert that generates creative, actionable campaign ideas for small businesses. Always respond with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 1500,
    });

    const responseContent = completion.choices[0]?.message?.content || '[]';
    
    // Try to parse JSON response
    let campaignIdeas;
    try {
      campaignIdeas = JSON.parse(responseContent);
    } catch (e) {
      // If response isn't valid JSON, try to extract JSON from markdown code blocks
      const jsonMatch = responseContent.match(/```json\n([\s\S]*?)\n```/) || 
                       responseContent.match(/```\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        campaignIdeas = JSON.parse(jsonMatch[1]);
      } else {
        // Fallback: create structured response from text
        const lines = responseContent.split('\n').filter(line => line.trim());
        campaignIdeas = lines.slice(0, 5).map((line, idx) => ({
          title: `Campaign Idea ${idx + 1}`,
          description: line.replace(/^\d+\.\s*/, ''),
          channels: ['Social Media', 'Email'],
          targetDate: null,
        }));
      }
    }

    return NextResponse.json({ campaigns: campaignIdeas });
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate campaign ideas' },
      { status: 500 }
    );
  }
}

