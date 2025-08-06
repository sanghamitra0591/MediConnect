import { useAuth } from '../context/AuthContext';
import DoctorsTable from '../components/DoctorsTable';
import SessionsTable from '../components/SessionsTable';
import DeviceMap from '../components/DeviceMap';

function DashboardPage() {
  const { logout } = useAuth();

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
        <SessionsTable />
        <DeviceMap />
      </div>
    </div>
  );
}

export default DashboardPage;