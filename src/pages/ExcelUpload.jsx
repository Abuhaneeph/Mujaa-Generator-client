import { useState, useRef, useEffect } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, Loader2, Download, ArrowLeft, AlertCircle, Play, X, RotateCcw } from 'lucide-react';
import './Dashboard.css';

export default function ExcelUpload({ onBack, onLogout }) {
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [storageId, setStorageId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [processing, setProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState({}); // { applicantId: 'pending' | 'processing' | 'success' | 'error' }
  const [errorMessages, setErrorMessages] = useState({}); // { applicantId: 'error message' }
  const [completedApplicants, setCompletedApplicants] = useState(new Set());
  const [error, setError] = useState('');
  const [validationResults, setValidationResults] = useState(null); // Validation results from server
  const [downloadingZip, setDownloadingZip] = useState(false); // Track ZIP download status
  const fileInputRef = useRef(null);
  const token = localStorage.getItem('token');
  const user = {
    full_name: localStorage.getItem('fullName') || localStorage.getItem('username')
  };

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileExt = selectedFile.name.split('.').pop().toLowerCase();
      if (!['xlsx', 'xls'].includes(fileExt)) {
        setError('Please select an Excel file (.xlsx or .xls)');
        return;
      }
      setFile(selectedFile);
      setError('');
      setApplicants([]);
      setStorageId(null);
      setProcessingStatus({});
      setCompletedApplicants(new Set());
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const fileExt = droppedFile.name.split('.').pop().toLowerCase();
      if (!['xlsx', 'xls'].includes(fileExt)) {
        setError('Please drop an Excel file (.xlsx or .xls)');
        return;
      }
      setFile(droppedFile);
      setError('');
      setApplicants([]);
      setStorageId(null);
      setProcessingStatus({});
      setCompletedApplicants(new Set());
    }
  };

  const handleParse = async () => {
    if (!file) {
      setError('Please select an Excel file first');
      return;
    }

    setParsing(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('excelFile', file);

      const response = await fetch(`${API_URL}/api/parse-excel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to parse Excel file');
      }

      setApplicants(data.applicants || []);
      setStorageId(data.storageId);
      setCurrentPage(1);
      setProcessingStatus({});
      setCompletedApplicants(new Set());
      
      // Store validation results if provided
      if (data.validation) {
        setValidationResults(data.validation);
      }
      
      // Initialize status for all applicants
      const initialStatus = {};
      data.applicants.forEach(applicant => {
        initialStatus[applicant.id] = 'pending';
      });
      setProcessingStatus(initialStatus);

    } catch (err) {
      console.error('Parse error:', err);
      setError(err.message || 'Failed to parse Excel file');
    } finally {
      setParsing(false);
    }
  };

  const processBatch = async (applicantIds, batchNumber) => {
    try {
      // Update status to processing
      const newStatus = { ...processingStatus };
      applicantIds.forEach(id => {
        if (!completedApplicants.has(id)) {
          newStatus[id] = 'processing';
        }
      });
      setProcessingStatus(newStatus);

      const response = await fetch(`${API_URL}/api/process-excel-batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          storageId,
          applicantIds,
          batchNumber
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // If there are completed documents, try to download them
        if (data.hasCompletedDocuments) {
          setDownloadingZip(true);
          try {
            const zipResponse = await fetch(`${API_URL}/api/download-excel-batch-zip/${storageId}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });

            if (zipResponse.ok) {
              const blob = await zipResponse.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `documents_partial_${Date.now()}.zip`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              window.URL.revokeObjectURL(url);
              setError(`Processing failed. Downloaded ${data.completedCount || 0} completed document(s). ${data.message || data.error || 'Batch processing failed'}`);
            } else {
        throw new Error(data.message || data.error || 'Batch processing failed');
            }
          } catch (zipErr) {
            throw new Error(data.message || data.error || 'Batch processing failed');
          } finally {
            setDownloadingZip(false);
          }
        } else {
          throw new Error(data.message || data.error || 'Batch processing failed');
        }
        return;
      }

      // Update status based on results
      const updatedStatus = { ...processingStatus };
      const newCompleted = new Set(completedApplicants);
      const newErrorMessages = { ...errorMessages };

      data.results.forEach(result => {
        updatedStatus[result.id] = 'success';
        newCompleted.add(result.id);
        // Clear any previous error message
        delete newErrorMessages[result.id];
      });

      data.errors.forEach(error => {
        updatedStatus[error.id] = 'error';
        newCompleted.add(error.id);
        newErrorMessages[error.id] = error.error || 'Processing failed';
      });

      setProcessingStatus(updatedStatus);
      setCompletedApplicants(newCompleted);
      setErrorMessages(newErrorMessages);

      return data;

    } catch (err) {
      console.error('Batch processing error:', err);
      const updatedStatus = { ...processingStatus };
      const newErrorMessages = { ...errorMessages };
      applicantIds.forEach(id => {
        if (!completedApplicants.has(id)) {
          updatedStatus[id] = 'error';
          newErrorMessages[id] = err.message || 'Processing failed';
        }
      });
      setProcessingStatus(updatedStatus);
      setErrorMessages(newErrorMessages);
      throw err;
    }
  };

  const handleStartProcessing = async () => {
    if (!storageId || applicants.length === 0) {
      setError('Please parse Excel file first');
      return;
    }

    // Check if there are validation errors that prevent processing
    if (validationResults) {
      const hasErrors = validationResults.errors && validationResults.errors.length > 0;
      const hasInvalidRows = validationResults.invalidRows && validationResults.invalidRows.length > 0;
      const hasMissingColumns = validationResults.missingColumns && validationResults.missingColumns.length > 0;
      
      if (hasErrors || hasMissingColumns || (hasInvalidRows && validationResults.validRows === 0)) {
        setError('Cannot start processing: Please fix validation errors in your Excel file and re-upload. Check the validation results above for details.');
        return;
      }
      
      if (hasInvalidRows && validationResults.validRows > 0) {
        const proceed = window.confirm(
          `Warning: ${validationResults.invalidRows.length} row(s) have validation issues and will be skipped. ` +
          `Only ${validationResults.validRows} valid row(s) will be processed. Do you want to continue?`
        );
        if (!proceed) {
          return;
        }
      }
    }

    setProcessing(true);
    setError('');

    try {
      // Process one applicant at a time
      const totalApplicants = applicants.length;

      for (let i = 0; i < totalApplicants; i++) {
        // Process one applicant at a time
        const applicantId = applicants[i].id;
        await processBatch([applicantId], i + 1);

        // Small delay between applicants to avoid overwhelming the server
        if (i < totalApplicants - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

    } catch (err) {
      setError(err.message || 'Processing failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = async () => {
    // Stop any ongoing processing
    if (processing) {
      setProcessing(false);
    }
    
    // Clear all state
    setFile(null);
    setApplicants([]);
    setStorageId(null);
    setProcessingStatus({});
    setErrorMessages({});
    setCompletedApplicants(new Set());
    setError('');
    setCurrentPage(1);
    setValidationResults(null);
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Optionally delete the storage on server
    if (storageId) {
      try {
        await fetch(`${API_URL}/api/clear-excel-storage/${storageId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (err) {
        console.warn('Failed to clear storage on server:', err);
      }
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await fetch(`${API_URL}/api/download-excel-template`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to download template');
      }

      const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
      a.download = 'excel_template.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Template download error:', err);
      setError(err.message || 'Failed to download template');
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(applicants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentApplicants = applicants.slice(startIndex, endIndex);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing':
        return <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />;
      case 'success':
        return <CheckCircle size={16} color="#10b981" />;
      case 'error':
        return <XCircle size={16} color="#ef4444" />;
      default:
        return <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#d1d5db' }} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'processing':
        return 'Processing...';
      case 'success':
        return 'Completed';
      case 'error':
        return 'Failed';
      default:
        return 'Pending';
    }
  };

  const completedCount = completedApplicants.size;
  const successCount = Object.values(processingStatus).filter(s => s === 'success').length;
  const errorCount = Object.values(processingStatus).filter(s => s === 'error').length;

  return (
    <div className="dashboard">
      {!onBack && (
        <nav className="dashboard-nav">
          <div className="nav-brand">
            <h2>Mujaa Admin</h2>
          </div>
          <div className="nav-user">
            <span>Welcome, {user?.full_name}</span>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </div>
        </nav>
      )}

      <div className="dashboard-content">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem', 
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '8px 16px',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#e5e7eb';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#f3f4f6';
              }}
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>
          )}
          <h1 style={{ margin: 0, flex: 1, fontSize: 'clamp(1.125rem, 4vw, 1.5rem)' }}>Excel Batch Upload</h1>
        </div>

        <div className="excel-upload-container">
          {/* Instructions Card */}
          <div className="excel-instructions-card">
            <h3 style={{ 
              marginTop: 0, 
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '1.125rem',
              fontWeight: '600'
            }}>
              <AlertCircle size={20} color="#3b82f6" />
              Instructions
            </h3>
            <ul style={{ 
              margin: 0, 
              paddingLeft: '1.5rem',
              color: '#4b5563',
              lineHeight: '1.8',
              fontSize: 'clamp(0.875rem, 2vw, 1rem)'
            }}>
              <li>Upload an Excel file (.xlsx or .xls) containing client data</li>
              <li>Required columns: Name, CV, Pension Company, Pension No, Pension Company Address, Account No, Address, DOB, Mortgage Bank, Mortgage Bank Address</li>
              <li>Column names are case-insensitive and support variations</li>
              <li>After parsing, you'll see all applicants with pagination</li>
              <li>Processing happens in batches of 10 concurrent requests</li>
            </ul>
            <button
              onClick={downloadTemplate}
              style={{
                marginTop: '1rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#2563eb';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#3b82f6';
              }}
            >
              <Download size={16} />
              Download Template (XLSX)
            </button>
          </div>

          {/* Upload Area */}
          {!storageId && (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="excel-upload-area"
              style={{
                borderColor: file ? '#10b981' : error ? '#ef4444' : '#d1d5db',
                backgroundColor: file ? '#f0fdf4' : error ? '#fef2f2' : '#f9fafb',
                cursor: parsing ? 'not-allowed' : 'pointer',
                padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 2rem)'
              }}
              onClick={() => !parsing && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                disabled={parsing}
              />
              
              {parsing ? (
                <div>
                  <Loader2 size={48} style={{ 
                    margin: '0 auto 1rem',
                    color: '#3b82f6',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <p style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)', fontWeight: '500', color: '#374151' }}>
                    Parsing Excel file...
                  </p>
                </div>
              ) : file ? (
                <div>
                  <CheckCircle size={48} style={{ 
                    margin: '0 auto 1rem',
                    color: '#10b981'
                  }} />
                  <p style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)', fontWeight: '500', color: '#374151', marginBottom: '0.5rem', wordBreak: 'break-word' }}>
                    {file.name}
                  </p>
                  <p style={{ color: '#6b7280', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', marginBottom: '1rem' }}>
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleParse();
                    }}
                    style={{
                      padding: 'clamp(8px, 2vw, 10px) clamp(16px, 4vw, 20px)',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                      fontWeight: '500',
                      marginRight: '0.5rem',
                      marginBottom: '0.5rem',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = '#2563eb';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = '#3b82f6';
                    }}
                  >
                    Parse Excel File
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setError('');
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    style={{
                      padding: 'clamp(8px, 2vw, 10px) clamp(16px, 4vw, 20px)',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                      fontWeight: '500',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Remove File
                  </button>
                </div>
              ) : (
                <div>
                  <FileSpreadsheet size={48} style={{ 
                    margin: '0 auto 1rem',
                    color: '#6b7280'
                  }} />
                  <p style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    Drag & drop your Excel file here
                  </p>
                  <p style={{ color: '#6b7280', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', marginBottom: '1rem' }}>
                    or click to browse
                  </p>
                  <p style={{ color: '#9ca3af', fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)' }}>
                    Supports .xlsx and .xls files
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              color: '#991b1b'
            }}>
              <XCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1, fontSize: 'clamp(0.875rem, 2vw, 1rem)', wordBreak: 'break-word' }}>
                {error}
              </div>
            </div>
          )}

          {/* Validation Blocking Message */}
          {validationResults && storageId && applicants.length > 0 && (() => {
            const hasBlockingErrors = 
              (validationResults.errors && validationResults.errors.length > 0) ||
              (validationResults.missingColumns && validationResults.missingColumns.length > 0) ||
              (validationResults.invalidRows && validationResults.invalidRows.length > 0 && validationResults.validRows === 0);
            
            if (hasBlockingErrors) {
              return (
              <div style={{
                  backgroundColor: '#fef2f2',
                  border: '2px solid #ef4444',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem',
                display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  color: '#991b1b'
                }}>
                  <AlertCircle size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontWeight: '600', 
                      fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                      marginBottom: '0.5rem'
                    }}>
                      Processing Blocked - Validation Errors Detected
                    </div>
                    <div style={{ 
                      fontSize: 'clamp(0.75rem, 1.8vw, 0.875rem)',
                      lineHeight: '1.6',
                      marginBottom: '0.75rem'
                    }}>
                      Please fix the following issues in your Excel file and re-upload:
                    </div>
                    <ul style={{ 
                      margin: 0, 
                      paddingLeft: '1.5rem',
                      fontSize: 'clamp(0.75rem, 1.8vw, 0.875rem)',
                      lineHeight: '1.8'
                    }}>
                      {validationResults.missingColumns && validationResults.missingColumns.length > 0 && (
                        <li>Missing required columns: {validationResults.missingColumns.map(c => c.displayName).join(', ')}</li>
                      )}
                      {validationResults.errors && validationResults.errors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                      {validationResults.invalidRows && validationResults.invalidRows.length > 0 && validationResults.validRows === 0 && (
                        <li>All rows have validation issues. No valid data to process.</li>
                      )}
                    </ul>
                    <div style={{ 
                      marginTop: '0.75rem',
                      padding: '0.75rem',
                      backgroundColor: 'white',
                      borderRadius: '4px',
                      fontSize: 'clamp(0.75rem, 1.8vw, 0.875rem)',
                      border: '1px solid #fecaca'
                    }}>
                      <strong>Action Required:</strong> Download the template, fix the issues, and upload the corrected file.
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {/* Validation Results */}
          {validationResults && (
            <div className="excel-validation-card" style={{
              backgroundColor: validationResults.isValid ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${validationResults.isValid ? '#bbf7d0' : '#fecaca'}`
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1rem'
              }}>
                {validationResults.isValid ? (
                  <CheckCircle size={24} color="#10b981" />
                ) : (
                  <XCircle size={24} color="#ef4444" />
                )}
                <h3 style={{
                  margin: 0,
                  fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)',
                  fontWeight: '600',
                  color: validationResults.isValid ? '#065f46' : '#991b1b'
                }}>
                  Excel Validation {validationResults.isValid ? 'Passed' : 'Failed'}
                </h3>
              </div>

              {/* Summary Stats */}
              <div className="excel-validation-stats">
                <div>
                  <div style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', color: '#6b7280', marginBottom: '0.25rem' }}>Total Rows</div>
                  <div style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)', fontWeight: '600', color: '#374151' }}>
                    {validationResults.totalRows}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', color: '#6b7280', marginBottom: '0.25rem' }}>Valid Rows</div>
                  <div style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)', fontWeight: '600', color: '#10b981' }}>
                    {validationResults.validRows}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', color: '#6b7280', marginBottom: '0.25rem' }}>Invalid Rows</div>
                  <div style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)', fontWeight: '600', color: '#ef4444' }}>
                    {validationResults.invalidRows.length}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', color: '#6b7280', marginBottom: '0.25rem' }}>Found Columns</div>
                  <div style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)', fontWeight: '600', color: '#374151' }}>
                    {validationResults.foundColumns.length}
                  </div>
                </div>
              </div>

              {/* Missing Columns */}
              {validationResults.missingColumns && validationResults.missingColumns.length > 0 && (
                <div style={{
                  marginBottom: '1rem',
                  padding: '1rem',
                  backgroundColor: '#fef2f2',
                  borderRadius: '6px',
                  border: '1px solid #fecaca'
                }}>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#991b1b',
                    marginBottom: '0.75rem'
                  }}>
                    Missing Required Columns ({validationResults.missingColumns.length}):
                  </div>
                  <ul style={{
                    margin: 0,
                    paddingLeft: '1.5rem',
                    color: '#991b1b',
                    fontSize: '0.875rem'
                  }}>
                    {validationResults.missingColumns.map((col, idx) => (
                      <li key={idx} style={{ marginBottom: '0.5rem' }}>
                        <strong>{col.displayName}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                          Expected variations: {col.expectedVariations.slice(0, 3).join(', ')}
                          {col.expectedVariations.length > 3 && '...'}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Errors */}
              {validationResults.errors && validationResults.errors.length > 0 && (
                <div style={{
                  marginBottom: '1rem',
                  padding: '1rem',
                  backgroundColor: '#fef2f2',
                  borderRadius: '6px',
                  border: '1px solid #fecaca'
                }}>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#991b1b',
                    marginBottom: '0.75rem'
                  }}>
                    Errors:
                  </div>
                  <ul style={{
                    margin: 0,
                    paddingLeft: '1.5rem',
                    color: '#991b1b',
                    fontSize: '0.875rem'
                  }}>
                    {validationResults.errors.map((err, idx) => (
                      <li key={idx} style={{ marginBottom: '0.5rem' }}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {validationResults.warnings && validationResults.warnings.length > 0 && (
                <div style={{
                  marginBottom: '1rem',
                  padding: '1rem',
                  backgroundColor: '#fffbeb',
                  borderRadius: '6px',
                  border: '1px solid #fde68a'
                }}>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#92400e',
                    marginBottom: '0.75rem'
                  }}>
                    Warnings:
                  </div>
                  <ul style={{
                    margin: 0,
                    paddingLeft: '1.5rem',
                    color: '#92400e',
                    fontSize: '0.875rem'
                  }}>
                    {validationResults.warnings.map((warn, idx) => (
                      <li key={idx} style={{ marginBottom: '0.5rem' }}>{warn}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Data Issues by Row */}
              {validationResults.invalidRows && validationResults.invalidRows.length > 0 && validationResults.invalidRows.length <= 20 && (
                <div style={{
                  marginBottom: '1rem',
                  padding: '1rem',
                  backgroundColor: '#fffbeb',
                  borderRadius: '6px',
                  border: '1px solid #fde68a'
                }}>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#92400e',
                    marginBottom: '0.75rem'
                  }}>
                    Data Issues by Row:
                  </div>
                  <div style={{
                    maxHeight: '200px',
                    overflowY: 'auto',
                    fontSize: '0.875rem',
                    color: '#92400e'
                  }}>
                    {validationResults.invalidRows.map((row, idx) => (
                      <div key={idx} style={{
                        padding: '0.5rem',
                        marginBottom: '0.5rem',
                        backgroundColor: 'white',
                        borderRadius: '4px',
                        border: '1px solid #fde68a'
                      }}>
                        <strong>Row {row.rowNumber}:</strong> {row.issues.join(', ')}
                      </div>
                    ))}
                  </div>
                  {validationResults.invalidRows.length > 20 && (
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      marginTop: '0.5rem',
                      fontStyle: 'italic'
                    }}>
                      ... and {validationResults.invalidRows.length - 20} more rows with issues
                    </div>
                  )}
                </div>
              )}

              {/* Found Columns */}
              {validationResults.foundColumns && validationResults.foundColumns.length > 0 && (
                <details style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb'
                }}>
                  <summary style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                    cursor: 'pointer'
                  }}>
                    Found Columns ({validationResults.foundColumns.length})
                  </summary>
                  <div style={{
                    marginTop: '0.75rem',
                    display: 'flex',
                flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    {validationResults.foundColumns.map((col, idx) => (
                      <span key={idx} style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        color: '#374151'
                      }}>
                        {col}
                      </span>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}

          {/* Applicants List */}
          {storageId && applicants.length > 0 && (
                <div>
              {/* Progress Summary */}
              <div className="excel-progress-summary">
                <div>
                  <p style={{ margin: 0, fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', color: '#6b7280' }}>
                    Total Applicants: <strong>{applicants.length}</strong>
                  </p>
                  <p style={{ margin: '0.25rem 0 0', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', color: '#6b7280' }}>
                    Completed: <strong style={{ color: '#10b981' }}>{successCount}</strong> | 
                    Failed: <strong style={{ color: '#ef4444' }}>{errorCount}</strong> | 
                    Pending: <strong>{applicants.length - completedCount}</strong>
                  </p>
                </div>
                <div className="excel-button-group">
                  {!processing && completedCount < applicants.length && (() => {
                    // Check if processing should be blocked due to validation errors
                    const hasBlockingErrors = validationResults && (
                      (validationResults.errors && validationResults.errors.length > 0) ||
                      (validationResults.missingColumns && validationResults.missingColumns.length > 0) ||
                      (validationResults.invalidRows && validationResults.invalidRows.length > 0 && validationResults.validRows === 0)
                    );
                    
                    const hasWarnings = validationResults && 
                      validationResults.invalidRows && 
                      validationResults.invalidRows.length > 0 && 
                      validationResults.validRows > 0;
                    
                    return (
                      <>
                        {hasBlockingErrors ? (
                    <button
                            disabled
                            title="Fix validation errors and re-upload to enable processing"
                      style={{
                        padding: '8px 16px',
                              backgroundColor: '#9ca3af',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                              cursor: 'not-allowed',
                              fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                              gap: '0.5rem',
                              opacity: 0.6
                      }}
                    >
                            <XCircle size={16} />
                            Processing Blocked (Fix Errors)
                    </button>
                        ) : (
                    <button
                      onClick={handleStartProcessing}
                      style={{
                        padding: '8px 16px',
                              backgroundColor: hasWarnings ? '#f59e0b' : '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                              fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <Play size={16} />
                            {hasWarnings ? 'Start Processing (Some Rows Will Be Skipped)' : 'Start Processing'}
                    </button>
                  )}
                      </>
                    );
                  })()}
                  {storageId && (
                    <button
                      onClick={handleReset}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <RotateCcw size={16} />
                      Reset
                    </button>
                  )}
                  {completedCount === applicants.length && successCount > 0 && (
                    <button
                      onClick={async () => {
                        setDownloadingZip(true);
                        try {
                          const response = await fetch(`${API_URL}/api/download-excel-batch-zip/${storageId}`, {
                            method: 'GET',
                            headers: {
                              'Authorization': `Bearer ${token}`
                            }
                          });

                          if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.message || 'Failed to download ZIP file');
                          }

                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `documents_batch_${Date.now()}.zip`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          window.URL.revokeObjectURL(url);
                        } catch (err) {
                          setError(err.message || 'Failed to download ZIP file');
                        } finally {
                          setDownloadingZip(false);
                        }
                      }}
                      disabled={downloadingZip}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: downloadingZip ? '#9ca3af' : '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: downloadingZip ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        opacity: downloadingZip ? 0.7 : 1
                      }}
                    >
                      {downloadingZip ? (
                        <>
                          <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                          Downloading ZIP...
                        </>
                      ) : (
                        <>
                      <Download size={16} />
                      Download ZIP ({successCount} files)
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Applicants Table */}
              <div className="excel-table-wrapper" style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                overflow: 'hidden',
                marginBottom: '1rem'
              }}>
                <table className="excel-table">
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: 'clamp(8px, 2vw, 12px)', textAlign: 'left', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', fontWeight: '600', color: '#374151' }}>Status</th>
                      <th style={{ padding: 'clamp(8px, 2vw, 12px)', textAlign: 'left', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', fontWeight: '600', color: '#374151' }}>Row</th>
                      <th style={{ padding: 'clamp(8px, 2vw, 12px)', textAlign: 'left', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', fontWeight: '600', color: '#374151' }}>Name</th>
                      <th style={{ padding: 'clamp(8px, 2vw, 12px)', textAlign: 'left', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', fontWeight: '600', color: '#374151' }}>Pension No</th>
                      <th style={{ padding: 'clamp(8px, 2vw, 12px)', textAlign: 'left', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', fontWeight: '600', color: '#374151' }}>Bank</th>
                      <th style={{ padding: 'clamp(8px, 2vw, 12px)', textAlign: 'left', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', fontWeight: '600', color: '#374151' }}>CV</th>
                      <th style={{ padding: 'clamp(8px, 2vw, 12px)', textAlign: 'left', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', fontWeight: '600', color: '#374151' }}>Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentApplicants.map((applicant) => {
                      const status = processingStatus[applicant.id] || 'pending';
                      const errorMessage = errorMessages[applicant.id];
                      return (
                        <tr 
                          key={applicant.id}
                          style={{ 
                            borderBottom: '1px solid #e5e7eb',
                            backgroundColor: status === 'processing' ? '#eff6ff' : status === 'success' ? '#f0fdf4' : status === 'error' ? '#fef2f2' : 'white'
                          }}
                        >
                          <td style={{ padding: 'clamp(8px, 2vw, 12px)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              {getStatusIcon(status)}
                              <span style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', color: '#6b7280' }}>
                                {getStatusText(status)}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: 'clamp(8px, 2vw, 12px)', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', color: '#374151' }}>
                            {applicant.rowNumber}
                          </td>
                          <td style={{ padding: 'clamp(8px, 2vw, 12px)', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', color: '#374151', fontWeight: '500', wordBreak: 'break-word' }}>
                            {applicant.name}
                          </td>
                          <td style={{ padding: 'clamp(8px, 2vw, 12px)', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', color: '#374151', wordBreak: 'break-word' }}>
                            {applicant.pensionNo}
                          </td>
                          <td style={{ padding: 'clamp(8px, 2vw, 12px)', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', color: '#374151', wordBreak: 'break-word' }}>
                            {applicant.mortgageBank}
                          </td>
                          <td style={{ padding: 'clamp(8px, 2vw, 12px)', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', color: '#374151' }}>
                            {parseFloat(applicant.cv).toLocaleString()}
                          </td>
                          <td style={{ padding: 'clamp(8px, 2vw, 12px)', fontSize: 'clamp(0.7rem, 1.8vw, 0.875rem)', color: errorMessage ? '#ef4444' : '#6b7280', maxWidth: 'clamp(120px, 30vw, 300px)' }}>
                            {errorMessage ? (
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.5rem',
                                color: '#ef4444'
                              }}>
                                <AlertCircle size={14} />
                                <span title={errorMessage} style={{ 
                                  overflow: 'hidden', 
                                  textOverflow: 'ellipsis', 
                                  whiteSpace: 'nowrap' 
                                }}>
                                  {errorMessage}
                                </span>
                              </div>
                            ) : (
                              <span style={{ color: '#9ca3af' }}>—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="excel-pagination">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: 'clamp(4px, 1.5vw, 6px) clamp(8px, 2vw, 12px)',
                      backgroundColor: currentPage === 1 ? '#f3f4f6' : 'white',
                      color: currentPage === 1 ? '#9ca3af' : '#374151',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      fontSize: 'clamp(0.75rem, 2vw, 0.875rem)'
                    }}
                  >
                    Previous
                  </button>
                  <span style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', color: '#6b7280' }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: 'clamp(4px, 1.5vw, 6px) clamp(8px, 2vw, 12px)',
                      backgroundColor: currentPage === totalPages ? '#f3f4f6' : 'white',
                      color: currentPage === totalPages ? '#9ca3af' : '#374151',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      fontSize: 'clamp(0.75rem, 2vw, 0.875rem)'
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
