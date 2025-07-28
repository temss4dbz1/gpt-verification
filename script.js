const dashboard = {
  search: '',
  suggestions: [],
  summary: '',
  loading: false,
  map: null,
  marker: null,

  async init() {
    this.initMap();
    await this.getLocationByIP();
  },

  initMap() {
    this.map = L.map('map').setView([39.5, -98.35], 4); // Center of US
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  },

  async getLocationByIP() {
    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      const location = `${data.city}, ${data.region}, ${data.country_name}`;
      this.placeMarker([data.latitude, data.longitude]);
      await this.fetchAISummary(location);
    } catch (e) {
      console.error("Could not detect location by IP", e);
    }
  },

  async autocompleteAddress() {
    if (this.search.length < 3) return;
    try {
      const apiKey = '1f6f929d5bac4267bc787c1ac32ef9ee'; // 🔐 Replace with your Geoapify API Key
      const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(this.search)}&limit=5&apiKey=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      this.suggestions = data.features.map(f => ({
        label: f.properties.formatted,
        coords: [f.properties.lat, f.properties.lon]
      }));
    } catch (e) {
      console.error("Autocomplete failed", e);
    }
  },

  async submitAddress() {
    if (!this.search || this.suggestions.length === 0) return;
    this.selectAddress(this.suggestions[0]);
  },

  selectAddress(suggestion) {
    this.search = suggestion.label;
    this.suggestions = [];
    this.placeMarker(suggestion.coords);
    this.fetchAISummary(suggestion.label);
  },

  placeMarker(coords) {
    if (this.marker) this.map.removeLayer(this.marker);
    this.marker = L.marker(coords).addTo(this.map);
    this.map.setView(coords, 13);
  },

  async fetchAISummary(location) {
    this.loading = true;
    this.summary = '';
    try {
      const res = await fetch('https://aged-art-a5fd.temss4dbz1.workers.dev/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location })
      });
      const data = await res.json();
      this.summary = data.summary || "No summary available.";
    } catch (e) {
      console.error("AI summary fetch failed", e);
      this.summary = "Could not fetch AI summary.";
    } finally {
      this.loading = false;
    }
  }
};

document.addEventListener("alpine:init", () => {
  Alpine.data("dashboard", () => dashboard);
});
