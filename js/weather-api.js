// Weather API Integration
const weatherAPI = {
    // OpenWeatherMap API endpoint and key
    apiKey: '', // You'll need to get an API key from OpenWeatherMap
    apiUrl: 'https://api.openweathermap.org/data/2.5/weather',
    forecastUrl: 'https://api.openweathermap.org/data/2.5/forecast',
    
    // Get current weather for a location
    async getCurrentWeather(lat, lon) {
        try {
            if (!this.apiKey) {
                throw new Error('API key not configured. Please set your OpenWeatherMap API key.');
            }
            
            const url = `${this.apiUrl}?lat=${lat}&lon=${lon}&units=metric&appid=${this.apiKey}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Weather API error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching weather data:', error);
            return null;
        }
    },
    
    // Get 5-day forecast for a location
    async getForecast(lat, lon) {
        try {
            if (!this.apiKey) {
                throw new Error('API key not configured. Please set your OpenWeatherMap API key.');
            }
            
            const url = `${this.forecastUrl}?lat=${lat}&lon=${lon}&units=metric&appid=${this.apiKey}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Forecast API error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching forecast data:', error);
            return null;
        }
    },
    
    // Check for severe weather conditions
    checkForSevereWeather(weatherData) {
        if (!weatherData) return null;
        
        const conditions = weatherData.weather[0];
        const wind = weatherData.wind;
        const rain = weatherData.rain ? weatherData.rain['1h'] || 0 : 0;
        
        // Weather condition IDs: https://openweathermap.org/weather-conditions
        const severeConditionIds = [
            // Thunderstorms
            200, 201, 202, 210, 211, 212, 221, 230, 231, 232,
            // Heavy rain
            502, 503, 504, 522, 531,
            // Heavy snow
            602, 622,
            // Atmosphere (fog, dust, etc)
            731, 751, 761, 762, 771, 781
        ];
        
        const isSevereCondition = severeConditionIds.includes(conditions.id);
        const isHighWind = wind.speed >= 10.8; // Strong breeze or higher
        const isHeavyRain = rain >= 7.6; // Heavy rain threshold
        
        if (isSevereCondition || isHighWind || isHeavyRain) {
            return {
                isSevere: true,
                condition: conditions.main,
                description: conditions.description,
                windSpeed: wind.speed,
                rainfall: rain
            };
        }
        
        return {
            isSevere: false,
            condition: conditions.main,
            description: conditions.description
        };
    },
    
    // Get weather alert level
    getAlertLevel(weatherData) {
        if (!weatherData) return 'info';
        
        const severeCheck = this.checkForSevereWeather(weatherData);
        
        if (severeCheck.isSevere) {
            // Determine severity based on condition
            const condition = weatherData.weather[0].id;
            
            // Tornado, hurricane, etc
            if ([781, 762].includes(condition)) return 'danger';
            
            // Severe thunderstorms, heavy rain
            if ([202, 212, 221, 504, 531].includes(condition)) return 'warning';
            
            // Other severe conditions
            return 'warning';
        }
        
        return 'info';
    },
    
    // Format weather data for display
    formatWeatherForDisplay(weatherData) {
        if (!weatherData) return null;
        
        const main = weatherData.main;
        const weather = weatherData.weather[0];
        const wind = weatherData.wind;
        const alertLevel = this.getAlertLevel(weatherData);
        
        return {
            temperature: Math.round(main.temp),
            feelsLike: Math.round(main.feels_like),
            humidity: main.humidity,
            condition: weather.main,
            description: weather.description,
            icon: `https://openweathermap.org/img/wn/${weather.icon}@2x.png`,
            windSpeed: wind.speed,
            windDirection: this.getWindDirection(wind.deg),
            alertLevel: alertLevel
        };
    },
    
    // Convert wind direction degrees to cardinal direction
    getWindDirection(degrees) {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const index = Math.round(degrees / 45) % 8;
        return directions[index];
    }
};