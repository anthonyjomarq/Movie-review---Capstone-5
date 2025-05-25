-- Media Review Tracker Database
-- Setting up tables for storing my reviews

-- Create database first:
-- CREATE DATABASE media_tracker;

-- Main reviews table
CREATE TABLE IF NOT EXISTS media_reviews (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    media_type VARCHAR(50) NOT NULL CHECK (media_type IN ('movie', 'tv', 'anime')),
    tmdb_id INTEGER UNIQUE, -- for API later
    poster_url TEXT,
    backdrop_url TEXT,
    release_date DATE, -- from API
    genre VARCHAR(255), -- from API
    rating INTEGER CHECK (rating >= 1 AND rating <= 10),
    review_text TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- make queries faster
CREATE INDEX IF NOT EXISTS idx_media_reviews_type ON media_reviews(media_type);
CREATE INDEX IF NOT EXISTS idx_media_reviews_rating ON media_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_media_reviews_created_at ON media_reviews(created_at);

-- auto update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$ language 'plpgsql';

CREATE TRIGGER update_media_reviews_updated_at 
    BEFORE UPDATE ON media_reviews 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- some test data
INSERT INTO media_reviews (title, media_type, rating, review_text, notes) VALUES
('The Matrix', 'movie', 9, 'Really good sci-fi movie', 'Mind bending plot especially for how long ago it was released'),
('Attack on Titan', 'anime', 10, 'Amazing anime series', 'My favorite series/anime ever'),
('Breaking Bad', 'tv', 10, 'Best TV show ever', 'Walter White is incredible')
ON CONFLICT DO NOTHING;

-- stats view for dashboard
CREATE OR REPLACE VIEW media_stats AS
SELECT 
    COUNT(*) as total_reviews,
    COUNT(*) FILTER (WHERE media_type = 'movie') as movie_count,
    COUNT(*) FILTER (WHERE media_type = 'tv') as tv_count,
    COUNT(*) FILTER (WHERE media_type = 'anime') as anime_count,
    ROUND(AVG(rating), 1) as average_rating,
    MAX(created_at) as last_review_added
FROM media_reviews;

-- View to get statistics (for dashboard)
CREATE OR REPLACE VIEW media_stats AS
SELECT 
    COUNT(*) as total_reviews,
    COUNT(*) FILTER (WHERE media_type = 'movie') as movie_count,
    COUNT(*) FILTER (WHERE media_type = 'tv') as tv_count,
    COUNT(*) FILTER (WHERE media_type = 'anime') as anime_count,
    ROUND(AVG(rating), 1) as average_rating,
    MAX(created_at) as last_review_added
FROM media_reviews;