import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Filter, 
  Plus, 
  Trash2, 
  Mail, 
  Tag, 
  Search,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import './App.css';

const { ipcRenderer } = window.require('electron');

function App() {
  const [currentView, setCurrentView] = useState('filters');
  const [filters, setFilters] = useState([]);
  const [labels, setLabels] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCredentials, setHasCredentials] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Settings state
  const [credentials, setCredentials] = useState({
    client_id: '',
    client_secret: '',
    redirect_uri: 'http://localhost:3000/auth/callback'
  });

  // Filter creation state
  const [newFilter, setNewFilter] = useState({
    criteria: {
      from: '',
      to: '',
      subject: '',
      query: '',
      hasAttachment: false,
      excludeChats: true
    },
    action: {
      addLabelIds: [],
      removeLabelIds: [],
      forward: '',
      markAsRead: false,
      markAsImportant: false,
      delete: false,
      neverSpam: false
    }
  });

  const [showCredentials, setShowCredentials] = useState(false);

  useEffect(() => {
    checkAuthStatus();
    loadCredentials();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadFilters();
      loadLabels();
    }
  }, [isAuthenticated]);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const checkAuthStatus = async () => {
    try {
      const result = await ipcRenderer.invoke('check-auth-status');
      if (result.success) {
        setIsAuthenticated(result.isAuthenticated);
        setHasCredentials(result.hasCredentials);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const loadCredentials = async () => {
    try {
      const result = await ipcRenderer.invoke('get-credentials');
      if (result.success && result.credentials) {
        setCredentials(result.credentials);
      }
    } catch (error) {
      console.error('Error loading credentials:', error);
    }
  };

  const loadFilters = async () => {
    setLoading(true);
    try {
      const result = await ipcRenderer.invoke('get-gmail-filters');
      if (result.success) {
        setFilters(result.filters);
        showNotification('Filters loaded successfully', 'success');
      } else {
        showNotification(`Error loading filters: ${result.error}`, 'error');
      }
    } catch (error) {
      showNotification('Error loading filters', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadLabels = async () => {
    try {
      const result = await ipcRenderer.invoke('get-gmail-labels');
      if (result.success) {
        setLabels(result.labels);
      }
    } catch (error) {
      console.error('Error loading labels:', error);
    }
  };

  const saveCredentials = async () => {
    try {
      const result = await ipcRenderer.invoke('save-credentials', credentials);
      if (result.success) {
        setHasCredentials(true);
        showNotification('Credentials saved successfully', 'success');
      } else {
        showNotification(`Error saving credentials: ${result.error}`, 'error');
      }
    } catch (error) {
      showNotification('Error saving credentials', 'error');
    }
  };

  const authenticate = async () => {
    try {
      const result = await ipcRenderer.invoke('get-auth-url');
      if (result.success) {
        // Open auth URL in default browser
        window.require('electron').shell.openExternal(result.authUrl);
        showNotification('Please complete authentication in your browser', 'info');
      } else {
        showNotification(`Error getting auth URL: ${result.error}`, 'error');
      }
    } catch (error) {
      showNotification('Error starting authentication', 'error');
    }
  };

  const createFilter = async () => {
    setLoading(true);
    try {
      const filterData = {
        criteria: Object.fromEntries(
          Object.entries(newFilter.criteria).filter(([_, value]) => 
            value !== '' && value !== false
          )
        ),
        action: Object.fromEntries(
          Object.entries(newFilter.action).filter(([key, value]) => {
            if (key === 'addLabelIds' || key === 'removeLabelIds') {
              return value.length > 0;
            }
            return value !== '' && value !== false;
          })
        )
      };

      const result = await ipcRenderer.invoke('create-gmail-filter', filterData);
      if (result.success) {
        showNotification('Filter created successfully', 'success');
        setNewFilter({
          criteria: {
            from: '',
            to: '',
            subject: '',
            query: '',
            hasAttachment: false,
            excludeChats: true
          },
          action: {
            addLabelIds: [],
            removeLabelIds: [],
            forward: '',
            markAsRead: false,
            markAsImportant: false,
            delete: false,
            neverSpam: false
          }
        });
        loadFilters();
      } else {
        showNotification(`Error creating filter: ${result.error}`, 'error');
      }
    } catch (error) {
      showNotification('Error creating filter', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteFilter = async (filterId) => {
    if (!window.confirm('Are you sure you want to delete this filter?')) {
      return;
    }

    try {
      const result = await ipcRenderer.invoke('delete-gmail-filter', filterId);
      if (result.success) {
        showNotification('Filter deleted successfully', 'success');
        loadFilters();
      } else {
        showNotification(`Error deleting filter: ${result.error}`, 'error');
      }
    } catch (error) {
      showNotification('Error deleting filter', 'error');
    }
  };

  const renderNotification = () => {
    if (!notification) return null;

    const bgColor = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      info: 'bg-blue-500'
    }[notification.type];

    return (
      <div className={`fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg z-50`}>
        <div className="flex items-center gap-2">
          {notification.type === 'success' && <CheckCircle size={16} />}
          {notification.type === 'error' && <AlertCircle size={16} />}
          {notification.type === 'info' && <Mail size={16} />}
          {notification.message}
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Settings size={24} />
        Settings
      </h2>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Gmail API Credentials</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Client ID</label>
            <input
              type="text"
              value={credentials.client_id}
              onChange={(e) => setCredentials({...credentials, client_id: e.target.value})}
              className="w-full p-2 border rounded-md"
              placeholder="Your Gmail API Client ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Client Secret</label>
            <div className="relative">
              <input
                type={showCredentials ? "text" : "password"}
                value={credentials.client_secret}
                onChange={(e) => setCredentials({...credentials, client_secret: e.target.value})}
                className="w-full p-2 border rounded-md pr-10"
                placeholder="Your Gmail API Client Secret"
              />
              <button
                type="button"
                onClick={() => setShowCredentials(!showCredentials)}
                className="absolute right-2 top-2 text-gray-500"
              >
                {showCredentials ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Redirect URI</label>
            <input
              type="text"
              value={credentials.redirect_uri}
              onChange={(e) => setCredentials({...credentials, redirect_uri: e.target.value})}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <button
            onClick={saveCredentials}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Save Credentials
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Authentication</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isAuthenticated ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{isAuthenticated ? 'Connected to Gmail' : 'Not connected to Gmail'}</span>
          </div>
          {hasCredentials && !isAuthenticated && (
            <button
              onClick={authenticate}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
            >
              Connect to Gmail
            </button>
          )}
          {!hasCredentials && (
            <p className="text-gray-500">Please save your credentials first</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderFilters = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Filter size={24} />
          Gmail Filters
        </h2>
        <button
          onClick={loadFilters}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {!isAuthenticated ? (
        <div className="bg-yellow-100 p-4 rounded-lg">
          <p>Please configure your credentials and authenticate with Gmail to view filters.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filters.map((filter) => (
            <div key={filter.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="mb-2">
                    <h4 className="font-semibold">Criteria:</h4>
                    <div className="text-sm text-gray-600 ml-4">
                      {filter.criteria.from && <div>From: {filter.criteria.from}</div>}
                      {filter.criteria.to && <div>To: {filter.criteria.to}</div>}
                      {filter.criteria.subject && <div>Subject: {filter.criteria.subject}</div>}
                      {filter.criteria.query && <div>Query: {filter.criteria.query}</div>}
                      {filter.criteria.hasAttachment && <div>Has attachment</div>}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold">Actions:</h4>
                    <div className="text-sm text-gray-600 ml-4">
                      {filter.action.addLabelIds?.map(labelId => {
                        const label = labels.find(l => l.id === labelId);
                        return <div key={labelId}>Add label: {label?.name || labelId}</div>;
                      })}
                      {filter.action.removeLabelIds?.map(labelId => {
                        const label = labels.find(l => l.id === labelId);
                        return <div key={labelId}>Remove label: {label?.name || labelId}</div>;
                      })}
                      {filter.action.forward && <div>Forward to: {filter.action.forward}</div>}
                      {filter.action.markAsRead && <div>Mark as read</div>}
                      {filter.action.markAsImportant && <div>Mark as important</div>}
                      {filter.action.delete && <div>Delete</div>}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteFilter(filter.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {filters.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              No filters found. Create your first filter below!
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderNewFilter = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Plus size={24} />
        Create New Filter
      </h2>

      {!isAuthenticated ? (
        <div className="bg-yellow-100 p-4 rounded-lg">
          <p>Please authenticate with Gmail to create filters.</p>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Filter Criteria</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">From</label>
                <input
                  type="text"
                  value={newFilter.criteria.from}
                  onChange={(e) => setNewFilter({
                    ...newFilter,
                    criteria: {...newFilter.criteria, from: e.target.value}
                  })}
                  className="w-full p-2 border rounded-md"
                  placeholder="sender@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">To</label>
                <input
                  type="text"
                  value={newFilter.criteria.to}
                  onChange={(e) => setNewFilter({
                    ...newFilter,
                    criteria: {...newFilter.criteria, to: e.target.value}
                  })}
                  className="w-full p-2 border rounded-md"
                  placeholder="recipient@example.com"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Subject</label>
                <input
                  type="text"
                  value={newFilter.criteria.subject}
                  onChange={(e) => setNewFilter({
                    ...newFilter,
                    criteria: {...newFilter.criteria, subject: e.target.value}
                  })}
                  className="w-full p-2 border rounded-md"
                  placeholder="Email subject contains..."
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Search Query</label>
                <input
                  type="text"
                  value={newFilter.criteria.query}
                  onChange={(e) => setNewFilter({
                    ...newFilter,
                    criteria: {...newFilter.criteria, query: e.target.value}
                  })}
                  className="w-full p-2 border rounded-md"
                  placeholder="Advanced search query"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newFilter.criteria.hasAttachment}
                  onChange={(e) => setNewFilter({
                    ...newFilter,
                    criteria: {...newFilter.criteria, hasAttachment: e.target.checked}
                  })}
                  className="mr-2"
                />
                <label>Has attachment</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newFilter.criteria.excludeChats}
                  onChange={(e) => setNewFilter({
                    ...newFilter,
                    criteria: {...newFilter.criteria, excludeChats: e.target.checked}
                  })}
                  className="mr-2"
                />
                <label>Exclude chats</label>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Actions</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Add Labels</label>
                <select
                  multiple
                  value={newFilter.action.addLabelIds}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    setNewFilter({
                      ...newFilter,
                      action: {...newFilter.action, addLabelIds: values}
                    });
                  }}
                  className="w-full p-2 border rounded-md h-20"
                >
                  {labels.filter(label => label.type === 'user').map(label => (
                    <option key={label.id} value={label.id}>
                      {label.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newFilter.action.markAsRead}
                    onChange={(e) => setNewFilter({
                      ...newFilter,
                      action: {...newFilter.action, markAsRead: e.target.checked}
                    })}
                    className="mr-2"
                  />
                  <label>Mark as read</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newFilter.action.markAsImportant}
                    onChange={(e) => setNewFilter({
                      ...newFilter,
                      action: {...newFilter.action, markAsImportant: e.target.checked}
                    })}
                    className="mr-2"
                  />
                  <label>Mark as important</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newFilter.action.delete}
                    onChange={(e) => setNewFilter({
                      ...newFilter,
                      action: {...newFilter.action, delete: e.target.checked}
                    })}
                    className="mr-2"
                  />
                  <label>Delete email</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newFilter.action.neverSpam}
                    onChange={(e) => setNewFilter({
                      ...newFilter,
                      action: {...newFilter.action, neverSpam: e.target.checked}
                    })}
                    className="mr-2"
                  />
                  <label>Never mark as spam</label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Forward to</label>
                <input
                  type="email"
                  value={newFilter.action.forward}
                  onChange={(e) => setNewFilter({
                    ...newFilter,
                    action: {...newFilter.action, forward: e.target.value}
                  })}
                  className="w-full p-2 border rounded-md"
                  placeholder="forward@example.com"
                />
              </div>
            </div>
          </div>

          <button
            onClick={createFilter}
            disabled={loading}
            className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={16} />}
            Create Filter
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {renderNotification()}
      
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg h-screen">
          <div className="p-4">
            <h1 className="text-xl font-bold text-gray-800">Gmail Filter Manager</h1>
          </div>
          <nav className="mt-8">
            <button
              onClick={() => setCurrentView('filters')}
              className={`w-full flex items-center px-4 py-2 text-left hover:bg-gray-100 ${
                currentView === 'filters' ? 'bg-blue-100 border-r-4 border-blue-500' : ''
              }`}
            >
              <Filter size={20} className="mr-3" />
              Filters
            </button>
            <button
              onClick={() => setCurrentView('new-filter')}
              className={`w-full flex items-center px-4 py-2 text-left hover:bg-gray-100 ${
                currentView === 'new-filter' ? 'bg-blue-100 border-r-4 border-blue-500' : ''
              }`}
            >
              <Plus size={20} className="mr-3" />
              Create Filter
            </button>
            <button
              onClick={() => setCurrentView('settings')}
              className={`w-full flex items-center px-4 py-2 text-left hover:bg-gray-100 ${
                currentView === 'settings' ? 'bg-blue-100 border-r-4 border-blue-500' : ''
              }`}
            >
              <Settings size={20} className="mr-3" />
              Settings
            </button>
          </nav>

          {/* Status indicator */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className={`flex items-center gap-2 p-2 rounded text-sm ${
              isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isAuthenticated ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              {isAuthenticated ? 'Connected' : 'Disconnected'}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-8">
          {currentView === 'filters' && renderFilters()}
          {currentView === 'new-filter' && renderNewFilter()}
          {currentView === 'settings' && renderSettings()}
        </div>
      </div>
    </div>
  );
}

export default App;