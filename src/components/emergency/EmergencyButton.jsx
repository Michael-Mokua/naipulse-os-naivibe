import { useState, useEffect, useRef } from 'react';
import EmergencyContactsManager from './EmergencyContactsManager.jsx';
import emergencyService from '../../services/emergencyService.js';

const EMERGENCY_ACCENT = '#FF0000';

export default function EmergencyButton() {
  const [isActive, setIsActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSendingLocation, setIsSendingLocation] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [location, setLocation] = useState(null);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [alertStatus, setAlertStatus] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const countdownRef = useRef(null);
  const locationIntervalRef = useRef(null);

  useEffect(() => {
    // Load emergency contacts from localStorage
    const savedContacts = localStorage.getItem('emergency_contacts');
    if (savedContacts) {
      setEmergencyContacts(JSON.parse(savedContacts));
    }
  }, []);

  const startEmergencySequence = () => {
    if (isActive) return;
    
    setIsActive(true);
    setCountdown(3);
    
    // Countdown sequence
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          activateEmergency();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const activateEmergency = async () => {
    // Get current location
    setIsSendingLocation(true);
    try {
      const position = await getCurrentLocation();
      setLocation(position);
      
      // Start audio recording
      await startRecording();
      
      // Send location to emergency contacts
      await sendEmergencyAlert(position);
      
      // Start live location tracking
      startLiveLocationTracking();
      
    } catch (error) {
      console.error('Emergency activation failed:', error);
    }
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          });
        },
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        // Upload audio to Supabase storage (to be implemented)
        console.log('Audio recording saved:', audioBlob);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendEmergencyAlert = async (position) => {
    // Send location to emergency contacts via SMS/WhatsApp
    try {
      const results = await emergencyService.sendEmergencyAlert(
        emergencyContacts,
        position,
        'EMERGENCY ALERT! I need help immediately.'
      );
      
      setAlertStatus({
        sent: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        total: results.length
      });
      
      console.log('Emergency alert results:', results);
    } catch (error) {
      console.error('Failed to send emergency alerts:', error);
      setAlertStatus({
        sent: 0,
        failed: emergencyContacts.length,
        total: emergencyContacts.length,
        error: error.message
      });
    }
    
    setIsSendingLocation(false);
  };

  const startLiveLocationTracking = () => {
    locationIntervalRef.current = setInterval(async () => {
      try {
        const position = await getCurrentLocation();
        setLocation(position);
        // Update live location to contacts
      } catch (error) {
        console.error('Location tracking error:', error);
      }
    }, 30000); // Update every 30 seconds
  };

  const stopEmergency = () => {
    setIsActive(false);
    setIsRecording(false);
    setIsSendingLocation(false);
    setCountdown(0);
    
    // Stop recording
    stopRecording();
    
    // Stop location tracking
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
    }
    
    // Stop countdown
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
  };

  const handleManageContacts = () => {
    setShowContactsModal(true);
  };

  return (
    <>
      <div className="emergency-button-container">
        {isActive ? (
          <button
            className="emergency-button active"
            onClick={stopEmergency}
            style={{
              background: EMERGENCY_ACCENT,
              animation: 'pulse 1s infinite'
            }}
          >
            <div className="emergency-button-content">
              {countdown > 0 ? (
                <span className="countdown">{countdown}</span>
              ) : (
                <>
                  <span className="emergency-icon">🚨</span>
                  <span className="emergency-text">STOP EMERGENCY</span>
                  {isRecording && <span className="recording-indicator">● REC</span>}
                </>
              )}
            </div>
          </button>
        ) : (
          <button
            className="emergency-button"
            onClick={startEmergencySequence}
            style={{ background: EMERGENCY_ACCENT }}
          >
            <div className="emergency-button-content">
              <span className="emergency-icon">🆘</span>
              <span className="emergency-text">EMERGENCY</span>
            </div>
          </button>
        )}
        
        <button
          className="manage-contacts-btn"
          onClick={handleManageContacts}
          style={{ color: EMERGENCY_ACCENT }}
        >
          ⚙️ Contacts
        </button>
      </div>

      <EmergencyContactsManager 
        isOpen={showContactsModal} 
        onClose={() => setShowContactsModal(false)}
      />

      <style jsx>{`
        .emergency-button-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 1000;
        }

        .emergency-button {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(255, 0, 0, 0.4);
          transition: all 0.3s ease;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        .emergency-button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 30px rgba(255, 0, 0, 0.6);
        }

        .emergency-button:active {
          transform: scale(0.95);
        }

        .emergency-button.active {
          width: 100px;
          height: 100px;
        }

        .emergency-button-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          color: white;
          font-weight: bold;
        }

        .emergency-icon {
          font-size: 24px;
        }

        .emergency-text {
          font-size: 10px;
          text-align: center;
        }

        .countdown {
          font-size: 36px;
          font-weight: bold;
        }

        .recording-indicator {
          font-size: 12px;
          color: #ff0000;
          animation: blink 1s infinite;
        }

        .manage-contacts-btn {
          background: rgba(0, 0, 0, 0.8);
          color: white;
          border: 2px solid #FF0000;
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 12px;
          align-self: center;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          min-height: 44px;
          min-width: 44px;
        }

        .manage-contacts-btn:active {
          transform: scale(0.95);
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes blink {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @media (max-width: 768px) {
          .emergency-button-container {
            bottom: 16px;
            right: 16px;
          }

          .emergency-button {
            width: 64px;
            height: 64px;
          }

          .emergency-button.active {
            width: 80px;
            height: 80px;
          }

          .emergency-icon {
            font-size: 20px;
          }

          .emergency-text {
            font-size: 8px;
          }

          .countdown {
            font-size: 32px;
          }

          .manage-contacts-btn {
            padding: 6px 12px;
            font-size: 10px;
          }
        }

        @media (max-width: 480px) {
          .emergency-button-container {
            bottom: 12px;
            right: 12px;
          }

          .emergency-button {
            width: 56px;
            height: 56px;
          }

          .emergency-button.active {
            width: 72px;
            height: 72px;
          }

          .emergency-icon {
            font-size: 18px;
          }

          .emergency-text {
            font-size: 7px;
          }

          .countdown {
            font-size: 28px;
          }

          .manage-contacts-btn {
            padding: 5px 10px;
            font-size: 9px;
          }
        }
      `}</style>
    </>
  );
}
