// Enhanced Maps Functionality for SafeNepal

const mapsManager = {
    // Map instance
    map: null,
    
    // Marker groups
    shelterMarkers: L.layerGroup(),
    hospitalMarkers: L.layerGroup(),
    policeMarkers: L.layerGroup(),
    disasterMarkers: L.layerGroup(),
    
    // User location
    userLocation: null,
    userMarker: null,
    
    // Initialize map
    init(mapElementId = 'map') {
        const mapElement = document.getElementById(mapElementId);
        if (!mapElement) return;
        
        // Create map centered on Nepal
        this.map = L.map(mapElementId).setView([28.3949, 84.124], 7);
        
        // Add tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(this.map);
        
        // Add layer control
        const baseMaps = {
            "Street": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19
            }),
            "Satellite": L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
                maxZoom: 20,
                subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
                attribution: '&copy; Google Maps'
            }),
            "Terrain": L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
                maxZoom: 17,
                attribution: '&copy; OpenTopoMap'
            })
        };
        
        const overlayMaps = {
            "Shelters": this.shelterMarkers,
            "Hospitals": this.hospitalMarkers,
            "Police Stations": this.policeMarkers,
            "Disaster Alerts": this.disasterMarkers
        };
        
        L.control.layers(baseMaps, overlayMaps).addTo(this.map);
        
        // Add scale control
        L.control.scale().addTo(this.map);
        
        // Add geolocation control
        this.addGeolocationControl();
        
        // Add search control
        this.addSearchControl();
        
        // Add disaster filter control
        this.addDisasterFilterControl();
        
        // Add markers to map
        this.shelterMarkers.addTo(this.map);
        this.disasterMarkers.addTo(this.map);
        
        // Load data
        this.loadShelters();
        this.loadHospitals();
        this.loadPoliceStations();
        this.loadDisasterData();
        
        // Setup event listeners
        this.setupEventListeners();
    },
    
    // Add geolocation control
    addGeolocationControl() {
        const locationControl = L.control({ position: 'topleft' });
        
        locationControl.onAdd = () => {
            const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
            div.innerHTML = `<a href="#" title="Show my location" role="button" aria-label="Show my location" class="location-button"><i class="fas fa-location-arrow"></i></a>`;
            
            div.onclick = (e) => {
                e.preventDefault();
                this.getUserLocation();
            };
            
            return div;
        };
        
        locationControl.addTo(this.map);
    },
    
    // Add search control
    addSearchControl() {
        const searchControl = L.control({ position: 'topright' });
        
        searchControl.onAdd = () => {
            const div = L.DomUtil.create('div', 'leaflet-control search-control');
            div.innerHTML = `
                <div class="input-group">
                    <input type="text" id="map-search" class="form-control form-control-sm" placeholder="Search location...">
                    <button class="btn btn-sm btn-primary" type="button" id="search-button">
                        <i class="fas fa-search"></i>
                    </button>
                </div>
            `;
            
            // Prevent map interactions when using the search box
            L.DomEvent.disableClickPropagation(div);
            
            return div;
        };
        
        searchControl.addTo(this.map);
        
        // Add event listener after the control is added to the map
        setTimeout(() => {
            const searchButton = document.getElementById('search-button');
            const searchInput = document.getElementById('map-search');
            
            if (searchButton && searchInput) {
                searchButton.addEventListener('click', () => {
                    this.searchLocation(searchInput.value);
                });
                
                searchInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.searchLocation(searchInput.value);
                    }
                });
            }
        }, 100);
    },
    
    // Add disaster filter control
    addDisasterFilterControl() {
        const filterControl = L.control({ position: 'bottomleft' });
        
        filterControl.onAdd = () => {
            const div = L.DomUtil.create('div', 'leaflet-control filter-control bg-white p-2 rounded shadow-sm');
            div.innerHTML = `
                <div class="mb-2"><strong>Filter Disasters</strong></div>
                <div class="form-check mb-1">
                    <input class="form-check-input" type="checkbox" value="earthquake" id="filter-earthquake" checked>
                    <label class="form-check-label" for="filter-earthquake">
                        Earthquakes
                    </label>
                </div>
                <div class="form-check mb-1">
                    <input class="form-check-input" type="checkbox" value="flood" id="filter-flood" checked>
                    <label class="form-check-label" for="filter-flood">
                        Floods
                    </label>
                </div>
                <div class="form-check mb-1">
                    <input class="form-check-input" type="checkbox" value="landslide" id="filter-landslide" checked>
                    <label class="form-check-label" for="filter-landslide">
                        Landslides
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="other" id="filter-other" checked>
                    <label class="form-check-label" for="filter-other">
                        Other
                    </label>
                </div>
            `;
            
            // Prevent map interactions when using the filter
            L.DomEvent.disableClickPropagation(div);
            
            return div;
        };
        
        filterControl.addTo(this.map);
        
        // Add event listeners after the control is added to the map
        setTimeout(() => {
            const filterCheckboxes = document.querySelectorAll('.filter-control input[type="checkbox"]');
            filterCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    this.filterDisasters();
                });
            });
        }, 100);
    },
    
    // Setup event listeners
    setupEventListeners() {
        // Disaster type filter
        const disasterTypeSelect = document.getElementById('disaster-type');
        if (disasterTypeSelect) {
            disasterTypeSelect.addEventListener('change', () => {
                this.filterDisasters();
            });
        }
        
        // Severity filter
        const severitySelect = document.getElementById('disaster-severity');
        if (severitySelect) {
            severitySelect.addEventListener('change', () => {
                this.filterDisasters();
            });
        }
        
        // Date range filter
        const dateFromInput = document.getElementById('date-from');
        const dateToInput = document.getElementById('date-to');
        if (dateFromInput && dateToInput) {
            dateFromInput.addEventListener('change', () => this.filterDisasters());
            dateToInput.addEventListener('change', () => this.filterDisasters());
        }
    },
    
    // Get user's current location
    getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    this.userLocation = [lat, lng];
                    
                    // Add or update user marker
                    if (this.userMarker) {
                        this.userMarker.setLatLng(this.userLocation);
                    } else {
                        const userIcon = L.divIcon({
                            html: '<i class="fas fa-user-circle fa-2x text-primary"></i>',
                            className: 'user-location-marker',
                            iconSize: [24, 24],
                            iconAnchor: [12, 12]
                        });
                        
                        this.userMarker = L.marker(this.userLocation, { icon: userIcon })
                            .addTo(this.map)
                            .bindPopup('Your Location');
                    }
                    
                    // Center map on user location
                    this.map.setView(this.userLocation, 13);
                    
                    // Find nearby shelters
                    this.findNearbyShelters();
                },
                (error) => {
                    console.error('Error getting location:', error);
                    this.showAlert('Unable to access your location. Please check your browser settings.', 'warning');
                }
            );
        } else {
            this.showAlert('Geolocation is not supported by your browser.', 'warning');
        }
    },
    
    // Search for a location
    searchLocation(query) {
        if (!query) return;
        
        // Use Nominatim for geocoding (OpenStreetMap's geocoding service)
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    const result = data[0];
                    const lat = parseFloat(result.lat);
                    const lon = parseFloat(result.lon);
                    
                    // Center map on result
                    this.map.setView([lat, lon], 13);
                    
                    // Add a temporary marker
                    const searchMarker = L.marker([lat, lon])
                        .addTo(this.map)
                        .bindPopup(result.display_name)
                        .openPopup();
                    
                    // Remove marker after 10 seconds
                    setTimeout(() => {
                        this.map.removeLayer(searchMarker);
                    }, 10000);
                } else {
                    this.showAlert('Location not found. Please try a different search.', 'warning');
                }
            })
            .catch(error => {
                console.error('Search error:', error);
                this.showAlert('Error searching for location. Please try again.', 'danger');
            });
    },
    
    // Load shelter data
    // tries multiple Overpass endpoints, increases radius, and gives better user feedback
async function loadShelters() {
    if (!userLocation) {
        showLoadingState(false, 'Enable location to find nearby shelters', true);
        return;
    }

    // List of Overpass endpoints (will try them in order)
    const OVERPASS_ENDPOINTS = [
        'https://overpass-api.de/api/interpreter',
        'https://lz4.overpass-api.de/api/interpreter',
        'https://overpass.kumi.systems/api/interpreter'
    ];
    let triedEndpoints = 0;
    let radius = CONFIG.SHELTER_RADIUS;   // Start with your configured radius
    let maxRadius = 50000;                // 50km max
    let maxAttempts = OVERPASS_ENDPOINTS.length;

    async function tryFetch(endpoint) {
        try {
            showLoadingState(true, `Finding nearby shelters... (radius: ${radius / 1000} km)`);
            const [lat, lon] = userLocation;
            const query = `
                [out:json][timeout:25];
                (
                  node["amenity"="shelter"](around:${radius},${lat},${lon});
                  node["emergency"="shelter"](around:${radius},${lat},${lon});
                  way["amenity"="shelter"](around:${radius},${lat},${lon});
                  way["emergency"="shelter"](around:${radius},${lat},${lon});
                );
                out center;
            `;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `data=${encodeURIComponent(query)}`
            });

            if (!response.ok) throw new Error(`Overpass API error: ${response.status}`);
            const data = await response.json();
            shelters = [];

            if (data.elements && data.elements.length > 0) {
                // Process shelter data
                data.elements.forEach(element => {
                    let shelter = {
                        id: element.id,
                        type: element.type,
                        name: (element.tags && element.tags.name) || 'Unnamed Shelter',
                        lat: element.type === 'node' ? element.lat : (element.center ? element.center.lat : undefined),
                        lon: element.type === 'node' ? element.lon : (element.center ? element.center.lon : undefined),
                        tags: element.tags || {}
                    };
                    if (shelter.lat && shelter.lon) {
                        shelter.distance = calculateDistance(
                            userLocation[0], userLocation[1],
                            shelter.lat, shelter.lon
                        );
                        shelters.push(shelter);
                    }
                });

                // Sort by distance
                shelters.sort((a, b) => a.distance - b.distance);

                // Render shelters
                renderShelters();
                showLoadingState(false);
                return true;
            } else {
                // No shelters found, try increasing radius if possible
                if (radius < maxRadius) {
                    radius = Math.min(radius * 2, maxRadius);
                    return false; // Will try again with larger radius
                } else {
                    showLoadingState(false, 'No shelters found within 50km. Try checking official sources.', false);
                    return true; // Stop trying
                }
            }
        } catch (error) {
            console.error('Error loading shelters:', error);
            return false; // Will try next endpoint
        }
    }

    // Try each endpoint up to maxAttempts
    for (let i = 0; i < OVERPASS_ENDPOINTS.length && triedEndpoints < maxAttempts; i++) {
        let success = await tryFetch(OVERPASS_ENDPOINTS[i]);
        if (success) return;
        triedEndpoints++;
    }

    // If all endpoints failed
    showLoadingState(false, 'Failed to load shelters. Overpass API may be down or your network is offline. Please try again.', true);
}

/* 
Helper: calculates distance between two lat/lon (Haversine formula)
If your file already has this, you don't need to duplicate!
*/
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
    
    // Load hospital data
    loadHospitals() {
        // Sample hospital data
        const hospitals = [
            { name: 'Tribhuvan University Teaching Hospital', lat: 27.7361, lng: 85.3305 },
            { name: 'Bir Hospital', lat: 27.7041, lng: 85.3131 },
            { name: 'Patan Hospital', lat: 27.6688, lng: 85.3182 },
            { name: 'Manipal Teaching Hospital', lat: 28.2021, lng: 83.9861 },
            { name: 'B&B Hospital', lat: 27.6739, lng: 85.3371 }
        ];
        
        hospitals.forEach(hospital => {
            this.addHospitalMarker(hospital);
        });
    },
    
    // Load police station data
    loadPoliceStations() {
        // Sample police station data
        const policeStations = [
            { name: 'Kathmandu Metropolitan Police', lat: 27.7041, lng: 85.3145 },
            { name: 'Lalitpur Metropolitan Police', lat: 27.6681, lng: 85.3185 },
            { name: 'Bhaktapur Police Station', lat: 27.6716, lng: 85.4288 },
            { name: 'Pokhara Police Station', lat: 28.2100, lng: 83.9870 },
            { name: 'Chitwan District Police Office', lat: 27.5285, lng: 84.3550 }
        ];
        
        policeStations.forEach(station => {
            this.addPoliceMarker(station);
        });
    },
    
    // Load disaster data
    loadDisasterData() {
        // In a real application, this would fetch data from APIs like USGS for earthquakes
        // For this example, we'll use sample data
        
        // Sample earthquake data
        const earthquakes = [
            { type: 'earthquake', title: 'M 4.5 Earthquake', lat: 27.8, lng: 85.5, severity: 'moderate', date: new Date(2023, 5, 15) },
            { type: 'earthquake', title: 'M 3.8 Earthquake', lat: 28.1, lng: 84.2, severity: 'minor', date: new Date(2023, 6, 2) },
            { type: 'earthquake', title: 'M 5.2 Earthquake', lat: 27.5, lng: 86.1, severity: 'major', date: new Date(2023, 4, 28) }
        ];
        
        // Sample flood data
        const floods = [
            { type: 'flood', title: 'Koshi River Flooding', lat: 26.8, lng: 87.2, severity: 'major', date: new Date(2023, 7, 10) },
            { type: 'flood', title: 'Narayani River Overflow', lat: 27.4, lng: 84.4, severity: 'moderate', date: new Date(2023, 7, 5) }
        ];
        
        // Sample landslide data
        const landslides = [
            { type: 'landslide', title: 'Sindhupalchok Landslide', lat: 27.9, lng: 85.9, severity: 'major', date: new Date(2023, 6, 20) },
            { type: 'landslide', title: 'Myagdi Landslide', lat: 28.4, lng: 83.5, severity: 'moderate', date: new Date(2023, 6, 25) }
        ];
        
        // Add all disaster markers
        [...earthquakes, ...floods, ...landslides].forEach(disaster => {
            this.addDisasterMarker(disaster);
        });
    },
    
    // Add shelter marker to map
    addShelterMarker(shelter) {
        const shelterIcon = L.divIcon({
            html: '<i class="fas fa-house-damage fa-2x text-success"></i>',
            className: 'shelter-marker',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });
        
        const marker = L.marker([shelter.lat, shelter.lng], { icon: shelterIcon })
            .bindPopup(`
                <div class="popup-content">
                    <h5>${shelter.name}</h5>
                    <p><strong>Type:</strong> ${shelter.type}</p>
                    <p><strong>Capacity:</strong> ${shelter.capacity} people</p>
                    <button class="btn btn-sm btn-primary get-directions" data-lat="${shelter.lat}" data-lng="${shelter.lng}">Get Directions</button>
                </div>
            `);
        
        marker.on('popupopen', () => {
            const directionBtn = document.querySelector('.get-directions');
            if (directionBtn) {
                directionBtn.addEventListener('click', (e) => {
                    const targetLat = e.target.getAttribute('data-lat');
                    const targetLng = e.target.getAttribute('data-lng');
                    this.getDirections(targetLat, targetLng);
                });
            }
        });
        
        this.shelterMarkers.addLayer(marker);
    },
    
    // Add hospital marker to map
    addHospitalMarker(hospital) {
        const hospitalIcon = L.divIcon({
            html: '<i class="fas fa-hospital fa-2x text-danger"></i>',
            className: 'hospital-marker',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });
        
        const marker = L.marker([hospital.lat, hospital.lng], { icon: hospitalIcon })
            .bindPopup(`
                <div class="popup-content">
                    <h5>${hospital.name}</h5>
                    <button class="btn btn-sm btn-primary get-directions" data-lat="${hospital.lat}" data-lng="${hospital.lng}">Get Directions</button>
                </div>
            `);
        
        marker.on('popupopen', () => {
            const directionBtn = document.querySelector('.get-directions');
            if (directionBtn) {
                directionBtn.addEventListener('click', (e) => {
                    const targetLat = e.target.getAttribute('data-lat');
                    const targetLng = e.target.getAttribute('data-lng');
                    this.getDirections(targetLat, targetLng);
                });
            }
        });
        
        this.hospitalMarkers.addLayer(marker);
    },
    
    // Add police station marker to map
    addPoliceMarker(station) {
        const policeIcon = L.divIcon({
            html: '<i class="fas fa-shield-alt fa-2x text-primary"></i>',
            className: 'police-marker',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });
        
        const marker = L.marker([station.lat, station.lng], { icon: policeIcon })
            .bindPopup(`
                <div class="popup-content">
                    <h5>${station.name}</h5>
                    <button class="btn btn-sm btn-primary get-directions" data-lat="${station.lat}" data-lng="${station.lng}">Get Directions</button>
                </div>
            `);
        
        marker.on('popupopen', () => {
            const directionBtn = document.querySelector('.get-directions');
            if (directionBtn) {
                directionBtn.addEventListener('click', (e) => {
                    const targetLat = e.target.getAttribute('data-lat');
                    const targetLng = e.target.getAttribute('data-lng');
                    this.getDirections(targetLat, targetLng);
                });
            }
        });
        
        this.policeMarkers.addLayer(marker);
    },
    
    // Add disaster marker to map
    addDisasterMarker(disaster) {
        let iconClass, colorClass;
        
        switch (disaster.type) {
            case 'earthquake':
                iconClass = 'fa-wave-square';
                colorClass = 'text-danger';
                break;
            case 'flood':
                iconClass = 'fa-water';
                colorClass = 'text-primary';
                break;
            case 'landslide':
                iconClass = 'fa-mountain';
                colorClass = 'text-warning';
                break;
            default:
                iconClass = 'fa-exclamation-triangle';
                colorClass = 'text-secondary';
        }
        
        // Adjust size based on severity
        let iconSize = 24;
        if (disaster.severity === 'major') iconSize = 32;
        if (disaster.severity === 'minor') iconSize = 20;
        
        const disasterIcon = L.divIcon({
            html: `<i class="fas ${iconClass} fa-2x ${colorClass}"></i>`,
            className: `disaster-marker ${disaster.type}-marker ${disaster.severity}-marker`,
            iconSize: [iconSize, iconSize],
            iconAnchor: [iconSize/2, iconSize/2]
        });
        
        const marker = L.marker([disaster.lat, disaster.lng], { icon: disasterIcon })
            .bindPopup(`
                <div class="popup-content">
                    <h5>${disaster.title}</h5>
                    <p><strong>Type:</strong> ${disaster.type.charAt(0).toUpperCase() + disaster.type.slice(1)}</p>
                    <p><strong>Severity:</strong> ${disaster.severity.charAt(0).toUpperCase() + disaster.severity.slice(1)}</p>
                    <p><strong>Date:</strong> ${disaster.date.toLocaleDateString()}</p>
                </div>
            `);
        
        this.disasterMarkers.addLayer(marker);
    },
    
    // Filter disasters based on selected criteria
    filterDisasters() {
        // Get filter values
        const typeFilters = {
            earthquake: document.getElementById('filter-earthquake')?.checked ?? true,
            flood: document.getElementById('filter-flood')?.checked ?? true,
            landslide: document.getElementById('filter-landslide')?.checked ?? true,
            other: document.getElementById('filter-other')?.checked ?? true
        };
        
        const severityFilter = document.getElementById('disaster-severity')?.value || 'all';
        
        // Get date range if available
        let dateFrom = null;
        let dateTo = null;
        
        const dateFromInput = document.getElementById('date-from');
        const dateToInput = document.getElementById('date-to');
        
        if (dateFromInput && dateFromInput.value) {
            dateFrom = new Date(dateFromInput.value);
        }
        
        if (dateToInput && dateToInput.value) {
            dateTo = new Date(dateToInput.value);
            // Set to end of day
            dateTo.setHours(23, 59, 59, 999);
        }
        
        // Clear existing markers
        this.disasterMarkers.clearLayers();
        
        // Reload disaster data with filters
        // In a real application, you would filter the API request
        // For this example, we'll reload the sample data and filter it
        this.loadDisasterData();
        
        // Apply filters to the markers
        this.disasterMarkers.eachLayer(marker => {
            const disaster = marker.getPopup().getContent();
            let show = true;
            
            // Extract type from popup content
            const typeMatch = disaster.match(/<strong>Type:<\/strong> (.+?)<\/p>/);
            if (typeMatch) {
                const type = typeMatch[1].toLowerCase();
                if (!typeFilters[type]) show = false;
            }
            
            // Extract severity from popup content
            if (severityFilter !== 'all' && show) {
                const severityMatch = disaster.match(/<strong>Severity:<\/strong> (.+?)<\/p>/);
                if (severityMatch) {
                    const severity = severityMatch[1].toLowerCase();
                    if (severity !== severityFilter) show = false;
                }
            }
            
            // Extract date from popup content
            if ((dateFrom || dateTo) && show) {
                const dateMatch = disaster.match(/<strong>Date:<\/strong> (.+?)<\/p>/);
                if (dateMatch) {
                    const disasterDate = new Date(dateMatch[1]);
                    if (dateFrom && disasterDate < dateFrom) show = false;
                    if (dateTo && disasterDate > dateTo) show = false;
                }
            }
            
            // Show or hide marker based on filters
            if (!show) {
                this.disasterMarkers.removeLayer(marker);
            }
        });
    },
    
    // Find shelters near user's location
    findNearbyShelters() {
        if (!this.userLocation) return;
        
        const [userLat, userLng] = this.userLocation;
        let nearestShelter = null;
        let shortestDistance = Infinity;
        
        // Find the nearest shelter
        this.shelterMarkers.eachLayer(marker => {
            const shelterLatLng = marker.getLatLng();
            const distance = this.map.distance([userLat, userLng], [shelterLatLng.lat, shelterLatLng.lng]);
            
            if (distance < shortestDistance) {
                shortestDistance = distance;
                nearestShelter = marker;
            }
        });
        
        if (nearestShelter) {
            // Highlight the nearest shelter
            nearestShelter.openPopup();
            
            // Draw a line to the nearest shelter
            const routeLine = L.polyline([
                [userLat, userLng],
                [nearestShelter.getLatLng().lat, nearestShelter.getLatLng().lng]
            ], {
                color: '#2563eb',
                weight: 4,
                opacity: 0.7,
                dashArray: '10, 10'
            }).addTo(this.map);
            
            // Remove the line after 10 seconds
            setTimeout(() => {
                this.map.removeLayer(routeLine);
            }, 10000);
            
            // Show distance information
            const distanceKm = (shortestDistance / 1000).toFixed(2);
            this.showAlert(`Nearest shelter is ${distanceKm} km away.`, 'info');
        }
    },
    
    // Get directions to a location
    getDirections(targetLat, targetLng) {
        if (!this.userLocation) {
            this.showAlert('Please share your location first to get directions.', 'warning');
            return;
        }
        
        const [userLat, userLng] = this.userLocation;
        
        // Open directions in Google Maps
        window.open(`https://www.google.com/maps/dir/${userLat},${userLng}/${targetLat},${targetLng}`, '_blank');
    },
    
    // Show alert message
    showAlert(message, type) {
        const alertContainer = document.getElementById('map-alerts');
        if (!alertContainer) return;
        
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        alertContainer.appendChild(alertDiv);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                const bsAlert = new bootstrap.Alert(alertDiv);
                bsAlert.close();
            }
        }, 5000);
    }
};

// Initialize maps when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    mapsManager.init();
});
