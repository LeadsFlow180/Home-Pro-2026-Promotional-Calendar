# Promotional Calendar App - Planning Document

## Project Overview
A Next.js web application that helps small businesses identify the best times to create marketing promotions by displaying calendar information from a 2026 updated calendar file and monthly images from a 2024 file.

## Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Processing**: TBD (will add Excel/CSV parsing libraries once files are received)

### Project Structure
```
promotional_calendar/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   │   ├── Calendar/     # Calendar display components
│   │   └── Promotions/   # Promotion-related components
│   ├── lib/              # Utility functions
│   │   ├── data/         # Data processing utilities
│   │   └── utils/        # General utilities
│   └── types/            # TypeScript type definitions
├── public/
│   └── images/           # Monthly images from 2024 file
└── data/                 # Processed calendar data (JSON)
```

## Key Features
1. **Calendar View**: Display promotional dates and events from 2026 calendar
2. **Monthly Images**: Show relevant monthly images from 2024 file
3. **Promotional Insights**: Highlight best times for marketing promotions
4. **Responsive Design**: Mobile-friendly interface for small business owners

## Data Structure (To be determined after file analysis)
- Calendar events with dates, descriptions, and promotional opportunities
- Monthly themes/images with metadata

## Development Guidelines
- Keep files under 500 lines
- Use TypeScript for type safety
- Follow Next.js App Router conventions
- Use Tailwind CSS for styling
- Maintain clear separation of concerns

