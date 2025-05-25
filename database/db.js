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

// get single review by id
export const getReviewById = async (id) => {
  const result = await query("SELECT * FROM media_reviews WHERE id = $1", [id]);
  return result.rows[0];
};

// get stats for dashboard
export const getStats = async () => {
  const result = await query("SELECT * FROM media_stats");
  return result.rows[0];
};

// add a review with multi-API data
export const addReview = async (reviewData) => {
  console.log("addReview called with:", reviewData); // Debug log
  console.log("reviewData type:", typeof reviewData); // Debug log

  if (typeof reviewData === "string") {
    console.error("ERROR: reviewData is a string, not an object!");
    throw new Error("Invalid reviewData format");
  }

  const {
    title,
    media_type,
    tmdb_id,
    mal_id,
    tvmaze_id,
    poster_url,
    backdrop_url,
    release_date,
    genre,
    rating,
    review_text,
    notes,
    source,
  } = reviewData;

  console.log("Extracted fields:", {
    title,
    media_type,
    rating,
    review_text,
  }); // Debug log

  const queryText = `
        INSERT INTO media_reviews (
            title, media_type, tmdb_id, poster_url, backdrop_url, 
            release_date, genre, rating, review_text, notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
    `;

  // Use the appropriate ID (TMDB, MAL, or TVMaze)
  const external_id = tmdb_id || mal_id || tvmaze_id || null;

  const values = [
    title,
    media_type,
    external_id,
    poster_url,
    backdrop_url,
    release_date,
    genre,
    rating,
    review_text,
    notes,
  ];

  console.log("SQL values:", values); // Debug log

  const result = await query(queryText, values);
  return result.rows[0];
};

// update a review with multi-API data
export const updateReview = async (id, reviewData) => {
  const {
    title,
    media_type,
    tmdb_id,
    mal_id,
    tvmaze_id,
    poster_url,
    backdrop_url,
    release_date,
    genre,
    rating,
    review_text,
    notes,
    source,
  } = reviewData;

  const queryText = `
        UPDATE media_reviews 
        SET title = $1, media_type = $2, tmdb_id = $3, poster_url = $4, backdrop_url = $5,
            release_date = $6, genre = $7, rating = $8, review_text = $9, notes = $10,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $11
        RETURNING *
    `;

  // Use the appropriate ID (TMDB, MAL, or TVMaze)
  const external_id = tmdb_id || mal_id || tvmaze_id || null;

  const result = await query(queryText, [
    title,
    media_type,
    external_id,
    poster_url,
    backdrop_url,
    release_date,
    genre,
    rating,
    review_text,
    notes,
    id,
  ]);

  return result.rows[0];
};

// delete a review
export const deleteReview = async (id) => {
  const result = await query(
    "DELETE FROM media_reviews WHERE id = $1 RETURNING *",
    [id]
  );
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
