import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import {
  testConnection,
  getStats,
  getAllReviews,
  getReviewById,
  addReview,
  updateReview,
  deleteReview,
} from "./database/db.js";
import { searchAllMedia, getMediaDetailsFromSource } from "./api/mediaApi.js";

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

// simple health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running!",
  });
});

// API routes for multi-source media search
app.get("/api/search", async (req, res) => {
  try {
    const { q, type } = req.query;

    if (!q) {
      return res.json({ results: [] });
    }

    console.log(`Searching for "${q}" with type "${type || "multi"}"`);
    const results = await searchAllMedia(q, type || "multi");

    console.log(`Found ${results.length} results from multiple sources`);
    res.json({ results });
  } catch (error) {
    console.error("Multi-source search error:", error);
    res.status(500).json({ error: "Search failed" });
  }
});

// get detailed info for a media item from any source
app.get("/api/details/:source/:mediaType/:mediaId", async (req, res) => {
  try {
    const { source, mediaType, mediaId } = req.params;
    console.log(
      `Getting details for ${mediaType} ID ${mediaId} from ${source}`
    );

    const details = await getMediaDetailsFromSource(mediaId, mediaType, source);

    if (!details) {
      return res.status(404).json({ error: "Media not found" });
    }

    res.json(details);
  } catch (error) {
    console.error("Get details error:", error);
    res.status(500).json({ error: "Failed to get details" });
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

// show all reviews
app.get("/reviews", async (req, res) => {
  try {
    const reviews = await getAllReviews();
    res.render("reviews", {
      title: "My Reviews",
      reviews: reviews,
    });
  } catch (error) {
    console.error("Error getting reviews:", error);
    res.render("reviews", {
      title: "My Reviews",
      reviews: [],
      error: "Could not load reviews",
    });
  }
});

// show add review form
app.get("/add", (req, res) => {
  res.render("add", { title: "Add Review" });
});

// handle adding new review
app.post("/add", async (req, res) => {
  try {
    console.log("Raw form data received:", req.body); // Debug log
    console.log("Request body type:", typeof req.body); // Debug log
    console.log("Request body keys:", Object.keys(req.body)); // Debug log

    // Make sure we have required fields
    if (
      !req.body.title ||
      !req.body.media_type ||
      !req.body.rating ||
      !req.body.review_text
    ) {
      console.log("Missing required fields:", {
        title: req.body.title,
        media_type: req.body.media_type,
        rating: req.body.rating,
        review_text: req.body.review_text,
      });
      return res.render("add", {
        title: "Add Review",
        error: "Please fill in all required fields.",
      });
    }

    const reviewData = {
      title: req.body.title,
      media_type: req.body.media_type,
      tmdb_id: req.body.tmdb_id ? parseInt(req.body.tmdb_id) : null,
      mal_id: req.body.mal_id ? parseInt(req.body.mal_id) : null,
      tvmaze_id: req.body.tvmaze_id ? parseInt(req.body.tvmaze_id) : null,
      poster_url: req.body.poster_url || null,
      backdrop_url: req.body.backdrop_url || null,
      release_date: req.body.release_date || null,
      genre: req.body.genre || null,
      rating: parseInt(req.body.rating),
      review_text: req.body.review_text,
      notes: req.body.notes || null,
      source: req.body.source || "manual",
    };

    console.log("Processed review data:", reviewData); // Debug log

    await addReview(reviewData);
    res.redirect("/reviews");
  } catch (error) {
    console.error("Error adding review:", error);
    res.render("add", {
      title: "Add Review",
      error: "Could not add review. Please try again.",
    });
  }
});

// show edit form
app.get("/edit/:id", async (req, res) => {
  try {
    const review = await getReviewById(req.params.id);
    if (!review) {
      return res.redirect("/reviews");
    }
    res.render("edit", {
      title: "Edit Review",
      review: review,
    });
  } catch (error) {
    console.error("Error getting review:", error);
    res.redirect("/reviews");
  }
});

// handle updating review
app.post("/edit/:id", async (req, res) => {
  try {
    const reviewData = {
      title: req.body.title,
      media_type: req.body.media_type,
      tmdb_id: req.body.tmdb_id ? parseInt(req.body.tmdb_id) : null,
      mal_id: req.body.mal_id ? parseInt(req.body.mal_id) : null,
      tvmaze_id: req.body.tvmaze_id ? parseInt(req.body.tvmaze_id) : null,
      poster_url: req.body.poster_url || null,
      backdrop_url: req.body.backdrop_url || null,
      release_date: req.body.release_date || null,
      genre: req.body.genre || null,
      rating: parseInt(req.body.rating),
      review_text: req.body.review_text,
      notes: req.body.notes || null,
      source: req.body.source || "manual",
    };

    await updateReview(req.params.id, reviewData);
    res.redirect("/reviews");
  } catch (error) {
    console.error("Error updating review:", error);
    res.redirect("/reviews");
  }
});

// handle deleting review
app.post("/delete/:id", async (req, res) => {
  try {
    await deleteReview(req.params.id);
    res.redirect("/reviews");
  } catch (error) {
    console.error("Error deleting review:", error);
    res.redirect("/reviews");
  }
});

// catch 404s
app.use((req, res) => {
  res.status(404).render("404", { title: "Page Not Found" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
