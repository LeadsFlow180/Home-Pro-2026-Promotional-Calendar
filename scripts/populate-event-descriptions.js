const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// Paths
const calendar2024Path = path.join(__dirname, '../src/data/2024-calendar.json');
const calendar2026Path = path.join(__dirname, '../src/data/2026-calendar.json');
const descriptionsPath = path.join(__dirname, '../src/data/event-descriptions.json');

// Initialize OpenAI
const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;

if (!apiKey) {
  console.error('❌ OpenAI API key not found!');
  console.error('Please set OPENAI_API_KEY in your .env.local file');
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: apiKey,
});

// Extract event name from event string
function extractEventName(eventString) {
  // Try to extract name after date (e.g., "2nd - Groundhog Day" -> "Groundhog Day")
  const dateMatch = eventString.match(/\d+(st|nd|rd|th)\s*-\s*(.+)/);
  if (dateMatch) {
    return dateMatch[2].trim();
  }
  // Try to remove date prefix
  const cleaned = eventString.replace(/^\d+(st|nd|rd|th)\s*-\s*/i, '').trim();
  return cleaned || eventString;
}

// Get all unique events from calendar data
function getAllEvents() {
  const calendar2024 = JSON.parse(fs.readFileSync(calendar2024Path, 'utf8'));
  const calendar2026 = JSON.parse(fs.readFileSync(calendar2026Path, 'utf8'));
  
  const events = new Map();
  
  // Process 2024 calendar (monthly data)
  calendar2024.forEach(monthData => {
    // Add themes as events
    monthData.themes?.forEach(theme => {
      const key = theme.toLowerCase().trim();
      if (!events.has(key)) {
        events.set(key, {
          name: theme,
          type: 'monthly',
          month: monthData.month,
        });
      }
    });
    
    // Add highlighted dates
    monthData.highlightedDates?.forEach(event => {
      const eventName = extractEventName(event.event);
      const key = eventName.toLowerCase().trim();
      if (!events.has(key)) {
        events.set(key, {
          name: eventName,
          type: event.type || 'highlighted',
          month: monthData.month,
          date: event.date,
        });
      }
    });
    
    // Add daily events
    monthData.events?.forEach(event => {
      const eventName = extractEventName(event.event);
      const key = eventName.toLowerCase().trim();
      if (!events.has(key)) {
        events.set(key, {
          name: eventName,
          type: event.type || 'daily',
          month: monthData.month,
          date: event.date,
        });
      }
    });
  });
  
  // Process 2026 calendar (promotional events)
  calendar2026.forEach(event => {
    const eventName = extractEventName(event.event);
    const key = eventName.toLowerCase().trim();
    if (!events.has(key)) {
      events.set(key, {
        name: eventName,
        type: event.type || 'promotional',
        month: event.month,
        date: event.date,
      });
    }
  });
  
  return Array.from(events.values());
}

// Check which events are missing from descriptions
function getMissingEvents(allEvents, existingDescriptions) {
  const existingKeys = new Set(
    Object.keys(existingDescriptions).map(k => k.toLowerCase().trim())
  );
  
  return allEvents.filter(event => {
    const key = event.name.toLowerCase().trim();
    // Check exact match
    if (existingKeys.has(key)) return false;
    
    // Check partial matches (e.g., "Groundhog Day" matches "Groundhog Day")
    for (const existingKey of existingKeys) {
      if (key.includes(existingKey) || existingKey.includes(key)) {
        return false;
      }
    }
    
    return true;
  });
}

// Generate description for a single event using OpenAI
async function generateEventDescription(event) {
  const prompt = `Generate detailed information about "${event.name}"${event.date ? ` (celebrated on ${event.date})` : ''}.

Provide a JSON object with the following structure:
{
  "title": "${event.name}",
  "description": "A 2-3 sentence description of what this holiday/event is about and why it's celebrated",
  "origin": "A 2-3 sentence explanation of the history and origin of this holiday/event, including when and how it started",
  "marketingTips": [
    "First marketing tip for businesses",
    "Second marketing tip",
    "Third marketing tip",
    "Fourth marketing tip"
  ]
}

Important:
- Be accurate and factual
- Keep descriptions concise but informative
- Marketing tips should be practical and actionable for small businesses
- If this is a well-known holiday, include historical context
- If this is a fun/unofficial holiday, explain its modern origins
- Return ONLY valid JSON, no markdown formatting or code blocks`;

  try {
    console.log(`  Generating description for: ${event.name}...`);
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that provides accurate, factual information about holidays and events. Always respond with valid JSON only, no markdown or code blocks.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const responseContent = completion.choices[0]?.message?.content || '{}';
    
    // Try to parse JSON
    let description;
    try {
      description = JSON.parse(responseContent);
    } catch (e) {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = responseContent.match(/```json\n([\s\S]*?)\n```/) || 
                       responseContent.match(/```\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        description = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Failed to parse JSON response');
      }
    }
    
    // Validate structure
    if (!description.title || !description.description) {
      throw new Error('Invalid response structure');
    }
    
    return description;
  } catch (error) {
    console.error(`  ❌ Error generating description for ${event.name}:`, error.message);
    return null;
  }
}

// Main function
async function main() {
  console.log('🚀 Starting event description population...\n');
  
  // Load existing descriptions
  let existingDescriptions = {};
  if (fs.existsSync(descriptionsPath)) {
    existingDescriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
    console.log(`📚 Loaded ${Object.keys(existingDescriptions).length} existing descriptions`);
  }
  
  // Get all events
  console.log('📅 Loading all events from calendar data...');
  const allEvents = getAllEvents();
  console.log(`   Found ${allEvents.length} unique events\n`);
  
  // Find missing events
  const missingEvents = getMissingEvents(allEvents, existingDescriptions);
  console.log(`🔍 Found ${missingEvents.length} events without descriptions\n`);
  
  if (missingEvents.length === 0) {
    console.log('✅ All events already have descriptions!');
    return;
  }
  
  // Show what will be generated
  console.log('📝 Events to generate descriptions for:');
  missingEvents.slice(0, 20).forEach((event, idx) => {
    console.log(`   ${idx + 1}. ${event.name} (${event.type})`);
  });
  if (missingEvents.length > 20) {
    console.log(`   ... and ${missingEvents.length - 20} more`);
  }
  console.log('');
  
  // Ask for confirmation
  console.log(`⚠️  This will make ${missingEvents.length} API calls to OpenAI.`);
  console.log('   Press Ctrl+C to cancel, or wait 3 seconds to continue...\n');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Generate descriptions in batches to avoid rate limits
  const batchSize = 5;
  const delayBetweenBatches = 2000; // 2 seconds
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < missingEvents.length; i += batchSize) {
    const batch = missingEvents.slice(i, i + batchSize);
    console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1} (${batch.length} events)...`);
    
    const promises = batch.map(async (event) => {
      const description = await generateEventDescription(event);
      if (description) {
        // Use the event name as the key
        existingDescriptions[event.name] = description;
        successCount++;
        return { event: event.name, success: true };
      } else {
        failCount++;
        return { event: event.name, success: false };
      }
    });
    
    await Promise.all(promises);
    
    // Save progress after each batch
    fs.writeFileSync(
      descriptionsPath,
      JSON.stringify(existingDescriptions, null, 2),
      'utf8'
    );
    
    // Delay between batches to avoid rate limits
    if (i + batchSize < missingEvents.length) {
      console.log(`   Waiting ${delayBetweenBatches / 1000} seconds before next batch...`);
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
    }
  }
  
  console.log('\n✅ Done!');
  console.log(`   ✅ Successfully generated: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📊 Total descriptions: ${Object.keys(existingDescriptions).length}`);
  console.log(`\n💾 Saved to: ${descriptionsPath}`);
}

// Run the script
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});


