// ✅ Paste your actual key and URL here
const apiKey = "1f6f929d5bac4267bc787c1ac32ef9ee";
const workerUrl = "https://aged-art-a5fd.temss4dbz1.workers.dev/";

document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("alpine:init", () => {
    Alpine.data("dashboard", () => ({
      search: "",
      suggestions: [],
      summary: "",
      loading: false,
      map: null,
      marker: null,

      init() {
        this.map = L.map("map").setView([39.5, -98.35], 4); // US center

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        }).addTo(this.map);

        this.marker = L.marker([0, 0]).addTo(this.map);
      },

      async autocompleteAddress() {
        if (this.search.length < 3) return;

        const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(this.search)}&apiKey=${apiKey}`;
        const res = await fetch(url);
        const data = await res.json();
        this.suggestions = data.features.map(f => ({
          label: f.properties.formatted,
          lat: f.geometry.coordinates[1],
          lon: f.geometry.coordinates[0]
        }));
      },

      selectAddress(address) {
        this.search = address.label;
        this.suggestions = [];
        this.showLocation(address.lat, address.lon);
        this.fetchSummary(address.label);
      },

      async submitAddress() {
        if (!this.search) return;
        this.suggestions = [];

        const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(this.search)}&apiKey=${apiKey}`;
        const res = await fetch(url);
        const data = await res.json();
        const feature = data.features?.[0];
        if (feature) {
          const lat = feature.geometry.coordinates[1];
          const lon = feature.geometry.coordinates[0];
          this.showLocation(lat, lon);
          this.fetchSummary(this.search);
        }
      },

      showLocation(lat, lon) {
        this.map.setView([lat, lon], 12);
        this.marker.setLatLng([lat, lon]);
      },

      async fetchSummary(location) {
        this.loading = true;
        try {
          const res = await fetch(workerUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ location })
          });
          const data = await res.json();
          this.summary = data.summary || "No summary available.";
        } catch (e) {
          this.summary = "Error fetching summary.";
        }
        this.loading = false;
      }
    }));
  });
});
