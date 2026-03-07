"use client";

import { useState, useEffect } from "react";
import { LoadingSpinner } from "../../components/Loading";
import { getApiUrl } from "../../../lib/apiUrl";

export default function ContactManagement() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    fetchContacts();
  }, [filter]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const url = filter === 'all' 
        ? getApiUrl('/api/admin/contacts')
        : getApiUrl(`/api/admin/contacts?status=${filter}`);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setContacts(data.data || []);
      } else {
        console.error("Failed to fetch contacts:", response.status);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateContactStatus = async (contactId, status) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(getApiUrl(`/api/admin/contacts/${contactId}/status`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchContacts();
        if (selectedContact && selectedContact._id === contactId) {
          setSelectedContact(null);
        }
      }
    } catch (error) {
      console.error("Error updating contact status:", error);
    }
  };

  const deleteContact = async (contactId) => {
    if (!confirm('Are you sure you want to delete this contact message?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(getApiUrl(`/api/admin/contacts/${contactId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchContacts();
        if (selectedContact && selectedContact._id === contactId) {
          setSelectedContact(null);
        }
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      new: 'bg-blue-100 text-blue-800',
      read: 'bg-yellow-100 text-yellow-800',
      replied: 'bg-green-100 text-green-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      new: '📬',
      read: '📭',
      replied: '✅'
    };
    return icons[status] || '📧';
  };

  const filteredContacts = contacts;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Contact Messages</h2>
        
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All ({contacts.length})
          </button>
          <button
            onClick={() => setFilter('new')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'new'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            New ({contacts.filter(c => c.status === 'new').length})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'read'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Read ({contacts.filter(c => c.status === 'read').length})
          </button>
          <button
            onClick={() => setFilter('replied')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'replied'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Replied ({contacts.filter(c => c.status === 'replied').length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-500">No contact messages found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredContacts.map((contact) => (
            <div key={contact._id} className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Contact Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{getStatusIcon(contact.status)}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900">{contact.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(contact.status)}`}>
                          {contact.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{contact.email}</p>
                      {contact.phone && (
                        <p className="text-sm text-gray-600">{contact.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Subject:</p>
                    <p className="text-gray-900">{contact.subject}</p>
                  </div>

                  {selectedContact?._id === contact._id ? (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Message:</p>
                      <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                        {contact.message}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedContact(contact);
                        if (contact.status === 'new') {
                          updateContactStatus(contact._id, 'read');
                        }
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View Full Message →
                    </button>
                  )}

                  <p className="text-gray-500 text-sm mt-2">
                    Received: {new Date(contact.createdAt).toLocaleDateString()} at {new Date(contact.createdAt).toLocaleTimeString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-2">
                  {contact.status === 'new' && (
                    <button
                      onClick={() => updateContactStatus(contact._id, 'read')}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition text-sm"
                    >
                      Mark Read
                    </button>
                  )}
                  {contact.status === 'read' && (
                    <button
                      onClick={() => updateContactStatus(contact._id, 'replied')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                    >
                      Mark Replied
                    </button>
                  )}
                  <button
                    onClick={() => deleteContact(contact._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {selectedContact?._id === contact._id && (
                <button
                  onClick={() => setSelectedContact(null)}
                  className="mt-3 text-gray-600 hover:text-gray-700 text-sm"
                >
                  ← Hide Message
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
