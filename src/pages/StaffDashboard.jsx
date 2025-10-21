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

  const handleDownloadPdf = async (docId, action = 'download') => {
    try {
      const response = await fetch(`${API_URL}/api/staff/document/${docId}/download?action=${action}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Download error:', error);
        alert(error.message || 'Failed to download PDF');
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      if (action === 'view') {
        window.open(url, '_blank');
      } else {
        // Parse filename from Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'document.pdf';
        
        if (contentDisposition) {
          // Extract filename from: filename="Name (PEN XXXXX).pdf"
          const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1];
          }
        }
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download PDF');
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
                    <th>Pension #</th>
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
                        <td>{doc.client_pension_no || doc.policy_number}</td>
                        <td>{doc.client_name}</td>
                        <td>
                          <span className={`status-badge status-${doc.status}`}>
                            {doc.status}
                          </span>
                        </td>
                        <td>{new Date(doc.generated_at).toLocaleDateString()}</td>
                        <td>
                          {doc.indicative_pdf_path ? (
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button 
                                onClick={() => handleDownloadPdf(doc.id, 'view')}
                                className="btn-view"
                                style={{
                                  color: '#10b981',
                                  textDecoration: 'none',
                                  fontWeight: '500',
                                  fontSize: '0.875rem',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  border: '1px solid #10b981',
                                  display: 'inline-block',
                                  transition: 'all 0.2s',
                                  cursor: 'pointer',
                                  backgroundColor: 'transparent'
                                }}
                                onMouseOver={(e) => {
                                  e.target.style.backgroundColor = '#10b981';
                                  e.target.style.color = 'white';
                                }}
                                onMouseOut={(e) => {
                                  e.target.style.backgroundColor = 'transparent';
                                  e.target.style.color = '#10b981';
                                }}
                              >
                                👁️ View PDF
                              </button>
                              <button 
                                onClick={() => handleDownloadPdf(doc.id, 'download')}
                                className="btn-download"
                                style={{
                                  color: '#3b82f6',
                                  textDecoration: 'none',
                                  fontWeight: '500',
                                  fontSize: '0.875rem',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  border: '1px solid #3b82f6',
                                  display: 'inline-block',
                                  transition: 'all 0.2s',
                                  cursor: 'pointer',
                                  backgroundColor: 'transparent'
                                }}
                                onMouseOver={(e) => {
                                  e.target.style.backgroundColor = '#3b82f6';
                                  e.target.style.color = 'white';
                                }}
                                onMouseOut={(e) => {
                                  e.target.style.backgroundColor = 'transparent';
                                  e.target.style.color = '#3b82f6';
                                }}
                              >
                                📥 Download PDF
                              </button>
                            </div>
                          ) : (
                            <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                              N/A
                            </span>
                          )}
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

