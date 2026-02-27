const crypto = require("crypto");

function generateSignedUrl(userId, contentId, baseUrl, expiryMinutes = 5) {
  const expiresAt = Math.floor(Date.now() / 1000) + (expiryMinutes * 60);
  const message = `uid=${userId}|cid=${contentId}|exp=${expiresAt}`;
  const signature = crypto
    .createHmac("sha256", process.env.JWT_SECRET)
    .update(message)
    .digest("hex");
  const url = `${baseUrl}/drm/stream?uid=${userId}&cid=${contentId}&exp=${expiresAt}&sig=${signature}`;
  return { url, expiresAt };
}

function verifySignedUrl(uid, cid, exp, sig) {
  const now = Math.floor(Date.now() / 1000);
  if (parseInt(exp) < now) {
    return { valid: false, reason: "Link has expired" };
  }
  const message = `uid=${uid}|cid=${cid}|exp=${exp}`;
  const expectedSig = crypto
    .createHmac("sha256", process.env.JWT_SECRET)
    .update(message)
    .digest("hex");
  try {
    const isValid = crypto.timingSafeEqual(
      Buffer.from(sig, "hex"),
      Buffer.from(expectedSig, "hex")
    );
    return isValid ? { valid: true } : { valid: false, reason: "Invalid signature" };
  } catch {
    return { valid: false, reason: "Malformed signature" };
  }
}

module.exports = { generateSignedUrl, verifySignedUrl };