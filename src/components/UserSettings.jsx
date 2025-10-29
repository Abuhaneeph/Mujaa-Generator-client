// User Settings Component - Manage multiple iLovePDF keys with auto-rotation
import { useState, useEffect } from 'react';
import { Settings, Key, RefreshCw, Save, Trash2, Plus, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function UserSettings() {
  const [keys, setKeys] = useState([]);
  const [newKey, setNewKey] = useState({ publicKey: '', secretKey: '', label: '', priority: 0 });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshingKeyId, setRefreshingKeyId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [keysPerPage] = useState(5);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const token = localStorage.getItem('token');

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    try {
      const response = await fetch(`${API_URL}/api/ilp/keys`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setKeys(data.keys || []);
      }
    } catch (error) {
      console.error('Failed to load keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddKey = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`${API_URL}/api/ilp/keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          publicKey: newKey.publicKey,
          secretKey: newKey.secretKey || undefined,
          label: newKey.label || undefined,
          priority: newKey.priority || 0,
          isActive: true
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: '✅ Key added successfully!' });
        setNewKey({ publicKey: '', secretKey: '', label: '', priority: 0 });
        setShowAddForm(false);
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        loadKeys();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to add key' });
      }
    } catch (error) {
      console.error('Add key error:', error);
      setMessage({ type: 'error', text: 'Network error. Check if backend is running.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteKey = async (keyId) => {
    if (!confirm('Are you sure you want to delete this key?')) return;

    try {
      const response = await fetch(`${API_URL}/api/ilp/keys/${keyId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '✅ Key deleted successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        loadKeys();
      } else {
        setMessage({ type: 'error', text: 'Failed to delete key' });
      }
    } catch (error) {
      console.error('Delete key error:', error);
      setMessage({ type: 'error', text: 'Failed to delete key' });
    }
  };

  const handleSetAsPrimary = async (keyId) => {
    try {
      // Set new primary key to priority 100
      await fetch(`${API_URL}/api/ilp/keys/${keyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ priority: 100 })
      });

      // Set all other keys to priority 0
      const otherKeys = keys.filter(k => k.id !== keyId);
      await Promise.all(
        otherKeys.map(key =>
          fetch(`${API_URL}/api/ilp/keys/${key.id}`, {
            method: 'PUT',
        headers: {
              'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ priority: 0 })
          })
        )
      );

      setMessage({ type: 'success', text: '✅ Key set as primary!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 2000);
      loadKeys();
    } catch (error) {
      console.error('Set primary error:', error);
      setMessage({ type: 'error', text: 'Failed to set as primary' });
    }
  };

  const handleRefreshCredits = async (keyId) => {
    setRefreshingKeyId(keyId);
    try {
      const response = await fetch(`${API_URL}/api/ilp/keys/${keyId}/refresh`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setKeys(prevKeys => 
          prevKeys.map(key => 
            key.id === keyId 
              ? { ...key, lastKnownCredits: data.credits, lastCheckedAt: new Date().toISOString() }
              : key
          )
        );
        setMessage({ type: 'success', text: '✅ Credits refreshed!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 2000);
      }
    } catch (error) {
      console.error('Refresh credits error:', error);
    } finally {
      setRefreshingKeyId(null);
    }
  };

  if (loading) {
    return <div className="p-4 md:p-8">Loading settings...</div>;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Settings</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm md:text-base w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Key
        </button>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {showAddForm && (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">Add New API Key</h2>
          <form onSubmit={handleAddKey} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Public Key *
              </label>
              <input
                type="text"
                  value={newKey.publicKey}
                  onChange={(e) => setNewKey({ ...newKey, publicKey: e.target.value })}
                placeholder="project_public_..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Secret Key (optional)
              </label>
                <input
                  type="password"
                  value={newKey.secretKey}
                  onChange={(e) => setNewKey({ ...newKey, secretKey: e.target.value })}
                  placeholder="secret_key_..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Label (optional)
                </label>
                <input
                  type="text"
                  value={newKey.label}
                  onChange={(e) => setNewKey({ ...newKey, label: e.target.value })}
                  placeholder="e.g., Main Key, Backup Key"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
            </div>

              </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 w-full sm:w-auto"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Adding...' : 'Add Key'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 w-full sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Keys List */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow">
        <div className="flex items-center gap-3 mb-6">
          <Key className="w-5 h-5 md:w-6 md:h-6 text-purple-600 flex-shrink-0" />
          <h2 className="text-lg md:text-xl font-bold text-gray-800">My API Keys</h2>
        </div>

        {keys.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">You don't have any API keys yet.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Add Your First Key
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {/* Calculate pagination */}
              {(() => {
                const indexOfLastKey = currentPage * keysPerPage;
                const indexOfFirstKey = indexOfLastKey - keysPerPage;
                const currentKeys = keys.slice(indexOfFirstKey, indexOfLastKey);
                const totalPages = Math.ceil(keys.length / keysPerPage);
                
                return (
                  <>
                    {currentKeys.map((key) => (
              <div
                key={key.id}
                className={`p-4 border-2 rounded-lg ${
                  key.isActive 
                    ? key.lastKnownCredits > 0 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-300 bg-gray-50'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="font-bold text-gray-800 text-sm md:text-base">
                        {key.label || `Key ${key.id}`}
                      </span>
                      <span className="text-xs text-gray-500 break-all">
                        ({key.publicKey.substring(0, 15)}...)
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded whitespace-nowrap ${
                        key.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {key.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-700 rounded whitespace-nowrap">
                        Priority: {key.priority}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-semibold text-gray-700">Credits:</span>
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap ${
                          (key.lastKnownCredits || 0) > 100 ? 'bg-green-100 text-green-700' :
                          (key.lastKnownCredits || 0) > 50 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {key.lastKnownCredits ?? 'Unknown'}
                        </span>
                      </div>
                      {key.lastCheckedAt && (
                        <span className="text-xs text-gray-500">
                          Last checked: {new Date(key.lastCheckedAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {key.priority !== Math.max(...keys.map(k => k.priority || 0), 0) && (
                      <button
                        onClick={() => handleSetAsPrimary(key.id)}
                        className="px-2 sm:px-3 py-1 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg whitespace-nowrap"
                        title="Set as primary key"
                      >
                        Use This Key
                      </button>
                    )}
                    {key.priority === Math.max(...keys.map(k => k.priority || 0), 0) && (
                      <span className="px-2 sm:px-3 py-1 text-xs font-semibold bg-green-600 text-white rounded-lg whitespace-nowrap">
                        PRIMARY KEY
                      </span>
                    )}
                    <button
                      onClick={() => handleRefreshCredits(key.id)}
                      disabled={refreshingKeyId === key.id}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg disabled:opacity-50 flex-shrink-0"
                      title="Refresh credits"
                    >
                      <RefreshCw className={`w-4 h-4 ${refreshingKeyId === key.id ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                      onClick={() => handleDeleteKey(key.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg flex-shrink-0"
                      title="Delete key"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
                    ))}
                  </>
                );
              })()}
            </div>
            
            {/* Pagination Controls */}
            {(() => {
              const totalPages = Math.ceil(keys.length / keysPerPage);
              if (totalPages <= 1) return null;
              
              return (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                    Showing {((currentPage - 1) * keysPerPage) + 1} to {Math.min(currentPage * keysPerPage, keys.length)} of {keys.length} keys
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 px-2 sm:px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </button>
                    <span className="px-2 sm:px-4 py-1 text-xs sm:text-sm font-semibold">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 px-2 sm:px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })()}
          </>
        )}
            </div>

      {/* Info Section */}
      <div className="mt-6 bg-blue-50 p-4 md:p-6 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-3 text-sm md:text-base">💡 How Multi-Key Auto-Rotation Works:</h3>
        <div className="space-y-2 text-xs sm:text-sm text-blue-800">
          <p><strong>1. Priority-Based Selection:</strong> Keys are automatically selected based on their priority (higher = used first)</p>
          <p><strong>2. Auto-Switch on Exhaustion:</strong> When a key runs out of credits, the system automatically switches to the next available key</p>
          <p><strong>3. No Manual Updates Needed:</strong> You can add multiple backup keys in advance and the system will rotate through them seamlessly</p>
          <p><strong>4. Refresh to Update:</strong> Click the refresh icon to get the latest credit count from iLovePDF API</p>
        </div>
      </div>

      {/* Account Information */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">Username</h3>
          <p className="text-sm sm:text-base text-gray-800 break-words">{localStorage.getItem('username') || 'N/A'}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">Full Name</h3>
          <p className="text-sm sm:text-base text-gray-800 break-words">{localStorage.getItem('fullName') || 'N/A'}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow sm:col-span-2 md:col-span-1">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">Role</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
            localStorage.getItem('userRole') === 'super_admin'
              ? 'bg-purple-100 text-purple-700'
              : 'bg-blue-100 text-blue-700'
          }`}>
            {localStorage.getItem('userRole') === 'super_admin' ? 'Super Admin' : 'Staff'}
          </span>
        </div>
      </div>
    </div>
  );
}
