/**
 * Test script for SafeNepal Settings
 * This script tests the functionality of the settings manager
 */

const testSettings = {
    runTests: function() {
        console.log('Running settings tests...');
        
        // Test general settings
        this.testGeneralSettings();
        
        // Test notification settings
        this.testNotificationSettings();
        
        // Test data settings
        this.testDataSettings();
        
        // Test account settings
        this.testAccountSettings();
        
        console.log('All tests completed!');
    },
    
    testGeneralSettings: function() {
        console.log('Testing general settings...');
        
        // Create test settings
        const testGeneralSettings = {
            language: 'ne',
            theme: 'dark',
            textSize: 4,
            defaultLocation: 'Test Location',
            locationPermission: true,
            accessibility: {
                highContrast: true,
                reduceMotion: false,
                screenReader: true
            }
        };
        
        // Save settings
        settingsManager.saveGeneralSettings(testGeneralSettings);
        
        // Load settings
        settingsManager.loadAllSettings();
        
        // Verify settings were saved correctly
        console.assert(settingsManager.generalSettings.language === 'ne', 'Language setting not saved correctly');
        console.assert(settingsManager.generalSettings.theme === 'dark', 'Theme setting not saved correctly');
        console.assert(settingsManager.generalSettings.textSize === 4, 'Text size setting not saved correctly');
        console.assert(settingsManager.generalSettings.defaultLocation === 'Test Location', 'Location setting not saved correctly');
        console.assert(settingsManager.generalSettings.accessibility.highContrast === true, 'High contrast setting not saved correctly');
        console.assert(settingsManager.generalSettings.accessibility.reduceMotion === false, 'Reduce motion setting not saved correctly');
        console.assert(settingsManager.generalSettings.accessibility.screenReader === true, 'Screen reader setting not saved correctly');
        
        console.log('General settings tests passed!');
    },
    
    testNotificationSettings: function() {
        console.log('Testing notification settings...');
        
        // Create test settings
        const testNotificationSettings = {
            enabled: true,
            alertTypes: {
                earthquake: true,
                weather: false,
                flood: true,
                landslide: false,
                community: true
            },
            frequency: 'critical',
            quietHours: {
                start: '23:00',
                end: '07:00',
                allowCritical: true
            },
            sound: false,
            vibration: true,
            soundType: 'alert'
        };
        
        // Save settings
        settingsManager.saveNotificationSettings(testNotificationSettings);
        
        // Load settings
        settingsManager.loadAllSettings();
        
        // Verify settings were saved correctly
        console.assert(settingsManager.notificationSettings.enabled === true, 'Notification enabled setting not saved correctly');
        console.assert(settingsManager.notificationSettings.alertTypes.earthquake === true, 'Earthquake alert setting not saved correctly');
        console.assert(settingsManager.notificationSettings.alertTypes.weather === false, 'Weather alert setting not saved correctly');
        console.assert(settingsManager.notificationSettings.frequency === 'critical', 'Frequency setting not saved correctly');
        console.assert(settingsManager.notificationSettings.quietHours.start === '23:00', 'Quiet hours start setting not saved correctly');
        console.assert(settingsManager.notificationSettings.sound === false, 'Sound setting not saved correctly');
        console.assert(settingsManager.notificationSettings.vibration === true, 'Vibration setting not saved correctly');
        
        console.log('Notification settings tests passed!');
    },
    
    testDataSettings: function() {
        console.log('Testing data settings...');
        
        // Create test settings
        const testDataSettings = {
            offlineMode: true,
            offlineData: {
                maps: true,
                contacts: false,
                guides: true,
                shelters: false
            }
        };
        
        // Save settings
        settingsManager.saveDataSettings(testDataSettings);
        
        // Load settings
        settingsManager.loadAllSettings();
        
        // Verify settings were saved correctly
        console.assert(settingsManager.dataSettings.offlineMode === true, 'Offline mode setting not saved correctly');
        console.assert(settingsManager.dataSettings.offlineData.maps === true, 'Maps offline setting not saved correctly');
        console.assert(settingsManager.dataSettings.offlineData.contacts === false, 'Contacts offline setting not saved correctly');
        console.assert(settingsManager.dataSettings.offlineData.guides === true, 'Guides offline setting not saved correctly');
        console.assert(settingsManager.dataSettings.offlineData.shelters === false, 'Shelters offline setting not saved correctly');
        
        console.log('Data settings tests passed!');
    },
    
    testAccountSettings: function() {
        console.log('Testing account settings...');
        
        // Create test settings
        const testAccountSettings = {
            profile: {
                name: 'Test User',
                email: 'test@example.com',
                phone: '9876543210'
            },
            privacy: {
                shareLocation: false,
                anonymousReports: true,
                usageAnalytics: false
            }
        };
        
        // Save settings
        settingsManager.saveAccountSettings(testAccountSettings);
        
        // Load settings
        settingsManager.loadAllSettings();
        
        // Verify settings were saved correctly
        console.assert(settingsManager.accountSettings.profile.name === 'Test User', 'Profile name setting not saved correctly');
        console.assert(settingsManager.accountSettings.profile.email === 'test@example.com', 'Profile email setting not saved correctly');
        console.assert(settingsManager.accountSettings.profile.phone === '9876543210', 'Profile phone setting not saved correctly');
        console.assert(settingsManager.accountSettings.privacy.shareLocation === false, 'Share location setting not saved correctly');
        console.assert(settingsManager.accountSettings.privacy.anonymousReports === true, 'Anonymous reports setting not saved correctly');
        console.assert(settingsManager.accountSettings.privacy.usageAnalytics === false, 'Usage analytics setting not saved correctly');
        
        console.log('Account settings tests passed!');
    }
};

// Run tests when this script is loaded directly
if (typeof window !== 'undefined' && window.location.pathname.includes('test.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        // Wait for settings manager to initialize
        setTimeout(() => {
            testSettings.runTests();
        }, 500);
    });
}