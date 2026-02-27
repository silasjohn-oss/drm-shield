const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Sample PDFs to generate
const samples = [
  {
    name: 'sample.pdf',
    title: 'Sample Document',
    content: 'This is a sample document for testing DRM Shield functionality.',
  },
  {
    name: 'confidential-report.pdf',
    title: 'Confidential Report 2024',
    content: 'This confidential report contains sensitive business information. Unauthorized distribution is prohibited.',
  },
  {
    name: 'technical-specs.pdf',
    title: 'Technical Specifications',
    content: 'Technical specifications for the DRM Shield system. This document contains proprietary information.',
  },
  {
    name: 'financial-summary.pdf',
    title: 'Financial Summary Q4 2024',
    content: 'Quarterly financial summary with detailed breakdowns. Confidential - For authorized personnel only.',
  },
  {
    name: 'product-roadmap.pdf',
    title: 'Product Roadmap 2024-2025',
    content: 'Upcoming product features and release timeline. Not for public disclosure.',
  },
];

// Generate each PDF
(async () => {
  for (const sample of samples) {
    try {
      const doc = await PDFDocument.create();
      const page = doc.addPage([600, 800]);
      
      // Add title
      page.drawText(sample.title, {
        x: 50,
        y: 750,
        size: 24,
      });
      
      // Add content
      page.drawText(sample.content, {
        x: 50,
        y: 700,
        size: 12,
        maxWidth: 500,
      });
      
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
      const filePath = path.join(uploadsDir, sample.name);
      fs.writeFileSync(filePath, pdfBytes);
      
      console.log(`✅ Created: ${sample.name}`);
    } catch (err) {
      console.error(`❌ Error creating ${sample.name}:`, err.message);
    }
  }
  
  console.log('\n🎉 All sample PDFs generated successfully!');
})();
