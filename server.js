require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { msg: "Too many requests. Slow down." },
}));

// Routes
const authRoutes = require("./routes/authRoutes");
const drmRoutes = require("./routes/drmRoutes");

app.use("/auth", authRoutes);
app.use("/drm", drmRoutes);

// Swagger docs - load after routes
try {
  const swaggerSpec = require("./swagger");
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("📚 Swagger loaded successfully");
} catch (err) {
  console.log("⚠️ Swagger failed to load:", err.message);
}

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "🛡️ DRM Shield is running",
    docs: "/api/docs",
    version: "1.0.0",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🛡️  DRM Shield → http://localhost:${PORT}`);
  console.log(`📚 API Docs  → http://localhost:${PORT}/api/docs\n`);
});