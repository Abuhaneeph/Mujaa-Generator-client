// Super Admin Dashboard - Overview and management interface
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { token, logout, user } = useAuth();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setRecentDocuments(data.recentDocuments || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async (docId, action = 'download') => {
    try {
      const response = await fetch(`${API_URL}/api/admin/documents/${docId}/download?action=${action}`, {
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

  const handleSelectDocument = (docId) => {
    setSelectedDocuments(prev => {
      if (prev.includes(docId)) {
        return prev.filter(id => id !== docId);
      } else {
        return [...prev, docId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedDocuments.length === recentDocuments.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(recentDocuments.map(doc => doc.id));
    }
  };

  const handleDeleteDocument = async (docId) => {
    setDeleteTarget([docId]);
    setShowDeleteConfirm(true);
  };

  const handleBulkDelete = () => {
    if (selectedDocuments.length === 0) {
      alert('Please select documents to delete');
      return;
    }
    setDeleteTarget(selectedDocuments);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      if (!deleteTarget || deleteTarget.length === 0) return;

      setIsDeleting(true);

      if (deleteTarget.length === 1) {
        // Single delete
        const response = await fetch(`${API_URL}/api/admin/documents/${deleteTarget[0]}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to delete document');
        }

        alert('Document deleted successfully');
      } else {
        // Bulk delete
        const response = await fetch(`${API_URL}/api/admin/documents/bulk/delete`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ documentIds: deleteTarget })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to delete documents');
        }

        const result = await response.json();
        alert(`${result.deletedCount} document(s) deleted successfully`);
      }

      // Refresh dashboard data
      setSelectedDocuments([]);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      setIsDeleting(false);
      fetchDashboardData();

    } catch (error) {
      console.error('Delete error:', error);
      alert(error.message || 'Failed to delete document(s)');
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      setIsDeleting(false);
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
          <h2>Mujaa Admin</h2>
        </div>
        <div className="nav-user">
          <span>Welcome, {user?.full_name}</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <h1>Dashboard</h1>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Active Staff</h3>
            <p className="stat-number">{stats?.active_staff || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Total Documents</h3>
            <p className="stat-number">{stats?.total_documents || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Pending</h3>
            <p className="stat-number">{stats?.pending_documents || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Submitted Today</h3>
            <p className="stat-number">{stats?.documents_today || 0}</p>
          </div>
        </div>

        <div className="dashboard-sections">
          <div className="section">
            <h2>Quick Actions</h2>
            <div className="action-buttons">
              <button className="btn-action" onClick={() => navigate('/admin/users')}>
                Manage Users
              </button>
              <button className="btn-action" onClick={() => navigate('/admin/documents')}>
                View All Documents
              </button>
              <button className="btn-action" onClick={() => navigate('/admin/activity')}>
                Activity Logs
              </button>
              <button className="btn-action" onClick={() => navigate('/admin/settings')}>
                System Settings
              </button>
            </div>
          </div>

          <div className="section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>Recent Documents</h2>
              {selectedDocuments.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '0.875rem'
                  }}
                >
                  🗑️ Delete Selected ({selectedDocuments.length})
                </button>
              )}
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>
                      <input
                        type="checkbox"
                        checked={selectedDocuments.length === recentDocuments.length && recentDocuments.length > 0}
                        onChange={handleSelectAll}
                        style={{ cursor: 'pointer' }}
                      />
                    </th>
                    <th>Pension #</th>
                    <th>Client Name</th>
                    <th>Status</th>
                    <th>Generated By</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDocuments.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{textAlign: 'center'}}>No documents yet</td>
                    </tr>
                  ) : (
                    recentDocuments.map((doc) => (
                      <tr key={doc.id} style={{ backgroundColor: selectedDocuments.includes(doc.id) ? '#f0f9ff' : 'transparent' }}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedDocuments.includes(doc.id)}
                            onChange={() => handleSelectDocument(doc.id)}
                            style={{ cursor: 'pointer' }}
                          />
                        </td>
                        <td>{doc.client_pension_no || doc.policy_number}</td>
                        <td>{doc.client_name}</td>
                        <td>
                          <span className={`status-badge status-${doc.status}`}>
                            {doc.status}
                          </span>
                        </td>
                        <td>{doc.generated_by_name}</td>
                        <td>{new Date(doc.generated_at).toLocaleDateString()}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {doc.cpanel_pdf_url ? (
                              <>
                                <button 
                                  onClick={() => handleDownloadPdf(doc.id, 'view')}
                                  className="btn-view"
                                  title="View PDF"
                                  style={{
                                    color: '#10b981',
                                    fontWeight: '500',
                                    fontSize: '0.875rem',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    border: '1px solid #10b981',
                                    cursor: 'pointer',
                                    backgroundColor: 'transparent',
                                    transition: 'all 0.2s'
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
                                  👁️ View
                                </button>
                                <button 
                                  onClick={() => handleDownloadPdf(doc.id, 'download')}
                                  className="btn-download"
                                  title="Download PDF"
                                  style={{
                                    color: '#3b82f6',
                                    fontWeight: '500',
                                    fontSize: '0.875rem',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    border: '1px solid #3b82f6',
                                    cursor: 'pointer',
                                    backgroundColor: 'transparent',
                                    transition: 'all 0.2s'
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
                                  📥 Download
                                </button>
                              </>
                            ) : (
                              <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                                N/A
                              </span>
                            )}
                            <button 
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="btn-delete"
                              title="Delete Document"
                              style={{
                                color: '#ef4444',
                                fontWeight: '500',
                                fontSize: '0.875rem',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: '1px solid #ef4444',
                                cursor: 'pointer',
                                backgroundColor: 'transparent',
                                transition: 'all 0.2s'
                              }}
                              onMouseOver={(e) => {
                                e.target.style.backgroundColor = '#ef4444';
                                e.target.style.color = 'white';
                              }}
                              onMouseOut={(e) => {
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.color = '#ef4444';
                              }}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '8px',
                maxWidth: '400px',
                width: '90%'
              }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
                  Confirm Delete
                </h3>
                {isDeleting ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ 
                      display: 'inline-block',
                      width: '40px',
                      height: '40px',
                      border: '4px solid #f3f4f6',
                      borderTop: '4px solid #ef4444',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      marginBottom: '1rem'
                    }} />
                    <p style={{ color: '#666', fontWeight: '500' }}>
                      Deleting {deleteTarget?.length} document(s)...
                    </p>
                    <p style={{ color: '#999', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                      Removing from database and Cloudinary
                    </p>
                  </div>
                ) : (
                  <>
                    <p style={{ marginBottom: '1.5rem', color: '#666' }}>
                      Are you sure you want to delete {deleteTarget?.length} document(s)? 
                      This will also remove the file(s) from Cloudinary. This action cannot be undone.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeleteTarget(null);
                        }}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '6px',
                          border: '1px solid #d1d5db',
                          backgroundColor: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={confirmDelete}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

