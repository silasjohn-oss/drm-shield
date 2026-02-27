const sharp = require("sharp");

async function hideWatermark(inputImagePath, outputImagePath, secretMessage) {
  const message = secretMessage + "|||END|||";
  const messageBinary = message
    .split("")
    .map(char => char.charCodeAt(0).toString(2).padStart(8, "0"))
    .join("");

  const { data, info } = await sharp(inputImagePath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = Buffer.from(data);

  if (messageBinary.length > pixels.length) {
    throw new Error("Message too long for this image");
  }

  for (let i = 0; i < messageBinary.length; i++) {
    const bit = parseInt(messageBinary[i]);
    pixels[i] = (pixels[i] & 0b11111110) | bit;
  }

  await sharp(pixels, {
    raw: { width: info.width, height: info.height, channels: info.channels },
  }).toFile(outputImagePath);

  return outputImagePath;
}

async function extractWatermark(imagePath) {
  const { data } = await sharp(imagePath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = Buffer.from(data);
  let binaryString = "";

  for (let i = 0; i < pixels.length; i++) {
    binaryString += (pixels[i] & 1).toString();
  }

  let message = "";
  for (let i = 0; i < binaryString.length; i += 8) {
    const byte = binaryString.slice(i, i + 8);
    const char = String.fromCharCode(parseInt(byte, 2));
    message += char;
    if (message.includes("|||END|||")) {
      return message.replace("|||END|||", "");
    }
  }
  return null;
}

module.exports = { hideWatermark, extractWatermark };