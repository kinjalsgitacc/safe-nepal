// Push Notification Service for SafeNepal

const pushService = {
    // Configuration
    config: {
        vapidPublicKey: 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U', // Replace with your VAPID public key in production
        applicationServerKey: null,
        registration: null,
        subscription: null,
        isSubscribed: false,
        swRegistration: null
    },
    
    // Initialize push service
    init() {
        // Check if service workers and push messaging are supported
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.warn('Push notifications are not supported by this browser');
            return false;
        }
        
        // Convert VAPID key to application server key
        this.config.applicationServerKey = this.urlB64ToUint8Array(this.config.vapidPublicKey);
        
        // Register service worker and initialize push messaging
        this.registerServiceWorker()
            .then(() => {
                console.log('Service worker registered successfully');
                return this.initializePushMessaging();
            })
            .then(() => {
                console.log('Push messaging initialized');
                this.updateSubscriptionStatus();
            })
            .catch(error => {
                console.error('Error initializing push service:', error);
            });
        
        return true;
    },
    
    // Register service worker
    async registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('/service-worker.js');
            this.config.swRegistration = registration;
            
            // Check if service worker is active
            if (registration.active) {
                console.log('Service worker is active');
            }
            
            return registration;
        } catch (error) {
            console.error('Service worker registration failed:', error);
            throw error;
        }
    },
    
    // Initialize push messaging
    async initializePushMessaging() {
        try {
            if (!this.config.swRegistration) {
                throw new Error('Service worker registration not found');
            }
            
            // Check if already subscribed
            const subscription = await this.config.swRegistration.pushManager.getSubscription();
            this.config.isSubscribed = subscription !== null;
            this.config.subscription = subscription;
            
            if (this.config.isSubscribed) {
                console.log('User is already subscribed to push notifications');
            } else {
                console.log('User is not subscribed to push notifications');
            }
            
            return true;
        } catch (error) {
            console.error('Error initializing push messaging:', error);
            throw error;
        }
    },
    
    // Subscribe to push notifications
    async subscribe() {
        try {
            if (!this.config.swRegistration) {
                throw new Error('Service worker registration not found');
            }
            
            // Request permission
            const permission = await this.requestNotificationPermission();
            if (permission !== 'granted') {
                throw new Error('Notification permission denied');
            }
            
            // Subscribe to push notifications
            const subscription = await this.config.swRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.config.applicationServerKey
            });
            
            console.log('User subscribed to push notifications');
            this.config.subscription = subscription;
            this.config.isSubscribed = true;
            
            // Send subscription to server
            await this.sendSubscriptionToServer(subscription);
            
            this.updateSubscriptionStatus();
            return subscription;
        } catch (error) {
            console.error('Error subscribing to push notifications:', error);
            throw error;
        }
    },
    
    // Unsubscribe from push notifications
    async unsubscribe() {
        try {
            if (!this.config.subscription) {
                throw new Error('No subscription found');
            }
            
            // Unsubscribe from push notifications
            await this.config.subscription.unsubscribe();
            
            console.log('User unsubscribed from push notifications');
            this.config.subscription = null;
            this.config.isSubscribed = false;
            
            // Send unsubscription to server
            await this.sendUnsubscriptionToServer();
            
            this.updateSubscriptionStatus();
            return true;
        } catch (error) {
            console.error('Error unsubscribing from push notifications:', error);
            throw error;
        }
    },
    
    // Request notification permission
    async requestNotificationPermission() {
        try {
            const permission = await Notification.requestPermission();
            return permission;
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            throw error;
        }
    },
    
    // Send subscription to server
    async sendSubscriptionToServer(subscription) {
        // In a real application, this would send the subscription to your server
        // For this demo, we'll just log it to the console
        console.log('Sending subscription to server:', subscription);
        
        // Store subscription in localStorage for demo purposes
        localStorage.setItem('safeNepal_pushSubscription', JSON.stringify(subscription));
        
        // Simulate server response
        return new Promise(resolve => {
            setTimeout(() => {
                console.log('Subscription sent to server successfully');
                resolve(true);
            }, 500);
        });
    },
    
    // Send unsubscription to server
    async sendUnsubscriptionToServer() {
        // In a real application, this would send the unsubscription to your server
        // For this demo, we'll just log it to the console
        console.log('Sending unsubscription to server');
        
        // Remove subscription from localStorage for demo purposes
        localStorage.removeItem('safeNepal_pushSubscription');
        
        // Simulate server response
        return new Promise(resolve => {
            setTimeout(() => {
                console.log('Unsubscription sent to server successfully');
                resolve(true);
            }, 500);
        });
    },
    
    // Update subscription status UI
    updateSubscriptionStatus() {
        // Dispatch event for other components to listen to
        const event = new CustomEvent('push_subscription_updated', {
            detail: {
                isSubscribed: this.config.isSubscribed,
                subscription: this.config.subscription
            }
        });
        document.dispatchEvent(event);
        
        // Update UI elements if they exist
        const subscribeButton = document.getElementById('push-subscribe-btn');
        const unsubscribeButton = document.getElementById('push-unsubscribe-btn');
        const subscriptionStatus = document.getElementById('push-subscription-status');
        
        if (subscribeButton) {
            subscribeButton.disabled = this.config.isSubscribed;
        }
        
        if (unsubscribeButton) {
            unsubscribeButton.disabled = !this.config.isSubscribed;
        }
        
        if (subscriptionStatus) {
            subscriptionStatus.textContent = this.config.isSubscribed ? 'Subscribed' : 'Not subscribed';
            subscriptionStatus.className = this.config.isSubscribed ? 'text-success' : 'text-danger';
        }
    },
    
    // Send a test notification
    async sendTestNotification() {
        if (!this.config.isSubscribed) {
            console.warn('Cannot send test notification: User is not subscribed');
            return false;
        }
        
        // In a real application, this would be handled by your server
        // For this demo, we'll use the service worker to show a notification
        if (this.config.swRegistration) {
            try {
                await this.config.swRegistration.showNotification('SafeNepal Test Notification', {
                    body: 'This is a test notification from SafeNepal.',
                    icon: '/images/icons/icon-128x128.png',
                    badge: '/images/icons/badge-72x72.png',
                    vibrate: [100, 50, 100],
                    data: {
                        type: 'test',
                        url: window.location.origin
                    },
                    actions: [
                        {
                            action: 'explore',
                            title: 'View Details'
                        },
                        {
                            action: 'close',
                            title: 'Close'
                        }
                    ]
                });
                console.log('Test notification sent');
                return true;
            } catch (error) {
                console.error('Error sending test notification:', error);
                return false;
            }
        } else {
            console.warn('Cannot send test notification: Service worker registration not found');
            return false;
        }
    },
    
    // Utility function to convert base64 to Uint8Array
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
    },
    
    // Check if push notifications are supported
    isPushSupported() {
        return ('serviceWorker' in navigator) && ('PushManager' in window);
    },
    
    // Check if notifications are enabled
    async areNotificationsEnabled() {
        if (!('Notification' in window)) {
            return false;
        }
        
        if (Notification.permission === 'granted') {
            return true;
        }
        
        if (Notification.permission === 'denied') {
            return false;
        }
        
        return null; // Permission not determined yet
    },
    
    // Get subscription as JSON string
    getSubscriptionJSON() {
        if (!this.config.subscription) {
            return null;
        }
        
        return JSON.stringify(this.config.subscription);
    },
    
    // Create subscription settings UI
    createSubscriptionUI(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // Check if push is supported
        if (!this.isPushSupported()) {
            container.innerHTML = `
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Push notifications are not supported by this browser.
                </div>
            `;
            return;
        }
        
        // Create UI
        container.innerHTML = `
            <div class="card border-primary mb-4">
                <div class="card-header bg-primary text-white">
                    <h5 class="mb-0"><i class="fas fa-bell me-2"></i> Push Notification Settings</h5>
                </div>
                <div class="card-body">
                    <div class="mb-3">
                        <p>Receive important alerts even when you're not using the app.</p>
                        <div class="d-flex align-items-center mb-2">
                            <span class="me-2">Status:</span>
                            <span id="push-subscription-status" class="${this.config.isSubscribed ? 'text-success' : 'text-danger'}">
                                ${this.config.isSubscribed ? 'Subscribed' : 'Not subscribed'}
                            </span>
                        </div>
                    </div>
                    <div class="d-grid gap-2">
                        <button id="push-subscribe-btn" class="btn btn-primary" ${this.config.isSubscribed ? 'disabled' : ''}>
                            <i class="fas fa-bell me-1"></i> Subscribe to Notifications
                        </button>
                        <button id="push-unsubscribe-btn" class="btn btn-outline-danger" ${!this.config.isSubscribed ? 'disabled' : ''}>
                            <i class="fas fa-bell-slash me-1"></i> Unsubscribe from Notifications
                        </button>
                        <button id="push-test-btn" class="btn btn-outline-secondary" ${!this.config.isSubscribed ? 'disabled' : ''}>
                            <i class="fas fa-paper-plane me-1"></i> Send Test Notification
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners
        const subscribeButton = document.getElementById('push-subscribe-btn');
        const unsubscribeButton = document.getElementById('push-unsubscribe-btn');
        const testButton = document.getElementById('push-test-btn');
        
        if (subscribeButton) {
            subscribeButton.addEventListener('click', async () => {
                subscribeButton.disabled = true;
                subscribeButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Subscribing...';
                
                try {
                    await this.subscribe();
                    testButton.disabled = false;
                } catch (error) {
                    console.error('Error subscribing:', error);
                    alert('Failed to subscribe to push notifications. Please try again.');
                    subscribeButton.disabled = false;
                }
                
                subscribeButton.innerHTML = '<i class="fas fa-bell me-1"></i> Subscribe to Notifications';
            });
        }
        
        if (unsubscribeButton) {
            unsubscribeButton.addEventListener('click', async () => {
                unsubscribeButton.disabled = true;
                unsubscribeButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Unsubscribing...';
                
                try {
                    await this.unsubscribe();
                    testButton.disabled = true;
                } catch (error) {
                    console.error('Error unsubscribing:', error);
                    alert('Failed to unsubscribe from push notifications. Please try again.');
                    unsubscribeButton.disabled = false;
                }
                
                unsubscribeButton.innerHTML = '<i class="fas fa-bell-slash me-1"></i> Unsubscribe from Notifications';
            });
        }
        
        if (testButton) {
            testButton.addEventListener('click', async () => {
                testButton.disabled = true;
                testButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...';
                
                try {
                    await this.sendTestNotification();
                } catch (error) {
                    console.error('Error sending test notification:', error);
                    alert('Failed to send test notification. Please try again.');
                }
                
                testButton.disabled = false;
                testButton.innerHTML = '<i class="fas fa-paper-plane me-1"></i> Send Test Notification';
            });
        }
    }
};

// Initialize push service when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if push service should be initialized
    const shouldInitPush = localStorage.getItem('safeNepal_initPushOnLoad');
    if (shouldInitPush === 'true') {
        pushService.init();
    }
});