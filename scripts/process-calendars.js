const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

/**
 * Process Excel files and convert to JSON
 * This script runs at build time to extract calendar data
 */

function process2024Calendar() {
  const filePath = path.join(__dirname, '../public/data/2024-calendar.xlsx');
  const workbook = XLSX.readFile(filePath);
  const monthlyData = [];

  workbook.SheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    
    const monthData = {
      month: sheetName,
      themes: [],
      events: [],
      highlightedDates: [],
    };

    data.forEach((row, index) => {
      if (!row || row.length === 0) return;

      // Extract themes (first column, longer text entries)
      if (row[0] && typeof row[0] === 'string') {
        const firstCol = row[0].toString().trim();
        // Themes are typically longer strings without date indicators
        if (firstCol && 
            !firstCol.match(/\d+(st|nd|rd|th)/) && 
            !firstCol.includes('HIGHLIGHTED') &&
            !firstCol.match(/^(January|February|March|April|May|June|July|August|September|October|November|December)/i) &&
            firstCol.length > 5) {
          monthData.themes.push(firstCol);
        }
      }

      // Extract events from all columns
      for (let col = 0; col < row.length; col++) {
        if (row[col] && typeof row[col] === 'string') {
          const cellText = row[col].toString().trim();
          
          // Check if it's a date event
          if (cellText.match(/\d+(st|nd|rd|th)/)) {
            const isHighlighted = cellText.includes(monthData.month) || 
                                 cellText.includes('New Year') ||
                                 cellText.includes('Martin Luther King') ||
                                 cellText.includes('MLK');
            
            const event = {
              date: cellText,
              event: cellText,
              type: isHighlighted ? 'highlighted' : 'daily',
              month: sheetName,
            };

            if (isHighlighted) {
              monthData.highlightedDates.push(event);
            } else {
              monthData.events.push(event);
            }
          }
        }
      }
    });

    monthlyData.push(monthData);
  });

  return monthlyData;
}

function process2026Calendar() {
  const filePath = path.join(__dirname, '../public/data/2026-calendar.xlsx');
  const workbook = XLSX.readFile(filePath);
  const allEvents = [];

  workbook.SheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    
    data.forEach((row) => {
      if (!row || row.length === 0) return;

      // Process each column for events
      for (let col = 0; col < row.length; col++) {
        if (row[col] && typeof row[col] === 'string') {
          const cellText = row[col].toString().trim();
          
          // Extract date and event information
          if (cellText.match(/\d+(st|nd|rd|th)/) || cellText.match(/\d{1,2}\/\d{1,2}/)) {
            allEvents.push({
              date: cellText,
              event: cellText,
              type: 'promotional',
              month: sheetName,
            });
          }
        }
      }
    });
  });

  return allEvents;
}

// Main processing
try {
  console.log('Processing 2024 calendar...');
  const data2024 = process2024Calendar();
  
  // Load image mapping if it exists
  let imageMap = {};
  try {
    const imageMappingPath = path.join(__dirname, '../src/data/month-images.json');
    if (fs.existsSync(imageMappingPath)) {
      imageMap = JSON.parse(fs.readFileSync(imageMappingPath, 'utf8'));
    }
  } catch (e) {
    console.log('No image mapping found, continuing without images...');
  }
  
  // Add image paths to month data
  data2024.forEach(month => {
    if (imageMap[month.month]) {
      month.imagePath = imageMap[month.month];
    }
  });
  
  // Write to both locations for compatibility
  const json2024 = JSON.stringify(data2024, null, 2);
  fs.writeFileSync(
    path.join(__dirname, '../data/2024-calendar.json'),
    json2024
  );
  fs.writeFileSync(
    path.join(__dirname, '../src/data/2024-calendar.json'),
    json2024
  );
  console.log(`✓ Processed ${data2024.length} months from 2024 calendar`);

  console.log('Processing 2026 calendar...');
  const data2026 = process2026Calendar();
  const json2026 = JSON.stringify(data2026, null, 2);
  fs.writeFileSync(
    path.join(__dirname, '../data/2026-calendar.json'),
    json2026
  );
  fs.writeFileSync(
    path.join(__dirname, '../src/data/2026-calendar.json'),
    json2026
  );
  console.log(`✓ Processed ${data2026.length} events from 2026 calendar`);

  console.log('✓ Calendar processing complete!');
} catch (error) {
  console.error('Error processing calendars:', error);
  process.exit(1);
}

