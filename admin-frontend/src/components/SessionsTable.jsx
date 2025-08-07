import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { useSocket } from '../hooks/useSocket';
import { API_ENDPOINTS, SOCKET_EVENTS } from '../utils/constants';
import LoadingSpinner from './LoadingSpinner';
import Modal from './Modal';

function SessionsTable() {
  const [sessions, setSessions] = useState([]);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ patientName: '', deviceId: '', doctorId: '' });
  const [devices, setDevices] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const { get, post, patch, loading, error, clearError } = useApi();
  const [formError, setFormError] = useState(null);

  const fetchSessions = async () => {
    try {
      const data = await get(API_ENDPOINTS.ACTIVE_SESSIONS);
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const data = await get('/api/sessions/history');
      setHistory(data.sessions || []);
    } catch (error) {
      // ignore
    }
  };

  const fetchAvailableDevices = async () => {
    try {
      const data = await get(API_ENDPOINTS.AVAILABLE_DEVICES);
      setDevices(data.devices || []);
    } catch (error) {
      // ignore
    }
  };

  const fetchAvailableDoctors = async () => {
    try {
      const data = await get(API_ENDPOINTS.AVAILABLE_DOCTORS);
      setDoctors(data.doctors || []);
    } catch (error) {
      // ignore
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchAvailableDevices();
    fetchAvailableDoctors();
    fetchHistory();
  }, []);

  const handleSessionAction = async (sessionId, action) => {
    try {
      if (action === 'complete') {
        await patch(API_ENDPOINTS.SESSION_COMPLETE(sessionId));
      } else if (action === 'cancel') {
        await patch(API_ENDPOINTS.SESSION_CANCEL(sessionId));
      }
      fetchSessions(); // Refresh the list
      fetchHistory();
      // Refresh available devices and doctors after session completion/cancellation
      fetchAvailableDevices();
      fetchAvailableDoctors();
    } catch (error) {
      console.error(`Error ${action}ing session:`, error);
    }
  };

  // Real-time session updates
  useSocket(SOCKET_EVENTS.SESSION_UPDATE, (data) => {
    console.log('Session update received:', data);
    
    if (data.type === 'initiated') {
      console.log('Session initiated:', data.session);
      setSessions(prev => {
        console.log('Current sessions before adding new session:', prev);
        const updated = [...prev, data.session];
        console.log('Updated sessions after adding new session:', updated);
        return updated;
      });
      fetchHistory();
      
      // Refresh available devices and doctors after session initiation
      console.log('Refreshing available devices and doctors after session initiation');
      fetchAvailableDevices();
      fetchAvailableDoctors();
    } else if (data.type === 'completed' || data.type === 'cancelled') {
      console.log(`Session ${data.type}:`, data.session);
      setSessions(prev => {
        console.log('Current sessions before removing session:', prev);
        const updated = prev.filter(session => session._id !== data.session._id);
        console.log('Updated sessions after removing session:', updated);
        return updated;
      });
      fetchHistory();
      
      // Refresh available devices and doctors after session completion/cancellation
      console.log(`Refreshing available devices and doctors after session ${data.type}`);
      fetchAvailableDevices();
      fetchAvailableDoctors();
    }
    
    // Force a refresh of all data after a short delay
    setTimeout(() => {
      console.log('Performing full data refresh after session update');
      fetchSessions();
      fetchHistory();
      fetchAvailableDevices();
      fetchAvailableDoctors();
    }, 1000);
  });

  const openModal = () => {
    setForm({ patientName: '', deviceId: '', doctorId: '' });
    setModalOpen(true);
    setFormError(null);
    clearError();
    // Refresh available devices and doctors when opening the modal
    fetchAvailableDevices();
    fetchAvailableDoctors();
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm({ patientName: '', deviceId: '', doctorId: '' });
    setFormError(null);
    clearError();
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setFormError(null);
    try {
      await post(API_ENDPOINTS.SESSION_INITIATE, {
        patientName: form.patientName,
        deviceId: form.deviceId,
        doctorId: form.doctorId,
      });
      closeModal();
      fetchSessions();
      fetchHistory();
      // Refresh available devices and doctors after session initiation
      fetchAvailableDevices();
      fetchAvailableDoctors();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to start session');
    }
  };

  if (loading && !modalOpen) {
    return <LoadingSpinner text="Loading sessions..." />;
  }

  return (
    <div className="card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="card-title">Sessions</h3>
        <div>
          <button className="btn btn-primary" onClick={openModal}>Start Session</button>
          <button className="btn btn-secondary" style={{ marginLeft: 8 }} onClick={() => setShowHistory(h => !h)}>
            {showHistory ? 'Show Active' : 'Show History'}
          </button>
        </div>
      </div>
      {!showHistory ? (
        sessions.length === 0 ? (
          <p className="card-empty">No active sessions</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Device</th>
                <th>Started</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session._id}>
                  <td>{session.patientName}</td>
                  <td>{session.doctor?.name || 'Unknown'}</td>
                  <td>{session.device?.deviceId || 'Unknown'}</td>
                  <td>{new Date(session.startedAt).toLocaleString()}</td>
                  <td>
                    <span className={`status status-${session.status}`}>{session.status}</span>
                  </td>
                  <td>
                    <button
                      className="btn btn-success btn-small"
                      onClick={() => handleSessionAction(session._id, 'complete')}
                    >
                      Complete
                    </button>
                    <button
                      className="btn btn-danger btn-small"
                      onClick={() => handleSessionAction(session._id, 'cancel')}
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      ) : (
        history.length === 0 ? (
          <p className="card-empty">No session history</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Device</th>
                <th>Started</th>
                <th>Ended</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((session) => (
                <tr key={session._id}>
                  <td>{session.patientName}</td>
                  <td>{session.doctor?.name || 'Unknown'}</td>
                  <td>{session.device?.deviceId || 'Unknown'}</td>
                  <td>{new Date(session.startedAt).toLocaleString()}</td>
                  <td>{session.endedAt ? new Date(session.endedAt).toLocaleString() : '-'}</td>
                  <td>
                    <span className={`status status-${session.status}`}>{session.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}
      <Modal isOpen={modalOpen} onClose={closeModal} title="Start Session">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="patientName"
              placeholder="Patient Name"
              value={form.patientName}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <select
              name="deviceId"
              value={form.deviceId}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">Select Device</option>
              {devices.map((device) => (
                <option key={device._id} value={device.deviceId}>
                  {device.deviceId} ({device.name || 'No Name'}) - {device.status || 'active'}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <select
              name="doctorId"
              value={form.doctorId}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">Select Doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  {doctor.name} - {doctor.specialization || 'General'} - {doctor.status || 'available'}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary btn-full-width" disabled={loading}>
            {loading ? 'Starting...' : 'Start Session'}
          </button>
          {(formError || error) && <p className="login-error">{formError || error}</p>}
        </form>
      </Modal>
    </div>
  );
}

export default SessionsTable;