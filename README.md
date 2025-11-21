# Promotional Calendar App

A Next.js web application that helps small businesses identify the best times to create marketing promotions by displaying calendar information from a 2026 updated calendar file and monthly images from a 2024 file.

## Features

- 📅 Interactive calendar view with promotional dates
- 🎨 Monthly images and themes
- 💡 Promotional insights and recommendations
- 📱 Responsive design for mobile and desktop

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `src/app/` - Next.js App Router pages
- `src/components/` - React components (Calendar, Promotions)
- `src/lib/` - Utility functions and data processing
- `public/images/` - Monthly images from 2024 file
- `data/` - Processed calendar data

## Data Files

This app requires:
- **2026 Calendar File**: Excel or CSV file with promotional dates and events
- **2024 Monthly Images**: File containing monthly promotional images

Please place these files in the project root or `data/` directory for processing.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [PLANNING.md](./PLANNING.md) - Project architecture and guidelines
- [TASK.md](./TASK.md) - Current tasks and progress
