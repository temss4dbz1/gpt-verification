const dashboard = {
  search: '',
  suggestions: [],
  summary: '',
  loading: false,
  map: null,
  marker: null,

  async init() {
    this.initMap();
    this.getLocationByIP();
  },

  initMap() {
    this.map = L.map('map').setView([39.5, -98.35], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  },

  async getLocationByIP() {
    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      this.placeMarker([data.latitude, data.longitude]);
      this.fetchAISummary(data.city + ", " + data.region + ", " + data.country_name);
    } catch (e) {
      console.error("IP location failed", e);
    }
  },

  async autocompleteAddress() {
    if (!this.search || this.search.length < 3) return;
    const res = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${this.search}&apiKey=YOUR_AUTOCOMPLETE_API_KEY`);
    const data = await res.json();
    this.suggestions = data.features.map(f => ({ label: f.properties.formatted, coords: [f.properties.lat, f.properties.lon] }));
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
      const res = await fetch('https://YOUR_WORKER_SUBDOMAIN.workers.dev/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location })
      });
      const data = await res.json();
      this.summary = data.summary;
    } catch (e) {
      this.summary = "AI summary could not be fetched.";
    } finally {
      this.loading = false;
    }
  }
};

document.addEventListener("alpine:init", () => {
  Alpine.data("dashboard", () => dashboard);
});
