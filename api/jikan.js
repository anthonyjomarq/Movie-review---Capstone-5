import axios from "axios";

const JIKAN_BASE_URL = "https://api.jikan.moe/v4";

// search for anime using Jikan (MyAnimeList) API
export const searchAnime = async (query) => {
  try {
    const response = await axios.get(`${JIKAN_BASE_URL}/anime`, {
      params: {
        q: query,
        limit: 10,
        order_by: "popularity",
        sort: "desc",
      },
    });

    // normalize the data to match our format
    const results = response.data.data.map((anime) => ({
      id: anime.mal_id,
      title: anime.title,
      media_type: "anime",
      release_date: anime.aired?.from || null,
      poster_path:
        anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
      backdrop_path: null, // Jikan doesn't provide backdrop images
      overview: anime.synopsis
        ? anime.synopsis.substring(0, 300) + "..."
        : "No description available",
      source: "jikan",
    }));

    return results;
  } catch (error) {
    console.error("Jikan API error:", error);
    return [];
  }
};

// get detailed anime info from Jikan
export const getAnimeDetails = async (malId) => {
  try {
    const response = await axios.get(`${JIKAN_BASE_URL}/anime/${malId}`);
    const anime = response.data.data;

    return {
      tmdb_id: null, // Jikan uses MAL ID, not TMDB
      mal_id: anime.mal_id,
      title: anime.title,
      media_type: "anime",
      release_date: anime.aired?.from || null,
      poster_url:
        anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
      backdrop_url: null,
      genre: anime.genres ? anime.genres.map((g) => g.name).join(", ") : null,
      overview: anime.synopsis || "No description available",
      source: "jikan",
    };
  } catch (error) {
    console.error("Jikan details error:", error);
    return null;
  }
};
