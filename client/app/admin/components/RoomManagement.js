"use client";

import { useState, useEffect } from "react";
import { api } from "../../../lib/api";

export default function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "Standard",
    price: "",
    description: "",
    capacity: "",
    featured: false,
    image: ""
  });
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await api.getRooms();
      setRooms(response.data || []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleImageChange = (e) => {
    const { value } = e.target;
    console.log('URL changed:', value);
    setFormData({
      ...formData,
      image: value
    });
    setImagePreview(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const url = editingRoom 
        ? `${API_URL}/api/rooms/${editingRoom._id}`
        : `${API_URL}/api/rooms`;
      
      const roomData = { ...formData };
      console.log('Saving room with data:', roomData);
      
      const response = await fetch(url, {
        method: editingRoom ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roomData)
      });

      if (response.ok) {
        console.log('Room saved successfully');
        fetchRooms();
        setShowModal(false);
        resetForm();
      } else {
        const error = await response.text();
        console.error('Failed to save room:', error);
      }
    } catch (error) {
      console.error("Error saving room:", error);
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      type: room.type,
      price: room.price,
      description: room.description,
      capacity: room.capacity,
      featured: room.featured,
      image: room.image || ""
    });
    setImagePreview(room.image || "");
    setShowModal(true);
  };

  const handleDelete = async (roomId) => {
    if (!confirm("Are you sure you want to delete this room?")) return;
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/rooms/${roomId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        fetchRooms();
      }
    } catch (error) {
      console.error("Error deleting room:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "Standard",
      price: "",
      description: "",
      capacity: "",
      featured: false,
      image: ""
    });
    setImagePreview("");
    setEditingRoom(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  if (loading) {
    return <div className="text-center py-8">Loading rooms...</div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Room Management</h2>
        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center space-x-2 w-full sm:w-auto justify-center"
        >
          <span>➕</span>
          <span>Add New Room</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Type</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Capacity</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Featured</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rooms.map((room) => (
              <tr key={room._id}>
                <td className="px-3 sm:px-6 py-4 text-sm font-medium text-gray-900">
                  <div className="max-w-[120px] sm:max-w-none truncate">{room.name}</div>
                  <div className="sm:hidden text-xs text-gray-500 mt-1">{room.type}</div>
                </td>
                <td className="px-3 sm:px-6 py-4">
                  {room.image ? (
                    <img src={room.image} alt={room.name} className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded" />
                  ) : (
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                      No Image
                    </div>
                  )}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{room.type}</td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">${room.price}</td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{room.capacity}</td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                  {room.featured ? "✅" : "❌"}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                    <button
                      onClick={() => handleEdit(room)}
                      className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(room._id)}
                      className="text-red-600 hover:text-red-800 text-xs sm:text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 m-4">
            <h3 className="text-2xl font-bold mb-6 text-gray-900">
              {editingRoom ? "Edit Room" : "Add New Room"}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Room Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="Standard">Standard</option>
                  <option value="Deluxe">Deluxe</option>
                  <option value="Suite">Suite</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Room Image URL</label>
                
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleImageChange}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste image URL from Unsplash, Imgur, or any image hosting service
                </p>
                
                {imagePreview && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Image Preview:</p>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-lg border border-gray-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                      onLoad={(e) => {
                        e.target.style.display = 'block';
                        e.target.nextElementSibling.style.display = 'none';
                      }}
                    />
                    <div className="hidden w-full h-48 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center text-gray-500">
                      Invalid image URL
                    </div>
                  </div>
                )}
                
                <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs font-medium text-blue-900 mb-1">💡 Where to get free images:</p>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• <a href="https://unsplash.com" target="_blank" className="underline">Unsplash.com</a> - Free high-quality images</li>
                    <li>• <a href="https://imgur.com" target="_blank" className="underline">Imgur.com</a> - Free image hosting</li>
                    <li>• Right-click image → Copy image address</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-700">Featured Room</label>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  {editingRoom ? "Update Room" : "Add Room"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
