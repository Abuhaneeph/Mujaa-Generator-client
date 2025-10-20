// User Settings Component - Manage iLovePDF keys and personal settings
import { useState, useEffect } from 'react';
import { Settings, Key, RefreshCw, Save, Eye, EyeOff } from 'lucide-react';

export default function UserSettings() {
  const [ilpConfig, setIlpConfig] = useState({
    publicKey: '',
    secretKey: '',
    credits: 0
  });
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const token = localStorage.getItem('token');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch(`${API_URL}/api/ilp/my-config`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIlpConfig({
          publicKey: data.publicKey || '',
          secretKey: '', // Never show secret key for security
          credits: data.credits || 0
        });
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveKeys = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`${API_URL}/api/ilp/my-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          publicKey: ilpConfig.publicKey,
          secretKey: ilpConfig.secretKey || undefined
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: '✅ iLovePDF keys saved successfully!' });
        setIlpConfig(prev => ({ ...prev, secretKey: '' })); // Clear secret key after saving
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to save keys' });
      }
    } catch (error) {
      console.error('Save keys error:', error);
      setMessage({ type: 'error', text: 'Network error. Check if backend is running.' });
    } finally {
      setSaving(false);
    }
  };

  const handleRefreshCredits = async () => {
    try {
      const response = await fetch(`${API_URL}/api/ilp/my-credits`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIlpConfig(prev => ({ ...prev, credits: data.remainingCredits || 0 }));
        setMessage({ type: 'success', text: 'Credits refreshed' });
        setTimeout(() => setMessage({ type: '', text: '' }), 2000);
      }
    } catch (error) {
      console.error('Refresh credits error:', error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading settings...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Settings</h1>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* iLovePDF API Keys */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3 mb-6">
            <Key className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-800">iLovePDF API Keys</h2>
          </div>

          <form onSubmit={handleSaveKeys} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Public Key *
              </label>
              <input
                type="text"
                value={ilpConfig.publicKey}
                onChange={(e) => setIlpConfig({ ...ilpConfig, publicKey: e.target.value })}
                placeholder="project_public_..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Your iLovePDF public key from https://developer.ilovepdf.com
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Secret Key (optional)
              </label>
              <div className="relative">
                <input
                  type={showSecretKey ? "text" : "password"}
                  value={ilpConfig.secretKey}
                  onChange={(e) => setIlpConfig({ ...ilpConfig, secretKey: e.target.value })}
                  placeholder="secret_key_... (optional)"
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Leave blank to keep existing secret key
              </p>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">API Credits:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  ilpConfig.credits > 100 ? 'bg-green-100 text-green-700' :
                  ilpConfig.credits > 50 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {ilpConfig.credits}
                </span>
                <button
                  type="button"
                  onClick={handleRefreshCredits}
                  className="text-purple-600 hover:text-purple-700"
                  title="Refresh credits"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Keys'}
              </button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">💡 How to Get API Keys:</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Visit <a href="https://developer.ilovepdf.com" target="_blank" className="underline">developer.ilovepdf.com</a></li>
              <li>Sign up or login to your account</li>
              <li>Go to "Projects" and create a new project</li>
              <li>Copy your Public Key and paste above</li>
              <li>Your keys are stored securely in your profile</li>
            </ol>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">🔐 Security Note:</h3>
            <p className="text-sm text-yellow-800">
              Your API keys are stored securely and are only accessible to you. 
              Each user manages their own keys independently.
            </p>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Account Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
              <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                {localStorage.getItem('username') || 'N/A'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                {localStorage.getItem('fullName') || 'N/A'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
              <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  localStorage.getItem('userRole') === 'super_admin'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {localStorage.getItem('userRole') === 'super_admin' ? 'Super Admin' : 'Staff'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">📝 Need to Change Password?</h3>
            <p className="text-sm text-gray-600 mb-3">
              Contact your Super Admin to reset your password.
            </p>
            <button className="text-sm text-purple-600 hover:text-purple-700 font-semibold">
              Request Password Reset →
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-800 mb-4">How Your Keys Are Used</h2>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <span className="text-purple-600 font-bold">1.</span>
            <p>When you generate documents, <strong>your personal API keys</strong> are used for PDF conversion</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-600 font-bold">2.</span>
            <p>Each user has their own API credits quota</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-600 font-bold">3.</span>
            <p>Credits are deducted from your account when converting DOCX to PDF</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-600 font-bold">4.</span>
            <p>You can update your keys anytime without affecting other users</p>
          </div>
        </div>
      </div>
    </div>
  );
}

