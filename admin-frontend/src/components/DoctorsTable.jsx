import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { useSocket } from '../hooks/useSocket';
import { API_ENDPOINTS, SOCKET_EVENTS } from '../utils/constants';
import LoadingSpinner from './LoadingSpinner';
import Modal from './Modal';
import axios from 'axios';

const initialForm = { name: '', email: '', password: '', specialization: '' };

function DoctorsTable() {
  const [doctors, setDoctors] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [selectedId, setSelectedId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const { get, post, patch, del, loading, error, clearError } = useApi();

  const fetchDoctors = async () => {
    try {
      const data = await get('/api/doctors');
      setDoctors(data.doctors || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  // Real-time doctor status updates
  useSocket(SOCKET_EVENTS.DOCTOR_STATUS, (data) => {
    console.log('Doctor status update received in DoctorsTable:', data);
    console.log('Before update - current doctors:', doctors);
    
    setDoctors(prevDoctors => {
      const updatedDoctors = prevDoctors.map(doctor =>
        doctor._id === data.doctorId
          ? { 
              ...doctor, 
              isOnline: data.isOnline !== undefined ? data.isOnline : doctor.isOnline,
              status: data.status || doctor.status 
            }
          : doctor
      );
      
      console.log('After update - updated doctors:', updatedDoctors);
      return updatedDoctors;
    });
    
    // Force a refresh of doctors data after a short delay to ensure status is updated
    setTimeout(() => {
      console.log('Refreshing doctors data after status update');
      fetchDoctors();
    }, 1000);
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const openAddModal = () => {
    setForm(initialForm);
    setEditMode(false);
    setModalOpen(true);
    setSelectedId(null);
    clearError();
  };

  const openEditModal = (doctor) => {
    setForm({ ...doctor, password: '' });
    setEditMode(true);
    setModalOpen(true);
    setSelectedId(doctor._id);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    try {
      if (editMode) {
        console.log('Updating doctor:', selectedId, form);
        await patch(`/api/doctors/${selectedId}`, form);
        closeModal();
        await fetchDoctors();
      } else {
        console.log('Adding doctor:', form);
        await post('/api/doctors/register', form);
        closeModal();
        await fetchDoctors();
      }
    } catch (err) {
      console.error('Error submitting doctor form:', err);
      // Error handled by useApi
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) return;
    try {
      console.log('Deleting doctor:', id);
      
      // Get token from localStorage
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      if (!token) {
        alert('Authentication token not found. Please log in again.');
        return;
      }
      
      // Use axios directly instead of the useApi hook
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const response = await axios.delete(`${baseURL}/api/doctors/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Doctor deleted successfully, response:', response.data);
      await fetchDoctors();
    } catch (err) {
      console.error('Error deleting doctor:', err);
      console.error('Error details:', err.message, err.response?.data);
      alert(`Failed to delete doctor: ${err.message}`);
    }
  };

  if (loading && !modalOpen) {
    return <LoadingSpinner text="Loading doctors..." />;
  }

  return (
    <div className="card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="card-title">Doctors</h3>
        <button className="btn btn-primary" onClick={openAddModal}>Add Doctor</button>
      </div>
      {doctors.length === 0 ? (
        <p className="card-empty">No doctors found</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Specialization</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor) => (
              <tr key={doctor._id}>
                <td>{doctor.name}</td>
                <td>{doctor.email}</td>
                <td>{doctor.specialization}</td>
                <td>
                  <span className={`status status-${doctor.isOnline ? 'online' : 'offline'}`}>
                    {doctor.isOnline ? 'Online' : 'Offline'}
                  </span>
                </td>
                <td>
                  <button className="btn btn-sm btn-secondary" onClick={() => openEditModal(doctor)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(doctor._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Modal isOpen={modalOpen} onClose={closeModal} title={editMode ? 'Edit Doctor' : 'Add Doctor'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          {!editMode && (
            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          )}
          <div className="form-group">
            <input
              type="text"
              name="specialization"
              placeholder="Specialization"
              value={form.specialization}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full-width" disabled={loading}>
            {loading ? (editMode ? 'Saving...' : 'Adding...') : (editMode ? 'Save Changes' : 'Add Doctor')}
          </button>
          {error && <p className="login-error">{error}</p>}
        </form>
      </Modal>
    </div>
  );
}

export default DoctorsTable;