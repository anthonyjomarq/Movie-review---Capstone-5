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

// unified search function that routes to appropriate APIs
export const searchAllMedia = async (query, mediaType = "multi") => {
  try {
    let allResults = [];

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

    // Remove duplicates and limit results
    const uniqueResults = removeDuplicates(allResults);
    return rankResults(uniqueResults).slice(0, 12); // Show top 12 results
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

// helper function to remove duplicate results
function removeDuplicates(results) {
  const seen = new Set();
  return results.filter((item) => {
    // Create a unique key based on title and type
    const key = `${item.title.toLowerCase().trim()}-${item.media_type}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

// helper function to rank results (prioritize certain sources)
function rankResults(results) {
  return results.sort((a, b) => {
    // Prioritize results with posters
    if (a.poster_path && !b.poster_path) return -1;
    if (!a.poster_path && b.poster_path) return 1;

    // Prioritize specialized sources for their content types
    if (a.media_type === "anime" && a.source === "jikan") return -1;
    if (b.media_type === "anime" && b.source === "jikan") return 1;

    if (a.media_type === "tv" && a.source === "tvmaze") return -1;
    if (b.media_type === "tv" && b.source === "tvmaze") return 1;

    return 0;
  });
}
