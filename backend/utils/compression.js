const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic);

/**
 * Compress video to 480p with reduced bitrate
 * @param {string} inputPath - Path to original video
 * @param {string} outputPath - Path for compressed video
 * @returns {Promise<void>}
 */
function compressVideo(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        '-vf scale=-2:480',           // Scale to 480p height, maintain aspect ratio
        '-c:v libx264',                // Use H.264 codec
        '-crf 28',                     // Constant Rate Factor (higher = more compression)
        '-preset fast',                // Encoding speed preset
        '-c:a aac',                    // Audio codec
        '-b:a 96k',                    // Audio bitrate
        '-movflags +faststart'         // Enable streaming
      ])
      .output(outputPath)
      .on('end', () => {
        console.log(`✅ Video compressed: ${path.basename(outputPath)}`);
        resolve();
      })
      .on('error', (err) => {
        console.error('❌ Video compression error:', err.message);
        reject(err);
      })
      .run();
  });
}

/**
 * Compress PDF by removing metadata and optimizing
 * @param {string} inputPath - Path to original PDF
 * @param {string} outputPath - Path for compressed PDF
 * @returns {Promise<void>}
 */
async function compressPDF(inputPath, outputPath) {
  try {
    const existingPdfBytes = await fs.readFile(inputPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Remove metadata to reduce size
    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer('');
    pdfDoc.setCreator('');

    // Save with compression
    const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
    await fs.writeFile(outputPath, pdfBytes);

    console.log(`✅ PDF compressed: ${path.basename(outputPath)}`);
  } catch (error) {
    console.error('❌ PDF compression error:', error.message);
    throw error;
  }
}

/**
 * Copy file without compression (for DOCX, PPT, etc.)
 * @param {string} inputPath - Path to original file
 * @param {string} outputPath - Path for output file
 * @returns {Promise<void>}
 */
async function copyFile(inputPath, outputPath) {
  try {
    await fs.copyFile(inputPath, outputPath);
    console.log(`✅ File copied: ${path.basename(outputPath)}`);
  } catch (error) {
    console.error('❌ File copy error:', error.message);
    throw error;
  }
}

module.exports = {
  compressVideo,
  compressPDF,
  copyFile
};
