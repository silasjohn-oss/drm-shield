const express = require("express");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const authMiddleware = require("../middleware/authMiddleware");
const redisClient = require("../redisClient");
const pool = require("../db");
const watermarkPDF = require("../services/watermarkService");
const analyzeViolation = require("../services/aiService");
const speakAlert = require("../services/voiceService");
const { encryptFile, decryptFile } = require("../services/encryptionService");
const { hideWatermark, extractWatermark } = require("../services/steganographyService");
const { generateSignedUrl, verifySignedUrl } = require("../services/signedUrlService");

const router = express.Router();
const upload = multer({ dest: "uploads/raw/" });

// Create folders if they don't exist
["uploads/encrypted", "uploads/temp", "uploads/raw"].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Generate a secure signed link
router.post("/generate-link", authMiddleware, async (req, res) => {
  try {
    const contentId = req.body.contentId || 1;
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const { url, expiresAt } = generateSignedUrl(req.user.userId, contentId, baseUrl);

    res.json({
      secureUrl: url,
      expiresAt: new Date(expiresAt * 1000).toISOString(),
      boundTo: req.user.email,
      expiresIn: "5 minutes",
    });
  } catch (err) {
    res.status(500).json({ msg: "Failed to generate link", error: err.message });
  }
});

// List available files
router.get("/files", authMiddleware, async (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, "../uploads");
    const files = fs.readdirSync(uploadsDir)
      .filter(file => file.toLowerCase().endsWith('.pdf'))
      .map(file => ({
        filename: file,
        size: fs.statSync(path.join(uploadsDir, file)).size,
      }));

    res.json({
      msg: "Available files",
      files,
      total: files.length,
    });
  } catch (err) {
    res.status(500).json({ msg: "Error listing files", error: err.message });
  }
});

// Stream watermarked content
router.get("/stream", async (req, res) => {
  try {
    const { uid, cid, exp, sig, file } = req.query;

    // Verify signed URL
    const urlCheck = verifySignedUrl(uid, cid, exp, sig);
    if (!urlCheck.valid) {
      return res.status(403).json({ msg: urlCheck.reason });
    }

    // Check Redis session
    const session = await redisClient.get(`session:${uid}`);
    if (!session) {
      await pool.query(
        "INSERT INTO logs (user_id, ip, device_hash, violation, threat_level, ai_analysis) VALUES ($1,$2,$3,$4,$5,$6)",
        [uid, req.ip, "unknown", true, "HIGH", "Session expired or revoked"]
      );
      return res.status(403).json({ msg: "Session expired. Please login again." });
    }

    // Use specified file or fall back to sample.pdf
    const filename = file || "sample.pdf";
    const uploadsDir = path.join(__dirname, "../uploads");
    const samplePath = path.join(uploadsDir, filename);
    
    // Security check: prevent directory traversal
    if (!samplePath.startsWith(uploadsDir) || !filename.toLowerCase().endsWith('.pdf')) {
      return res.status(400).json({ msg: "Invalid file specified" });
    }

    if (!fs.existsSync(samplePath)) {
      return res.status(404).json({
        msg: `File '${filename}' not found in uploads folder`
      });
    }

    // Get user email
    const userResult = await pool.query(
      "SELECT email FROM users WHERE id = $1", [uid]
    );
    const email = userResult.rows[0]?.email || `user-${uid}`;

    // Apply watermark
    const watermarkedPath = `uploads/temp/final_${uid}_${Date.now()}.pdf`;
    await watermarkPDF(samplePath, watermarkedPath, email, uid);

    // Log valid access
    await pool.query(
      "INSERT INTO logs (user_id, ip, device_hash, violation, threat_level, ai_analysis) VALUES ($1,$2,$3,$4,$5,$6)",
      [uid, req.ip, "valid-session", false, "LOW", "Valid authenticated access"]
    );

    // Send file then clean up
    res.download(watermarkedPath, `protected-${filename}`, () => {
      setTimeout(() => {
        if (fs.existsSync(watermarkedPath)) fs.unlinkSync(watermarkedPath);
      }, 5000);
    });

  } catch (err) {
    return res.status(401).json({ msg: "Error", error: err.message });
  }
});

// Get audit logs
router.get("/logs", authMiddleware, async (req, res) => {
  try {
    const logs = await pool.query(
      "SELECT * FROM logs ORDER BY timestamp DESC LIMIT 100"
    );
    res.json(logs.rows);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching logs", error: err.message });
  }
});

// Revoke a session
router.post("/revoke-session", authMiddleware, async (req, res) => {
  try {
    const { targetUserId } = req.body;
    await redisClient.del(`session:${targetUserId}`);
    res.json({ msg: `Session revoked for user ${targetUserId}` });
  } catch (err) {
    res.status(500).json({ msg: "Error revoking session", error: err.message });
  }
});

// Simulate violation for demo
router.post("/simulate-violation", authMiddleware, async (req, res) => {
  try {
    const aiResult = await analyzeViolation(
      req.user.userId, req.ip, "suspicious-device-999"
    );

    await speakAlert(
      `Security alert. Unauthorized access detected for user ${req.user.email}. Threat level ${aiResult.threat_level}.`
    );

    await pool.query(
      "INSERT INTO logs (user_id, ip, device_hash, violation, threat_level, ai_analysis) VALUES ($1,$2,$3,$4,$5,$6)",
      [req.user.userId, req.ip, "suspicious-device-999", true, aiResult.threat_level, aiResult.ai_analysis]
    );

    res.json({
      msg: "Violation simulated",
      aiResult,
      voiceAlertGenerated: true,
    });
  } catch (err) {
    res.status(500).json({ msg: "Error", error: err.message });
  }
});

// Trace a leaked file
router.post("/trace-leak", upload.single("file"), async (req, res) => {
  try {
    const watermark = await extractWatermark(req.file.path);
    fs.unlinkSync(req.file.path);

    if (!watermark) {
      return res.status(404).json({ msg: "No watermark found in this file" });
    }

    const userIdMatch = watermark.match(/ID:(\d+)/);
    const userId = userIdMatch ? userIdMatch[1] : null;

    const user = userId
      ? await pool.query("SELECT email FROM users WHERE id = $1", [userId])
      : null;

    res.json({
      msg: "Leak source identified!",
      watermarkFound: watermark,
      leakSource: user?.rows[0]?.email || "Unknown",
      userId,
    });
  } catch (err) {
    res.status(500).json({ msg: "Trace failed", error: err.message });
  }
});

module.exports = router;