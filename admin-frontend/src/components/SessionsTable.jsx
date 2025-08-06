import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { useSocket } from '../hooks/useSocket';
import { API_ENDPOINTS, SOCKET_EVENTS } from '../utils/constants';
import LoadingSpinner from './LoadingSpinner';

function SessionsTable() {
  const [sessions, setSessions] = useState([]);
  const { get, patch, loading, error } = useApi();

  const fetchSessions = async () => {
    try {
      const data = await get(API_ENDPOINTS.ACTIVE_SESSIONS);
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const handleSessionAction = async (sessionId, action) => {
    try {
      if (action === 'complete') {
        await patch(API_ENDPOINTS.SESSION_COMPLETE(sessionId));
      } else if (action === 'cancel') {
        await patch(API_ENDPOINTS.SESSION_CANCEL(sessionId));
      }
      fetchSessions(); // Refresh the list
    } catch (error) {
      console.error(`Error ${action}ing session:`, error);
    }
  };

  // Real-time session updates
  useSocket(SOCKET_EVENTS.SESSION_UPDATE, (data) => {
    if (data.type === 'initiated') {
      setSessions(prev => [...prev, data.session]);
    } else if (data.type === 'completed' || data.type === 'cancelled') {
      setSessions(prev => prev.filter(session => session._id !== data.session._id));
    }
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading sessions..." />;
  }

  if (error) {
    return (
      <div className="card">
        <h3 className="card-title">Active Sessions</h3>
        <p className="card-empty">Error loading sessions: {error}</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="card-title">Active Sessions</h3>
      {sessions.length === 0 ? (
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
                  <span className={`status status-${session.status}`}>
                    {session.status}
                  </span>
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
      )}
    </div>
  );
}

export default SessionsTable; 