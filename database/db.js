import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// database connection setup
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// test the connection
pool.on("connect", () => {
  console.log("Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("Database connection error:", err);
});

// basic database functions
export const query = async (text, params) => {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
};

// get all reviews
export const getAllReviews = async () => {
  const result = await query(
    "SELECT * FROM media_reviews ORDER BY created_at DESC"
  );
  return result.rows;
};

// get stats for dashboard
export const getStats = async () => {
  const result = await query("SELECT * FROM media_stats");
  return result.rows[0];
};

// add a review (basic version for now)
export const addReview = async (
  title,
  mediaType,
  rating,
  reviewText,
  notes
) => {
  const queryText = `
        INSERT INTO media_reviews (title, media_type, rating, review_text, notes)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;
  const result = await query(queryText, [
    title,
    mediaType,
    rating,
    reviewText,
    notes,
  ]);
  return result.rows[0];
};

// test database connection
export const testConnection = async () => {
  try {
    const result = await query("SELECT NOW()");
    console.log("Database test successful:", result.rows[0]);
    return true;
  } catch (error) {
    console.error("Database test failed:", error);
    return false;
  }
};

export default pool;
