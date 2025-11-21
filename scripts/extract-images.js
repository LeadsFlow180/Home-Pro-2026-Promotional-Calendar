const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

/**
 * Extract images from the 2024 calendar Excel file
 */
async function extractImages() {
  const filePath = path.join(__dirname, '../public/data/2024-calendar.xlsx');
  const imagesDir = path.join(__dirname, '../public/images/months');
  
  // Create images directory if it doesn't exist
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const imageMap = {};

  // Process each worksheet (month)
  workbook.eachSheet((worksheet, sheetId) => {
    const monthName = worksheet.name;
    console.log(`Processing images for ${monthName}...`);

    // Get images from the worksheet
    if (worksheet.model && worksheet.model.images) {
      worksheet.model.images.forEach((image, index) => {
        const imageBuffer = image.buffer;
        const imageExtension = image.extension || 'png';
        const imageFileName = `${monthName.toLowerCase()}.${imageExtension}`;
        const imagePath = path.join(imagesDir, imageFileName);

        // Save the image
        fs.writeFileSync(imagePath, imageBuffer);
        imageMap[monthName] = `/images/months/${imageFileName}`;
        console.log(`  ✓ Extracted image: ${imageFileName}`);
      });
    }

    // Also check for embedded images in cells
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell, colNumber) => {
        if (cell.value && cell.value.image) {
          const image = cell.value.image;
          const imageBuffer = image.buffer;
          const imageExtension = image.extension || 'png';
          const imageFileName = `${monthName.toLowerCase()}.${imageExtension}`;
          const imagePath = path.join(imagesDir, imageFileName);

          if (!imageMap[monthName]) {
            fs.writeFileSync(imagePath, imageBuffer);
            imageMap[monthName] = `/images/months/${imageFileName}`;
            console.log(`  ✓ Extracted image from cell: ${imageFileName}`);
          }
        }
      });
    });
  });

  return imageMap;
}

// Main execution
(async () => {
  try {
    console.log('Extracting images from 2024 calendar...');
    const imageMap = await extractImages();
    
    // Save image mapping to JSON
    const mappingPath = path.join(__dirname, '../src/data/month-images.json');
    fs.writeFileSync(mappingPath, JSON.stringify(imageMap, null, 2));
    
    console.log(`✓ Extracted images for ${Object.keys(imageMap).length} months`);
    console.log('✓ Image mapping saved to src/data/month-images.json');
  } catch (error) {
    console.error('Error extracting images:', error);
    process.exit(1);
  }
})();

