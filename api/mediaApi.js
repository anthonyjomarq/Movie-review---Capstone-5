// Unified media search API - combines TMDB, Jikan, and TVMaze
import {
  searchMedia as searchTMDB,
  getMediaDetails as getTMDBDetails,
} from "./tmdb.js";
import {
  searchAnime as searchJikan,
  getAnimeDetails as getJikanDetails,
} from "./jikan.js";
import {
  searchTVShows as searchTVMaze,
  getTVShowDetails as getTVMazeDetails,
} from "./tvmaze.js";

// Helper function to calculate search relevance score
function calculateRelevanceScore(searchQuery, title, originalTitle = "") {
  const query = searchQuery.toLowerCase().trim();
  const titleLower = title.toLowerCase();
  const originalTitleLower = originalTitle.toLowerCase();

  let score = 0;

  // Exact match gets highest score
  if (titleLower === query || originalTitleLower === query) {
    score += 100;
  }
  // Title starts with query gets high score
  else if (
    titleLower.startsWith(query) ||
    originalTitleLower.startsWith(query)
  ) {
    score += 80;
  }
  // Query is at beginning of any word in title
  else if (
    titleLower.includes(" " + query) ||
    originalTitleLower.includes(" " + query)
  ) {
    score += 60;
  }
  // Title contains query as substring
  else if (titleLower.includes(query) || originalTitleLower.includes(query)) {
    score += 40;
  }
  // Partial word matches (for cases like "jujutsu" matching "jutsu")
  else {
    const queryWords = query.split(" ");
    const titleWords = titleLower.split(" ");
    const originalTitleWords = originalTitleLower.split(" ");

    let wordMatches = 0;
    let partialMatches = 0;

    queryWords.forEach((queryWord) => {
      // Check for exact word matches
      if (
        titleWords.some((titleWord) => titleWord === queryWord) ||
        originalTitleWords.some((titleWord) => titleWord === queryWord)
      ) {
        wordMatches++;
      }
      // Check for partial word matches - but only if query word is substantial
      else if (
        queryWord.length >= 4 &&
        (titleWords.some((titleWord) => titleWord.includes(queryWord)) ||
          originalTitleWords.some((titleWord) => titleWord.includes(queryWord)))
      ) {
        partialMatches++;
      }
    });

    // Score based on word matches
    score += wordMatches * 25;
    score += partialMatches * 8;
  }

  // Bonus for shorter titles (more likely to be relevant)
  if (title.length < 30) {
    score += 5;
  }

  // Penalty for very long titles that might be descriptions
  if (title.length > 80) {
    score -= 10;
  }

  return Math.max(0, score); // Ensure score is never negative
}

// Enhanced function to add relevance scores to results
function addRelevanceScores(results, searchQuery) {
  return results.map((item) => ({
    ...item,
    relevance_score: calculateRelevanceScore(
      searchQuery,
      item.title,
      item.original_title || ""
    ),
  }));
}

// Enhanced function to remove duplicate results with relevance consideration
function removeDuplicates(results) {
  const seen = new Map();

  results.forEach((item) => {
    const key = `${item.title.toLowerCase().trim()}-${item.media_type}`;

    if (!seen.has(key)) {
      seen.set(key, item);
    } else {
      // If we've seen this title, keep the one with higher relevance score
      const existing = seen.get(key);
      if (item.relevance_score > existing.relevance_score) {
        seen.set(key, item);
      }
    }
  });

  return Array.from(seen.values());
}

// Enhanced function to rank results with relevance scoring
function rankResults(results, searchQuery) {
  // Add relevance scores to all results
  const scoredResults = addRelevanceScores(results, searchQuery);

  // Filter out results with very low relevance (less than 5 points)
  const relevantResults = scoredResults.filter(
    (item) => item.relevance_score >= 5
  );

  return relevantResults.sort((a, b) => {
    // Primary sort: relevance score (highest first)
    if (b.relevance_score !== a.relevance_score) {
      return b.relevance_score - a.relevance_score;
    }

    // Secondary sort: Prioritize results with posters
    if (a.poster_path && !b.poster_path) return -1;
    if (!a.poster_path && b.poster_path) return 1;

    // Tertiary sort: Prioritize specialized sources for their content types
    if (
      a.media_type === "anime" &&
      a.source === "jikan" &&
      b.source !== "jikan"
    )
      return -1;
    if (
      b.media_type === "anime" &&
      b.source === "jikan" &&
      a.source !== "jikan"
    )
      return 1;

    if (a.media_type === "tv" && a.source === "tvmaze" && b.source !== "tvmaze")
      return -1;
    if (b.media_type === "tv" && b.source === "tvmaze" && a.source !== "tvmaze")
      return 1;

    // Final sort: by release date (newer first)
    const dateA = a.release_date ? new Date(a.release_date) : new Date(0);
    const dateB = b.release_date ? new Date(b.release_date) : new Date(0);
    return dateB - dateA;
  });
}

// unified search function that routes to appropriate APIs
export const searchAllMedia = async (query, mediaType = "multi") => {
  try {
    let allResults = [];

    console.log(`Searching for "${query}" with type "${mediaType}"`);

    switch (mediaType) {
      case "anime":
        // Use Jikan for anime-specific searches
        console.log("Searching anime via Jikan...");
        const animeResults = await searchJikan(query);
        allResults = animeResults;
        break;

      case "tv":
        // Use both TVMaze and TMDB for TV shows
        console.log("Searching TV shows via TVMaze and TMDB...");
        const tvResults = await Promise.all([
          searchTVMaze(query),
          searchTMDB(query, "tv"),
        ]);

        // Combine results, TVMaze first (better TV data)
        allResults = [...tvResults[0], ...tvResults[1]];
        break;

      case "movie":
        // Use TMDB for movies
        console.log("Searching movies via TMDB...");
        allResults = await searchTMDB(query, "movie");
        break;

      case "multi":
      default:
        // Search all APIs and combine results
        console.log("Searching all sources...");
        const multiResults = await Promise.all([
          searchTMDB(query, "multi"),
          searchJikan(query),
          searchTVMaze(query),
        ]);

        // Combine all results
        allResults = [
          ...multiResults[0],
          ...multiResults[1],
          ...multiResults[2],
        ];
        break;
    }

    console.log(`Raw results count: ${allResults.length}`);

    // Remove duplicates and rank by relevance
    const uniqueResults = removeDuplicates(allResults);
    console.log(`Unique results count: ${uniqueResults.length}`);

    const rankedResults = rankResults(uniqueResults, query);
    console.log(
      `Top result: ${rankedResults[0]?.title} (score: ${rankedResults[0]?.relevance_score})`
    );

    return rankedResults.slice(0, 12); // Show top 12 results
  } catch (error) {
    console.error("Multi-API search error:", error);
    return [];
  }
};

// get detailed info from the appropriate API based on source
export const getMediaDetailsFromSource = async (mediaId, mediaType, source) => {
  try {
    switch (source) {
      case "jikan":
        return await getJikanDetails(mediaId);

      case "tvmaze":
        return await getTVMazeDetails(mediaId);

      case "tmdb":
      default:
        return await getTMDBDetails(mediaId, mediaType);
    }
  } catch (error) {
    console.error("Get details error:", error);
    return null;
  }
};
