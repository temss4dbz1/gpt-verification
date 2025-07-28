const input = document.getElementById("addressInput");
const mapContainer = document.getElementById("map");
const resultDiv = document.getElementById("result");

// Init Leaflet map
const map = L.map("map").setView([39.5, -98.35], 4); // USA default
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

let marker = null;

input.addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    const query = input.value.trim();
    if (!query) return;

    const geoResponse = await fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
        query
      )}&format=json&apiKey=1f6f929d5bac4267bc787c1ac32ef9ee`
    );

    const geoData = await geoResponse.json();
    if (geoData.results && geoData.results.length > 0) {
      const location = geoData.results[0];
      const lat = location.lat;
      const lon = location.lon;
      const formatted = location.formatted;

      if (marker) map.removeLayer(marker);
      marker = L.marker([lat, lon]).addTo(map).bindPopup(formatted).openPopup();
      map.setView([lat, lon], 12);

      // Call Cloudflare Worker with address
      const summaryResponse = await fetch("https://aged-art-a5fd.temss4dbz1.workers.dev", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ location: formatted }),
      });

      const summaryData = await summaryResponse.json();
      resultDiv.innerText = summaryData.summary || "No summary returned.";
    } else {
      resultDiv.innerText = "Location not found.";
    }
  }
});
