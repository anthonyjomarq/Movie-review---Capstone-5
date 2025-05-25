import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { testConnection, getStats, getAllReviews } from "./database/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// need this for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// basic middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// main route - now with real data!
app.get("/", async (req, res) => {
  try {
    const stats = await getStats();
    res.render("index", {
      title: "Media Review Tracker",
      message: "Welcome to your personal media review tracker!",
      stats: stats || { movie_count: 0, tv_count: 0, anime_count: 0 },
    });
  } catch (error) {
    console.error("Error getting stats:", error);
    // fallback to zeros if database fails
    res.render("index", {
      title: "Media Review Tracker",
      message: "Welcome to your personal media review tracker!",
      stats: { movie_count: 0, tv_count: 0, anime_count: 0 },
    });
  }
});

// test database connection
app.get("/db-test", async (req, res) => {
  const isConnected = await testConnection();
  if (isConnected) {
    const reviews = await getAllReviews();
    res.json({
      status: "Database connected!",
      reviewCount: reviews.length,
      sampleReviews: reviews.slice(0, 3), // just show first 3
    });
  } else {
    res.status(500).json({ status: "Database connection failed" });
  }
});

// simple health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running!",
  });
});

// catch 404s
app.use((req, res) => {
  res.status(404).render("404", { title: "Page Not Found" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
