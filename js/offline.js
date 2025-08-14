// Offline Functionality Manager for SafeNepal

const offlineManager = {
    // Check if the app is online
    isOnline: navigator.onLine,
    
    // Initialize offline functionality
    init() {
        // Register service worker
        this.registerServiceWorker();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Check initial online status
        this.updateOnlineStatus();
        
        // Initialize offline data storage
        this.initOfflineStorage();
        
        // Create offline UI elements
        this.createOfflineUI();
        
        console.log('Offline Manager initialized');
    },
    
    // Create offline UI elements
    createOfflineUI() {
        // Create offline indicator if it doesn't exist
        if (!document.getElementById('offline-indicator')) {
            const indicator = document.createElement('div');
            indicator.id = 'offline-indicator';
            indicator.className = 'position-fixed bottom-0 end-0 m-3 p-2 bg-white rounded shadow-sm d-none';
            indicator.innerHTML = '<i class="fas fa-wifi-slash text-danger me-2"></i><span>Offline Mode</span>';
            document.body.appendChild(indicator);
        }
    },
    
    // Register service worker
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js')
                    .then(registration => {
                        console.log('ServiceWorker registration successful with scope:', registration.scope);
                    })
                    .catch(error => {
                        console.error('ServiceWorker registration failed:', error);
                    });
            });
        }
    },
    
    // Set up event listeners for online/offline events
    setupEventListeners() {
        // Online event
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.updateOnlineStatus();
            this.syncOfflineData();
        });
        
        // Offline event
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.updateOnlineStatus();
        });
        
        // Visibility change event (for when the user returns to the app)
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.updateOnlineStatus();
                if (this.isOnline) {
                    this.syncOfflineData();
                }
            }
        });
        
        // Before unload event (for saving data before the user leaves)
        window.addEventListener('beforeunload', () => {
            this.saveOfflineData();
        });
    },
    
    // Update UI based on online status
    updateOnlineStatus() {
        const statusIndicator = document.getElementById('online-status');
        const offlineIndicator = document.getElementById('offline-indicator');
        
        if (this.isOnline) {
            // Update status indicator if it exists
            if (statusIndicator) {
                statusIndicator.innerHTML = '<i class="fas fa-wifi text-success"></i> Online';
                statusIndicator.classList.remove('text-danger');
                statusIndicator.classList.add('text-success');
            }
            
            // Hide offline indicator
            if (offlineIndicator) {
                offlineIndicator.classList.add('d-none');
            }
            
            // Hide offline banner if it exists
            const offlineBanner = document.getElementById('offline-banner');
            if (offlineBanner) {
                offlineBanner.classList.add('d-none');
            }
            
            // Show online toast notification
            if (typeof showToast === 'function' && this.wasOffline) {
                showToast('Connection', 'You are back online', 'success');
                this.wasOffline = false;
            }
        } else {
            // Update status indicator if it exists
            if (statusIndicator) {
                statusIndicator.innerHTML = '<i class="fas fa-wifi-slash text-danger"></i> Offline';
                statusIndicator.classList.remove('text-success');
                statusIndicator.classList.add('text-danger');
            }
            
            // Show offline indicator
            if (offlineIndicator) {
                offlineIndicator.classList.remove('d-none');
            }
            
            // Show offline banner
            this.showOfflineBanner();
            
            // Set offline flag for later
            this.wasOffline = true;
            
            // Show offline toast notification
            if (typeof showToast === 'function') {
                showToast('Connection', 'You are offline. Some features may be limited.', 'warning');
            }
        }
    },
    
    // Show offline banner
    showOfflineBanner() {
        // Check if banner already exists
        let offlineBanner = document.getElementById('offline-banner');
        
        if (!offlineBanner) {
            // Create offline banner
            offlineBanner = document.createElement('div');
            offlineBanner.id = 'offline-banner';
            offlineBanner.className = 'alert alert-warning alert-dismissible fade show m-0';
            offlineBanner.innerHTML = `
                <div class="container d-flex justify-content-between align-items-center">
                    <div>
                        <i class="fas fa-wifi-slash me-2"></i>
                        <strong>You're offline.</strong> Some features may be limited.
                    </div>
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            `;
            
            // Add to the top of the body
            document.body.prepend(offlineBanner);
        } else {
            // Show existing banner
            offlineBanner.classList.remove('d-none');
        }
    },
    
    // Initialize offline data storage
    initOfflineStorage() {
        // Create IndexedDB database for offline data
        if (!window.indexedDB) {
            console.error('Your browser doesn\'t support IndexedDB. Offline functionality will be limited.');
            return;
        }
        
        const request = indexedDB.open('SafeNepalOfflineDB', 1);
        
        request.onerror = (event) => {
            console.error('IndexedDB error:', event.target.error);
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Create object stores for different types of data
            if (!db.objectStoreNames.contains('emergencyContacts')) {
                db.createObjectStore('emergencyContacts', { keyPath: 'id', autoIncrement: true });
            }
            
            if (!db.objectStoreNames.contains('safetyGuides')) {
                db.createObjectStore('safetyGuides', { keyPath: 'id' });
            }
            
            if (!db.objectStoreNames.contains('shelters')) {
                db.createObjectStore('shelters', { keyPath: 'id', autoIncrement: true });
            }
            
            if (!db.objectStoreNames.contains('offlineActions')) {
                db.createObjectStore('offlineActions', { keyPath: 'id', autoIncrement: true });
            }
        };
        
        request.onsuccess = (event) => {
            this.db = event.target.result;
            console.log('IndexedDB initialized successfully');
            
            // Load initial data into IndexedDB
            this.loadInitialData();
        };
    },
    
    // Load initial data into IndexedDB
    loadInitialData() {
        // Load safety guides
        this.loadSafetyGuides();
        
        // Load shelter data
        this.loadShelterData();
    },
    
    // Load safety guides into IndexedDB
    loadSafetyGuides() {
        // Sample safety guides data
        const safetyGuides = [
            {
                id: 'earthquake',
                title: 'Earthquake Safety',
                content: 'Detailed earthquake safety information that would be available offline.'
            },
            {
                id: 'flood',
                title: 'Flood Safety',
                content: 'Detailed flood safety information that would be available offline.'
            },
            {
                id: 'landslide',
                title: 'Landslide Safety',
                content: 'Detailed landslide safety information that would be available offline.'
            },
            {
                id: 'fire',
                title: 'Fire Safety',
                content: 'Detailed fire safety information that would be available offline.'
            }
        ];
        
        if (!this.db) return;
        
        const transaction = this.db.transaction(['safetyGuides'], 'readwrite');
        const store = transaction.objectStore('safetyGuides');
        
        safetyGuides.forEach(guide => {
            store.put(guide);
        });
    },
    
    // Load shelter data into IndexedDB
    loadShelterData() {
        // Sample shelter data
        const shelters = [
            {
                name: 'Kathmandu Emergency Shelter',
                lat: 27.7172,
                lng: 85.3240,
                capacity: 500,
                type: 'School'
            },
            {
                name: 'Bhaktapur Relief Center',
                lat: 27.6710,
                lng: 85.4298,
                capacity: 300,
                type: 'Community Center'
            },
            {
                name: 'Lalitpur Safe Haven',
                lat: 27.6588,
                lng: 85.3247,
                capacity: 250,
                type: 'Government Building'
            }
        ];
        
        if (!this.db) return;
        
        const transaction = this.db.transaction(['shelters'], 'readwrite');
        const store = transaction.objectStore('shelters');
        
        shelters.forEach(shelter => {
            store.put(shelter);
        });
    },
    
    // Save data for offline use
    saveOfflineData() {
        // Save emergency contacts
        this.saveEmergencyContacts();
        
        // Save user preferences
        this.saveUserPreferences();
    },
    
    // Save emergency contacts to IndexedDB
    saveEmergencyContacts() {
        // Get contacts from localStorage
        const contactsJson = localStorage.getItem('safeNepal_emergencyContacts');
        if (!contactsJson) return;
        
        const contacts = JSON.parse(contactsJson);
        
        if (!this.db) return;
        
        const transaction = this.db.transaction(['emergencyContacts'], 'readwrite');
        const store = transaction.objectStore('emergencyContacts');
        
        // Clear existing contacts
        store.clear();
        
        // Add each contact
        contacts.forEach(contact => {
            store.add(contact);
        });
    },
    
    // Save user preferences
    saveUserPreferences() {
        // Get user preferences from localStorage
        const preferences = {
            theme: localStorage.getItem('safeNepal_theme') || 'light',
            language: localStorage.getItem('safeNepal_language') || 'en',
            notificationsEnabled: localStorage.getItem('safeNepal_notifications') === 'true'
        };
        
        // Store in localStorage for offline access
        localStorage.setItem('safeNepal_preferences', JSON.stringify(preferences));
    },
    
    // Sync offline data when back online
    syncOfflineData() {
        if (!this.isOnline || !this.db) return;
        
        // Get offline actions that need to be synced
        const transaction = this.db.transaction(['offlineActions'], 'readwrite');
        const store = transaction.objectStore('offlineActions');
        
        const request = store.getAll();
        
        request.onsuccess = (event) => {
            const actions = event.target.result;
            
            if (actions.length === 0) return;
            
            console.log(`Syncing ${actions.length} offline actions`);
            
            // Process each action
            actions.forEach(action => {
                this.processOfflineAction(action);
            });
            
            // Clear processed actions
            store.clear();
        };
    },
    
    // Process an offline action
    processOfflineAction(action) {
        // In a real app, this would send the action to the server
        console.log('Processing offline action:', action);
        
        // Example: if the action is to add a contact, it would be sent to the server
        if (action.type === 'add_contact') {
            // Send to server (simulated)
            console.log('Syncing contact to server:', action.data);
        }
    },
    
    // Record an action to be synced later when online
    recordOfflineAction(type, data) {
        if (!this.db) return;
        
        const transaction = this.db.transaction(['offlineActions'], 'readwrite');
        const store = transaction.objectStore('offlineActions');
        
        const action = {
            type,
            data,
            timestamp: new Date().toISOString()
        };
        
        store.add(action);
    },
    
    // Get offline data
    getOfflineData(storeName, callback) {
        if (!this.db) {
            callback([]);
            return;
        }
        
        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        
        const request = store.getAll();
        
        request.onsuccess = (event) => {
            callback(event.target.result);
        };
        
        request.onerror = (event) => {
            console.error(`Error getting offline data from ${storeName}:`, event.target.error);
            callback([]);
        };
    },
    
    // Check if a resource is available offline
    isResourceAvailable(url, callback) {
        if ('caches' in window) {
            caches.match(url)
                .then(response => {
                    callback(response !== undefined);
                })
                .catch(() => {
                    callback(false);
                });
        } else {
            callback(false);
        }
    },
    
    // Prefetch important resources for offline use
    prefetchResources() {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            // List of important URLs to prefetch
            const urls = [
                '/',
                '/index.html',
                '/safety.html',
                '/contacts.html',
                '/shelters.html',
                '/offline.html',
                '/style.css',
                '/js/earthquake-api.js',
                '/js/weather-api.js',
                '/js/maps.js',
                '/js/contacts.js',
                '/js/offline.js',
                '/js/language.js',
                '/js/notifications.js',
                '/js/settings.js',
                '/js/push-service.js',
                '/js/simulation.js',
                '/js/community-reports.js'
            ];
            
            // Send message to service worker to prefetch these URLs
            navigator.serviceWorker.controller.postMessage({
                type: 'PREFETCH',
                urls: urls
            });
        }
    }
};

// Initialize offline functionality when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    offlineManager.init();
});