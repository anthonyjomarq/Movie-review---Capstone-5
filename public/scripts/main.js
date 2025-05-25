// basic js for the media tracker
document.addEventListener("DOMContentLoaded", function () {
  console.log("Media tracker loaded!");

  // simple hover effects for cards
  const cards = document.querySelectorAll(".stat-card, .feature-card");
  cards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-5px)";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)";
    });
  });
});

// will add more functionality later
