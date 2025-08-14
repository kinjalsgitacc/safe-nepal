// Notifications System for SafeNepal

const notificationManager = {
    // Permission status
    permissionStatus: 'default',
    
    // Notification settings
    settings: {
        enabled: false,
        alertTypes: {
            earthquake: true,
            flood: true,
            landslide: true,
            weather: true,
            general: true
        },
        frequency: 'all', // 'all', 'high', 'medium', 'none'
        vibration: true,
        sound: true
    },
    
    // Initialize notification system
    init() {
        // Check if notifications are supported
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications');
            return;
        }
        
        // Load saved settings
        this.loadSettings();
        
        // Check permission status
        this.checkPermission();
        
        // Set up UI elements
        this.setupUI();
        
        // Set up service worker for push notifications
        this.setupServiceWorker();
        
        // Set up event listeners
        this.setupEventListeners();
    },
    
    // Load saved notification settings
    loadSettings() {
        const savedSettings = localStorage.getItem('safeNepal_notificationSettings');
        if (savedSettings) {
            try {
                const parsedSettings = JSON.parse(savedSettings);
                this.settings = { ...this.settings, ...parsedSettings };
            } catch (e) {
                console.error('Error parsing notification settings:', e);
            }
        }
    },
    
    // Save notification settings
    saveSettings() {
        localStorage.setItem('safeNepal_notificationSettings', JSON.stringify(this.settings));
        
        // Update service worker with new settings
        this.updateServiceWorkerSettings();
    },
    
    // Check notification permission
    checkPermission() {
        this.permissionStatus = Notification.permission;
        
        // Update settings based on permission
        if (this.permissionStatus === 'granted') {
            this.settings.enabled = true;
        } else if (this.permissionStatus === 'denied') {
            this.settings.enabled = false;
        }
        
        // Update UI
        this.updateUI();
    },
    
    // Request notification permission
    requestPermission() {
        Notification.requestPermission()
            .then(permission => {
                this.permissionStatus = permission;
                
                if (permission === 'granted') {
                    this.settings.enabled = true;
                    this.saveSettings();
                    this.showWelcomeNotification();
                }
                
                this.updateUI();
            });
    },
    
    // Set up UI elements
    setupUI() {
        // Toggle switch for notifications
        const notificationToggle = document.getElementById('notification-toggle');
        if (notificationToggle) {
            notificationToggle.checked = this.settings.enabled;
            notificationToggle.addEventListener('change', (e) => {
                if (e.target.checked) {
                    if (this.permissionStatus !== 'granted') {
                        this.requestPermission();
                    } else {
                        this.settings.enabled = true;
                        this.saveSettings();
                    }
                } else {
                    this.settings.enabled = false;
                    this.saveSettings();
                }
            });
        }
        
        // Alert type checkboxes
        Object.keys(this.settings.alertTypes).forEach(type => {
            const checkbox = document.getElementById(`notification-${type}`);
            if (checkbox) {
                checkbox.checked = this.settings.alertTypes[type];
                checkbox.addEventListener('change', (e) => {
                    this.settings.alertTypes[type] = e.target.checked;
                    this.saveSettings();
                });
            }
        });
        
        // Frequency selector
        const frequencySelector = document.getElementById('notification-frequency');
        if (frequencySelector) {
            frequencySelector.value = this.settings.frequency;
            frequencySelector.addEventListener('change', (e) => {
                this.settings.frequency = e.target.value;
                this.saveSettings();
            });
        }
        
        // Vibration toggle
        const vibrationToggle = document.getElementById('notification-vibration');
        if (vibrationToggle) {
            vibrationToggle.checked = this.settings.vibration;
            vibrationToggle.addEventListener('change', (e) => {
                this.settings.vibration = e.target.checked;
                this.saveSettings();
            });
        }
        
        // Sound toggle
        const soundToggle = document.getElementById('notification-sound');
        if (soundToggle) {
            soundToggle.checked = this.settings.sound;
            soundToggle.addEventListener('change', (e) => {
                this.settings.sound = e.target.checked;
                this.saveSettings();
            });
        }
    },
    
    // Update UI based on current settings and permission
    updateUI() {
        // Update toggle switch
        const notificationToggle = document.getElementById('notification-toggle');
        if (notificationToggle) {
            notificationToggle.checked = this.settings.enabled;
            
            // Disable toggle if permission is denied
            notificationToggle.disabled = this.permissionStatus === 'denied';
        }
        
        // Update permission status display
        const permissionStatus = document.getElementById('notification-permission-status');
        if (permissionStatus) {
            let statusText = '';
            let statusClass = '';
            
            switch (this.permissionStatus) {
                case 'granted':
                    statusText = 'Notifications are enabled';
                    statusClass = 'text-success';
                    break;
                case 'denied':
                    statusText = 'Notifications are blocked. Please enable them in your browser settings.';
                    statusClass = 'text-danger';
                    break;
                default:
                    statusText = 'Notification permission not granted yet';
                    statusClass = 'text-warning';
            }
            
            permissionStatus.textContent = statusText;
            permissionStatus.className = statusClass;
        }
        
        // Update settings section visibility
        const settingsSection = document.getElementById('notification-settings-section');
        if (settingsSection) {
            if (this.settings.enabled && this.permissionStatus === 'granted') {
                settingsSection.classList.remove('d-none');
            } else {
                settingsSection.classList.add('d-none');
            }
        }
    },
    
    // Set up service worker for push notifications
    setupServiceWorker() {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.ready
                .then(registration => {
                    // Check if push subscription exists
                    return registration.pushManager.getSubscription()
                        .then(subscription => {
                            if (subscription) {
                                return subscription;
                            }
                            
                            // Subscribe for push notifications if permission is granted
                            if (this.permissionStatus === 'granted' && this.settings.enabled) {
                                return this.subscribeToPushNotifications(registration);
                            }
                        });
                })
                .catch(error => {
                    console.error('Error setting up push notifications:', error);
                });
        }
    },
    
    // Subscribe to push notifications
    subscribeToPushNotifications(registration) {
        // In a real application, you would get this from your server
        // For demo purposes, we're using a dummy public key
        const applicationServerPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
        
        const applicationServerKey = this.urlB64ToUint8Array(applicationServerPublicKey);
        
        return registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey
        })
        .then(subscription => {
            console.log('User is subscribed to push notifications');
            
            // In a real application, you would send the subscription to your server
            this.sendSubscriptionToServer(subscription);
            
            return subscription;
        })
        .catch(error => {
            console.error('Failed to subscribe to push notifications:', error);
            this.settings.enabled = false;
            this.saveSettings();
            this.updateUI();
        });
    },
    
    // Send subscription to server (simulated)
    sendSubscriptionToServer(subscription) {
        // In a real application, you would send this to your server
        console.log('Sending subscription to server:', subscription);
        
        // For demo purposes, we'll just store it in localStorage
        localStorage.setItem('safeNepal_pushSubscription', JSON.stringify(subscription));
    },
    
    // Update service worker with new settings
    updateServiceWorkerSettings() {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'UPDATE_NOTIFICATION_SETTINGS',
                settings: this.settings
            });
        }
    },
    
    // Set up event listeners
    setupEventListeners() {
        // Listen for push notification events from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'PUSH_RECEIVED') {
                // Handle push notification received
                console.log('Push notification received:', event.data.notification);
            }
        });
    },
    
    // Show welcome notification
    showWelcomeNotification() {
        this.showNotification({
            title: 'SafeNepal Notifications Enabled',
            body: 'You will now receive important alerts about disasters and emergencies.',
            icon: '/images/logo.png',
            tag: 'welcome',
            data: {
                type: 'general',
                url: '/'
            }
        });
    },
    
    // Show a notification
    showNotification(options) {
        // Check if notifications are enabled
        if (!this.settings.enabled || this.permissionStatus !== 'granted') {
            return Promise.reject('Notifications are not enabled');
        }
        
        // Check if this type of notification is enabled
        const type = options.data && options.data.type ? options.data.type : 'general';
        if (this.settings.alertTypes[type] === false) {
            return Promise.reject(`Notifications of type ${type} are disabled`);
        }
        
        // Check frequency setting
        const priority = options.data && options.data.priority ? options.data.priority : 'medium';
        if (
            (this.settings.frequency === 'high' && priority !== 'high') ||
            (this.settings.frequency === 'none')
        ) {
            return Promise.reject(`Notifications with priority ${priority} are filtered out`);
        }
        
        // Set vibration if enabled
        if (this.settings.vibration) {
            options.vibrate = [100, 50, 100];
        }
        
        // Set notification options
        const notificationOptions = {
            body: options.body || '',
            icon: options.icon || '/images/logo.png',
            badge: options.badge || '/images/badge.png',
            tag: options.tag || 'general',
            data: options.data || {},
            vibrate: options.vibrate,
            requireInteraction: options.requireInteraction || false,
            actions: options.actions || []
        };
        
        // Show notification
        return navigator.serviceWorker.ready
            .then(registration => {
                return registration.showNotification(options.title, notificationOptions);
            })
            .catch(error => {
                console.error('Error showing notification:', error);
                return Promise.reject(error);
            });
    },
    
    // Show an earthquake alert notification
    showEarthquakeAlert(data) {
        return this.showNotification({
            title: `Earthquake Alert: Magnitude ${data.magnitude}`,
            body: `${data.location} - ${data.time}. Distance: ${data.distance} km from your location.`,
            icon: '/images/earthquake-icon.png',
            tag: 'earthquake',
            requireInteraction: true,
            data: {
                type: 'earthquake',
                priority: data.magnitude >= 5.0 ? 'high' : 'medium',
                url: '/safety.html#earthquake',
                earthquake: data
            },
            actions: [
                {
                    action: 'view-safety',
                    title: 'Safety Guide'
                },
                {
                    action: 'view-map',
                    title: 'View Map'
                }
            ]
        });
    },
    
    // Show a weather alert notification
    showWeatherAlert(data) {
        return this.showNotification({
            title: `Weather Alert: ${data.condition}`,
            body: `${data.description} - ${data.location}. ${data.advice}`,
            icon: '/images/weather-icon.png',
            tag: 'weather',
            requireInteraction: data.severity === 'high',
            data: {
                type: 'weather',
                priority: data.severity,
                url: '/safety.html#weather',
                weather: data
            },
            actions: [
                {
                    action: 'view-safety',
                    title: 'Safety Tips'
                },
                {
                    action: 'view-forecast',
                    title: 'Forecast'
                }
            ]
        });
    },
    
    // Show a flood alert notification
    showFloodAlert(data) {
        return this.showNotification({
            title: `Flood Alert: ${data.level}`,
            body: `${data.location} - ${data.description}. ${data.advice}`,
            icon: '/images/flood-icon.png',
            tag: 'flood',
            requireInteraction: data.severity === 'high',
            data: {
                type: 'flood',
                priority: data.severity,
                url: '/safety.html#flood',
                flood: data
            },
            actions: [
                {
                    action: 'view-safety',
                    title: 'Safety Guide'
                },
                {
                    action: 'view-shelters',
                    title: 'Find Shelter'
                }
            ]
        });
    },
    
    // Show a landslide alert notification
    showLandslideAlert(data) {
        return this.showNotification({
            title: `Landslide Alert: ${data.level}`,
            body: `${data.location} - ${data.description}. ${data.advice}`,
            icon: '/images/landslide-icon.png',
            tag: 'landslide',
            requireInteraction: data.severity === 'high',
            data: {
                type: 'landslide',
                priority: data.severity,
                url: '/safety.html#landslide',
                landslide: data
            },
            actions: [
                {
                    action: 'view-safety',
                    title: 'Safety Guide'
                },
                {
                    action: 'view-map',
                    title: 'View Map'
                }
            ]
        });
    },
    
    // Show a general alert notification
    showGeneralAlert(data) {
        return this.showNotification({
            title: data.title || 'SafeNepal Alert',
            body: data.message,
            icon: data.icon || '/images/logo.png',
            tag: data.tag || 'general',
            requireInteraction: data.requireInteraction || false,
            data: {
                type: 'general',
                priority: data.priority || 'medium',
                url: data.url || '/',
                alert: data
            },
            actions: data.actions || []
        });
    },
    
    // Helper function to convert base64 to Uint8Array
    urlB64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');
        
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        
        return outputArray;
    }
};

// Initialize notification system when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    notificationManager.init();
});