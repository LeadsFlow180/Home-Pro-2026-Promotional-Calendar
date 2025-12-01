import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { month, themes, events, highlightedDates, serviceId, campaignType, selectedEvents } = await request.json();

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

    // Get service name if provided
    const serviceMap: { [key: string]: string } = {
      'appliance-repair': 'Appliance Repair',
      'bathroom-remodeling': 'Bathroom Remodeling',
      'carpet-cleaning': 'Carpet Cleaning',
      'carpentry-woodworking': 'Carpentry & Woodworking',
      'chimneys-fireplaces': 'Chimneys and Fireplaces',
      'doors': 'Doors',
      'drywall-installation': 'Drywall Installation',
      'electrician': 'Electrician',
      'flooring-tile': 'Flooring & Tile',
      'garage-door-installation': 'Garage Door Installation',
      'handyman-service': 'Handyman Service',
      'home-cleaning': 'Home Cleaning',
      'hvac': 'HVAC',
      'kitchen-remodeling': 'Kitchen Remodeling and Renovation',
      'landscaping-outdoor': 'Landscaping and Outdoor Services',
      'locksmith': 'Locksmith',
      'masonry-concrete': 'Masonry and Concrete',
      'painting-wallpaper': 'Painting and Wallpaper',
      'pest-control': 'Pest Control',
      'plumbing': 'Plumbing',
      'roofing': 'Roofing',
      'swimming-pool-spa': 'Swimming Pool and Spa Services',
      'water-mold-restoration': 'Water and Mold Damage Restoration',
      'window-installation-repair': 'Window Installation and Repair',
    };

    const serviceName = serviceId ? serviceMap[serviceId] : null;
    const isEventSpecific = campaignType === 'event-specific' && selectedEvents && selectedEvents.length > 0;

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

    // Build selected events info for event-specific campaigns
    let selectedEventsInfo = '';
    if (isEventSpecific) {
      selectedEventsInfo = selectedEvents
        .map((e: any) => {
          const eventName = e.event.replace(e.date, '').trim() || e.event;
          return `${e.date}: ${eventName}`;
        })
        .join('; ');
    }

    // Build the service-specific context
    const serviceContext = serviceName 
      ? `\n\nIMPORTANT: These campaigns must be specifically tailored for ${serviceName} businesses. Each campaign should:
- Be highly relevant to ${serviceName} services and customer needs
- Address common problems or opportunities that ${serviceName.toLowerCase()} businesses face
- Use industry-specific language and pain points
- Connect the holiday/event to how it relates to ${serviceName} services
- Provide actionable ideas that a ${serviceName.toLowerCase()} business owner can immediately implement`
      : '';

    // Build campaign count and focus
    const campaignCount = isEventSpecific ? selectedEvents.length : 6;
    const campaignFocus = isEventSpecific
      ? `Generate ${campaignCount} creative marketing campaign ideas, one for each of these specific events: ${selectedEventsInfo}. Each campaign must be directly tied to its specific event and ${serviceName ? `tailored for ${serviceName} businesses` : 'suitable for home service businesses'}.`
      : `Generate ${campaignCount} creative marketing campaign ideas for ${month}. These should be general campaigns that work well throughout the month${serviceName ? ` specifically for ${serviceName} businesses` : ' for home service businesses'}.`;

    const prompt = `You are a master marketing/advertising/lead generator/branding expert helping small businesses create promotional campaigns.

For the month of ${month}, here are the relevant details:
- Monthly Themes: ${themesList}
- Key Highlighted Dates: ${keyDatesInfo || 'None specified'}
- Daily Opportunities: ${dailyEventsInfo || 'None specified'}
${isEventSpecific ? `- Selected Events for Campaigns: ${selectedEventsInfo}` : ''}

${campaignFocus}

Each campaign idea must:
1. Be innovative, creative, and budget-friendly
2. Be specific, actionable, and directly tied to ${isEventSpecific ? 'the selected events' : `${month} themes or events`}
3. ${serviceName ? `Be highly relevant to ${serviceName} businesses and their specific customer needs` : 'Be suitable for home service businesses'}
4. Include a compelling campaign title, detailed description (2-3 sentences explaining the campaign strategy), and suggested marketing channels (e.g., Social Media, Email, In-Store, Website, Google Ads, Local Partnerships)
5. Be suitable for small businesses with limited budgets
6. Focus on generating leads and building brand awareness
7. ${isEventSpecific ? 'Be tied to the specific event date and name' : `Be timely and relevant to ${month} specifically`}
${serviceContext}

The ideas should be innovative, creative, and budget-friendly. Think outside the box while keeping campaigns practical and implementable.

Format the response as a JSON array with objects containing: title, description, channels (array), and targetDate (if applicable). Example format:
[
  {
    "title": "Campaign Title",
    "description": "Detailed campaign description here (2-3 sentences)",
    "channels": ["Social Media", "Email", "Website"],
    "targetDate": "Optional specific date"
  }
]`;

    console.log('Calling OpenAI API for month:', month);
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a master marketing/advertising/lead generator/branding expert that generates innovative, creative, and budget-friendly campaign ideas for small businesses. Always respond with valid JSON. Focus on practical, actionable campaigns that generate leads and build brand awareness.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.9,
      max_tokens: 2000,
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

