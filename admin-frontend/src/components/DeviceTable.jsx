import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { useSocket } from '../hooks/useSocket';
import { SOCKET_EVENTS } from '../utils/constants';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';
import axios from 'axios';

const initialForm = { deviceId: '', name: '', gpsLat: '', gpsLng: '', status: '' };

function DeviceTable() {
  const [devices, setDevices] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [selectedId, setSelectedId] = useState(null);
  const { get, post, patch, del, loading, error, clearError } = useApi();

  const fetchDevices = async () => {
    try {
      const data = await get('/api/devices');
      setDevices(data.devices || []);
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);
  
  // Real-time device status updates
  useSocket(SOCKET_EVENTS.SESSION_UPDATE, (data) => {
    console.log('Session update received in DeviceTable:', data);
    if (data.session && data.session.device) {
      fetchDevices(); // Refresh the devices list when a session is updated
    }
  });

  const openAddModal = () => {
    setForm(initialForm);
    setEditMode(false);
    setModalOpen(true);
    setSelectedId(null);
    clearError();
  };

  const openEditModal = (device) => {
    setForm({
      deviceId: device.deviceId,
      name: device.name || '',
      gpsLat: device.gps?.lat || '',
      gpsLng: device.gps?.lng || '',
      status: device.status || '',
    });
    setEditMode(true);
    setModalOpen(true);
    setSelectedId(device._id);
    clearError();
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm(initialForm);
    setSelectedId(null);
    setEditMode(false);
    clearError();
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setForm((prev) => ({
            ...prev,
            gpsLat: position.coords.latitude,
            gpsLng: position.coords.longitude,
          }));
        },
        (error) => {
          alert('Unable to retrieve your location.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const payload = {
      deviceId: form.deviceId,
      name: form.name,
      gps: { lat: parseFloat(form.gpsLat), lng: parseFloat(form.gpsLng) },
      status: form.status,
    };
    try {
      if (editMode) {
        console.log('Updating device:', selectedId, payload);
        await patch(`/api/devices/${selectedId}`, payload);
      } else {
        console.log('Adding device:', payload);
        await post('/api/devices/register', payload);
      }
      closeModal();
      await fetchDevices();
    } catch (err) {
      console.error('Error submitting device form:', err);
      // Error handled by useApi
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this device?')) return;
    try {
      console.log('Deleting device:', id);
      
      // Get token from localStorage
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      if (!token) {
        alert('Authentication token not found. Please log in again.');
        return;
      }
      
      // Use axios directly instead of the useApi hook
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const response = await axios.delete(`${baseURL}/api/devices/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Device deleted successfully, response:', response.data);
      await fetchDevices();
    } catch (err) {
      console.error('Error deleting device:', err);
      console.error('Error details:', err.message, err.response?.data);
      alert(`Failed to delete device: ${err.message}`);
    }
  };

  if (loading && !modalOpen) {
    return <LoadingSpinner text="Loading devices..." />;
  }

  return (
    <div className="card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="card-title">Pharmacy Devices</h3>
        <button className="btn btn-primary" onClick={openAddModal}>Add Device</button>
      </div>
      {devices.length === 0 ? (
        <p className="card-empty">No devices found</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Device ID</th>
              <th>Name</th>
              <th>Latitude</th>
              <th>Longitude</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device) => (
              <tr key={device._id}>
                <td>{device.deviceId}</td>
                <td>{device.name || '-'}</td>
                <td>{device.gps?.lat?.toFixed(4) || '-'}</td>
                <td>{device.gps?.lng?.toFixed(4) || '-'}</td>
                <td>{device.status || '-'}</td>
                <td>
                  <button className="btn btn-sm btn-secondary" onClick={() => openEditModal(device)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(device._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Modal isOpen={modalOpen} onClose={closeModal} title={editMode ? 'Edit Device' : 'Add Device'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="deviceId"
              placeholder="Device ID"
              value={form.deviceId}
              onChange={handleChange}
              required
              disabled={editMode || loading}
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder="Device Name"
              value={form.name}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div className="form-group" style={{ display: 'flex', gap: '8px' }}>
            <input
              type="number"
              name="gpsLat"
              placeholder="Latitude"
              value={form.gpsLat}
              onChange={handleChange}
              step="any"
              required
              disabled={loading}
            />
            <input
              type="number"
              name="gpsLng"
              placeholder="Longitude"
              value={form.gpsLng}
              onChange={handleChange}
              step="any"
              required
              disabled={loading}
            />
            <button type="button" className="btn btn-secondary" onClick={handleDetectLocation} disabled={loading}>
              Detect Location
            </button>
          </div>
          <div className="form-group">
            <input
              type="text"
              name="status"
              placeholder="Status (active/inactive)"
              value={form.status}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full-width" disabled={loading}>
            {loading ? (editMode ? 'Saving...' : 'Adding...') : (editMode ? 'Save Changes' : 'Add Device')}
          </button>
          {error && <p className="login-error">{error}</p>}
        </form>
      </Modal>
    </div>
  );
}

export default DeviceTable;