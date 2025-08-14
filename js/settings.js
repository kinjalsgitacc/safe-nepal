/**
 * SafeNepal Settings Manager
 * Handles all settings-related functionality for the SafeNepal application
 */

const settingsManager = {
    // Default settings
    defaults: {
        general: {
            language: 'en',
            theme: 'light',
            textSize: 3,
            defaultLocation: 'Kathmandu, Nepal',
            locationPermission: true,
            accessibility: {
                highContrast: false,
                reduceMotion: false,
                screenReader: false
            }
        },
        notifications: {
            enabled: true,
            alertTypes: {
                earthquake: true,
                weather: true,
                flood: true,
                landslide: true,
                community: true
            },
            frequency: 'all',
            quietHours: {
                start: '22:00',
                end: '06:00',
                allowCritical: true
            },
            sound: true,
            vibration: true,
            soundType: 'default'
        },
        data: {
            offlineMode: true,
            offlineData: {
                maps: true,
                contacts: true,
                guides: true,
                shelters: true
            }
        },
        account: {
            profile: {
                name: '',
                email: '',
                phone: ''
            },
            privacy: {
                shareLocation: true,
                anonymousReports: false,
                usageAnalytics: true
            }
        }
    },

    /**
     * Initialize settings manager
     */
    init: function() {
        // Load all settings
        this.loadAllSettings();
        
        // Apply theme
        this.applyTheme();
        
        // Apply accessibility settings
        this.applyAccessibilitySettings();
        
        // Load profile data if available
        this.loadProfileData();
        
        // Initialize settings page if we're on it
        if (window.location.pathname.includes('settings.html')) {
            this.initSettingsPage();
        }
    },

    /**
     * Load all settings from localStorage
     */
    loadAllSettings: function() {
        // Load general settings
        this.generalSettings = JSON.parse(localStorage.getItem('safeNepal_generalSettings')) || this.defaults.general;
        
        // Load notification settings
        this.notificationSettings = JSON.parse(localStorage.getItem('safeNepal_notificationSettings')) || this.defaults.notifications;
        
        // Load data settings
        this.dataSettings = JSON.parse(localStorage.getItem('safeNepal_dataSettings')) || this.defaults.data;
        
        // Load account settings
        this.accountSettings = JSON.parse(localStorage.getItem('safeNepal_accountSettings')) || this.defaults.account;
    },

    /**
     * Save general settings
     * @param {Object} settings - General settings object
     */
    saveGeneralSettings: function(settings) {
        this.generalSettings = settings;
        localStorage.setItem('safeNepal_generalSettings', JSON.stringify(settings));
        
        // Apply theme and accessibility changes immediately
        this.applyTheme();
        this.applyAccessibilitySettings();
        
        return true;
    },

    /**
     * Save notification settings
     * @param {Object} settings - Notification settings object
     */
    saveNotificationSettings: function(settings) {
        this.notificationSettings = settings;
        localStorage.setItem('safeNepal_notificationSettings', JSON.stringify(settings));
        
        // Update notification manager if available
        if (typeof notificationManager !== 'undefined') {
            notificationManager.updateSettings(settings);
        }
        
        return true;
    },

    /**
     * Save data settings
     * @param {Object} settings - Data settings object
     */
    saveDataSettings: function(settings) {
        this.dataSettings = settings;
        localStorage.setItem('safeNepal_dataSettings', JSON.stringify(settings));
        
        // Update offline functionality if enabled
        if (settings.offlineMode && typeof offlineManager !== 'undefined') {
            offlineManager.updateOfflineData(settings.offlineData);
        }
        
        return true;
    },

    /**
     * Save account settings
     * @param {Object} settings - Account settings object
     */
    saveAccountSettings: function(settings) {
        this.accountSettings = settings;
        localStorage.setItem('safeNepal_accountSettings', JSON.stringify(settings));
        return true;
    },

    /**
     * Apply current theme setting
     */
    applyTheme: function() {
        const theme = this.generalSettings.theme;
        const htmlEl = document.documentElement;
        
        // Remove any existing theme classes
        htmlEl.classList.remove('theme-light', 'theme-dark');
        
        if (theme === 'dark') {
            htmlEl.classList.add('theme-dark');
            document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#343a40');
        } else if (theme === 'light') {
            htmlEl.classList.add('theme-light');
            document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#0d6efd');
        } else if (theme === 'system') {
            // Check system preference
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                htmlEl.classList.add('theme-dark');
                document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#343a40');
            } else {
                htmlEl.classList.add('theme-light');
                document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#0d6efd');
            }
            
            // Listen for changes in system theme
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
                if (this.generalSettings.theme === 'system') {
                    htmlEl.classList.remove('theme-light', 'theme-dark');
                    if (e.matches) {
                        htmlEl.classList.add('theme-dark');
                        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#343a40');
                    } else {
                        htmlEl.classList.add('theme-light');
                        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#0d6efd');
                    }
                }
            });
        }
        
        // Apply text size
        const textSizeClass = `text-size-${this.generalSettings.textSize || 3}`;
        htmlEl.classList.remove('text-size-1', 'text-size-2', 'text-size-3', 'text-size-4', 'text-size-5');
        htmlEl.classList.add(textSizeClass);
    },

    /**
     * Apply accessibility settings
     */
    applyAccessibilitySettings: function() {
        const accessibility = this.generalSettings.accessibility || {};
        const htmlEl = document.documentElement;
        
        // High contrast mode
        if (accessibility.highContrast) {
            htmlEl.classList.add('high-contrast');
        } else {
            htmlEl.classList.remove('high-contrast');
        }
        
        // Reduce motion
        if (accessibility.reduceMotion) {
            htmlEl.classList.add('reduce-motion');
        } else {
            htmlEl.classList.remove('reduce-motion');
        }
        
        // Screen reader optimization
        if (accessibility.screenReader) {
            htmlEl.classList.add('screen-reader-optimized');
        } else {
            htmlEl.classList.remove('screen-reader-optimized');
        }
    },

    /**
     * Load profile data into form fields
     */
    loadProfileData: function() {
        const profile = this.accountSettings.profile || {};
        
        // Update profile fields if they exist
        const nameField = document.getElementById('profile-name');
        if (nameField && profile.name) {
            nameField.value = profile.name;
        }
        
        const emailField = document.getElementById('profile-email');
        if (emailField && profile.email) {
            emailField.value = profile.email;
        }
        
        const phoneField = document.getElementById('profile-phone');
        if (phoneField && profile.phone) {
            phoneField.value = profile.phone;
        }
    },

    /**
     * Initialize settings page functionality
     */
    initSettingsPage: function() {
        // Load all settings into form fields
        this.populateSettingsForm();
        
        // Set up event listeners for settings forms
        this.setupEventListeners();
        
        // Calculate storage usage
        this.calculateStorageUsage();
    },

    /**
     * Populate settings form with current values
     */
    populateSettingsForm: function() {
        // General Settings
        const general = this.generalSettings;
        
        // Language
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.value = general.language || 'en';
        }
        
        // Theme
        const themeRadios = document.querySelectorAll('input[name="theme"]');
        themeRadios.forEach(radio => {
            if (radio.value === general.theme) {
                radio.checked = true;
            }
        });
        
        // Text size
        const textSizeRange = document.getElementById('text-size-range');
        if (textSizeRange) {
            textSizeRange.value = general.textSize || 3;
        }
        
        // Default location
        const defaultLocation = document.getElementById('default-location');
        if (defaultLocation) {
            defaultLocation.value = general.defaultLocation || 'Kathmandu, Nepal';
        }
        
        // Location permission
        const locationPermission = document.getElementById('location-permission');
        if (locationPermission) {
            locationPermission.checked = general.locationPermission !== false;
        }
        
        // Accessibility settings
        const accessibility = general.accessibility || {};
        
        const highContrast = document.getElementById('high-contrast');
        if (highContrast) {
            highContrast.checked = accessibility.highContrast || false;
        }
        
        const reduceMotion = document.getElementById('reduce-motion');
        if (reduceMotion) {
            reduceMotion.checked = accessibility.reduceMotion || false;
        }
        
        const screenReader = document.getElementById('screen-reader');
        if (screenReader) {
            screenReader.checked = accessibility.screenReader || false;
        }
        
        // Notification Settings
        const notifications = this.notificationSettings;
        
        // Push permission
        const pushPermission = document.getElementById('push-permission');
        if (pushPermission) {
            pushPermission.checked = notifications.enabled !== false;
        }
        
        // Alert types
        const earthquakeAlerts = document.getElementById('earthquake-alerts');
        if (earthquakeAlerts && notifications.alertTypes) {
            earthquakeAlerts.checked = notifications.alertTypes.earthquake !== false;
        }
        
        const weatherAlerts = document.getElementById('weather-alerts');
        if (weatherAlerts && notifications.alertTypes) {
            weatherAlerts.checked = notifications.alertTypes.weather !== false;
        }
        
        const floodAlerts = document.getElementById('flood-alerts');
        if (floodAlerts && notifications.alertTypes) {
            floodAlerts.checked = notifications.alertTypes.flood !== false;
        }
        
        const landslideAlerts = document.getElementById('landslide-alerts');
        if (landslideAlerts && notifications.alertTypes) {
            landslideAlerts.checked = notifications.alertTypes.landslide !== false;
        }
        
        const communityAlerts = document.getElementById('community-alerts');
        if (communityAlerts && notifications.alertTypes) {
            communityAlerts.checked = notifications.alertTypes.community !== false;
        }
        
        // Alert frequency
        const alertFrequency = document.getElementById('alert-frequency');
        if (alertFrequency) {
            alertFrequency.value = notifications.frequency || 'all';
        }
        
        // Quiet hours
        if (notifications.quietHours) {
            const quietHoursStart = document.getElementById('quiet-hours-start');
            if (quietHoursStart) {
                quietHoursStart.value = notifications.quietHours.start || '22:00';
            }
            
            const quietHoursEnd = document.getElementById('quiet-hours-end');
            if (quietHoursEnd) {
                quietHoursEnd.value = notifications.quietHours.end || '06:00';
            }
            
            const overrideQuietHours = document.getElementById('override-quiet-hours');
            if (overrideQuietHours) {
                overrideQuietHours.checked = notifications.quietHours.allowCritical !== false;
            }
        }
        
        // Sound & vibration
        const notificationSound = document.getElementById('notification-sound');
        if (notificationSound) {
            notificationSound.checked = notifications.sound !== false;
        }
        
        const notificationVibration = document.getElementById('notification-vibration');
        if (notificationVibration) {
            notificationVibration.checked = notifications.vibration !== false;
        }
        
        const soundType = document.getElementById('sound-type');
        if (soundType) {
            soundType.value = notifications.soundType || 'default';
        }
        
        // Data Settings
        const data = this.dataSettings;
        
        // Offline mode
        const offlineMode = document.getElementById('offline-mode');
        if (offlineMode) {
            offlineMode.checked = data.offlineMode !== false;
        }
        
        // Offline data
        if (data.offlineData) {
            const offlineMaps = document.getElementById('offline-maps');
            if (offlineMaps) {
                offlineMaps.checked = data.offlineData.maps !== false;
            }
            
            const offlineContacts = document.getElementById('offline-contacts');
            if (offlineContacts) {
                offlineContacts.checked = data.offlineData.contacts !== false;
            }
            
            const offlineGuides = document.getElementById('offline-guides');
            if (offlineGuides) {
                offlineGuides.checked = data.offlineData.guides !== false;
            }
            
            const offlineShelters = document.getElementById('offline-shelters');
            if (offlineShelters) {
                offlineShelters.checked = data.offlineData.shelters !== false;
            }
        }
        
        // Account Settings
        const account = this.accountSettings;
        
        // Profile
        if (account.profile) {
            const profileName = document.getElementById('profile-name');
            if (profileName) {
                profileName.value = account.profile.name || '';
            }
            
            const profileEmail = document.getElementById('profile-email');
            if (profileEmail) {
                profileEmail.value = account.profile.email || '';
            }
            
            const profilePhone = document.getElementById('profile-phone');
            if (profilePhone) {
                profilePhone.value = account.profile.phone || '';
            }
        }
        
        // Privacy
        if (account.privacy) {
            const shareLocation = document.getElementById('share-location');
            if (shareLocation) {
                shareLocation.checked = account.privacy.shareLocation !== false;
            }
            
            const anonymousReports = document.getElementById('anonymous-reports');
            if (anonymousReports) {
                anonymousReports.checked = account.privacy.anonymousReports || false;
            }
            
            const usageAnalytics = document.getElementById('usage-analytics');
            if (usageAnalytics) {
                usageAnalytics.checked = account.privacy.usageAnalytics !== false;
            }
        }
    },

    /**
     * Set up event listeners for settings forms
     */
    setupEventListeners: function() {
        // General Settings
        const saveGeneralBtn = document.getElementById('save-general-settings');
        if (saveGeneralBtn) {
            saveGeneralBtn.addEventListener('click', () => {
                // Show loading state
                saveGeneralBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';
                saveGeneralBtn.disabled = true;
                
                // Get form values
                const language = document.getElementById('language-select').value;
                const theme = document.querySelector('input[name="theme"]:checked').value;
                const textSize = document.getElementById('text-size-range').value;
                const defaultLocation = document.getElementById('default-location').value;
                const locationPermission = document.getElementById('location-permission').checked;
                const highContrast = document.getElementById('high-contrast').checked;
                const reduceMotion = document.getElementById('reduce-motion').checked;
                const screenReader = document.getElementById('screen-reader').checked;
                
                // Save settings
                const generalSettings = {
                    language,
                    theme,
                    textSize,
                    defaultLocation,
                    locationPermission,
                    accessibility: {
                        highContrast,
                        reduceMotion,
                        screenReader
                    }
                };
                
                this.saveGeneralSettings(generalSettings);
                
                // Apply language change
                if (typeof languageManager !== 'undefined') {
                    languageManager.changeLanguage(language);
                }
                
                // Apply theme change immediately
                this.applyTheme();
                
                // Restore button after 1 second
                setTimeout(() => {
                    saveGeneralBtn.innerHTML = '<i class="fas fa-save me-1"></i> Save Changes';
                    saveGeneralBtn.disabled = false;
                    
                    // Show success message
                    this.showAlert('General settings saved successfully!', 'success');
                }, 1000);
            });
        }
        
        // Notification Settings
        const saveNotificationBtn = document.getElementById('save-notification-settings');
        if (saveNotificationBtn) {
            saveNotificationBtn.addEventListener('click', () => {
                // Show loading state
                saveNotificationBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';
                saveNotificationBtn.disabled = true;
                
                // Get form values
                const enabled = document.getElementById('push-permission').checked;
                const earthquakeAlerts = document.getElementById('earthquake-alerts').checked;
                const weatherAlerts = document.getElementById('weather-alerts').checked;
                const floodAlerts = document.getElementById('flood-alerts').checked;
                const landslideAlerts = document.getElementById('landslide-alerts').checked;
                const communityAlerts = document.getElementById('community-alerts').checked;
                const frequency = document.getElementById('alert-frequency').value;
                const quietHoursStart = document.getElementById('quiet-hours-start').value;
                const quietHoursEnd = document.getElementById('quiet-hours-end').value;
                const overrideQuietHours = document.getElementById('override-quiet-hours').checked;
                const sound = document.getElementById('notification-sound').checked;
                const vibration = document.getElementById('notification-vibration').checked;
                const soundType = document.getElementById('sound-type').value;
                
                // Save settings
                const notificationSettings = {
                    enabled,
                    alertTypes: {
                        earthquake: earthquakeAlerts,
                        weather: weatherAlerts,
                        flood: floodAlerts,
                        landslide: landslideAlerts,
                        community: communityAlerts
                    },
                    frequency,
                    quietHours: {
                        start: quietHoursStart,
                        end: quietHoursEnd,
                        allowCritical: overrideQuietHours
                    },
                    sound,
                    vibration,
                    soundType
                };
                
                this.saveNotificationSettings(notificationSettings);
                
                // Restore button after 1 second
                setTimeout(() => {
                    saveNotificationBtn.innerHTML = '<i class="fas fa-save me-1"></i> Save Changes';
                    saveNotificationBtn.disabled = false;
                    
                    // Show success message
                    this.showAlert('Notification settings saved successfully!', 'success');
                }, 1000);
            });
        }
        
        // Data & Storage Settings
        const saveDataBtn = document.getElementById('save-data-settings');
        if (saveDataBtn) {
            saveDataBtn.addEventListener('click', () => {
                // Show loading state
                saveDataBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';
                saveDataBtn.disabled = true;
                
                // Get form values
                const offlineMode = document.getElementById('offline-mode').checked;
                const offlineMaps = document.getElementById('offline-maps').checked;
                const offlineContacts = document.getElementById('offline-contacts').checked;
                const offlineGuides = document.getElementById('offline-guides').checked;
                const offlineShelters = document.getElementById('offline-shelters').checked;
                
                // Save settings
                const dataSettings = {
                    offlineMode,
                    offlineData: {
                        maps: offlineMaps,
                        contacts: offlineContacts,
                        guides: offlineGuides,
                        shelters: offlineShelters
                    }
                };
                
                this.saveDataSettings(dataSettings);
                
                // Restore button after 1 second
                setTimeout(() => {
                    saveDataBtn.innerHTML = '<i class="fas fa-save me-1"></i> Save Changes';
                    saveDataBtn.disabled = false;
                    
                    // Show success message
                    this.showAlert('Data settings saved successfully!', 'success');
                }, 1000);
            });
        }
        
        // Account Settings
        const saveAccountBtn = document.getElementById('save-account-settings');
        if (saveAccountBtn) {
            saveAccountBtn.addEventListener('click', () => {
                // Show loading state
                saveAccountBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';
                saveAccountBtn.disabled = true;
                
                // Get form values
                const name = document.getElementById('profile-name').value;
                const email = document.getElementById('profile-email').value;
                const phone = document.getElementById('profile-phone').value;
                const shareLocation = document.getElementById('share-location').checked;
                const anonymousReports = document.getElementById('anonymous-reports').checked;
                const usageAnalytics = document.getElementById('usage-analytics').checked;
                
                // Save settings
                const accountSettings = {
                    profile: {
                        name,
                        email,
                        phone
                    },
                    privacy: {
                        shareLocation,
                        anonymousReports,
                        usageAnalytics
                    }
                };
                
                this.saveAccountSettings(accountSettings);
                
                // Restore button after 1 second
                setTimeout(() => {
                    saveAccountBtn.innerHTML = '<i class="fas fa-save me-1"></i> Save Changes';
                    saveAccountBtn.disabled = false;
                    
                    // Show success message
                    this.showAlert('Account settings saved successfully!', 'success');
                }, 1000);
            });
        }
        
        // Data Management Buttons
        const exportDataBtn = document.getElementById('export-data-btn');
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', () => {
                this.exportAllData();
            });
        }
        
        const importDataBtn = document.getElementById('import-data-btn');
        if (importDataBtn) {
            importDataBtn.addEventListener('click', () => {
                this.importData();
            });
        }
        
        const clearCacheBtn = document.getElementById('clear-cache-btn');
        if (clearCacheBtn) {
            clearCacheBtn.addEventListener('click', () => {
                this.clearCache();
            });
        }
        
        const resetAppBtn = document.getElementById('reset-app-btn');
        if (resetAppBtn) {
            resetAppBtn.addEventListener('click', () => {
                this.resetApp();
            });
        }
        
        // Location detection
        const detectLocationBtn = document.getElementById('detect-location-btn');
        if (detectLocationBtn) {
            detectLocationBtn.addEventListener('click', () => {
                this.detectLocation();
            });
        }
        
        // Real-time theme switching
        const themeRadios = document.querySelectorAll('input[name="theme"]');
        themeRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.checked) {
                    // Update the setting temporarily for immediate preview
                    this.generalSettings.theme = radio.value;
                    this.applyTheme();
                    
                    // Show a notification that settings need to be saved
                    this.showAlert('Theme changed. Click "Save Changes" to make it permanent.', 'info');
                }
            });
        });
        
        // Real-time text size adjustment
        const textSizeRange = document.getElementById('text-size-range');
        if (textSizeRange) {
            textSizeRange.addEventListener('input', () => {
                this.generalSettings.textSize = textSizeRange.value;
                this.applyTheme(); // This also applies text size
            });
        }
        
        // Real-time accessibility settings
        const highContrastToggle = document.getElementById('high-contrast');
        if (highContrastToggle) {
            highContrastToggle.addEventListener('change', () => {
                this.generalSettings.accessibility.highContrast = highContrastToggle.checked;
                this.applyAccessibilitySettings();
            });
        }
        
        const reduceMotionToggle = document.getElementById('reduce-motion');
        if (reduceMotionToggle) {
            reduceMotionToggle.addEventListener('change', () => {
                this.generalSettings.accessibility.reduceMotion = reduceMotionToggle.checked;
                this.applyAccessibilitySettings();
            });
        }
        
        const screenReaderToggle = document.getElementById('screen-reader');
        if (screenReaderToggle) {
            screenReaderToggle.addEventListener('change', () => {
                this.generalSettings.accessibility.screenReader = screenReaderToggle.checked;
                this.applyAccessibilitySettings();
            });
        }
    },

    /**
     * Calculate storage usage
     */
    calculateStorageUsage: function() {
        // Get total storage used
        let totalBytes = 0;
        let mapBytes = 0;
        let contactsBytes = 0;
        let reportsBytes = 0;
        let guidesBytes = 0;
        let settingsBytes = 0;
        
        // Calculate size of each storage item
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            const bytes = new Blob([value]).size;
            
            totalBytes += bytes;
            
            if (key.includes('map')) {
                mapBytes += bytes;
            } else if (key.includes('contact')) {
                contactsBytes += bytes;
            } else if (key.includes('report')) {
                reportsBytes += bytes;
            } else if (key.includes('guide')) {
                guidesBytes += bytes;
            } else if (key.includes('settings') || key.includes('preference')) {
                settingsBytes += bytes;
            }
        }
        
        // Update UI
        document.getElementById('total-storage-used').textContent = this.formatBytes(totalBytes);
        document.getElementById('map-storage-used').textContent = this.formatBytes(mapBytes);
        document.getElementById('contacts-storage-used').textContent = this.formatBytes(contactsBytes);
        document.getElementById('reports-storage-used').textContent = this.formatBytes(reportsBytes);
        document.getElementById('guides-storage-used').textContent = this.formatBytes(guidesBytes);
        document.getElementById('settings-storage-used').textContent = this.formatBytes(settingsBytes);
        
        // Update progress bar
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            // Estimate percentage of storage used (5MB limit for localStorage)
            const percentage = Math.min(100, (totalBytes / (5 * 1024 * 1024)) * 100);
            progressBar.style.width = `${percentage}%`;
            progressBar.setAttribute('aria-valuenow', percentage);
        }
    },

    /**
     * Format bytes to human-readable format
     * @param {number} bytes - Bytes to format
     * @param {number} decimals - Number of decimal places
     * @returns {string} Formatted string
     */
    formatBytes: function(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },

    /**
     * Export all data
     */
    exportAllData: function() {
        // Collect all data from localStorage
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('safeNepal_')) {
                try {
                    data[key] = JSON.parse(localStorage.getItem(key));
                } catch (e) {
                    data[key] = localStorage.getItem(key);
                }
            }
        }
        
        // Create JSON file
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        // Create download link
        const a = document.createElement('a');
        a.href = url;
        a.download = `SafeNepal_Backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    },

    /**
     * Import data
     */
    importData: function() {
        // Create file input element
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
        
        // Listen for file selection
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        this.importAllData(data);
                    } catch (error) {
                        this.showAlert('Invalid data file. Please select a valid SafeNepal backup file.', 'danger');
                    }
                };
                reader.readAsText(file);
            }
        });
        
        // Trigger file selection dialog
        fileInput.click();
    },

    /**
     * Import all data
     * @param {Object} data - Data to import
     */
    importAllData: function(data) {
        if (!data || typeof data !== 'object') {
            this.showAlert('Invalid data format. Import failed.', 'danger');
            return;
        }
        
        try {
            // Import each data item
            Object.keys(data).forEach(key => {
                if (key.startsWith('safeNepal_')) {
                    localStorage.setItem(key, JSON.stringify(data[key]));
                }
            });
            
            this.showAlert('Data imported successfully! Reloading...', 'success');
            
            // Reload page to apply imported settings
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            this.showAlert('Error importing data: ' + error.message, 'danger');
        }
    },

    /**
     * Clear cache
     */
    clearCache: function() {
        if (confirm('Are you sure you want to clear the cache? This will remove temporary files but keep your settings and data.')) {
            // Clear cache using service worker
            if ('caches' in window) {
                caches.keys().then(function(cacheNames) {
                    return Promise.all(
                        cacheNames.map(function(cacheName) {
                            return caches.delete(cacheName);
                        })
                    );
                }).then(() => {
                    this.showAlert('Cache cleared successfully!', 'success');
                    // Recalculate storage usage
                    this.calculateStorageUsage();
                });
            }
        }
    },

    /**
     * Reset app
     */
    resetApp: function() {
        if (confirm('WARNING: This will reset the app and delete ALL your data. This action cannot be undone. Are you sure you want to continue?')) {
            // Clear all local storage
            localStorage.clear();
            
            // Clear all caches
            if ('caches' in window) {
                caches.keys().then(function(cacheNames) {
                    return Promise.all(
                        cacheNames.map(function(cacheName) {
                            return caches.delete(cacheName);
                        })
                    );
                });
            }
            
            // Show success message and reload page
            this.showAlert('App reset successful. Reloading...', 'success');
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        }
    },

    /**
     * Detect location
     */
    detectLocation: function() {
        const detectLocationBtn = document.getElementById('detect-location-btn');
        
        if (navigator.geolocation) {
            detectLocationBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
            detectLocationBtn.disabled = true;
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Get location name from coordinates using reverse geocoding
                    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`)
                        .then(response => response.json())
                        .then(data => {
                            const locationName = data.display_name.split(',').slice(0, 3).join(',');
                            document.getElementById('default-location').value = locationName;
                            
                            // Restore button
                            detectLocationBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i>';
                            detectLocationBtn.disabled = false;
                        })
                        .catch(error => {
                            // If reverse geocoding fails, just use coordinates
                            document.getElementById('default-location').value = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
                            
                            // Restore button
                            detectLocationBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i>';
                            detectLocationBtn.disabled = false;
                        });
                },
                (error) => {
                    this.showAlert('Unable to retrieve your location. Please enter it manually.', 'warning');
                    
                    // Restore button
                    detectLocationBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i>';
                    detectLocationBtn.disabled = false;
                }
            );
        } else {
            this.showAlert('Geolocation is not supported by your browser. Please enter your location manually.', 'warning');
        }
    },

    /**
     * Show alert message
     * @param {string} message - Message to display
     * @param {string} type - Alert type (success, info, warning, danger)
     */
    showAlert: function(message, type = 'info') {
        // Create alert element
        const alertEl = document.createElement('div');
        alertEl.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
        alertEl.style.zIndex = '9999';
        alertEl.style.maxWidth = '90%';
        alertEl.style.width = '500px';
        alertEl.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Add to document
        document.body.appendChild(alertEl);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (alertEl.parentNode) {
                const bsAlert = new bootstrap.Alert(alertEl);
                bsAlert.close();
            }
        }, 5000);
    }
};

// Initialize settings manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    settingsManager.init();
});