const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

/**
 * Utility to create custom PDF files for testing
 * Usage: node scripts/createCustomPdf.js <filename> <title> <content>
 */

const args = process.argv.slice(2);

if (args.length < 3) {
  console.log('Usage: node scripts/createCustomPdf.js <filename> <title> <content>');
  console.log('\nExample:');
  console.log('  node scripts/createCustomPdf.js "my-document.pdf" "My Document" "This is my custom document content."');
  process.exit(1);
}

const [filename, title, content] = args;

// Validate filename
if (!filename.toLowerCase().endsWith('.pdf')) {
  console.error('❌ Error: Filename must end with .pdf');
  process.exit(1);
}

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create the PDF
(async () => {
  try {
    const doc = await PDFDocument.create();
    const page = doc.addPage([600, 800]);
    
    // Add title
    page.drawText(title, {
      x: 50,
      y: 750,
      size: 24,
    });
    
    // Add content (word wrap)
    const words = content.split(' ');
    let currentY = 700;
    let currentLine = '';
    
    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      if (testLine.length > 80) {
        page.drawText(currentLine, {
          x: 50,
          y: currentY,
          size: 12,
          maxWidth: 500,
        });
        currentLine = word;
        currentY -= 20;
      } else {
        currentLine = testLine;
      }
    });
    
    if (currentLine) {
      page.drawText(currentLine, {
        x: 50,
        y: currentY,
        size: 12,
        maxWidth: 500,
      });
    }
    
    // Add metadata
    page.drawText(`Generated: ${new Date().toISOString()}`, {
      x: 50,
      y: 100,
      size: 10,
    });
    
    page.drawText('© 2024 DRM Shield - Confidential', {
      x: 50,
      y: 80,
      size: 10,
    });

    const pdfBytes = await doc.save();
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, pdfBytes);
    
    const sizeKb = (pdfBytes.length / 1024).toFixed(2);
    console.log(`✅ Created: ${filename} (${sizeKb} KB)`);
  } catch (err) {
    console.error(`❌ Error creating ${filename}:`, err.message);
    process.exit(1);
  }
})();
