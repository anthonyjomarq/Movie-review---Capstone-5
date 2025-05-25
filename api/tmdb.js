import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

// search for movies, tv shows, or both
export const searchMedia = async (query, mediaType = "multi") => {
  try {
    const endpoint =
      mediaType === "multi" ? "search/multi" : `search/${mediaType}`;
    const response = await axios.get(`${TMDB_BASE_URL}/${endpoint}`, {
      params: {
        api_key: TMDB_API_KEY,
        query: query,
        page: 1,
      },
    });

    // clean up the results
    const results = response.data.results.slice(0, 10).map((item) => ({
      id: item.id,
      title: item.title || item.name,
      media_type: item.media_type || mediaType,
      release_date: item.release_date || item.first_air_date,
      poster_path: item.poster_path
        ? `${TMDB_IMAGE_BASE}${item.poster_path}`
        : null,
      backdrop_path: item.backdrop_path
        ? `${TMDB_IMAGE_BASE}${item.backdrop_path}`
        : null,
      overview: item.overview,
      source: "tmdb",
    }));

    return results;
  } catch (error) {
    console.error("TMDB search error:", error);
    return [];
  }
};

// get detailed info for a specific movie or tv show
export const getMediaDetails = async (tmdbId, mediaType) => {
  try {
    const response = await axios.get(
      `${TMDB_BASE_URL}/${mediaType}/${tmdbId}`,
      {
        params: {
          api_key: TMDB_API_KEY,
        },
      }
    );

    const item = response.data;

    return {
      tmdb_id: item.id,
      title: item.title || item.name,
      media_type: mediaType,
      release_date: item.release_date || item.first_air_date,
      poster_url: item.poster_path
        ? `${TMDB_IMAGE_BASE}${item.poster_path}`
        : null,
      backdrop_url: item.backdrop_path
        ? `${TMDB_IMAGE_BASE}${item.backdrop_path}`
        : null,
      genre: item.genres ? item.genres.map((g) => g.name).join(", ") : null,
      overview: item.overview,
      source: "tmdb",
    };
  } catch (error) {
    console.error("TMDB details error:", error);
    return null;
  }
};

// search specifically for anime (using keywords)
export const searchAnime = async (query) => {
  try {
    // search TV shows with anime-related keywords
    const response = await axios.get(`${TMDB_BASE_URL}/search/tv`, {
      params: {
        api_key: TMDB_API_KEY,
        query: query,
        page: 1,
      },
    });

    // filter for likely anime results
    const results = response.data.results
      .filter((item) => {
        const title = (item.name || "").toLowerCase();
        const overview = (item.overview || "").toLowerCase();
        // basic anime detection
        return (
          title.includes("anime") ||
          overview.includes("anime") ||
          item.origin_country?.includes("JP") ||
          item.original_language === "ja"
        );
      })
      .slice(0, 10)
      .map((item) => ({
        id: item.id,
        title: item.name,
        media_type: "anime",
        release_date: item.first_air_date,
        poster_path: item.poster_path
          ? `${TMDB_IMAGE_BASE}${item.poster_path}`
          : null,
        backdrop_path: item.backdrop_path
          ? `${TMDB_IMAGE_BASE}${item.backdrop_path}`
          : null,
        overview: item.overview,
        source: "tmdb",
      }));

    return results;
  } catch (error) {
    console.error("Anime search error:", error);
    return [];
  }
};
