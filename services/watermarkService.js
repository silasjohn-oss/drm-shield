const fs = require("fs");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");

async function watermarkPDF(inputPath, outputPath, userEmail, userId) {
  const pdfBytes = fs.readFileSync(inputPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const watermarkText = `CONFIDENTIAL | User: ${userEmail} | ID: ${userId} | ${new Date().toISOString()}`;

  pages.forEach((page) => {
    const { width, height } = page.getSize();

    // Top watermark
    page.drawText(watermarkText, {
      x: 30,
      y: height - 30,
      size: 9,
      font,
      color: rgb(1, 0, 0),
      opacity: 0.7,
    });

    // Bottom watermark
    page.drawText(watermarkText, {
      x: 30,
      y: 20,
      size: 9,
      font,
      color: rgb(1, 0, 0),
      opacity: 0.7,
    });

    // Diagonal center watermark
    page.drawText(`PROTECTED - ${userId}`, {
      x: width / 4,
      y: height / 2,
      size: 30,
      font,
      color: rgb(1, 0, 0),
      opacity: 0.1,
      rotate: { type: "degrees", angle: 45 },
    });
  });

  const newPdf = await pdfDoc.save();
  fs.writeFileSync(outputPath, newPdf);
  return outputPath;
}

module.exports = watermarkPDF;