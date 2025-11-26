import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { month, themes, events, highlightedDates } = await request.json();

    // Check for API key first - try multiple environment variable names
    const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    
    // Debug logging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('Environment check:', {
        hasOpenAIKey: !!process.env.OPENAI_API_KEY,
        hasNextPublicKey: !!process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        keyLength: apiKey ? apiKey.length : 0,
        keyPrefix: apiKey ? apiKey.substring(0, 10) : 'none',
      });
    }
    
    if (!apiKey) {
      console.error('OpenAI API key is missing from environment variables');
      console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('OPENAI')));
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please check your .env.local file and restart the dev server.' },
        { status: 500 }
      );
    }

    // Initialize OpenAI client inside the function to ensure env var is loaded
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // Build prompt for OpenAI
    const themesList = themes.length > 0 ? themes.join(', ') : 'None specified';
    
    // Extract event names from highlighted dates
    const keyDatesInfo = highlightedDates
      .slice(0, 8)
      .map((e: any) => {
        const eventName = e.event.replace(e.date, '').trim() || e.event;
        return `${e.date}: ${eventName}`;
      })
      .join('; ');
    
    // Extract event names from daily events
    const dailyEventsInfo = events
      .slice(0, 12)
      .map((e: any) => {
        const eventName = e.event.replace(e.date, '').trim() || e.event;
        return `${e.date}: ${eventName}`;
      })
      .join('; ');

    const prompt = `You are a marketing expert helping small businesses create promotional campaigns. 

For the month of ${month}, here are the relevant details:
- Monthly Themes: ${themesList}
- Key Highlighted Dates: ${keyDatesInfo || 'None specified'}
- Daily Opportunities: ${dailyEventsInfo || 'None specified'}

Generate 5 creative marketing campaign ideas specifically tailored for ${month}. Each campaign idea should:
1. Be specific, actionable, and directly tied to ${month} themes or events
2. Leverage the monthly themes (${themesList}) or specific dates mentioned above
3. Include a compelling campaign title, detailed description (2-3 sentences), and suggested marketing channels (e.g., Social Media, Email, In-Store, Website)
4. Be suitable for small businesses with limited budgets
5. Be timely and relevant to ${month} specifically

Focus on campaigns that capitalize on ${month}'s unique characteristics, holidays, and seasonal opportunities.

Format the response as a JSON array with objects containing: title, description, channels (array), and targetDate (if applicable). Example format:
[
  {
    "title": "Campaign Title",
    "description": "Detailed campaign description here",
    "channels": ["Social Media", "Email"],
    "targetDate": "Optional specific date"
  }
]`;

    console.log('Calling OpenAI API for month:', month);
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
    console.log('OpenAI API call successful');

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
    console.error('OpenAI API error details:', {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type,
      stack: error.stack?.substring(0, 500),
    });
    
    const errorMessage = error.message || 'Failed to generate campaign ideas';
    
    // Provide more specific error messages based on OpenAI error types
    let userMessage = errorMessage;
    if (errorMessage.includes('API key') || errorMessage.includes('Invalid') || error.status === 401) {
      userMessage = 'Invalid OpenAI API key. Please check your .env.local file and ensure the key is correct.';
    } else if (errorMessage.includes('rate limit') || error.status === 429) {
      userMessage = 'OpenAI API rate limit exceeded. Please try again in a moment.';
    } else if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('ECONNREFUSED')) {
      userMessage = 'Network error. Please check your internet connection and try again.';
    } else if (error.status === 500 && errorMessage.includes('OpenAI')) {
      userMessage = 'OpenAI API service error. Please try again in a moment.';
    }
    
    return NextResponse.json(
      { error: userMessage, details: process.env.NODE_ENV === 'development' ? errorMessage : undefined },
      { status: 500 }
    );
  }
}

