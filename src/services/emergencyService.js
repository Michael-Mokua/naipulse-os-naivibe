// Emergency Service for SMS/Location Sharing
// This service handles sending emergency alerts via SMS and sharing location

class EmergencyService {
  constructor() {
    this.twilioAccountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
    this.twilioAuthToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
    this.twilioPhoneNumber = import.meta.env.VITE_TWILIO_PHONE_NUMBER;
  }

  /**
   * Send emergency SMS alert to contacts
   * @param {Array} contacts - Array of emergency contacts
   * @param {Object} location - User's current location
   * @param {string} message - Custom emergency message
   */
  async sendEmergencyAlert(contacts, location, message = 'EMERGENCY! I need help.') {
    const locationUrl = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
    const fullMessage = `${message}\n\nMy Location: ${locationUrl}\n\nTimestamp: ${new Date().toLocaleString()}`;

    const results = [];

    for (const contact of contacts) {
      try {
        // In production, this would call Twilio API
        // For now, we'll simulate the SMS sending
        const result = await this.sendSMS(contact.phone, fullMessage);
        results.push({
          contact: contact.name,
          phone: contact.phone,
          success: true,
          timestamp: new Date().toISOString()
        });
        
        console.log(`Emergency alert sent to ${contact.name} (${contact.phone})`);
      } catch (error) {
        results.push({
          contact: contact.name,
          phone: contact.phone,
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
        
        console.error(`Failed to send alert to ${contact.name}:`, error);
      }
    }

    return results;
  }

  /**
   * Send SMS via Twilio
   * @param {string} to - Recipient phone number
   * @param {string} message - SMS message
   */
  async sendSMS(to, message) {
    if (!this.twilioAccountSid || !this.twilioAuthToken || !this.twilioPhoneNumber) {
      // Simulate SMS sending for development
      console.log(`[SIMULATED SMS] To: ${to}\nMessage: ${message}`);
      return { success: true, simulated: true };
    }

    // In production, use actual Twilio API
    // This requires a backend server to protect credentials
    const response = await fetch('/api/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        message,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send SMS');
    }

    return await response.json();
  }

  /**
   * Share location via WhatsApp
   * @param {string} phone - Phone number
   * @param {Object} location - User's location
   */
  shareViaWhatsApp(phone, location) {
    const locationUrl = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
    const message = `EMERGENCY! I need help. My location: ${locationUrl}`;
    const whatsappUrl = `https://wa.me/${phone.replace('+', '')}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
  }

  /**
   * Generate Google Maps link for location
   * @param {Object} location - Location object with latitude and longitude
   */
  generateMapsLink(location) {
    return `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
  }

  /**
   * Format location for display
   * @param {Object} location - Location object
   */
  formatLocation(location) {
    return {
      latitude: location.latitude.toFixed(6),
      longitude: location.longitude.toFixed(6),
      accuracy: location.accuracy ? `±${Math.round(location.accuracy)}m` : 'Unknown',
      mapsLink: this.generateMapsLink(location),
      timestamp: new Date(location.timestamp).toLocaleString()
    };
  }

  /**
   * Get nearby emergency services
   * @param {Object} location - User's location
   * @param {string} type - Type of service (police, hospital, etc.)
   */
  async getNearbyServices(location, type = 'all') {
    // This would integrate with Google Places API or similar
    // For now, return mock data
    const mockServices = {
      police: [
        { name: 'Nairobi Central Police Station', distance: '1.2km', phone: '+254722123456' },
        { name: 'Kilimani Police Station', distance: '2.5km', phone: '+254722123457' },
      ],
      hospital: [
        { name: 'Nairobi Hospital', distance: '0.8km', phone: '+254720123456' },
        { name: 'Kenyatta National Hospital', distance: '3.2km', phone: '+254720123457' },
      ],
    };

    return type === 'all' ? mockServices : mockServices[type] || [];
  }
}

export default new EmergencyService();
