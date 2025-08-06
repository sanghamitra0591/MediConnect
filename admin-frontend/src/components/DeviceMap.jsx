import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { API_ENDPOINTS } from '../utils/constants';
import LoadingSpinner from './LoadingSpinner';

function DeviceMap() {
  const [devices, setDevices] = useState([]);
  const { get, loading, error } = useApi();

  const fetchDevices = async () => {
    try {
      const data = await get(API_ENDPOINTS.DEVICES);
      setDevices(data.devices || []);
    } catch (error) {
      console.error('Error fetching devices:', error);
      // Mock data for demo
      setDevices([
        { deviceId: 'pharmacy-001', gps: { lat: 40.7128, lng: -74.0060 }, lastActive: new Date() },
        { deviceId: 'pharmacy-002', gps: { lat: 40.7589, lng: -73.9851 }, lastActive: new Date() },
        { deviceId: 'pharmacy-003', gps: { lat: 40.7505, lng: -73.9934 }, lastActive: new Date() },
      ]);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading device map..." />;
  }

  if (error) {
    return (
      <div className="card">
        <h3 className="card-title">Device Activity Map</h3>
        <p className="card-empty">Error loading devices: {error}</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="card-title">Device Activity Map</h3>
      <div className="device-map">
        <div className="device-map-content">
          <div className="device-map-icon">🗺️</div>
          <h4 className="device-map-title">Device Map</h4>
          <p className="device-map-subtitle">
            {devices.length} devices registered
          </p>
          <div className="device-list">
            {devices.map((device) => (
              <div key={device.deviceId} className="device-item">
                <div className="device-id">{device.deviceId}</div>
                <div className="device-coordinates">
                  📍 {device.gps.lat.toFixed(4)}, {device.gps.lng.toFixed(4)}
                </div>
                <div className="device-last-active">
                  Last active: {new Date(device.lastActive).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeviceMap; 