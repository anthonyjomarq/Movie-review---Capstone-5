# 📺 My Media Review Tracker

**A personal project inspired by Derek Sivers' book tracking website**

Ever finish watching an amazing movie or TV show, only to completely forget what you thought about it a few months later? That's exactly what happened to me, and that's why I built this web app for my bootcamp capstone project.

I was inspired by myanimelist.net which had a webpage for anime reviews but I got the idea to add TV series and movies to the idea. 
[![Media Tracker Screenshot](https://via.placeholder.com/800x400/CB3737/FFFFFF?text=Media+Review+Tracker)](https://gyazo.com/8bc3114d6ae0434b82ac6b758f30a3a2)

## What I Built 

This is my capstone project for my web development bootcamp, and honestly, I'm pretty proud of how it turned out! Here's what it does:

### The Cool Stuff ✨
- **Smart Search**: Instead of manually typing everything, you can search across multiple databases (TMDB for movies/TV, MyAnimeList for anime, and TVMaze for more TV shows). The app automatically fills in posters, release dates, genres - all that good stuff.
- **Personal Reviews**: Rate everything 1-10 and write your thoughts. I added a separate notes section too for those random thoughts you want to remember.
- **Sorting & Filtering**: Want to see your highest-rated anime? Or just movies from this year? The filtering system makes it super easy to find what you're looking for.
- **Actually Looks Good**: I spent way too much time on the CSS, but it was worth it. Responsive design, smooth animations, even keyboard shortcuts (press 1-4 to filter by type!).

### What I Learned Along the Way 🎓
This project taught me a ton about:
- Working with multiple APIs and handling their different response formats
- PostgreSQL database design (learned about indexes the hard way!)

## Getting It Running

### What You'll Need
- Node.js (I used v18 but v14+ should work)
- PostgreSQL (I had some experience in college so it was not hard)
- A TMDB API key (free but required - the other APIs don't need keys!)

### Setup Steps
```bash
# Clone my project
git clone https://github.com/anthonyjomarq/Movie-review---Capstone-5.git
cd media-review-tracker

# Install all the things
npm install
```

Create a `.env` file (this hides your key from other people and your personal stuff):
```env
# Database stuff
DB_HOST=localhost
DB_PORT=5432
DB_NAME=media_tracker
DB_USER=your_username
DB_PASSWORD=your_password

# The only API key you actually need
TMDB_API_KEY=get_this_from_tmdb

# Server config
PORT=3000
```

Set up the database:
I did this manually i just created the database and use the query.sql in the project

# Run my setup script
npm run setup-db
```

Start it up:
```bash
# Development mode (auto-restarts when you make changes)
npm run dev

# Or just run it normally
npm start
```

Then go to `http://localhost:3000` and start tracking your media!

## How I Built This

### The APIs I'm Using
- **TMDB**: The big one for movies and TV shows. Great data, good images, free tier is generous.
- **Jikan (MyAnimeList)**: Perfect for anime. No API key needed which is nice.
- **TVMaze**: Extra TV show coverage. Also free, also no key needed.

The tricky part was making them all work together and ranking the search results intelligently. I probably overthought the relevance scoring algorithm, but it works pretty well!

### Database Design
I kept it simple with one main table for reviews and a view for statistics:

```sql
-- The main table where everything lives
CREATE TABLE media_reviews (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    media_type VARCHAR(50) CHECK (media_type IN ('movie', 'tv', 'anime')),
    tmdb_id INTEGER UNIQUE,
    poster_url TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 10),
    review_text TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- ... and some other fields
);
```

Nothing too fancy, but it gets the job done!

## The Learning Journey

### Things That Went Well
- The multi-API search actually works better than I expected
- The UI turned out pretty clean (I'm not a designer but I tried!)
- PostgreSQL wasn't as scary as I thought it would be
- Got really comfortable with async/await and Promises

### Things That Were Challenging
- Handling different API response formats and merging them intelligently
- Making the search results relevant (turned into a mini algorithm problem)

### If I Did It Again
- Would probably add user authentication from the start
- Maybe use a CSS framework instead of writing everything from scratch
- Set up better error logging earlier in the process
- Write more modular code (some of my functions got pretty long)


## Want to Try It?

Feel free to clone this and make it your own! If you run into issues, create an issue on GitHub and I'll try to help. Also, if you make cool improvements, I'd love to see them!
