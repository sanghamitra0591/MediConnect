import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import DoctorsTable from '../components/DoctorsTable';
import SessionsTable from '../components/SessionsTable';
import DeviceMap from '../components/DeviceMap';
import DeviceTable from '../components/DeviceTable';

function DashboardPage() {
  const { logout, userType, token } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const { get, patch, loading } = useApi();

  useEffect(() => {
    const fetchDoctor = async () => {
      if (userType === 'doctor') {
        try {
          const res = await get('/api/doctors/me');
          setDoctor(res.doctor);
        } catch (err) {
          // handle error
        }
      }
    };
    fetchDoctor();
    // eslint-disable-next-line
  }, [userType]);

  const handleToggle = async () => {
    try {
      const res = await patch('/api/doctors/availability');
      setDoctor((prev) => ({ ...prev, isOnline: res.isOnline }));
    } catch (err) {
      // handle error
    }
  };

  if (userType === 'doctor') {
    return (
      <div className="container dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Doctor Dashboard</h1>
          <button className="btn btn-secondary" onClick={logout}>
            Logout
          </button>
        </div>
        <div className="dashboard-content">
          {doctor ? (
            <>
              <p>Welcome, Dr. {doctor.name}!</p>
              <p>
                Status: <span className={`status status-${doctor.isOnline ? 'online' : 'offline'}`}>{doctor.isOnline ? 'Online' : 'Offline'}</span>
              </p>
              <button className="btn btn-primary" onClick={handleToggle} disabled={loading}>
                {doctor.isOnline ? 'Go Offline' : 'Go Online'}
              </button>
            </>
          ) : (
            <p>Loading your profile...</p>
          )}
        </div>
      </div>
    );
  }

  // Default: admin dashboard
  return (
    <div className="container dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">MediConnect Admin Dashboard</h1>
        <button className="btn btn-secondary" onClick={logout}>
          Logout
        </button>
      </div>
      <div className="dashboard-content">
        <DoctorsTable />
        <DeviceTable />
        <SessionsTable />
        <DeviceMap />
      </div>
    </div>
  );
}

export default DashboardPage;