import * as XLSX from 'xlsx';

export interface CalendarEvent {
  date: string;
  event: string;
  type: 'monthly' | 'daily' | 'highlighted';
  month?: string;
}

export interface MonthlyData {
  month: string;
  themes: string[];
  events: CalendarEvent[];
  imagePath?: string;
}

/**
 * Process the 2026 calendar Excel file to extract promotional dates
 */
export async function process2026Calendar(): Promise<CalendarEvent[]> {
  try {
    const response = await fetch('/data/2026-calendar.xlsx');
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    const events: CalendarEvent[] = [];
    
    // Process each sheet (month)
    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
      
      // Parse the data structure based on the CSV format we saw
      // Adjust parsing logic based on actual Excel structure
      data.forEach((row: any) => {
        // Process row data - structure will be determined after reading the file
        // This is a placeholder for the actual parsing logic
      });
    });
    
    return events;
  } catch (error) {
    console.error('Error processing 2026 calendar:', error);
    return [];
  }
}

/**
 * Process the 2024 calendar Excel file to extract monthly themes and images
 */
export async function process2024Calendar(): Promise<MonthlyData[]> {
  try {
    const response = await fetch('/data/2024-calendar.xlsx');
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    const monthlyData: MonthlyData[] = [];
    
    // Process each sheet (month)
    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
      
      const monthData: MonthlyData = {
        month: sheetName,
        themes: [],
        events: [],
      };
      
      // Parse themes and events from the data
      // Based on the CSV structure: themes in first column, dates in other columns
      data.forEach((row: any, index: number) => {
        if (index === 0) {
          // First row might contain month name
          return;
        }
        
        // Extract themes (first column with text, not dates)
        if (row[0] && typeof row[0] === 'string' && !row[0].includes('th') && !row[0].includes('st') && !row[0].includes('nd') && !row[0].includes('rd')) {
          if (row[0] !== 'HIGHLIGHTED DATES:' && !row[0].includes('January') && !row[0].includes('February') && !row[0].includes('March') && !row[0].includes('April') && !row[0].includes('May') && !row[0].includes('June') && !row[0].includes('July') && !row[0].includes('August') && !row[0].includes('September') && !row[0].includes('October') && !row[0].includes('November') && !row[0].includes('December')) {
            monthData.themes.push(row[0]);
          }
        }
        
        // Extract daily events from columns 1, 2, 3
        for (let col = 1; col <= 3; col++) {
          if (row[col] && typeof row[col] === 'string') {
            const eventText = row[col].toString();
            // Check if it's a date event (contains "th", "st", "nd", "rd")
            if (eventText.match(/\d+(st|nd|rd|th)/)) {
              const event: CalendarEvent = {
                date: eventText,
                event: eventText,
                type: eventText.includes('January') || eventText.includes('February') || eventText.includes('March') || eventText.includes('April') || eventText.includes('May') || eventText.includes('June') || eventText.includes('July') || eventText.includes('August') || eventText.includes('September') || eventText.includes('October') || eventText.includes('November') || eventText.includes('December') ? 'highlighted' : 'daily',
                month: sheetName,
              };
              monthData.events.push(event);
            }
          }
        }
      });
      
      monthlyData.push(monthData);
    });
    
    return monthlyData;
  } catch (error) {
    console.error('Error processing 2024 calendar:', error);
    return [];
  }
}

