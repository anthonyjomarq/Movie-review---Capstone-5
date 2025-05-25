// multi-API search functionality for add/edit forms
document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("searchInput");
  const searchType = document.getElementById("searchType");
  const searchBtn = document.getElementById("searchBtn");
  const searchResults = document.getElementById("searchResults");
  const hideSearchBtn = document.getElementById("hideSearchBtn");
  const searchSection = document.getElementById("searchSection");
  const formFields = document.getElementById("formFields");

  // form fields
  const titleInput = document.getElementById("title");
  const mediaTypeSelect = document.getElementById("media_type");
  const tmdbIdInput = document.getElementById("tmdb_id");
  const malIdInput = document.getElementById("mal_id");
  const tvmazeIdInput = document.getElementById("tvmaze_id");
  const posterUrlInput = document.getElementById("poster_url");
  const backdropUrlInput = document.getElementById("backdrop_url");
  const releaseDateInput = document.getElementById("release_date");
  const genreInput = document.getElementById("genre");
  const sourceInput = document.getElementById("source");

  // hide search section
  if (hideSearchBtn) {
    hideSearchBtn.addEventListener("click", function () {
      searchSection.style.display = "none";
    });
  }

  // search functionality (only if elements exist)
  if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", performSearch);
    searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        performSearch();
      }
    });
  }

  async function performSearch() {
    const query = searchInput.value.trim();
    const type = searchType ? searchType.value : "multi";

    if (!query) {
      return;
    }

    searchResults.innerHTML =
      '<div class="loading">🔍 Searching across multiple sources...</div>';

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}&type=${type}`
      );
      const data = await response.json();

      displaySearchResults(data.results);
    } catch (error) {
      console.error("Multi-source search error:", error);
      searchResults.innerHTML =
        '<div class="error">Search failed. Please try again or add manually below.</div>';
    }
  }

  function displaySearchResults(results) {
    if (results.length === 0) {
      searchResults.innerHTML =
        '<div class="no-results">No results found across all sources. You can add the review manually using the form below.</div>';
      return;
    }

    const resultsHTML = results
      .map((item) => {
        const sourceLabel = getSourceLabel(item.source || "tmdb");
        const sourceColor = getSourceColor(item.source || "tmdb");

        return `
                <div class="result-item" data-media-id="${
                  item.id
                }" data-media-type="${item.media_type}" data-source="${
          item.source || "tmdb"
        }">
                    <div class="result-poster">
                        ${
                          item.poster_path
                            ? `<img src="${item.poster_path}" alt="${item.title}">`
                            : '<div class="no-poster">No Image</div>'
                        }
                    </div>
                    <div class="result-info">
                        <h4>${item.title}</h4>
                        <div class="result-badges">
                            <span class="result-type">${item.media_type.toUpperCase()}</span>
                            <span class="result-source" style="background: ${sourceColor}">${sourceLabel}</span>
                        </div>
                        <p class="result-date">${
                          item.release_date
                            ? new Date(item.release_date).getFullYear()
                            : "Unknown"
                        }</p>
                        <p class="result-overview">${
                          item.overview
                            ? item.overview.substring(0, 150) + "..."
                            : "No description available"
                        }</p>
                        <button type="button" class="btn btn-primary btn-small select-btn">Select This</button>
                    </div>
                </div>
            `;
      })
      .join("");

    searchResults.innerHTML = `
            <div class="results-header">
                <h4>Found ${results.length} results across multiple sources:</h4>
            </div>
            ${resultsHTML}
        `;

    // add click handlers to select buttons
    searchResults.querySelectorAll(".select-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const resultItem = this.closest(".result-item");
        selectMedia(resultItem);
      });
    });
  }

  async function selectMedia(resultItem) {
    const mediaId = resultItem.dataset.mediaId;
    const mediaType = resultItem.dataset.mediaType;
    const source = resultItem.dataset.source || "tmdb";

    try {
      // get detailed info from the appropriate source
      const response = await fetch(
        `/api/details/${source}/${mediaType}/${mediaId}`
      );
      const details = await response.json();

      // fill the form with API data
      fillFormWithApiData(details);

      // show success message
      showSelectedPreview(details);
    } catch (error) {
      console.error("Error getting details:", error);
      alert("Error loading details. Please try again or add manually.");
    }
  }

  function fillFormWithApiData(details) {
    if (titleInput) titleInput.value = details.title;
    if (mediaTypeSelect) mediaTypeSelect.value = details.media_type;

    // Clear all API IDs first
    if (tmdbIdInput) tmdbIdInput.value = "";
    if (malIdInput) malIdInput.value = "";
    if (tvmazeIdInput) tvmazeIdInput.value = "";

    // Set the appropriate ID based on source
    if (details.tmdb_id && tmdbIdInput) tmdbIdInput.value = details.tmdb_id;
    if (details.mal_id && malIdInput) malIdInput.value = details.mal_id;
    if (details.tvmaze_id && tvmazeIdInput)
      tvmazeIdInput.value = details.tvmaze_id;

    if (posterUrlInput) posterUrlInput.value = details.poster_url || "";
    if (backdropUrlInput) backdropUrlInput.value = details.backdrop_url || "";
    if (releaseDateInput) releaseDateInput.value = details.release_date || "";
    if (genreInput) genreInput.value = details.genre || "";
    if (sourceInput) sourceInput.value = details.source || "tmdb";
  }

  function showSelectedPreview(details) {
    const sourceLabel = getSourceLabel(details.source || "tmdb");
    const previewHTML = `
            <div class="selected-preview">
                <h4>✅ Selected: ${details.title}</h4>
                <p>Source: ${sourceLabel} | Type: ${details.media_type.toUpperCase()} | Year: ${
      details.release_date
        ? new Date(details.release_date).getFullYear()
        : "Unknown"
    }</p>
                ${details.genre ? `<p>Genre: ${details.genre}</p>` : ""}
                <p><strong>Now fill in your rating and review below!</strong></p>
                <button type="button" class="btn btn-small" onclick="clearSelection()">Change Selection</button>
            </div>
        `;

    searchResults.innerHTML = previewHTML;
  }

  function getSourceLabel(source) {
    switch (source) {
      case "tmdb":
        return "TMDB";
      case "jikan":
        return "MyAnimeList";
      case "tvmaze":
        return "TVMaze";
      default:
        return "TMDB";
    }
  }

  function getSourceColor(source) {
    switch (source) {
      case "tmdb":
        return "#01d277";
      case "jikan":
        return "#2e51a2";
      case "tvmaze":
        return "#ff6600";
      default:
        return "#01d277";
    }
  }
});

// Global functions
window.clearSelection = function () {
  // clear all API data
  const fields = [
    "tmdb_id",
    "mal_id",
    "tvmaze_id",
    "poster_url",
    "backdrop_url",
    "release_date",
    "genre",
    "source",
  ];
  fields.forEach((field) => {
    const input = document.getElementById(field);
    if (input) input.value = "";
  });

  // clear search results
  const searchResults = document.getElementById("searchResults");
  if (searchResults) searchResults.innerHTML = "";

  // clear form
  const form = document.getElementById("reviewForm");
  if (form) {
    form.reset();
  }
};
