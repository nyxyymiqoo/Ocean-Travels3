const searchButton = document.getElementById("searchbtn");
const clearButton = document.getElementById("clearbtn");
const results = document.getElementById("resultContainer");
const dropdown = document.getElementById("dropdown");
const closeButton = document.getElementById("close-btn");
const queryInput = document.getElementById("searchinput");

if (searchButton && clearButton && results && dropdown && closeButton && queryInput) {
  const showMessage = (message) => {
    results.replaceChildren();
    const messageElement = document.createElement("p");
    messageElement.className = "notfound";
    messageElement.textContent = message;
    results.append(messageElement);
    dropdown.hidden = false;
  };

  const renderResults = (items) => {
    results.replaceChildren();

    items.forEach((item) => {
      const card = document.createElement("article");
      card.className = "result-card";

      const title = document.createElement("h2");
      title.className = "title";
      title.textContent = item.name;

      const image = document.createElement("img");
      image.className = "search-img";
      image.src = item.imageUrl;
      image.alt = item.name;
      image.loading = "lazy";

      const description = document.createElement("p");
      description.className = "description";
      description.textContent = item.description;

      card.append(title, image, description);
      results.append(card);
    });

    dropdown.hidden = false;
  };

  const normalize = (value) => value.trim().toLowerCase();

  const search = async () => {
    const searchQuery = normalize(queryInput.value);
    if (!searchQuery) {
      showMessage("Enter a destination to search.");
      queryInput.focus();
      return;
    }

    try {
      const response = await fetch("travel_recommendation_api.json");
      if (!response.ok) {
        throw new Error(`Search data request failed (${response.status}).`);
      }
      const data = await response.json();
      const categoryQuery = {
        countries: "country",
        temples: "temple",
        beaches: "beach",
      }[searchQuery] || searchQuery;

      const matches = [];
      data.countries.forEach((country) => {
        const countryMatches =
          categoryQuery === "country" ||
          normalize(country.name).includes(searchQuery);
        country.cities.forEach((city) => {
          if (countryMatches || normalize(city.name).includes(searchQuery)) {
            matches.push(city);
          }
        });
      });

      [
        ...data.temples.map((item) => ({ ...item, category: "temple" })),
        ...data.beaches.map((item) => ({ ...item, category: "beach" })),
      ].forEach((item) => {
        if (
          normalize(item.name).includes(searchQuery) ||
          item.category === categoryQuery
        ) {
          matches.push(item);
        }
      });

      if (matches.length) {
        renderResults(matches);
      } else {
        showMessage("Sorry, we couldn't find that destination. Try a country or place name.");
      }
    } catch (error) {
      console.error("Unable to load travel recommendations.", error);
      showMessage("Recommendations couldn't be loaded. Please try again.");
    }
  };

  const clearSearch = () => {
    queryInput.value = "";
    dropdown.hidden = true;
    results.replaceChildren();
  };

  searchButton.addEventListener("click", search);
  queryInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      search();
    }
  });
  clearButton.addEventListener("click", clearSearch);
  closeButton.addEventListener("click", clearSearch);
}
