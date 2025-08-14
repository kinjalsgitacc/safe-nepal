// Earthquake API Integration
const earthquakeAPI = {
    // USGS Earthquake API endpoint
    apiUrl: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson',
    
    // Fetch recent earthquakes
    async getRecentEarthquakes() {
        try {
            const response = await fetch(this.apiUrl);
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching earthquake data:', error);
            return null;
        }
    },
    
    // Filter earthquakes by proximity to Nepal
    filterByNepalProximity(earthquakeData, radiusKm = 500) {
        if (!earthquakeData || !earthquakeData.features) return [];
        
        // Nepal's approximate center coordinates
        const nepalLat = 28.3949;
        const nepalLng = 84.124;
        
        return earthquakeData.features.filter(quake => {
            const quakeLat = quake.geometry.coordinates[1];
            const quakeLng = quake.geometry.coordinates[0];
            
            // Calculate distance using Haversine formula
            const distance = this.calculateDistance(
                nepalLat, nepalLng,
                quakeLat, quakeLng
            );
            
            return distance <= radiusKm;
        });
    },
    
    // Calculate distance between two points using Haversine formula
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    },
    
    toRad(value) {
        return value * Math.PI / 180;
    },
    
    // Get severity class based on magnitude
    getSeverityClass(magnitude) {
        if (magnitude >= 6.0) return 'danger';
        if (magnitude >= 4.5) return 'warning';
        return 'info';
    },
    
    // Format earthquake data for display
    formatQuakeForDisplay(quake) {
        const mag = quake.properties.mag;
        const place = quake.properties.place;
        const time = new Date(quake.properties.time).toLocaleString();
        const depth = quake.geometry.coordinates[2];
        const severityClass = this.getSeverityClass(mag);
        
        return {
            magnitude: mag,
            location: place,
            time: time,
            depth: depth,
            severityClass: severityClass,
            url: quake.properties.url,
            coordinates: {
                lat: quake.geometry.coordinates[1],
                lng: quake.geometry.coordinates[0]
            }
        };
    }
};