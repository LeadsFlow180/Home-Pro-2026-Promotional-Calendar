# Data Files Directory

## Required Files

Please place the following files in this directory or the project root:

1. **2026 Calendar File** (Excel `.xlsx` or CSV `.csv`)
   - Contains promotional dates, events, and marketing opportunities
   - Will be processed to extract calendar information

2. **2024 Monthly Images File** (Excel `.xlsx` or CSV `.csv`)
   - Contains monthly promotional images and themes
   - Images will be extracted and placed in `public/images/`

## File Processing

Once files are provided, the app will:
- Parse the calendar data and convert it to JSON format
- Extract and organize monthly images
- Create a searchable, filterable calendar interface

