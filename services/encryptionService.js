const crypto = require("crypto");
const fs = require("fs");

const MASTER_KEY = Buffer.from(process.env.ENCRYPTION_KEY, "hex");

function encryptFile(inputPath, outputPath) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", MASTER_KEY, iv);
  const inputBuffer = fs.readFileSync(inputPath);
  const encryptedData = Buffer.concat([
    cipher.update(inputBuffer),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  const outputBuffer = Buffer.concat([iv, authTag, encryptedData]);
  fs.writeFileSync(outputPath, outputBuffer);
  console.log("✅ File encrypted successfully");
  return { outputPath, originalSize: inputBuffer.length };
}

function decryptFile(encryptedPath, outputPath) {
  const encryptedBuffer = fs.readFileSync(encryptedPath);
  const iv = encryptedBuffer.slice(0, 16);
  const authTag = encryptedBuffer.slice(16, 32);
  const encryptedData = encryptedBuffer.slice(32);
  const decipher = crypto.createDecipheriv("aes-256-gcm", MASTER_KEY, iv);
  decipher.setAuthTag(authTag);
  try {
    const decryptedData = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final(),
    ]);
    fs.writeFileSync(outputPath, decryptedData);
    console.log("✅ File decrypted successfully");
    return outputPath;
  } catch (err) {
    throw new Error("❌ Decryption failed — file may be tampered");
  }
}

module.exports = { encryptFile, decryptFile };