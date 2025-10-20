// Staff Dashboard - Document generation and viewing
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

export default function StaffDashboard() {
  const [stats, setStats] = useState(null);
  const [myDocuments, setMyDocuments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, logout, user } = useAuth();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/staff/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setMyDocuments(data.recentDocuments || []);
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h2>Mujaa Staff Portal</h2>
        </div>
        <div className="nav-user">
          <span>Welcome, {user?.full_name}</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <h1>My Dashboard</h1>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Documents</h3>
            <p className="stat-number">{stats?.total_documents || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Pending</h3>
            <p className="stat-number">{stats?.pending_documents || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Approved</h3>
            <p className="stat-number">{stats?.approved_documents || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Generated Today</h3>
            <p className="stat-number">{stats?.documents_today || 0}</p>
          </div>
        </div>

        <div className="dashboard-sections">
          <div className="section">
            <h2>Quick Actions</h2>
            <div className="action-buttons">
              <button className="btn-action btn-primary-action" onClick={() => navigate('/staff/generate')}>
                Generate New Document
              </button>
              <button className="btn-action" onClick={() => navigate('/staff/documents')}>
                My Documents
              </button>
            </div>
          </div>

          <div className="section">
            <h2>Recent Documents</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Policy #</th>
                    <th>Client Name</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {myDocuments.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{textAlign: 'center'}}>
                        No documents yet. Click "Generate New Document" to start!
                      </td>
                    </tr>
                  ) : (
                    myDocuments.map((doc) => (
                      <tr key={doc.id}>
                        <td>{doc.policy_number}</td>
                        <td>{doc.client_name}</td>
                        <td>
                          <span className={`status-badge status-${doc.status}`}>
                            {doc.status}
                          </span>
                        </td>
                        <td>{new Date(doc.generated_at).toLocaleDateString()}</td>
                        <td>
                          <button 
                            className="btn-sm"
                            onClick={() => navigate(`/staff/document/${doc.id}`)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {notifications.length > 0 && (
            <div className="section">
              <h2>Notifications</h2>
              <div className="notifications-list">
                {notifications.slice(0, 5).map((notif) => (
                  <div key={notif.id} className={`notification ${notif.type}`}>
                    <strong>{notif.title}</strong>
                    <p>{notif.message}</p>
                    <small>{new Date(notif.created_at).toLocaleString()}</small>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

