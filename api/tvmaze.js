import axios from "axios";

const TVMAZE_BASE_URL = "https://api.tvmaze.com";

// search for TV shows using TVMaze API
export const searchTVShows = async (query) => {
  try {
    const response = await axios.get(`${TVMAZE_BASE_URL}/search/shows`, {
      params: {
        q: query,
      },
    });

    // normalize the data to match our format
    const results = response.data.slice(0, 10).map((item) => {
      const show = item.show;
      return {
        id: show.id,
        title: show.name,
        media_type: "tv",
        release_date: show.premiered || null,
        poster_path: show.image?.medium || show.image?.original || null,
        backdrop_path: show.image?.original || null,
        overview: show.summary
          ? show.summary.replace(/<[^>]*>/g, "").substring(0, 300) + "..."
          : "No description available",
        source: "tvmaze",
      };
    });

    return results;
  } catch (error) {
    console.error("TVMaze API error:", error);
    return [];
  }
};

// get detailed TV show info from TVMaze
export const getTVShowDetails = async (tvmazeId) => {
  try {
    const response = await axios.get(`${TVMAZE_BASE_URL}/shows/${tvmazeId}`);
    const show = response.data;

    return {
      tmdb_id: null, // TVMaze uses its own ID system
      tvmaze_id: show.id,
      title: show.name,
      media_type: "tv",
      release_date: show.premiered || null,
      poster_url: show.image?.medium || show.image?.original || null,
      backdrop_url: show.image?.original || null,
      genre: show.genres ? show.genres.join(", ") : null,
      overview: show.summary
        ? show.summary.replace(/<[^>]*>/g, "")
        : "No description available",
      source: "tvmaze",
    };
  } catch (error) {
    console.error("TVMaze details error:", error);
    return null;
  }
};
