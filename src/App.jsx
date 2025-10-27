import React, { useState, useEffect, useCallback } from 'react';
import { Search, FileText, CheckCircle, AlertCircle, Loader2, X, Building2, Upload, ArrowUpDown, Settings, RefreshCw, Eye, EyeOff, Scissors, Grid3X3, List, RotateCcw, Trash2, Copy, Move, GripVertical, ZoomIn, ZoomOut, Maximize2, Download, Lock, User, LogOut } from 'lucide-react';

// Login Component
const LoginPage = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Connect to backend authentication API
      //const API_URL= 'https://mujaa-document-generator.onrender.com'
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      console.log('🔐 Attempting login to:', `${API_URL}/api/auth/login`);
      console.log('📝 Credentials:', { username: credentials.username });
      
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password
        })
      });

      console.log('📡 Response status:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('📦 Response data:', data);

      if (response.ok && data.success) {
        console.log('✅ Login successful!');
        // Save authentication data
      localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('username', data.user.username);
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('fullName', data.user.full_name);
      onLogin(true);
    } else {
        console.error('❌ Login failed:', data);
        setError(data.message || 'Invalid username or password');
      }
    } catch (error) {
      console.error('💥 Login error:', error);
      setError('Connection error. Please check if the server is running.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">MUJAA Document Generator</h1>
          <p className="text-gray-600">Please sign in to access the system</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Enter your username"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all duration-200"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter your password"
                className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all duration-200"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

  
      </div>
    </div>
  );
};

const DocumentGenerator = ({ onLogout, onBack }) => {
  // Get user info
  const userRole = localStorage.getItem('userRole');
  const userName = localStorage.getItem('fullName') || localStorage.getItem('username');
  const isStaff = userRole === 'staff';
  const isAdmin = userRole === 'super_admin';

  // Generate unique tab ID for this browser tab (persists across refreshes within this tab)
  const [tabId] = useState(() => {
    let id = sessionStorage.getItem('tabId');
    if (!id) {
      id = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('tabId', id);
    }
    return id;
  });

  // Load initial form data from sessionStorage for this specific tab
  const [formData, setFormData] = useState(() => {
    const savedData = sessionStorage.getItem(`formData_${tabId}`);
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (e) {
        console.warn('Failed to parse saved form data:', e);
      }
    }
    return {
      cv: '',
      name: '',
      pensionCompany: '',
      pensionNo: '',
      pensionCompanyAddress: '',
      address: '', // residential address
      dob: '',
      mortgageBank: '',
      mortgageBankAddress: '',
      accountNo: ''
    };
  });

  const [status, setStatus] = useState({ message: '', type: '', visible: false });
  const [isLoading, setIsLoading] = useState(false);
  const [isBackgroundProcessing, setIsBackgroundProcessing] = useState(false);
  const [showPensionModal, setShowPensionModal] = useState(false);
  const [showMortgageModal, setShowMortgageModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mortgageSearchTerm, setMortgageSearchTerm] = useState('');
  const [currentPolicyNumber, setCurrentPolicyNumber] = useState('');
  const [showCustomOrderModal, setShowCustomOrderModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [documentOrder, setDocumentOrder] = useState([]);
  const [newPolicyNumber, setNewPolicyNumber] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  const [splitPages, setSplitPages] = useState([]);
  const [showPreview, setShowPreview] = useState({});
  const [isSplitting, setIsSplitting] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedPages, setSelectedPages] = useState(new Set());
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showFullPreview, setShowFullPreview] = useState(null);
  const [autoPreviewSplitPages, setAutoPreviewSplitPages] = useState(true);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [ilpPublicKey, setIlpPublicKey] = useState('');
  const [ilpSecretKey, setIlpSecretKey] = useState('');
  const [ilpCredits, setIlpCredits] = useState(null);
  const [isSavingIlp, setIsSavingIlp] = useState(false);
  const [thumbnails, setThumbnails] = useState({}); // id -> dataURL

  // Predefined pension companies and their addresses
  const pensionCompanies = {
    'Norrenberger Pensions Limited': 'No. 22 Otukpo Street, Off Gimbiya Street, Area 11, Garki, Abuja',
    'NPF Pensions Limited': 'Plot 3820, R.B. Dikko Street, Off Shehu Shagari Way, Opposite Force Headquarters, Central Business District (CBD), Abuja',
    'OAK Pensions Limited': '266 Muritala Mohammed Way, Yaba, Lagos',
    'Parthian Pensions Limited': '1st Floor, NIJ House, Plot 20 Adeyemo Alakija Street, Victoria Island, Lagos',
    'Pensions Alliance Limited': 'Plot 289 Ajose Adeogun Street, Victoria Island, Lagos',
    'Premium Pension Limited': 'No. 4. Agwu Street, Off Faskari Crescent, Area 3, Garki, Abuja',
    'Citizens Pensions Limited': '3rd Floor, The Beacon, Plot 15 Admiralty Way, Lekki Phase 1, Lagos',
    'Nigerian University Pension Management Company (NUPEMCO)': 'Ground Floor, Abuja Chamber of Commerce and Industry, KM 8 Umaru Musa Yaradua Express Road, Abuja',
    'Cardinal Stone Pensions Limited': '26 Adeola Hopewell Street, Victoria Island, Lagos',
    'Trustfund Pensions Limited': 'Plot 820/821 Labour House, Behind Ministry of Finance, Central Business District, Abuja',
    'Stanbic IBTC Pension Managers Limited': 'Stanbic IBTC Towers, No. 6F Walter Carrington Crescent, Victoria Island, Lagos',
    'Access-ARM Pensions Limited': 'No. 339 Cadastral Zone A08, Takwa Crescent, Off Adetokunbo Ademola Crescent, Wuse 2, Abuja',
    'Crusader Sterling Pensions Limited': 'No. 14b Keffi Street, Off Awolowo Way, South West Ikoyi, Lagos',
    'FCMB Pensions Limited': 'No. 207 Zakariya Maimalari Street, Cadastral AO, Central Business District, Abuja',
    'AXA Mansard Pensions Limited': 'Plot 1568, Muhammadu Buhari Way, Area 11, Garki, Abuja',
    'Leadway Pensure PFA Limited': '121/123 Funsho Williams Avenue, Surulere, Lagos',
    'Legacy Pension Managers Limited': '39 Adetokunbo Ademola Crescent, Wuse II, Abuja',
    'NLPC Pension Fund Administrators Limited': '312A Ikorodu Road, Anthony, Lagos',
    'IGI Pension Fund Managers Limited': 'No. 4, Adeola Odeku Street, Victoria Island, Lagos',
    'Tangerine APT Pensions Limited': 'Federal Mortgage Bank House, Plot 266, Cadastral AO, Central Business District, Abuja',
    'Veritas Glanvills Pensions Limited': 'Plot 1698 C & D, Oyin Jolayemi Street, Victoria Island, Lagos',
    'AIICO Pension Managers Limited': '2 Oba Akran Avenue, Ikeja, Lagos',
    'Fidelity Pension Managers Limited': 'Fidelity Bank Towers, 3, Fidelindo Crescent, Victoria Island, Lagos',
    'Guaranty Trust Pension Managers Limited': '172B, Moshood Olugbani Street, Off Ligali Ayorinde, Victoria Island, Lagos'
  };

  // Predefined mortgage banks and their addresses
  const mortgageBanks = {
    'JIGAWA SAVINGS & LOANS LTD': 'BINTA SUNUSI HOUSE, NO 1, KIYAWA ROAD DUTSE JIGAWA STATE',
    'KEBBI STATE HOME SAVINGS & LOANS LTD': 'PLOT 24, AHMADU BELLO WAY, BIRNIN KEBBI, KEBBI STATE',
  };

 const apiUrl = import.meta.env.VITE_API_URL ||  'http://localhost:3000';
 // const apiUrl = 'https://mujaa-document-generator.onrender.com';





  // Utility function to convert ArrayBuffer to base64 efficiently
  const arrayBufferToBase64 = (arrayBuffer) => {
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = '';
    const chunkSize = 8192; // Process in chunks to avoid stack overflow
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, chunk);
    }
    
    return btoa(binary);
  };

  // Safe response parsing using clone to avoid double-read errors
  const readJsonSafely = async (res) => {
    try {
      return await res.clone().json();
    } catch {
      return null;
    }
  };
  const readTextSafely = async (res) => {
    try {
      return await res.clone().text();
    } catch {
      return '';
    }
  };

  // Load pdf.js from CDN once
  let pdfJsLoadingPromise = null;
  const loadPdfJsOnce = () => {
    if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
    if (pdfJsLoadingPromise) return pdfJsLoadingPromise;
    pdfJsLoadingPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        try {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          resolve(window.pdfjsLib);
        } catch (e) { reject(e); }
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return pdfJsLoadingPromise;
  };

  // Generate thumbnail (PNG) for a single-page PDF data URL
  const generatePdfThumbnail = async (pdfDataUrl, maxWidth = 320) => {
    const pdfjsLib = await loadPdfJsOnce();
    const base64 = pdfDataUrl.split(',')[1] || '';
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
    const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1 });
    const scale = Math.min(1, maxWidth / viewport.width);
    const scaledViewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = Math.ceil(scaledViewport.width);
    canvas.height = Math.ceil(scaledViewport.height);
    await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise;
    return canvas.toDataURL('image/png');
  };

  // Ensure thumbnails exist for provided pages
  const ensureThumbnailsForPages = async (pages) => {
    const toRender = pages.filter(p => p.previewData && !thumbnails[p.id]);
    if (toRender.length === 0) return;
    for (const p of toRender) {
      try {
        const dataUrl = await generatePdfThumbnail(p.previewData, 320);
        setThumbnails(prev => ({ ...prev, [p.id]: dataUrl }));
      } catch (e) {
        // Ignore rendering errors; fallback to open button
      }
    }
  };

  // Auto-generate thumbnails when splitPages change
  useEffect(() => {
    if (splitPages && splitPages.length > 0) {
      ensureThumbnailsForPages(splitPages);
    }
  }, [splitPages]);

  // Save form data to sessionStorage whenever it changes (per-tab storage)
  useEffect(() => {
    sessionStorage.setItem(`formData_${tabId}`, JSON.stringify(formData));
  }, [formData, tabId]);

  useEffect(() => {
    checkHealth();
    getCurrentPolicyNumber();
  }, []);

  const showStatus = (message, type = 'info') => {
    setStatus({ message, type, visible: true });
    if (type === 'success') {
      setTimeout(() => setStatus(prev => ({ ...prev, visible: false })), 5000);
    }
  };

  const loadIlpConfigAndCredits = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.warn('⚠️ No auth token found - cannot load credits');
        setIlpCredits(0);
        return;
      }
      
      console.log('🔑 Loading iLovePDF credits with token...');
      
      // Use authenticated endpoint /api/ilp/my-config (same as Settings)
      const cfgRes = await fetch(`${apiUrl}/api/ilp/my-config`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (cfgRes.ok) {
        const cfg = await cfgRes.json();
        setIlpPublicKey(cfg.publicKey || '');
        // Credits are in the response!
        const credits = cfg.credits || 0;
        setIlpCredits(credits);
        console.log('💳 DocumentGenerator loaded LIVE credits from /my-config:', credits);
      } else {
        const errorText = await cfgRes.text();
        console.error('❌ Failed to load credits, status:', cfgRes.status, errorText);
        setIlpCredits(0);
      }
    } catch (e) {
      console.error('❌ Load config error:', e);
      setIlpCredits(0);
    }
  };

  // Load iLovePDF config on component mount
  useEffect(() => {
    loadIlpConfigAndCredits();
  }, []);

  const saveIlpConfig = async () => {
    try {
      setIsSavingIlp(true);
      showStatus('Saving keys and fetching LIVE credits...', 'info');
      
      const token = localStorage.getItem('token');
      
      // Use authenticated endpoint /api/ilp/my-config (same as Settings)
      const res = await fetch(`${apiUrl}/api/ilp/my-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          publicKey: ilpPublicKey, 
          secretKey: ilpSecretKey || undefined 
        })
      });
      
      const data = await readJsonSafely(res);
      if (!res.ok) {
        const text = await readTextSafely(res);
        throw new Error((data && data.error) || text || 'Failed to save keys');
      }
      
      // Get credits from save response
      const credits = data.credits || 0;
      setIlpCredits(credits);
      console.log('💳 DocumentGenerator saved to /my-config, got LIVE credits:', credits);
      
      showStatus(`Keys saved! Credits: ${credits}`, 'success');
      setIlpSecretKey('');
    } catch (e) {
      showStatus(`Failed to save keys: ${e.message}`, 'error');
    } finally {
      setIsSavingIlp(false);
    }
  };

  const refreshIlpCredits = async () => {
    try {
      showStatus('Refreshing credits...', 'info');
      
      const token = localStorage.getItem('token');
      
      // Use authenticated endpoint /api/ilp/refresh-credits (same as Settings)
      const res = await fetch(`${apiUrl}/api/ilp/refresh-credits`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await readJsonSafely(res);
      if (!res.ok) {
        const text = await readTextSafely(res);
        throw new Error((data && data.error) || text || 'Failed to fetch credits');
      }
      
      const credits = data.credits || 0;
      setIlpCredits(credits);
      console.log('💳 DocumentGenerator refreshed LIVE credits from /refresh-credits:', credits);
      showStatus(`Credits: ${credits}`, 'success');
      setTimeout(() => setStatus(prev => ({ ...prev, visible: false })), 2000);
    } catch (e) {
      showStatus(`Failed to fetch credits: ${e.message}`, 'error');
    }
  };

  const hideStatus = () => {
    setStatus(prev => ({ ...prev, visible: false }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFormFields = () => {
    const emptyFormData = {
      cv: '',
      name: '',
      pensionCompany: '',
      pensionNo: '',
      pensionCompanyAddress: '',
      address: '',
      dob: '',
      mortgageBank: '',
      mortgageBankAddress: '',
      accountNo: ''
    };
    setFormData(emptyFormData);
    // Also clear from sessionStorage for this tab
    sessionStorage.setItem(`formData_${tabId}`, JSON.stringify(emptyFormData));
  };

  const handlePensionCompanySelect = (company) => {
    setFormData(prev => ({
      ...prev,
      pensionCompany: company,
      pensionCompanyAddress: pensionCompanies[company]
    }));
    setShowPensionModal(false);
    setSearchTerm('');
  };

  const handleMortgageBankSelect = (bank) => {
    setFormData(prev => ({
      ...prev,
      mortgageBank: bank,
      mortgageBankAddress: mortgageBanks[bank]
    }));
    setShowMortgageModal(false);
    setMortgageSearchTerm('');
  };

  const filteredPensionCompanies = Object.keys(pensionCompanies).filter(company =>
    company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMortgageBanks = Object.keys(mortgageBanks).filter(bank =>
    bank.toLowerCase().includes(mortgageSearchTerm.toLowerCase())
  );

  const checkHealth = async () => {
    try {
      showStatus('Checking server status...', 'info');
      
      const response = await fetch(`${apiUrl}/api/health`);
      const data = await response.json();
      
      if (response.ok) {
        let message = `Server Status: ${data.status}<br/>`;
        message += `Templates Directory: ${data.templatesDirExists ? 'EXISTS' : 'MISSING'}<br/>`;
        
        // Show bank-specific template information
        if (data.templateStructure) {
          message += `<br/><strong>Template Structure:</strong><br/>`;
          message += `Common Templates: ${data.templateStructure.commonTemplates.count}/${data.templateStructure.commonTemplates.templates.length}<br/>`;
          message += `Jigawa Templates: ${data.templateStructure.jigawaTemplates.count}/${data.templateStructure.jigawaTemplates.templates.length} (${data.templateStructure.jigawaTemplates.exists ? 'EXISTS' : 'MISSING'})<br/>`;
          message += `Jigawa PDFs: ${data.templateStructure.jigawaPdfs.count}/${data.templateStructure.jigawaPdfs.templates.length} (${data.templateStructure.jigawaPdfs.exists ? 'EXISTS' : 'MISSING'})<br/>`;
          message += `Kebbi Templates: ${data.templateStructure.kebbiTemplates.count}/${data.templateStructure.kebbiTemplates.templates.length} (${data.templateStructure.kebbiTemplates.exists ? 'EXISTS' : 'MISSING'})<br/>`;
          
          if (data.templateStructure.jigawaTemplates.available.length > 0) {
            message += `Jigawa Available: ${data.templateStructure.jigawaTemplates.available.join(', ')}<br/>`;
          }
          if (data.templateStructure.jigawaPdfs.available.length > 0) {
            message += `Jigawa PDFs Available: ${data.templateStructure.jigawaPdfs.available.join(', ')}<br/>`;
          }
          if (data.templateStructure.kebbiTemplates.available.length > 0) {
            message += `Kebbi Available: ${data.templateStructure.kebbiTemplates.available.join(', ')}<br/>`;
          }
        }
        
        const isHealthy = data.templateStructure && 
          data.templateStructure.commonTemplates.count === data.templateStructure.commonTemplates.templates.length &&
          data.templateStructure.jigawaTemplates.count === data.templateStructure.jigawaTemplates.templates.length &&
          data.templateStructure.kebbiTemplates.count === data.templateStructure.kebbiTemplates.templates.length;
        
        showStatus(message, isHealthy ? 'success' : 'error');
      } else {
        showStatus(`Server Error: ${data.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      showStatus(`Connection Error: ${error.message}`, 'error');
    }
  };

  const getCurrentPolicyNumber = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/current-policy-number`);
      const data = await response.json();
      
      if (response.ok) {
        setCurrentPolicyNumber(data.policyNo);
        console.log('Current policy number:', data.policyNo);
      } else {
        console.error('Failed to get policy number:', data.error);
      }
    } catch (error) {
      console.error('Error getting policy number:', error);
    }
  };

  const handleResetPolicyNumber = async () => {
    if (!newPolicyNumber || isNaN(parseInt(newPolicyNumber))) {
      showStatus('Please enter a valid policy number', 'error');
      return;
    }

    try {
      setIsLoading(true);
      showStatus('Resetting policy number...', 'info');
      
      const response = await fetch(`${apiUrl}/api/reset-policy-number/${newPolicyNumber}`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setCurrentPolicyNumber(data.nextPolicyNumber);
        setNewPolicyNumber('');
        showStatus(`Policy number reset successfully! Next number: ${data.nextPolicyNumber}`, 'success');
      } else {
        showStatus(`Failed to reset policy number: ${data.error}`, 'error');
      }
    } catch (error) {
      showStatus(`Error resetting policy number: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };


  const validateForm = () => {
    const requiredFields = [
      { field: 'pensionCompany', label: 'Pension Company' },
      { field: 'address', label: 'Residential Address' },
      { field: 'dob', label: 'Date of Birth' },
      { field: 'mortgageBank', label: 'Mortgage Bank' }
    ];

    console.log('Validating form with data:', formData);

    for (const { field, label } of requiredFields) {
      console.log(`Checking field ${field}:`, formData[field]);
      if (!formData[field]) {
        console.log(`Validation failed for field: ${field} (${label})`);
        showStatus(`Please select/enter ${label}`, 'error');
        return false;
      }
    }
    console.log('Form validation passed!');
    return true;
  };

  const generateDocuments = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      showStatus('Generating documents...', 'info');
      
      // Ensure documentOrder is properly initialized
      const currentDocumentOrder = documentOrder.length > 0 ? documentOrder : initializeDocumentOrder();
      
      // Prepare request data with document order
      const requestData = {
        ...formData,
        documentOrder: currentDocumentOrder.map(item => ({
          type: item.type,
          documentName: item.type === 'generated' 
            ? item.id.replace('generated_', '') 
            : item.name
        }))
      };
      
      console.log(`[Tab ${tabId.slice(-4)}] Starting document generation...`);
      
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${apiUrl}/api/generate-documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      console.log(`[Tab ${tabId.slice(-4)}] Response status:`, response.status);
      console.log(`[Tab ${tabId.slice(-4)}] Response headers:`, response.headers.get('content-type'));

      if (!response.ok) {
        let errorMessage = 'Failed to generate documents';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      console.log(`[Tab ${tabId.slice(-4)}] Received PDF blob:`, blob.size, 'bytes');
      
      if (blob.size === 0) {
        throw new Error('Received empty PDF file');
      }
      
      // Format name for filename: ADAMU MUAAZU (PEN 32434344).pdf
      const formattedName = formData.name.toUpperCase();
      const filename = `${formattedName} (PEN ${formData.pensionNo}).pdf`;

      // Create download link with unique timestamp to avoid conflicts
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      // Trigger download
      document.body.appendChild(link);
      
      // Use setTimeout to ensure the blob URL is ready
      setTimeout(() => {
        console.log(`[Tab ${tabId.slice(-4)}] Triggering download for:`, filename);
        link.click();
        
        // Cleanup after a delay
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          console.log(`[Tab ${tabId.slice(-4)}] Download cleanup completed`);
        }, 100);
      }, 100);
      
      showStatus(`Documents downloaded successfully!<br/>Check your Downloads folder for the PDF file.<br/>File size: ${(blob.size / 1024).toFixed(2)} KB`, 'success');
      
      // Clear form fields after successful generation
      clearFormFields();
      
      // Refresh policy number after successful generation
      getCurrentPolicyNumber();
      
      // Refresh iLovePDF credits to reflect usage
      refreshIlpCredits();
      
      // Refresh staff dashboard data to show new document
      if (window.refreshStaffDashboard) {
        window.refreshStaffDashboard();
      }
      
    } catch (error) {
      console.error(`[Tab ${tabId.slice(-4)}] Download failed:`, error);
      showStatus(`Download failed: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      name: file.name,
      size: file.size,
      type: file.type,
      splitIntoPages: false,
      isSplit: false,
      splitPages: []
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    showStatus(`Added ${files.length} file(s) for upload`, 'success');
  };

  const splitPdfFile = async (fileObj) => {
    try {
      setIsSplitting(true);
      showStatus(`Splitting ${fileObj.name} into pages...`, 'info');
      
      // Convert file to base64 using efficient method
      const arrayBuffer = await fileObj.file.arrayBuffer();
      const base64 = arrayBufferToBase64(arrayBuffer);
      
      const response = await fetch(`${apiUrl}/api/split-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pdfData: base64,
          fileName: fileObj.name
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to split PDF');
      }

      const data = await response.json();
      
      // Update the file object with split pages
      const updatedFile = {
        ...fileObj,
        isSplit: true,
        splitPages: data.pages,
        totalPages: data.totalPages
      };
      
      // Update uploaded files
      setUploadedFiles(prev => 
        prev.map(f => f.id === fileObj.id ? updatedFile : f)
      );
      
      // Add split pages to state (document order will be updated by useEffect)
      setSplitPages(prev => [...prev, ...data.pages]);
      // Generate thumbnails for previews (mobile-friendly)
      ensureThumbnailsForPages(data.pages);
      
      // Auto-enable preview for all split pages
      if (autoPreviewSplitPages) {
        const newPreviewState = {};
        data.pages.forEach(page => {
          newPreviewState[page.id] = true;
        });
        setShowPreview(prev => ({ ...prev, ...newPreviewState }));
      }
      
      showStatus(`Successfully split ${fileObj.name} into ${data.totalPages} pages`, 'success');
      
    } catch (error) {
      console.error('PDF splitting failed:', error);
      showStatus(`Failed to split PDF: ${error.message}`, 'error');
    } finally {
      setIsSplitting(false);
    }
  };

  const togglePreview = (pageId) => {
    setShowPreview(prev => ({
      ...prev,
      [pageId]: !prev[pageId]
    }));
  };

  const togglePageSelection = (pageId) => {
    setSelectedPages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pageId)) {
        newSet.delete(pageId);
      } else {
        newSet.add(pageId);
      }
      return newSet;
    });
  };

  const selectAllPages = () => {
    const allPageIds = splitPages.map(page => page.id);
    setSelectedPages(new Set(allPageIds));
  };

  const clearSelection = () => {
    setSelectedPages(new Set());
  };

  const deleteSelectedPages = () => {
    if (selectedPages.size === 0) return;
    
    // Remove selected pages from splitPages
    setSplitPages(prev => prev.filter(page => !selectedPages.has(page.id)));
    
    // Remove from document order
    setDocumentOrder(prev => prev.filter(item => !selectedPages.has(item.id)));
    
    // Clear selection
    setSelectedPages(new Set());
    showStatus(`Deleted ${selectedPages.size} page(s)`, 'success');
  };

  const duplicateSelectedPages = () => {
    if (selectedPages.size === 0) return;
    
    const selectedPagesData = splitPages.filter(page => selectedPages.has(page.id));
    const duplicatedPages = selectedPagesData.map(page => ({
      ...page,
      id: `${page.id}_copy_${Date.now()}`,
      pageNumber: `${page.pageNumber} (Copy)`
    }));
    
    setSplitPages(prev => [...prev, ...duplicatedPages]);
    showStatus(`Duplicated ${selectedPages.size} page(s)`, 'success');
  };

  const rotatePage = (pageId, direction = 'right') => {
    // This would need backend support for actual rotation
    showStatus(`Rotate ${direction} functionality would be implemented here`, 'info');
  };

  // Multi-selection functions
  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const selectAllItems = () => {
    const allItemIds = getAllDraggableItems().map(item => item.id);
    setSelectedItems(new Set(allItemIds));
  };

  const clearItemSelection = () => {
    setSelectedItems(new Set());
  };

  const toggleMultiSelectMode = () => {
    setIsMultiSelectMode(prev => {
      if (!prev) {
        // Entering multi-select mode, clear previous selections
        setSelectedItems(new Set());
      }
      return !prev;
    });
  };

  // Get all draggable items for preview area (generated docs + split pages)
  const getAllDraggableItems = useCallback(() => {
    // Use the current document order if available, otherwise return empty array
    const currentOrder = documentOrder.length > 0 ? documentOrder : [];
    
    // Create a map of split pages for quick lookup
    const splitPagesMap = new Map();
    splitPages.forEach(page => {
      splitPagesMap.set(page.id, page);
    });

    // Convert document order items to preview items
    return currentOrder.map(item => {
      if (item.type === 'generated') {
        return {
          id: item.id,
          name: item.name,
          type: 'generated',
          order: item.order,
          isGenerated: true
        };
      } else if (item.type === 'split_page') {
        const page = splitPagesMap.get(item.id);
        if (page) {
          return {
            id: page.id,
            name: `Page ${page.pageNumber} - ${page.originalFileName}`,
            type: 'split_page',
            order: item.order,
            originalFileName: page.originalFileName,
            pageNumber: page.pageNumber,
            previewData: page.previewData,
            isSplitPage: true
          };
        }
      } else if (item.type === 'uploaded') {
        // Handle uploaded files that aren't split
        return {
          id: item.id,
          name: item.name,
          type: 'uploaded',
          order: item.order,
          isUploaded: true
        };
      }
      return null;
    }).filter(Boolean); // Remove null items
  }, [documentOrder, splitPages]);

  const removeUploadedFile = (fileId) => {
    // Find the file to get its split pages
    const fileToRemove = uploadedFiles.find(f => f.id === fileId);
    
    // Remove the file
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    
    // Remove associated split pages from document order
    if (fileToRemove && fileToRemove.isSplit) {
      setDocumentOrder(prev => 
        prev.filter(item => 
          !(item.type === 'split_page' && item.originalFileName === fileToRemove.name)
        )
      );
      
      // Remove from split pages state
      setSplitPages(prev => 
        prev.filter(page => page.originalFileName !== fileToRemove.name)
      );
    }
  };

  // Initialize document order with all available documents
  // Initialize document order with all available documents
  const initializeDocumentOrder = useCallback(() => {
    const baseGeneratedDocs = [
      'confirmation_of_property_availability',
      'confirmation_of_property_title',
      'indemnity',
      'readiness',
      'verification',
      'indicative',
      'legal_search'
    ];

    // Desired global order provided by user - THIS IS THE DEFAULT ORDER
    const desiredOrder = [
      'statement',
      'indicative',
      'mujaa_offer_letter',
      'verification',
      'indemnity',
      'clearance_cert',
      'valuation_report',
      'kbl_insurance',
      'nsia_insurance',
      'confirmation_of_property_availability',
      'confirmation_of_property_title',
      'readiness',
      'rangaza_c_of_o',
      'rangaza_deed_of_assignment',
      'legal_search'
    ];

    // Add bank-specific documents
    const generatedDocsSet = new Set(baseGeneratedDocs);
    if (formData.mortgageBank && formData.mortgageBank.toLowerCase().includes('jigawa')) {
      generatedDocsSet.add('kbl_insurance');
      generatedDocsSet.add('nsia_insurance');
      generatedDocsSet.add('mujaa_offer_letter');
      generatedDocsSet.add('valuation_report');
      generatedDocsSet.add('clearance_cert'); // Changed from pension_cert
      generatedDocsSet.add('rangaza_c_of_o');
      generatedDocsSet.add('rangaza_deed_of_assignment');
    } else if (formData.mortgageBank && formData.mortgageBank.toLowerCase().includes('kebbi')) {
      generatedDocsSet.add('statement');
      generatedDocsSet.add('kbl_insurance');
      generatedDocsSet.add('nsia_insurance');
      generatedDocsSet.add('mujaa_offer_letter');
      generatedDocsSet.add('valuation_report');
      generatedDocsSet.add('clearance_cert');
      generatedDocsSet.add('rangaza_c_of_o');
      generatedDocsSet.add('rangaza_deed_of_assignment');
    }

    // Create ordered array with proper indices based on desiredOrder
    const orderedItems = [];
    let currentOrder = 1;

    // First, place all generated docs according to desiredOrder
    desiredOrder.forEach(docName => {
      if (generatedDocsSet.has(docName)) {
        orderedItems.push({
          id: `generated_${docName}`,
          name: docName.replace(/_/g, ' ').toUpperCase(),
          type: 'generated',
          order: currentOrder++,
          documentName: docName
        });
      }
    });

    // Add any remaining generated docs not in desiredOrder (shouldn't happen but safety check)
    Array.from(generatedDocsSet).forEach(docName => {
      if (!desiredOrder.includes(docName)) {
        orderedItems.push({
          id: `generated_${docName}`,
          name: docName.replace(/_/g, ' ').toUpperCase(),
          type: 'generated',
          order: currentOrder++,
          documentName: docName
        });
      }
    });

    // Then add uploaded files (non-split)
    const uploadedDocs = uploadedFiles
      .filter(file => !file.isSplit)
      .map(file => ({
        id: file.id,
        name: file.name,
        type: 'uploaded',
        order: currentOrder++,
        splitIntoPages: file.splitIntoPages || false
      }));

    orderedItems.push(...uploadedDocs);

    // Finally add split pages
    const splitDocs = splitPages.map(page => ({
      id: page.id,
      name: `Page ${page.pageNumber} - ${page.originalFileName}`,
      type: 'split_page',
      order: currentOrder++,
      originalFileName: page.originalFileName,
      pageNumber: page.pageNumber,
      previewData: page.previewData
    }));

    orderedItems.push(...splitDocs);

    return orderedItems;
  }, [uploadedFiles, splitPages, formData.mortgageBank]);
  // Update document order when uploaded files or split pages change
  useEffect(() => {
    const newDocumentOrder = initializeDocumentOrder();
    setDocumentOrder(newDocumentOrder);
  }, [initializeDocumentOrder]);

  const handleDragStart = (e, item) => {
    // If multi-select mode and item is selected, drag all selected items
    if (isMultiSelectMode && selectedItems.has(item.id)) {
      const selectedItemsData = getAllDraggableItems().filter(i => selectedItems.has(i.id));
      setDraggedItem({ ...item, isMultiSelect: true, selectedItems: selectedItemsData });
    } else {
      setDraggedItem(item);
    }
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, item) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverItem(item);
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = (e, targetItem) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem.id === targetItem.id) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    // Get current document order - if empty, we can't reorder
    if (documentOrder.length === 0) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    const newOrder = [...documentOrder];
    
    if (draggedItem.isMultiSelect && draggedItem.selectedItems) {
      // Handle multi-selection drag
      const selectedIds = draggedItem.selectedItems.map(item => item.id);
      const targetIndex = newOrder.findIndex(item => item.id === targetItem.id);
      
      if (targetIndex === -1) {
        setDraggedItem(null);
        setDragOverItem(null);
        return;
      }

      // Remove all selected items
      const remainingItems = newOrder.filter(item => !selectedIds.includes(item.id));
      
      // Insert selected items at target position
      const itemsToInsert = draggedItem.selectedItems.map(item => ({
        ...item,
        order: targetIndex + 1
      }));
      
      // Reconstruct the order
      const beforeTarget = remainingItems.slice(0, targetIndex);
      const afterTarget = remainingItems.slice(targetIndex);
      
      newOrder.splice(0, newOrder.length, ...beforeTarget, ...itemsToInsert, ...afterTarget);
    } else {
      // Handle single item drag
      const draggedIndex = newOrder.findIndex(item => item.id === draggedItem.id);
      const targetIndex = newOrder.findIndex(item => item.id === targetItem.id);

      // If either item is not found, return
      if (draggedIndex === -1 || targetIndex === -1) {
        setDraggedItem(null);
        setDragOverItem(null);
        return;
      }

      // Remove dragged item and insert at new position
      const [removed] = newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, removed);
    }

    // Update order numbers
    const updatedOrder = newOrder.map((item, index) => ({
      ...item,
      order: index + 1
    }));

    setDocumentOrder(updatedOrder);
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const generateCustomOrderDocuments = async () => {
    console.log('generateCustomOrderDocuments called!');
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    console.log('Form validation passed, starting generation...');

    try {
      setIsLoading(true);
      showStatus('Generating custom ordered documents...', 'info');
      console.log('Loading state set to true');
      
      // Ensure documentOrder is properly initialized
      const currentDocumentOrder = documentOrder.length > 0 ? documentOrder : initializeDocumentOrder();
      
      // Convert uploaded files to base64 (only non-split files)
      const uploadedDocuments = await Promise.all(
        uploadedFiles
          .filter(file => !file.isSplit) // Only include non-split files
          .map(async (fileObj) => {
            const arrayBuffer = await fileObj.file.arrayBuffer();
            const base64 = arrayBufferToBase64(arrayBuffer);
            return {
              name: fileObj.name,
              data: base64,
              splitIntoPages: fileObj.splitIntoPages || false
            };
          })
      );
      
      const requestData = {
        ...formData,
        documentOrder: currentDocumentOrder.map(item => ({
          type: item.type,
          documentName: item.type === 'generated' 
            ? item.id.replace('generated_', '') 
            : item.type === 'split_page'
            ? item.id
            : item.name,
          pageNumber: item.type === 'split_page' ? item.pageNumber : undefined
        })),
        uploadedDocuments: uploadedDocuments,
        splitPages: splitPages // Include split pages data
      };
      
      console.log('Sending request data:', requestData);
      
      console.log('Making request to:', `${apiUrl}/api/generate-documents-with-custom-order`);
      
      console.log(`[Tab ${tabId.slice(-4)}] Starting custom order generation...`);
      
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${apiUrl}/api/generate-documents-with-custom-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      console.log(`[Tab ${tabId.slice(-4)}] Response status:`, response.status);
      console.log(`[Tab ${tabId.slice(-4)}] Response ok:`, response.ok);
      console.log(`[Tab ${tabId.slice(-4)}] Response headers:`, response.headers.get('content-type'));

      if (!response.ok) {
        let errorMessage = 'Failed to generate custom ordered documents';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.error(`[Tab ${tabId.slice(-4)}] Error response:`, errorData);
        } catch (e) {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
        console.log(`[Tab ${tabId.slice(-4)}] Received custom order PDF blob:`, blob.size, 'bytes');
      
      if (blob.size === 0) {
        throw new Error('Received empty PDF file');
      }
      
      // Format name for filename: ADAMU MUAAZU (PEN 32434344).pdf
      const formattedName = formData.name.toUpperCase();
      const filename = `${formattedName} (PEN ${formData.pensionNo}).pdf`;

      // Create download link with unique timestamp to avoid conflicts
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      // Trigger download
      document.body.appendChild(link);
      
      // Use setTimeout to ensure the blob URL is ready
      setTimeout(() => {
        console.log(`[Tab ${tabId.slice(-4)}] Triggering custom order download for:`, filename);
        link.click();
        
        // Cleanup after a delay
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          console.log(`[Tab ${tabId.slice(-4)}] Custom order download cleanup completed`);
        }, 100);
      }, 100);
      
      showStatus(`Custom ordered documents downloaded successfully!<br/>Check your Downloads folder for the PDF file.<br/>File size: ${(blob.size / 1024).toFixed(2)} KB`, 'success');
      
      // Clear form fields after successful generation
      clearFormFields();
      
      // Refresh policy number after successful generation
      getCurrentPolicyNumber();
      
      // Refresh iLovePDF credits to reflect usage
      refreshIlpCredits();
      
      // For staff users, show background processing state
      if (isStaff) {
        setIsBackgroundProcessing(true);
        showStatus(`✅ Indicative PDF downloaded!<br/>🔄 Background processing: Merging and uploading combined PDF...<br/>📄 Document will appear in "My Documents" when complete.`, 'info');
        
        // Set a timeout to clear background processing state (background job typically takes 30-60 seconds)
        setTimeout(() => {
          setIsBackgroundProcessing(false);
          showStatus(`✅ Background processing complete!<br/>📄 Check "My Documents" to see your new document.`, 'success');
          
          // Refresh dashboard data after background processing completes
          if (window.refreshStaffDashboard) {
            window.refreshStaffDashboard();
          }
        }, 60000); // 60 seconds timeout
      }
      
    } catch (error) {
      console.error('Custom order download failed:', error);
      
      // Show error message instead of automatic fallback to prevent multiple concurrent requests
      showStatus(`❌ Custom order generation failed: ${error.message}`, 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {/* Back Button - Only show if user has role (came from dashboard) */}
                {(isAdmin || isStaff) && onBack && (
                  <button
                    onClick={onBack}
                    className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-all duration-200"
                    title="Back to Dashboard"
                  >
                    ← Back
                  </button>
                )}
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full">
                <FileText className="w-8 h-8 text-white" />
              </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Document Generator</h1>
            <p className="text-gray-600">Generate pension documents with ease</p>
            <div className="flex items-center justify-center gap-4 mt-2">
              <p className="text-sm text-gray-500">
                Welcome, {userName || localStorage.getItem('username') || 'User'}
              </p>
              {isStaff && (
                <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                  Staff Member
                </span>
              )}
              {isAdmin && (
                <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                  Super Admin
                </span>
              )}
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full" title={`Tab ID: ${tabId}`}>
                Tab {tabId.slice(-4).toUpperCase()}
              </span>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Multi-Tab Support Info */}
            <div className="p-3 border border-green-200 rounded-xl bg-green-50">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-green-800">
                  <p className="font-semibold mb-1">✨ Multi-Tab Support Enabled</p>
                  <p className="text-xs text-green-700">
                    You can open up to 10 tabs simultaneously. Each tab maintains its own independent form data. 
                    Works across multiple PCs and browsers!
                  </p>
                </div>
              </div>
            </div>

            {/* iLovePDF Settings */}
            <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Settings className="w-5 h-5" /> iLovePDF Settings
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span>Credits:</span>
                  <span className={`px-2 py-0.5 rounded ${ilpCredits === null ? 'bg-gray-200 text-gray-700' : ilpCredits > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {ilpCredits === null ? 'N/A' : ilpCredits}
                  </span>
                  <button
                    type="button"
                    onClick={refreshIlpCredits}
                    className="ml-2 inline-flex items-center gap-1 px-2 py-1 border border-gray-300 rounded hover:bg-gray-100"
                    title="Refresh credits"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Public Key</label>
                  <input
                    type="text"
                    value={ilpPublicKey}
                    onChange={(e) => setIlpPublicKey(e.target.value)}
                    placeholder="Enter iLovePDF Public Key"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Secret Key (optional)</label>
                  <input
                    type="password"
                    value={ilpSecretKey}
                    onChange={(e) => setIlpSecretKey(e.target.value)}
                    placeholder="Enter iLovePDF Secret Key"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all duration-200"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={saveIlpConfig}
                  disabled={isSavingIlp}
                  className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {isSavingIlp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
                  Save Keys
                </button>
              </div>
            </div>
            {/* First Row */}

              <div className="md:col-span-8">
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      Name
    </label>
    <input
      type="text"
      name="name"
      value={formData.name}
      onChange={handleInputChange}
      placeholder="Enter Name"
      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl 
                 focus:border-purple-500 focus:outline-none transition-all duration-200"
      required
    />
  </div>
          <div>
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    CV (₦)
  </label>
  <input
    type="text"
    name="cv"
    value={
      formData.cv !== ""
        ? formData.cv.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        : ""
    }
    onChange={(e) => {
      let rawValue = e.target.value.replace(/,/g, ""); // remove commas

      // Allow decimals only once
      if (/^\d*\.?\d*$/.test(rawValue)) {
        setFormData((prev) => ({
          ...prev,
          cv: rawValue, // keep as string to avoid cutting decimals
        }));
      }
    }}
    onBlur={() => {
      // Format properly on blur (optional)
      if (formData.cv !== "" && !isNaN(formData.cv)) {
        setFormData((prev) => ({
          ...prev,
          cv: parseFloat(prev.cv).toString(),
        }));
      }
    }}
    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl 
               focus:border-purple-500 focus:outline-none 
               transition-all duration-200 text-lg"
    required
  />
</div>



            {/* Second Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all duration-200"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  name="accountNo"
                  value={formData.accountNo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Third Row */}
            {/* Third Row */}
<div className="grid grid-cols-1 md:grid-cols-12 gap-6">
  <div className="md:col-span-4">
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      Pension Number
    </label>
    <input
      type="text"
      name="pensionNo"
      value={formData.pensionNo}
      onChange={handleInputChange}
      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl 
                 focus:border-purple-500 focus:outline-none transition-all duration-200"
      required
    />
  </div>

  <div className="md:col-span-8">
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      Residential Address
    </label>
    <input
      type="text"
      name="address"
      value={formData.address}
      onChange={handleInputChange}
      placeholder="Enter your full residential address..."
      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl 
                 focus:border-purple-500 focus:outline-none transition-all duration-200"
      required
    />
  </div>
</div>


            {/* Pension Company Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                PFA (Pension Fund Administrator)
              </label>
              <button
                type="button"
                onClick={() => setShowPensionModal(true)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all duration-200 flex items-center justify-between bg-white text-left hover:border-purple-300"
              >
                <span className={formData.pensionCompany ? 'text-gray-900' : 'text-gray-500'}>
                  {formData.pensionCompany || 'Select a pension company...'}
                </span>
                <Search className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {formData.pensionCompanyAddress && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  PFA Address
                </label>
                <input
                  type="text"
                  name="pensionCompanyAddress"
                  value={formData.pensionCompanyAddress}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all duration-200 bg-gray-50"
                  readOnly
                />
              </div>
            )}

            {/* Mortgage Bank Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mortgage Bank
              </label>
              <button
                type="button"
                onClick={() => setShowMortgageModal(true)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all duration-200 flex items-center justify-between bg-white text-left hover:border-purple-300"
              >
                <span className={formData.mortgageBank ? 'text-gray-900' : 'text-gray-500'}>
                  {formData.mortgageBank || 'Select a mortgage bank...'}
                </span>
                <Building2 className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {formData.mortgageBankAddress && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mortgage Bank Address
                </label>
                <input
                  type="text"
                  name="mortgageBankAddress"
                  value={formData.mortgageBankAddress}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all duration-200 bg-gray-50"
                  readOnly
                />
              </div>
            )}
            
            {/* Policy Number Display */}
            {currentPolicyNumber && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-blue-800">Current Policy Number</h3>
                    <p className="text-2xl font-bold text-blue-900">{currentPolicyNumber}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={newPolicyNumber}
                      onChange={(e) => setNewPolicyNumber(e.target.value)}
                      placeholder="New number"
                      className="w-24 px-3 py-2 border border-blue-300 rounded-lg text-sm"
                    />
                    <button
                      onClick={handleResetPolicyNumber}
                      disabled={isLoading || !newPolicyNumber}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="button"
                onClick={checkHealth}
                disabled={isLoading}
                className="flex-1 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                Check Server Status
              </button>
              
              
              <button
                type="button"
                onClick={() => {
                  setShowCustomOrderModal(true);
                  // Initialize document order when opening modal
                  setDocumentOrder(initializeDocumentOrder());
                }}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowUpDown className="w-5 h-5" />}
                Custom Order
              </button>
              
              {!isStaff && (
                <button
                  type="submit"
                  disabled={isLoading}
                  onClick={generateDocuments}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                  Generate Documents
                </button>
              )}
            </div>
          </div>
          
          {status.visible && (
            <div className={`mt-6 p-4 rounded-xl border-l-4 ${
              status.type === 'success' 
                ? 'bg-green-50 border-green-500 text-green-700'
                : status.type === 'error'
                ? 'bg-red-50 border-red-500 text-red-700'
                : 'bg-blue-50 border-blue-500 text-blue-700'
            } transition-all duration-300`}>
              <div 
                className="text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: status.message }}
              />
              <button
                onClick={hideStatus}
                className="mt-2 text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        {/* Pension Company Selection Modal */}
        {showPensionModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800">Select Pension Company</h3>
                <button
                  onClick={() => {
                    setShowPensionModal(false);
                    setSearchTerm('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-6 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search pension companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all duration-200"
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-3">
                  {filteredPensionCompanies.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No pension companies found matching your search.</p>
                    </div>
                  ) : (
                    filteredPensionCompanies.map((company) => (
                      <button
                        key={company}
                        onClick={() => handlePensionCompanySelect(company)}
                        className="w-full p-4 text-left bg-white border-2 border-gray-100 hover:border-purple-300 hover:bg-purple-50 rounded-xl transition-all duration-200 hover:shadow-md"
                      >
                        <div className="font-semibold text-gray-900 mb-2">{company}</div>
                        <div className="text-sm text-gray-600">{pensionCompanies[company]}</div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mortgage Bank Selection Modal */}
        {showMortgageModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800">Select Mortgage Bank</h3>
                <button
                  onClick={() => {
                    setShowMortgageModal(false);
                    setMortgageSearchTerm('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-6 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search mortgage banks..."
                    value={mortgageSearchTerm}
                    onChange={(e) => setMortgageSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all duration-200"
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-3">
                  {filteredMortgageBanks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No mortgage banks found matching your search.</p>
                    </div>
                  ) : (
                    filteredMortgageBanks.map((bank) => (
                      <button
                        key={bank}
                        onClick={() => handleMortgageBankSelect(bank)}
                        className="w-full p-4 text-left bg-white border-2 border-gray-100 hover:border-purple-300 hover:bg-purple-50 rounded-xl transition-all duration-200 hover:shadow-md"
                      >
                        <div className="font-semibold text-gray-900 mb-2">{bank}</div>
                        <div className="text-sm text-gray-600">{mortgageBanks[bank]}</div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Custom Document Order Modal */}
        {showCustomOrderModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <h3 className="text-2xl font-bold text-gray-800">Document Manager</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {documentOrder.length} documents
                    </span>
                    {selectedPages.size > 0 && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        {selectedPages.size} selected
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMultiSelectMode}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isMultiSelectMode 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    title="Toggle multi-select mode"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Multi-Select
                  </button>
                  <button
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
                  >
                    {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid3X3 className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => {
                      setShowCustomOrderModal(false);
                      setUploadedFiles([]);
                      setDocumentOrder([]);
                      setSplitPages([]);
                      setShowPreview({});
                      setDraggedItem(null);
                      setDragOverItem(null);
                      setSelectedPages(new Set());
                      setSelectedItems(new Set());
                      setIsMultiSelectMode(false);
                      setViewMode('grid');
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Toolbar */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* File Upload */}
                    <div className="relative">
                      <input
                        type="file"
                        multiple
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        Upload PDFs
                      </label>
                    </div>

                    {/* Multi-Select Controls - Always Visible */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleMultiSelectMode}
                        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                          isMultiSelectMode 
                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4" />
                        Multi-Select
                      </button>
                      
                      {isMultiSelectMode && (
                        <>
                          <button
                            onClick={selectAllItems}
                            className="text-sm text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
                          >
                            Select All
                          </button>
                          <button
                            onClick={clearItemSelection}
                            className="text-sm text-gray-600 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-100"
                          >
                            Clear
                          </button>
                          {selectedItems.size > 0 && (
                            <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                              {selectedItems.size} selected
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    {/* Bulk Actions for Split Pages */}
                    {selectedPages.size > 0 && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={duplicateSelectedPages}
                          className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          <Copy className="w-4 h-4" />
                          Duplicate
                        </button>
                        <button
                          onClick={deleteSelectedPages}
                          className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Zoom Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-600 min-w-[3rem] text-center">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <button
                      onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 overflow-hidden flex">
                {/* Left Panel - Document Order */}
                <div className="w-1/3 border-r border-gray-200 p-4 overflow-y-auto">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Document Order</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Drag and drop to reorder documents. The order here will be the final order in your PDF package.
                  </p>
                  
                  <div className="space-y-2">
                    {documentOrder.map((item, index) => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                        onDragOver={(e) => handleDragOver(e, item)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, item)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center gap-3 bg-white p-3 rounded-lg border-2 transition-all duration-200 ${
                          selectedItems.has(item.id) 
                            ? 'border-blue-500 bg-blue-50' 
                            : draggedItem?.id === item.id 
                            ? 'opacity-50 scale-95' 
                            : dragOverItem?.id === item.id 
                            ? 'border-blue-400 bg-blue-50 shadow-md' 
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        } ${isMultiSelectMode ? 'cursor-pointer' : 'cursor-move'}`}
                        onClick={(e) => {
                          if (isMultiSelectMode) {
                            e.stopPropagation();
                            toggleItemSelection(item.id);
                          }
                        }}
                      >
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        {isMultiSelectMode && (
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            selectedItems.has(item.id) 
                              ? 'bg-blue-600 border-blue-600' 
                              : 'bg-white border-gray-300'
                          }`}>
                            {selectedItems.has(item.id) && (
                              <CheckCircle className="w-3 h-3 text-white" />
                            )}
                          </div>
                        )}
                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-semibold text-gray-600">
                          {item.order}
                        </div>
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700 flex-1 truncate">{item.name}</span>
                        <div className="flex gap-1">
                          {item.type === 'generated' && (
                            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">Generated</span>
                          )}
                          {item.type === 'uploaded' && (
                            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Uploaded</span>
                          )}
                          {item.type === 'split_page' && (
                            <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
                              Page {item.pageNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Panel - Document Preview */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-800">Document Preview & Ordering</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {getAllDraggableItems().length} items available
                      </span>
                    </div>
                  </div>

                  {/* Uploaded Files Section */}
                  {uploadedFiles.length > 0 && (
                    <div className="mb-6">
                      <h5 className="font-semibold text-gray-700 mb-3">Uploaded Files</h5>
                      <div className="space-y-3">
                        {uploadedFiles.map((file) => (
                          <div key={file.id} className="bg-gray-50 p-4 rounded-lg border">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-gray-500" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                                  {file.isSplit && (
                                    <p className="text-xs text-blue-600">Split into {file.totalPages} pages</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {!file.isSplit && (
                                  <button
                                    onClick={() => splitPdfFile(file)}
                                    disabled={isSplitting}
                                    className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {isSplitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Scissors className="w-3 h-3" />}
                                    Split
                                  </button>
                                )}
                                <button
                                  onClick={() => removeUploadedFile(file.id)}
                                  className="text-red-500 hover:text-red-700 p-1"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All Documents - Generated + Split Pages */}
                  {getAllDraggableItems().length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-semibold text-gray-700">All Documents</h5>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-2 text-sm text-gray-600">
                            <input
                              type="checkbox"
                              checked={autoPreviewSplitPages}
                              onChange={(e) => setAutoPreviewSplitPages(e.target.checked)}
                              className="rounded"
                            />
                            Auto-preview split pages
                          </label>
                        </div>
                      </div>
                      
                      <div className={`${viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-2'}`}>
                        {getAllDraggableItems().map((item) => (
                          <div
                            key={item.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, item)}
                            onDragOver={(e) => handleDragOver(e, item)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, item)}
                            onDragEnd={handleDragEnd}
                            className={`relative group transition-all duration-200 ${
                              viewMode === 'grid' 
                                ? 'bg-white border-2 rounded-lg overflow-hidden hover:shadow-lg' 
                                : 'bg-white border rounded-lg p-3 flex items-center gap-3 hover:shadow-md'
                            } ${
                              selectedItems.has(item.id) 
                                ? 'border-blue-500 bg-blue-50' 
                                : draggedItem?.id === item.id
                                ? 'opacity-50 scale-95'
                                : dragOverItem?.id === item.id
                                ? 'border-green-400 bg-green-50 shadow-md'
                                : 'border-gray-200 hover:border-gray-300'
                            } ${isMultiSelectMode ? 'cursor-pointer' : 'cursor-move'}`}
                            onClick={(e) => {
                              if (isMultiSelectMode) {
                                e.stopPropagation();
                                toggleItemSelection(item.id);
                              } else if (item.isSplitPage) {
                                togglePageSelection(item.id);
                              }
                            }}
                            style={{ transform: `scale(${zoomLevel})` }}
                          >
                            {/* Drag Handle */}
                            <div className="absolute top-2 left-2 z-10">
                              <GripVertical className="w-4 h-4 text-gray-400" />
                            </div>

                            {/* Selection Checkbox */}
                            <div className="absolute top-2 left-8 z-10">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                isMultiSelectMode 
                                  ? (selectedItems.has(item.id) ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300')
                                  : (item.isSplitPage && selectedPages.has(item.id) ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300')
                              }`}>
                                {(isMultiSelectMode && selectedItems.has(item.id)) || 
                                 (!isMultiSelectMode && item.isSplitPage && selectedPages.has(item.id)) ? (
                                  <CheckCircle className="w-3 h-3 text-white" />
                                ) : null}
                              </div>
                            </div>

                            {/* Item Actions */}
                            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="flex gap-1">
                                {item.isSplitPage && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      togglePreview(item.id);
                                    }}
                                    className="p-1 bg-white/90 rounded hover:bg-white transition-colors"
                                    title="Toggle preview"
                                  >
                                    {showPreview[item.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                  </button>
                                )}
                                {item.isSplitPage && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowFullPreview(item);
                                    }}
                                    className="p-1 bg-white/90 rounded hover:bg-white transition-colors"
                                    title="Full preview"
                                  >
                                    <Maximize2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Item Content */}
                            {viewMode === 'grid' ? (
                              <div className="aspect-[3/4] flex flex-col">
                                <div className="flex-1 bg-gray-100 flex items-center justify-center cursor-move">
                                  {item.isSplitPage ? (
                                    thumbnails[item.id] ? (
                                      <img src={thumbnails[item.id]} alt={`Page ${item.pageNumber} preview`} className="w-full h-full object-contain" />
                                    ) : item.previewData ? (
                                      <iframe src={item.previewData} className="w-full h-full border-0 pointer-events-none" title={`Page ${item.pageNumber} preview`} />
                                    ) : (
                                      <div className="text-center text-gray-500 p-4">Preview unavailable</div>
                                    )
                                  ) : item.isGenerated ? (
                                    <div className="text-center text-gray-500 p-4">
                                      <FileText className="w-8 h-8 mx-auto mb-2" />
                                      <p className="text-xs font-medium">{item.name}</p>
                                      <p className="text-xs text-gray-400 mt-1">Generated Document</p>
                                    </div>
                                  ) : item.isUploaded ? (
                                    <div className="text-center text-gray-500 p-4">
                                      <FileText className="w-8 h-8 mx-auto mb-2" />
                                      <p className="text-xs font-medium">{item.name}</p>
                                      <p className="text-xs text-gray-400 mt-1">Uploaded File</p>
                                    </div>
                                  ) : (
                                    <div className="text-center text-gray-500">
                                      <FileText className="w-8 h-8 mx-auto mb-2" />
                                      <p className="text-xs">Click to preview</p>
                                    </div>
                                  )}
                                </div>
                                <div className="p-2 bg-gray-50 border-t">
                                  <p className="text-xs font-medium text-gray-700 truncate">
                                    {item.isGenerated ? item.name : item.isUploaded ? item.name : `Page ${item.pageNumber}`}
                                  </p>
                                  {item.isSplitPage && (
                                    <p className="text-xs text-gray-500 truncate">
                                      {item.originalFileName}
                                    </p>
                                  )}
                                  <div className="flex gap-1 mt-1">
                                    {item.isGenerated && (
                                      <span className="text-xs text-blue-600 bg-blue-100 px-1 py-0.5 rounded">Generated</span>
                                    )}
                                    {item.isSplitPage && (
                                      <span className="text-xs text-purple-600 bg-purple-100 px-1 py-0.5 rounded">Split Page</span>
                                    )}
                                    {item.isUploaded && (
                                      <span className="text-xs text-green-600 bg-green-100 px-1 py-0.5 rounded">Uploaded</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="w-16 h-20 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 cursor-move">
                                  {item.isSplitPage ? (
                                    thumbnails[item.id] ? (
                                      <img src={thumbnails[item.id]} alt={`Page ${item.pageNumber} preview`} className="w-full h-full object-contain rounded" />
                                    ) : item.previewData ? (
                                      <iframe src={item.previewData} className="w-full h-full border-0 rounded pointer-events-none" title={`Page ${item.pageNumber} preview`} />
                                    ) : (
                                      <FileText className="w-6 h-6 text-gray-400" />
                                    )
                                  ) : (
                                    <FileText className="w-6 h-6 text-gray-400" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {item.isGenerated ? item.name : item.isUploaded ? item.name : `Page ${item.pageNumber}`}
                                  </p>
                                  {item.isSplitPage && (
                                    <p className="text-xs text-gray-500 truncate">
                                      {item.originalFileName}
                                    </p>
                                  )}
                                  <div className="flex gap-1 mt-1">
                                    {item.isGenerated && (
                                      <span className="text-xs text-blue-600 bg-blue-100 px-1 py-0.5 rounded">Generated</span>
                                    )}
                                    {item.isSplitPage && (
                                      <span className="text-xs text-purple-600 bg-purple-100 px-1 py-0.5 rounded">Split Page</span>
                                    )}
                                    {item.isUploaded && (
                                      <span className="text-xs text-green-600 bg-green-100 px-1 py-0.5 rounded">Uploaded</span>
                                    )}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {getAllDraggableItems().length === 0 && uploadedFiles.length === 0 && (
                    <div className="text-center py-12">
                      <Upload className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No documents available</h3>
                      <p className="text-gray-500 mb-4">Upload PDF files to get started with document management</p>
                      <label
                        htmlFor="file-upload"
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        Choose PDF Files
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-4">
                <button
                  onClick={() => {
                    setShowCustomOrderModal(false);
                    setUploadedFiles([]);
                    setDocumentOrder([]);
                    setSplitPages([]);
                    setShowPreview({});
                    setDraggedItem(null);
                    setDragOverItem(null);
                    setSelectedPages(new Set());
                    setViewMode('grid');
                  }}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-400 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    console.log('Generate Custom Order button clicked!');
                    console.log('isLoading state:', isLoading);
                    generateCustomOrderDocuments();
                  }}
                  disabled={isLoading || isBackgroundProcessing}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  title={isLoading ? "Generating and downloading documents..." : isBackgroundProcessing ? "Background processing: Merging and uploading..." : "Generate documents with custom order"}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating & Downloading...
                    </>
                  ) : isBackgroundProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Background Processing...
                    </>
                  ) : (
                    <>
                      <ArrowUpDown className="w-5 h-5" />
                      Generate Custom Order
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Full Preview Modal */}
        {showFullPreview && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  {showFullPreview.originalFileName} - Page {showFullPreview.pageNumber}
                </h3>
                <button
                  onClick={() => setShowFullPreview(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="flex-1 p-4 overflow-auto">
                <iframe
                  src={showFullPreview.previewData}
                  className="w-full h-full border-0 rounded"
                  title={`Full preview of page ${showFullPreview.pageNumber}`}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// User Management Component (Inline for now)
const UserManagementInline = () => {
  const [users, setUsers] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'staff'
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  
  useEffect(() => {
    // Debug: Check if token exists
    const token = localStorage.getItem('token');
    console.log('🔑 Token in localStorage:', token ? 'Yes (length: ' + token.length + ')' : 'No');
    
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('❌ No token found in localStorage');
      setMessage({ type: 'error', text: 'Not authenticated. Please login again.' });
      return;
    }
    
    try {
      console.log('📡 Fetching users with token:', token.substring(0, 20) + '...');
      
      const response = await fetch(`${API_URL}/api/admin/users`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📊 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Users loaded:', data.users?.length || 0);
        setUsers(data.users || []);
        if (data.message) {
          setMessage({ type: 'info', text: data.message });
        }
      } else {
        const error = await response.json();
        console.error('❌ Fetch users failed:', error);
        setMessage({ type: 'error', text: error.message || 'Failed to load users' });
      }
    } catch (error) {
      console.error('💥 Fetch users error:', error);
      setMessage({ type: 'error', text: 'Network error' });
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    const token = localStorage.getItem('token');
    
    if (!token) {
      setMessage({ type: 'error', text: 'Not authenticated. Please login again.' });
      return;
    }
    
    try {
      console.log('📝 Creating user:', formData.username);
      
      const response = await fetch(`${API_URL}/api/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      console.log('📡 Create user response:', response.status);
      const data = await response.json();
      console.log('📦 Response data:', data);

      if (response.ok) {
        setMessage({ type: 'success', text: '✅ Staff account created successfully!' });
        setShowCreateForm(false);
        setFormData({ username: '', email: '', password: '', full_name: '', role: 'staff' });
        fetchUsers();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else if (response.status === 503) {
        // Database not available
        setMessage({ type: 'error', text: `⚠️ ${data.message}\n\n${data.hint || ''}` });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to create user' });
      }
    } catch (error) {
      console.error('💥 Create user error:', error);
      setMessage({ type: 'error', text: 'Network error. Check if backend is running.' });
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!confirm(`Delete user "${username}"?`)) return;
    
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'User deleted' });
        fetchUsers();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.message || 'Failed to delete user' });
      }
    } catch (error) {
      console.error('Delete error:', error);
      setMessage({ type: 'error', text: 'Error deleting user' });
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">User Management</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          {showCreateForm ? '✕ Cancel' : '+ Create Staff'}
        </button>
      </div>

      {message.text && (
        <div className={`mb-4 p-3 rounded ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-bold mb-4">Create New Staff Account</h3>
          <form onSubmit={handleCreateUser} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full px-3 py-2 border rounded"
                required
                placeholder="staff1"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border rounded"
                required
                placeholder="staff@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Full Name</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                className="w-full px-3 py-2 border rounded"
                required
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Password (min 8 chars)</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-3 py-2 border rounded"
                required
                minLength="8"
                placeholder="********"
              />
            </div>
            <div className="col-span-2">
              <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700">
                Create Staff Account
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Username</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Full Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Role</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                  No users yet. Click "Create Staff" to add staff members.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{user.username}</td>
                  <td className="px-4 py-3">{user.full_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded ${
                      user.role === 'super_admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role === 'super_admin' ? 'Admin' : 'Staff'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded ${
                      user.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {user.role !== 'super_admin' && (
                      <button
                        onClick={() => handleDeleteUser(user.id, user.username)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Import dashboard components (create simple placeholders if files don't exist)
const AdminDashboardSimple = ({ onLogout, userName }) => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [dashboardStats, setDashboardStats] = useState({
    total_documents: 0,
    pending_documents: 0,
    active_staff: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // API URL configuration
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${apiUrl}/api/admin/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setDashboardStats({
            total_documents: data.stats.total_documents || 0,
            pending_documents: data.stats.pending_documents || 0,
            active_staff: data.stats.active_staff || 0
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-gradient-to-r from-purple-600 to-indigo-700 shadow-lg p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Super Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-white font-medium">Welcome, {userName}</span>
          <button onClick={onLogout} className="bg-white text-purple-700 px-4 py-2 rounded-lg hover:bg-gray-100 font-semibold transition-colors">
            Logout
          </button>
        </div>
      </nav>
      
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gradient-to-b from-gray-800 to-gray-900 shadow-lg min-h-screen p-4">
          <div className="space-y-2">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                currentTab === 'dashboard' 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setCurrentTab('users')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                currentTab === 'users' 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              👥 Manage Users
            </button>
            <button
              onClick={() => setCurrentTab('documents')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                currentTab === 'documents' 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              📄 All Documents
            </button>
            <button
              onClick={() => setCurrentTab('generate')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                currentTab === 'generate' 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              ✏️ Generate Documents
            </button>
            <button
              onClick={() => setCurrentTab('settings')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                currentTab === 'settings' 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              ⚙️ System Settings
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {currentTab === 'dashboard' && (
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-gray-600 mb-2">Total Documents</h3>
                  {isLoadingStats ? (
                    <div className="text-3xl font-bold text-gray-400">
                      <div className="w-12 h-9 bg-gray-200 animate-pulse rounded"></div>
                    </div>
                  ) : (
                    <p className="text-3xl font-bold text-purple-600">{dashboardStats.total_documents}</p>
                  )}
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-gray-600 mb-2">Pending Review</h3>
                  {isLoadingStats ? (
                    <div className="text-3xl font-bold text-gray-400">
                      <div className="w-12 h-9 bg-gray-200 animate-pulse rounded"></div>
                    </div>
                  ) : (
                    <p className="text-3xl font-bold text-yellow-600">{dashboardStats.pending_documents}</p>
                  )}
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-gray-600 mb-2">Active Staff</h3>
                  {isLoadingStats ? (
                    <div className="text-3xl font-bold text-gray-400">
                      <div className="w-12 h-9 bg-gray-200 animate-pulse rounded"></div>
                    </div>
                  ) : (
                    <p className="text-3xl font-bold text-green-600">{dashboardStats.active_staff}</p>
                  )}
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-bold mb-4">Quick Start Guide</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Click "Manage Users" to create staff accounts</li>
                  <li>Share login credentials with staff members</li>
                  <li>Staff can login and generate documents</li>
                  <li>View all documents in "All Documents" tab</li>
                  <li>Or use "Generate Documents" to create documents yourself</li>
                </ol>
              </div>
            </div>
          )}

          {currentTab === 'users' && <UserManagementInline />}

          {currentTab === 'documents' && <AllDocumentsView />}

          {currentTab === 'generate' && (
            <div className="p-0">
              <DocumentGenerator 
                onLogout={onLogout} 
                onBack={() => setCurrentTab('dashboard')} 
              />
            </div>
          )}

          {currentTab === 'settings' && <UserSettingsInline />}
        </div>
      </div>
    </div>
  );
};

// User Settings Component (Inline)
const UserSettingsInline = () => {
  const [ilpConfig, setIlpConfig] = useState({ publicKey: '', secretKey: '', credits: 0 });
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const token = localStorage.getItem('token');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch(`${API_URL}/api/ilp/my-config`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setIlpConfig({ publicKey: data.publicKey || '', secretKey: '', credits: data.credits || 0 });
      }
    } catch (error) {
      console.error('Load config error:', error);
    }
  };

  const handleSaveKeys = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: 'info', text: 'Saving keys and fetching credits...' });
    
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
      console.log('📦 Save keys response:', data);
      console.log('💳 Credits in response:', data.credits);

      if (response.ok) {
        // Update credits from response
        if (data.credits !== undefined) {
          console.log('✅ Updating credits to:', data.credits);
          setIlpConfig(prev => ({ ...prev, credits: data.credits, secretKey: '' }));
          setMessage({ type: 'success', text: `✅ Keys saved! Credits: ${data.credits}` });
        } else {
          console.warn('⚠️ No credits in response');
          setMessage({ type: 'success', text: '✅ Keys saved successfully!' });
          setIlpConfig(prev => ({ ...prev, secretKey: '' }));
        }
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        
        // Reload config to get fresh data
        setTimeout(() => loadConfig(), 500);
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setSaving(false);
    }
  };

  const handleRefreshCredits = async () => {
    try {
      setMessage({ type: 'info', text: 'Refreshing credits...' });
      
      const response = await fetch(`${API_URL}/api/ilp/refresh-credits`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setIlpConfig(prev => ({ ...prev, credits: data.credits || 0 }));
        setMessage({ type: 'success', text: `✅ Credits: ${data.credits || 0}` });
        setTimeout(() => setMessage({ type: '', text: '' }), 2000);
      }
    } catch (error) {
      console.error('Refresh error:', error);
      setMessage({ type: 'error', text: 'Failed to refresh credits' });
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">My Settings</h2>

      {message.text && (
        <div className={`mb-4 p-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">iLovePDF API Keys</h3>
        <form onSubmit={handleSaveKeys} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Public Key</label>
            <input
              type="text"
              value={ilpConfig.publicKey}
              onChange={(e) => setIlpConfig({...ilpConfig, publicKey: e.target.value})}
              placeholder="project_public_..."
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Secret Key (optional)</label>
            <div className="relative">
              <input
                type={showSecretKey ? "text" : "password"}
                value={ilpConfig.secretKey}
                onChange={(e) => setIlpConfig({...ilpConfig, secretKey: e.target.value})}
                placeholder="secret_key_..."
                className="w-full px-3 py-2 pr-10 border rounded"
              />
              <button
                type="button"
                onClick={() => setShowSecretKey(!showSecretKey)}
                className="absolute right-3 top-3 text-gray-400"
              >
                {showSecretKey ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">API Credits: </span>
              <span className={`text-lg font-bold px-3 py-1 rounded ${
                ilpConfig.credits > 100 ? 'bg-green-100 text-green-700' :
                ilpConfig.credits > 50 ? 'bg-yellow-100 text-yellow-700' :
                ilpConfig.credits > 0 ? 'bg-orange-100 text-orange-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {ilpConfig.credits}
              </span>
              <button
                type="button"
                onClick={handleRefreshCredits}
                className="text-sm text-purple-600 hover:text-purple-700 underline"
                title="Refresh credits from iLovePDF"
              >
                🔄 Refresh
              </button>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Keys'}
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded">
          <p className="text-sm text-blue-800">
            <strong>💡 Your personal API keys:</strong> Each user manages their own iLovePDF keys. 
            When you generate documents, your keys are used for PDF conversion.
          </p>
        </div>
      </div>
    </div>
  );
};

// All Documents View Component for Admin
const AllDocumentsView = () => {
  const [documents, setDocuments] = useState([]);
  const [allDocuments, setAllDocuments] = useState([]); // Store all documents for client-side filtering
  const [filter, setFilter] = useState('all');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    fetchDocuments();
  }, [filter]);

  // Client-side filtering based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setDocuments(allDocuments);
    } else {
      const filtered = allDocuments.filter(doc => {
        const search = searchTerm.toLowerCase();
        const clientName = (doc.client_name || '').toLowerCase();
        const pensionNo = (doc.client_pension_no || '').toLowerCase();
        const policyNo = (doc.policy_number || '').toLowerCase();
        const documentRef = (doc.document_ref || '').toLowerCase();
        
        return clientName.includes(search) || 
               pensionNo.includes(search) || 
               policyNo.includes(search) || 
               documentRef.includes(search);
      });
      setDocuments(filtered);
    }
  }, [searchTerm, allDocuments]);

  const fetchDocuments = async () => {
    const token = localStorage.getItem('token');
    try {
      const url = filter === 'all' 
        ? `${API_URL}/api/admin/documents`
        : `${API_URL}/api/admin/documents?status=${filter}`;
        
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAllDocuments(data.documents || []);
        setDocuments(data.documents || []);
        if (data.documents && data.documents.length === 0) {
          setMessage({ type: 'info', text: 'No documents found. Documents will appear here when staff generate them.' });
        }
      } else {
        setMessage({ type: 'info', text: 'Database not configured. Setup MySQL to track documents.' });
      }
    } catch (error) {
      console.error('Fetch documents error:', error);
      setMessage({ type: 'info', text: 'Database not available. Documents tracking requires MySQL.' });
    }
  };

  const handleDownloadPdf = async (docId, action = 'download') => {
    try {
      const token = localStorage.getItem('token');
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
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'document.pdf';
        
        if (contentDisposition) {
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
    if (selectedDocuments.length === documents.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(documents.map(doc => doc.id));
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
      const token = localStorage.getItem('token');

      if (deleteTarget.length === 1) {
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

        setMessage({ type: 'success', text: 'Document deleted successfully' });
      } else {
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
        setMessage({ type: 'success', text: `${result.deletedCount} document(s) deleted successfully` });
      }

      setSelectedDocuments([]);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      setIsDeleting(false);
      fetchDocuments();

    } catch (error) {
      console.error('Delete error:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to delete document(s)' });
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">All Documents</h2>
        <div className="flex gap-2 items-center">
          {selectedDocuments.length > 0 && (
            <button 
              onClick={handleBulkDelete}
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 font-medium"
            >
              🗑️ Delete Selected ({selectedDocuments.length})
            </button>
          )}
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>All</button>
          <button onClick={() => setFilter('pending')} className={`px-4 py-2 rounded ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200'}`}>Pending</button>
          <button onClick={() => setFilter('submitted')} className={`px-4 py-2 rounded ${filter === 'submitted' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Submitted</button>
          <button onClick={() => setFilter('approved')} className={`px-4 py-2 rounded ${filter === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>Approved</button>
        </div>
      </div>

      {message.text && (
        <div className={`mb-4 p-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
          {message.text}
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="🔍 Search by client name, pension number, policy number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium" style={{ width: '40px' }}>
                <input
                  type="checkbox"
                  checked={selectedDocuments.length === documents.length && documents.length > 0}
                  onChange={handleSelectAll}
                  className="cursor-pointer"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">Pension #</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Client Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Generated By</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                  No documents yet. Documents will appear here when staff generate them.
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc.id} className={`border-t hover:bg-gray-50 ${selectedDocuments.includes(doc.id) ? 'bg-blue-50' : ''}`}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedDocuments.includes(doc.id)}
                      onChange={() => handleSelectDocument(doc.id)}
                      className="cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium">{doc.client_pension_no || doc.policy_number}</td>
                  <td className="px-4 py-3">{doc.client_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{doc.generated_by_name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded ${
                      doc.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      doc.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                      doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{new Date(doc.generated_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-center flex-wrap">
                      {doc.cpanel_pdf_url ? (
                        <>
                      <button
                            onClick={() => handleDownloadPdf(doc.id, 'view')}
                            className="px-3 py-1 border border-green-500 text-green-600 rounded hover:bg-green-500 hover:text-white transition-colors text-sm font-medium"
                            title="View PDF"
                      >
                            👁️ View
                      </button>
                          <button
                            onClick={() => handleDownloadPdf(doc.id, 'download')}
                            className="px-3 py-1 border border-blue-500 text-blue-600 rounded hover:bg-blue-500 hover:text-white transition-colors text-sm font-medium"
                            title="Download PDF"
                          >
                            📥 Download
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-400 text-sm">N/A</span>
                      )}
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="px-3 py-1 border border-red-500 text-red-600 rounded hover:bg-red-500 hover:text-white transition-colors text-sm font-medium"
                        title="Delete Document"
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
  );
};

const StaffDashboardSimple = ({ onLogout, userName }) => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [myDocuments, setMyDocuments] = useState([]);
  const [allDocuments, setAllDocuments] = useState([]); // Store all documents for client-side filtering
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // API URL configuration
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    fetchDashboardData();
    
    // Expose refresh function globally for document generation callbacks
    window.refreshStaffDashboard = fetchDashboardData;
    
    // Cleanup on unmount
    return () => {
      delete window.refreshStaffDashboard;
    };
  }, []);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Client-side filtering and pagination
  useEffect(() => {
    let filtered = allDocuments;
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      filtered = allDocuments.filter(doc => {
        const search = searchTerm.toLowerCase();
        const clientName = (doc.client_name || '').toLowerCase();
        const pensionNo = (doc.client_pension_no || '').toLowerCase();
        const policyNo = (doc.policy_number || '').toLowerCase();
        const documentRef = (doc.document_ref || '').toLowerCase();
        
        return clientName.includes(search) || 
               pensionNo.includes(search) || 
               policyNo.includes(search) || 
               documentRef.includes(search);
      });
    }
    
    // Apply pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginated = filtered.slice(startIndex, endIndex);
    
    setMyDocuments(paginated);
  }, [searchTerm, allDocuments, currentPage, itemsPerPage]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔄 Fetching staff dashboard data from:', `${apiUrl}/api/staff/dashboard`);
      
      const response = await fetch(`${apiUrl}/api/staff/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📡 Dashboard API response status:', response.status, response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Loaded staff dashboard data for user');
        
        setStats(data.stats);
        setAllDocuments(data.recentDocuments || []);
        setMyDocuments(data.recentDocuments || []);
        setNotifications(data.notifications || []);
      } else {
        const errorText = await response.text();
        console.error('❌ Dashboard API error:', response.status, errorText);
      }
    } catch (error) {
      console.error('❌ Failed to fetch dashboard:', error);
    }
  };

  const handleDownloadPdf = async (docId, action = 'download') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/staff/document/${docId}/download?action=${action}`, {
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

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Staff Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-white font-medium">Welcome, {userName}</span>
          <button onClick={onLogout} className="bg-white text-blue-700 px-4 py-2 rounded-lg hover:bg-gray-100 font-semibold transition-colors">
            Logout
          </button>
        </div>
      </nav>
      
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gradient-to-b from-gray-800 to-gray-900 shadow-lg min-h-screen p-4">
          <div className="space-y-2">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                currentTab === 'dashboard' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setCurrentTab('generate')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                currentTab === 'generate' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              ✏️ Generate Documents
            </button>
            <button
              onClick={() => setCurrentTab('my-documents')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                currentTab === 'my-documents' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              📄 My Documents
            </button>
            <button
              onClick={() => setCurrentTab('settings')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                currentTab === 'settings' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              ⚙️ My Settings
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {currentTab === 'dashboard' && (
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-gray-600 mb-2">My Documents</h3>
                  <p className="text-3xl font-bold text-blue-600">{stats?.total_documents || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-gray-600 mb-2">Pending</h3>
                  <p className="text-3xl font-bold text-yellow-600">{stats?.pending_documents || 0}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-bold mb-4">Quick Start</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Click "Generate Documents" to create new documents</li>
                  <li>You will see the Indicative PDF after generation</li>
                  <li>Combined PDF is automatically sent to Super Admin</li>
                  <li>Check "My Documents" to see your submissions</li>
                </ol>
              </div>
            </div>
          )}

          {currentTab === 'generate' && (
            <div className="p-0">
              <DocumentGenerator 
                onLogout={onLogout} 
                onBack={() => setCurrentTab('dashboard')} 
              />
            </div>
          )}

          {currentTab === 'my-documents' && (
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-4">My Documents</h2>
              
              {/* Search Bar */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="🔍 Search by client name, pension number, policy number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
                />
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Pension #</th>
                      <th className="text-left py-3 px-4">Client Name</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-center py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myDocuments.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-6 text-gray-500">
                          No documents yet. Click "Generate Documents" to start!
                        </td>
                      </tr>
                    ) : (
                      myDocuments.map((doc) => (
                        <tr key={doc.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{doc.client_pension_no || doc.policy_number}</td>
                          <td className="py-3 px-4">{doc.client_name}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              doc.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                              doc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {doc.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">{new Date(doc.generated_at).toLocaleDateString()}</td>
                          <td className="py-3 px-4">
                            {doc.indicative_pdf_path ? (
                              <div className="flex gap-2 justify-center">
                                <button 
                                  onClick={() => handleDownloadPdf(doc.id, 'view')}
                                  className="px-3 py-1 border border-green-500 text-green-600 rounded hover:bg-green-500 hover:text-white transition-colors text-sm font-medium"
                                >
                                  👁️ View PDF
                                </button>
                                <button 
                                  onClick={() => handleDownloadPdf(doc.id, 'download')}
                                  className="px-3 py-1 border border-blue-500 text-blue-600 rounded hover:bg-blue-500 hover:text-white transition-colors text-sm font-medium"
                                >
                                  📥 Download PDF
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">N/A</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                <p className="text-sm text-gray-500 mt-4">
                  Note: You can only view Indicative PDFs. Combined PDFs are available to Super Admin only.
                </p>
                
                {/* Pagination Controls */}
                {(() => {
                  let filtered = allDocuments;
                  if (searchTerm.trim() !== '') {
                    filtered = allDocuments.filter(doc => {
                      const search = searchTerm.toLowerCase();
                      const clientName = (doc.client_name || '').toLowerCase();
                      const pensionNo = (doc.client_pension_no || '').toLowerCase();
                      const policyNo = (doc.policy_number || '').toLowerCase();
                      const documentRef = (doc.document_ref || '').toLowerCase();
                      return clientName.includes(search) || pensionNo.includes(search) || policyNo.includes(search) || documentRef.includes(search);
                    });
                  }
                  const totalPages = Math.ceil(filtered.length / itemsPerPage);
                  const startItem = (currentPage - 1) * itemsPerPage + 1;
                  const endItem = Math.min(currentPage * itemsPerPage, filtered.length);
                  
                  if (totalPages <= 1) return null;
                  
                  return (
                    <div className="mt-6 flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Showing {startItem} to {endItem} of {filtered.length} documents
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Previous
                        </button>
                        <span className="px-4 py-2 text-sm font-medium">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {currentTab === 'settings' && <UserSettingsInline />}
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('');
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('fullName') || localStorage.getItem('username');
    
    // Check URL params
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'generator') {
      setCurrentView('generator');
    }
    
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      setUserRole(role);
      setUserName(name);
    }
  }, []);

  const handleLogin = (success) => {
    setIsAuthenticated(success);
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('fullName') || localStorage.getItem('username');
    setUserRole(role);
    setUserName(name);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('fullName');
    setIsAuthenticated(false);
    setUserRole(null);
    setUserName('');
    setCurrentView('dashboard');
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Show document generator if requested
  if (currentView === 'generator') {
    return <DocumentGenerator onLogout={handleLogout} onBack={() => setCurrentView('dashboard')} />;
  }

  // Show role-based dashboard
  if (userRole === 'super_admin') {
    return <AdminDashboardSimple onLogout={handleLogout} userName={userName} />;
  } else if (userRole === 'staff') {
    return <StaffDashboardSimple onLogout={handleLogout} userName={userName} />;
  }

  // Fallback to document generator for backward compatibility
  return <DocumentGenerator onLogout={handleLogout} />;
};

export default App;