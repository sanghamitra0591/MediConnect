import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { useSocket } from '../hooks/useSocket';
import { API_ENDPOINTS, SOCKET_EVENTS } from '../utils/constants';
import LoadingSpinner from './LoadingSpinner';

function DoctorsTable() {
  const [doctors, setDoctors] = useState([]);
  const { get, loading, error } = useApi();

  const fetchDoctors = async () => {
    try {
      const data = await get(API_ENDPOINTS.ONLINE_DOCTORS);
      setDoctors(data.doctors || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  // Real-time doctor status updates
  useSocket(SOCKET_EVENTS.DOCTOR_STATUS, (data) => {
    setDoctors(prevDoctors => 
      prevDoctors.map(doctor => 
        doctor._id === data.doctorId 
          ? { ...doctor, isOnline: data.isOnline }
          : doctor
      )
    );
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading doctors..." />;
  }

  if (error) {
    return (
      <div className="card">
        <h3 className="card-title">Online Doctors</h3>
        <p className="card-empty">Error loading doctors: {error}</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="card-title">Online Doctors</h3>
      {doctors.length === 0 ? (
        <p className="card-empty">No doctors are currently online</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Specialization</th>
              <th>Status</th>
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
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default DoctorsTable; 