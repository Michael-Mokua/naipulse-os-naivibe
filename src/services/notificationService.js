// Smart Notification Service for Naipulse OS
// Handles location-based, context-aware, and smart notifications

class NotificationService {
  constructor() {
    this.notifications = [];
    this.userPreferences = {
      safety: true,
      community: true,
      chat: true,
      events: true,
      carpool: true,
      marketplace: true,
      news: true,
      locationBased: true
    };
    this.userLocation = null;
    this.notificationQueue = [];
    this.isInitialized = false;
  }

  // Initialize the notification service
  async initialize() {
    if (this.isInitialized) return;

    // Request notification permission
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted');
      }
    }

    // Get user location
    this.getUserLocation();

    // Start location monitoring
    this.startLocationMonitoring();

    // Load user preferences
    this.loadUserPreferences();

    this.isInitialized = true;
  }

  // Get user's current location
  getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          console.log('User location updated:', this.userLocation);
        },
        (error) => {
          console.error('Location error:', error);
        }
      );
    }
  }

  // Start monitoring location changes
  startLocationMonitoring() {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          this.userLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          this.checkLocationBasedNotifications();
        },
        (error) => {
          console.error('Location monitoring error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    }
  }

  // Check for location-based notifications
  checkLocationBasedNotifications() {
    if (!this.userLocation || !this.userPreferences.locationBased) return;

    // In production, this would check against database for nearby alerts
    // For now, we'll simulate with mock data
    const nearbyAlerts = this.getNearbyAlerts(this.userLocation);
    nearbyAlerts.forEach(alert => {
      this.sendNotification(alert.type, alert.title, alert.message, alert.data);
    });
  }

  // Get nearby alerts based on location (mock implementation)
  getNearbyAlerts(location) {
    // In production, this would query Supabase for alerts within a radius
    // For now, return empty array
    return [];
  }

  // Send a notification
  sendNotification(type, title, message, data = {}, priority = 'normal') {
    if (!this.userPreferences[type]) return;

    const notification = {
      id: Date.now(),
      type,
      title,
      message,
      data,
      priority,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    // Add to notifications list
    this.notifications.unshift(notification);

    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: type,
        requireInteraction: priority === 'urgent'
      });
    }

    // Trigger custom event for UI to handle
    window.dispatchEvent(new CustomEvent('naipulse-notification', {
      detail: notification
    }));

    return notification;
  }

  // Safety notifications
  sendSafetyAlert(title, message, data = {}) {
    return this.sendNotification('safety', title, message, data, 'urgent');
  }

  // Community notifications
  sendCommunityAlert(title, message, data = {}) {
    return this.sendNotification('community', title, message, data, 'normal');
  }

  // Chat notifications
  sendChatNotification(title, message, data = {}) {
    return this.sendNotification('chat', title, message, data, 'normal');
  }

  // Event notifications
  sendEventNotification(title, message, data = {}) {
    return this.sendNotification('event', title, message, data, 'normal');
  }

  // Carpool notifications
  sendCarpoolNotification(title, message, data = {}) {
    return this.sendNotification('carpool', title, message, data, 'normal');
  }

  // Marketplace notifications
  sendMarketplaceNotification(title, message, data = {}) {
    return this.sendNotification('marketplace', title, message, data, 'normal');
  }

  // News notifications
  sendNewsNotification(title, message, data = {}) {
    return this.sendNotification('news', title, message, data, 'low');
  }

  // Smart notification based on context
  sendSmartNotification(context, data) {
    switch (context) {
      case 'crime_nearby':
        return this.sendSafetyAlert(
          '🚨 Crime Alert Nearby',
          `Crime reported in your area. Stay safe!`,
          data
        );
      case 'traffic_update':
        return this.sendCommunityAlert(
          '🚗 Traffic Update',
          'Heavy traffic reported on your route',
          data
        );
      case 'weather_alert':
        return this.sendSafetyAlert(
          '🌧️ Weather Alert',
          'Heavy rain expected. Plan accordingly.',
          data
        );
      case 'event_nearby':
        return this.sendEventNotification(
          '🎉 Event Nearby',
          'An event is happening near you!',
          data
        );
      case 'carpool_match':
        return this.sendCarpoolNotification(
          '🚗 Carpool Match Found',
          'Someone is offering a ride on your route',
          data
        );
      case 'marketplace_interest':
        return this.sendMarketplaceNotification(
          '🛍️ Item Interest',
          'Someone is interested in your listing',
          data
        );
      case 'community_alert':
        return this.sendCommunityAlert(
          '👀 Community Alert',
          'New alert in your area',
          data
        );
      default:
        return this.sendNotification(
          'info',
          'Notification',
          'You have a new notification',
          data
        );
    }
  }

  // Mark notification as read
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
    }
  }

  // Mark all notifications as read
  markAllAsRead() {
    this.notifications.forEach(n => n.isRead = true);
  }

  // Get unread notifications
  getUnreadNotifications() {
    return this.notifications.filter(n => !n.isRead);
  }

  // Get notifications by type
  getNotificationsByType(type) {
    return this.notifications.filter(n => n.type === type);
  }

  // Clear all notifications
  clearAllNotifications() {
    this.notifications = [];
  }

  // Update user preferences
  updatePreferences(preferences) {
    this.userPreferences = { ...this.userPreferences, ...preferences };
    this.saveUserPreferences();
  }

  // Load user preferences from localStorage
  loadUserPreferences() {
    try {
      const saved = localStorage.getItem('naipulse_notification_preferences');
      if (saved) {
        this.userPreferences = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
  }

  // Save user preferences to localStorage
  saveUserPreferences() {
    try {
      localStorage.setItem('naipulse_notification_preferences', JSON.stringify(this.userPreferences));
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
    }
  }

  // Get notification count
  getNotificationCount() {
    return this.getUnreadNotifications().length;
  }

  // Schedule a notification for later
  scheduleNotification(delayMs, type, title, message, data = {}) {
    setTimeout(() => {
      this.sendNotification(type, title, message, data);
    }, delayMs);
  }

  // Proactive notifications based on time and location
  sendProactiveNotifications() {
    const now = new Date();
    const hour = now.getHours();

    // Morning commute notifications (7-9 AM)
    if (hour >= 7 && hour <= 9) {
      this.sendCommunityAlert(
        '🌅 Morning Commute',
        'Check traffic conditions before you leave',
        { context: 'morning_commute' }
      );
    }

    // Evening safety reminders (6-8 PM)
    if (hour >= 18 && hour <= 20) {
      this.sendSafetyAlert(
        '🌙 Evening Safety',
        'Stay safe on your way home. Share your route with contacts.',
        { context: 'evening_safety' }
      );
    }

    // Weekend events
    if (now.getDay() === 0 || now.getDay() === 6) {
      this.sendEventNotification(
        '🎉 Weekend Vibes',
        'Check out events happening this weekend!',
        { context: 'weekend_events' }
      );
    }
  }

  // Notification digest (summary of recent notifications)
  sendNotificationDigest() {
    const recentNotifications = this.getUnreadNotifications().slice(0, 5);
    if (recentNotifications.length === 0) return;

    const summary = recentNotifications.map(n => n.title).join(', ');
    this.sendNotification(
      'info',
      '📬 Notification Digest',
      `You have ${recentNotifications.length} new notifications: ${summary}`,
      { notifications: recentNotifications }
    );
  }

  // Emergency notification (highest priority)
  sendEmergencyNotification(title, message, data = {}) {
    const notification = {
      id: Date.now(),
      type: 'emergency',
      title,
      message,
      data,
      priority: 'urgent',
      timestamp: new Date().toISOString(),
      isRead: false
    };

    // Show immediately with high priority
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'emergency',
        requireInteraction: true,
        vibrate: [200, 100, 200]
      });
    }

    // Play sound if available
    this.playNotificationSound('emergency');

    this.notifications.unshift(notification);

    window.dispatchEvent(new CustomEvent('naipulse-emergency', {
      detail: notification
    }));

    return notification;
  }

  // Play notification sound
  playNotificationSound(type = 'default') {
    try {
      // In production, you'd have actual sound files
      // For now, this is a placeholder
      console.log(`Playing ${type} notification sound`);
    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  }

  // Get notification statistics
  getNotificationStats() {
    const stats = {
      total: this.notifications.length,
      unread: this.getUnreadNotifications().length,
      byType: {}
    };

    this.notifications.forEach(n => {
      stats.byType[n.type] = (stats.byType[n.type] || 0) + 1;
    });

    return stats;
  }
}

export default new NotificationService();
