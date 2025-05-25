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
    const { title, media_type, rating, review_text, notes } = req.body;
    await addReview(title, media_type, parseInt(rating), review_text, notes);
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
    const { title, media_type, rating, review_text, notes } = req.body;
    await updateReview(
      req.params.id,
      title,
      media_type,
      parseInt(rating),
      review_text,
      notes
    );
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
