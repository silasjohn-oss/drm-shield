const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const redisClient = require("../redisClient");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ msg: "Email and password required" });

    const hashed = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2)",
      [email, hashed]
    );
    res.json({ msg: "User registered successfully" });
  } catch (err) {
    if (err.code === "23505")
      return res.status(400).json({ msg: "Email already exists" });
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password, deviceHash } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1", [email]
    );
    if (!result.rows.length)
      return res.status(400).json({ msg: "User not found" });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(400).json({ msg: "Wrong password" });

    const sessionId = uuidv4();
    await redisClient.set(
      `session:${user.id}`,
      sessionId,
      { EX: 1800 }
    );

    const token = jwt.sign(
      { userId: user.id, email: user.email, sessionId, deviceHash },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    res.json({ token, userId: user.id, email: user.email });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

module.exports = router;