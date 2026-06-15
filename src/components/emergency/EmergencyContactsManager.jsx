import { useState, useEffect } from 'react';

export default function EmergencyContactsManager({ isOpen, onClose }) {
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: '' });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = () => {
    const savedContacts = localStorage.getItem('emergency_contacts');
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
    }
  };

  const saveContacts = (updatedContacts) => {
    localStorage.setItem('emergency_contacts', JSON.stringify(updatedContacts));
    setContacts(updatedContacts);
  };

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) {
      alert('Please fill in name and phone number');
      return;
    }

    const updatedContacts = [...contacts, { ...newContact, id: Date.now() }];
    saveContacts(updatedContacts);
    setNewContact({ name: '', phone: '', relationship: '' });
    setIsAdding(false);
  };

  const handleDeleteContact = (id) => {
    const updatedContacts = contacts.filter(contact => contact.id !== id);
    saveContacts(updatedContacts);
  };

  const handleMakePrimary = (id) => {
    const updatedContacts = contacts.map(contact => ({
      ...contact,
      isPrimary: contact.id === id
    }));
    saveContacts(updatedContacts);
  };

  if (!isOpen) return null;

  return (
    <div className="emergency-contacts-modal">
      <div className="emergency-contacts-content">
        <div className="emergency-contacts-header">
          <h2>🆘 Emergency Contacts</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="contacts-info">
          <p>These contacts will receive your location and emergency alerts when you activate the emergency button.</p>
        </div>

        <div className="contacts-list">
          {contacts.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📱</span>
              <p>No emergency contacts added</p>
              <p className="empty-hint">Add contacts who should be notified in case of emergency</p>
            </div>
          ) : (
            contacts.map((contact) => (
              <div key={contact.id} className={`contact-card ${contact.isPrimary ? 'primary' : ''}`}>
                <div className="contact-info">
                  <div className="contact-name">
                    {contact.name}
                    {contact.isPrimary && <span className="primary-badge">PRIMARY</span>}
                  </div>
                  <div className="contact-phone">{contact.phone}</div>
                  {contact.relationship && <div className="contact-relationship">{contact.relationship}</div>}
                </div>
                <div className="contact-actions">
                  {!contact.isPrimary && (
                    <button 
                      className="action-btn primary-btn"
                      onClick={() => handleMakePrimary(contact.id)}
                      title="Make primary contact"
                    >
                      ⭐
                    </button>
                  )}
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteContact(contact.id)}
                    title="Remove contact"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {!isAdding ? (
          <button className="add-contact-btn" onClick={() => setIsAdding(true)}>
            + Add Emergency Contact
          </button>
        ) : (
          <div className="add-contact-form">
            <h3>Add New Contact</h3>
            <input
              type="text"
              placeholder="Contact Name"
              value={newContact.name}
              onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
            />
            <input
              type="tel"
              placeholder="Phone Number (e.g., +2547...)"
              value={newContact.phone}
              onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
            />
            <input
              type="text"
              placeholder="Relationship (e.g., Parent, Spouse)"
              value={newContact.relationship}
              onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
            />
            <div className="form-actions">
              <button className="cancel-btn" onClick={() => setIsAdding(false)}>Cancel</button>
              <button className="save-btn" onClick={handleAddContact}>Save Contact</button>
            </div>
          </div>
        )}

        <div className="emergency-tips">
          <h4>💡 Tips:</h4>
          <ul>
            <li>Add at least 2-3 emergency contacts</li>
            <li>Include family members and close friends</li>
            <li>Mark your most trusted contact as primary</li>
            <li>Keep phone numbers updated</li>
          </ul>
        </div>
      </div>

      <style jsx>{`
        .emergency-contacts-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 20px;
        }

        .emergency-contacts-content {
          background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
          padding: 32px;
          border-radius: 16px;
          max-width: 500px;
          width: 100%;
          border: 2px solid #FF0000;
          box-shadow: 0 0 40px rgba(255, 0, 0, 0.3);
          max-height: 90vh;
          overflow-y: auto;
        }

        .emergency-contacts-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .emergency-contacts-header h2 {
          color: #FF0000;
          margin: 0;
          font-size: 24px;
        }

        .close-btn {
          background: none;
          border: none;
          color: #fff;
          font-size: 32px;
          cursor: pointer;
          padding: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background 0.3s;
        }

        .close-btn:hover {
          background: rgba(255, 0, 0, 0.2);
        }

        .contacts-info {
          background: rgba(255, 0, 0, 0.1);
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 24px;
          border-left: 4px solid #FF0000;
        }

        .contacts-info p {
          margin: 0;
          color: #ccc;
          font-size: 14px;
        }

        .contacts-list {
          margin-bottom: 24px;
          max-height: 300px;
          overflow-y: auto;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #666;
        }

        .empty-icon {
          font-size: 48px;
          display: block;
          margin-bottom: 16px;
        }

        .empty-hint {
          font-size: 12px;
          margin-top: 8px;
        }

        .contact-card {
          background: rgba(255, 255, 255, 0.05);
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s;
        }

        .contact-card:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .contact-card.primary {
          border: 2px solid #FFD700;
          background: rgba(255, 215, 0, 0.1);
        }

        .contact-info {
          flex: 1;
        }

        .contact-name {
          font-weight: bold;
      color: #fff;
      font-size: 16px;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .primary-badge {
      background: #FFD700;
      color: #000;
      font-size: 10px;
      padding: 2px 8px;
      border-radius: 10px;
      font-weight: bold;
    }

    .contact-phone {
      color: #00FF88;
      font-size: 14px;
      margin-bottom: 4px;
    }

    .contact-relationship {
      color: #888;
      font-size: 12px;
    }

    .contact-actions {
      display: flex;
      gap: 8px;
    }

    .action-btn {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: #fff;
      padding: 8px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.3s;
    }

    .action-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .primary-btn:hover {
      background: rgba(255, 215, 0, 0.3);
    }

    .delete-btn:hover {
      background: rgba(255, 0, 0, 0.3);
    }

    .add-contact-btn {
      width: 100%;
      background: #FF0000;
      color: white;
      border: none;
      padding: 16px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s;
    }

    .add-contact-btn:hover {
      background: #cc0000;
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(255, 0, 0, 0.4);
    }

    .add-contact-form {
      background: rgba(0, 0, 0, 0.3);
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 24px;
      border: 1px solid rgba(255, 0, 0, 0.3);
    }

    .add-contact-form h3 {
      color: #FF0000;
      margin: 0 0 16px 0;
      font-size: 18px;
    }

    .add-contact-form input {
      width: 100%;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 12px;
      font-size: 14px;
    }

    .add-contact-form input:focus {
      outline: none;
      border-color: #FF0000;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 16px;
    }

    .cancel-btn {
      flex: 1;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: none;
      padding: 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .cancel-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .save-btn {
      flex: 1;
      background: #00FF88;
      color: #000;
      border: none;
      padding: 12px;
      border-radius: 6px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s;
    }

    .save-btn:hover {
      background: #00cc6a;
    }

    .emergency-tips {
      background: rgba(0, 212, 255, 0.1);
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid #00D4FF;
    }

    .emergency-tips h4 {
      color: #00D4FF;
      margin: 0 0 12px 0;
      font-size: 14px;
    }

    .emergency-tips ul {
      margin: 0;
      padding-left: 20px;
      color: #ccc;
      font-size: 13px;
    }

    .emergency-tips li {
      margin-bottom: 8px;
    }
      `}</style>
    </div>
  );
}
