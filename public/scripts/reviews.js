// Reviews page sorting and filtering functionality
document.addEventListener("DOMContentLoaded", function () {
  const sortSelect = document.getElementById("sortSelect");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const reviewsGrid = document.getElementById("reviewsGrid");
  const reviewCards = document.querySelectorAll(".review-card");

  let currentFilter = "all";
  let currentSort = "review-date-desc";

  // Initialize
  if (sortSelect) {
    sortSelect.addEventListener("change", handleSort);
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", handleFilter);
  });

  // Handle sorting
  function handleSort() {
    currentSort = sortSelect.value;
    console.log("Sorting by:", currentSort);

    // Add loading effect
    reviewsGrid.classList.add("loading");

    setTimeout(() => {
      sortReviews(currentSort);
      reviewsGrid.classList.remove("loading");
    }, 150);
  }

  // Handle filtering
  function handleFilter(e) {
    const filterType = e.target.dataset.filter;

    // Update active state
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    e.target.classList.add("active");

    currentFilter = filterType;
    console.log("Filtering by:", filterType);

    // Add loading effect
    reviewsGrid.classList.add("loading");

    setTimeout(() => {
      filterReviews(filterType);
      reviewsGrid.classList.remove("loading");
    }, 150);
  }

  // Sort reviews function
  function sortReviews(sortType) {
    const cardsArray = Array.from(reviewCards);

    cardsArray.sort((a, b) => {
      switch (sortType) {
        case "rating-desc":
          return parseInt(b.dataset.rating) - parseInt(a.dataset.rating);
        case "rating-asc":
          return parseInt(a.dataset.rating) - parseInt(b.dataset.rating);
        case "title-asc":
          return a.dataset.title.localeCompare(b.dataset.title);
        case "title-desc":
          return b.dataset.title.localeCompare(a.dataset.title);
        case "review-date-asc":
          return (
            parseInt(a.dataset.reviewDate) - parseInt(b.dataset.reviewDate)
          );
        case "review-date-desc":
          return (
            parseInt(b.dataset.reviewDate) - parseInt(a.dataset.reviewDate)
          );
        case "release-date-asc":
          // Handle cases where release date might be missing (0)
          const aRelease = parseInt(a.dataset.releaseDate);
          const bRelease = parseInt(b.dataset.releaseDate);
          if (aRelease === 0 && bRelease === 0) return 0;
          if (aRelease === 0) return 1; // Put items without release date at the end
          if (bRelease === 0) return -1;
          return aRelease - bRelease;
        case "release-date-desc":
          const aReleaseDesc = parseInt(a.dataset.releaseDate);
          const bReleaseDesc = parseInt(b.dataset.releaseDate);
          if (aReleaseDesc === 0 && bReleaseDesc === 0) return 0;
          if (aReleaseDesc === 0) return 1;
          if (bReleaseDesc === 0) return -1;
          return bReleaseDesc - aReleaseDesc;
        default:
          return (
            parseInt(b.dataset.reviewDate) - parseInt(a.dataset.reviewDate)
          );
      }
    });

    // Re-append in new order
    cardsArray.forEach((card) => {
      reviewsGrid.appendChild(card);
    });

    // Re-apply current filter after sorting
    if (currentFilter !== "all") {
      filterReviews(currentFilter);
    }
  }

  // Filter reviews function
  function filterReviews(filterType) {
    reviewCards.forEach((card) => {
      const cardType = card.dataset.type;

      if (filterType === "all" || cardType === filterType) {
        card.classList.remove("hidden");
        card.style.display = "flex";
      } else {
        card.classList.add("hidden");
        card.style.display = "none";
      }
    });

    // Update empty state if needed
    updateEmptyState();
  }

  // Update empty state based on visible cards
  function updateEmptyState() {
    const visibleCards = document.querySelectorAll(".review-card:not(.hidden)");
    const existingEmptyState = document.querySelector(".filter-empty-state");

    if (visibleCards.length === 0 && currentFilter !== "all") {
      if (!existingEmptyState) {
        const emptyState = document.createElement("div");
        emptyState.className = "filter-empty-state";
        emptyState.innerHTML = `
                      <div class="empty-state">
                          <h3>No ${getFilterDisplayName(
                            currentFilter
                          )} reviews found</h3>
                          <p>Try a different filter or add some ${currentFilter} reviews!</p>
                          <a href="/add" class="btn btn-primary">Add Review</a>
                      </div>
                  `;
        reviewsGrid.appendChild(emptyState);
      }
    } else if (existingEmptyState) {
      existingEmptyState.remove();
    }
  }

  // Get display name for filter
  function getFilterDisplayName(filter) {
    switch (filter) {
      case "movie":
        return "movie";
      case "tv":
        return "TV show";
      case "anime":
        return "anime";
      default:
        return "";
    }
  }

  // Add smooth hover effects
  reviewCards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-4px)";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)";
    });
  });

  // Add keyboard shortcuts
  document.addEventListener("keydown", function (e) {
    // Only if not typing in an input
    if (e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
      switch (e.key) {
        case "1":
          document.querySelector('[data-filter="all"]').click();
          break;
        case "2":
          document.querySelector('[data-filter="movie"]').click();
          break;
        case "3":
          document.querySelector('[data-filter="tv"]').click();
          break;
        case "4":
          document.querySelector('[data-filter="anime"]').click();
          break;
      }
    }
  });

  console.log("Reviews page initialized with sorting and filtering!");
});
