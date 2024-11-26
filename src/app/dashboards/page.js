'use client';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [apiKeys, setApiKeys] = useState([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usageLimit] = useState(1000);
  const [currentUsage] = useState(0);
  const [alertThreshold, setAlertThreshold] = useState(90);
  const [alertEnabled, setAlertEnabled] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [keyLimit, setKeyLimit] = useState(1000);
  const [visibleKeys, setVisibleKeys] = useState({});

  // Fetch API keys on component mount
  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with your actual API endpoint
      const response = await fetch('/api/keys');
      const data = await response.json();
      setApiKeys(data);
    } catch (err) {
      setError('Failed to fetch API keys');
    } finally {
      setIsLoading(false);
    }
  };

  const createApiKey = async () => {
    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newKeyName,
          limit: keyLimit,
          usage: 0,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create key');
      }
      
      const newKey = await response.json();
      setApiKeys([...apiKeys, newKey]);
      setNewKeyName('');
    } catch (err) {
      throw err;
    }
  };

  const deleteApiKey = async (keyId) => {
    try {
      // TODO: Replace with your actual API endpoint
      await fetch(`/api/keys/${keyId}`, {
        method: 'DELETE',
      });
      setApiKeys(apiKeys.filter(key => key.id !== keyId));
    } catch (err) {
      setError('Failed to delete API key');
    }
  };

  const handleCreateKey = async (e) => {
    e.preventDefault();
    try {
      await createApiKey(); // Remove the event parameter here
      setIsModalOpen(false);
      setNewKeyName('');
      setKeyLimit(1000);
    } catch (err) {
      setError('Failed to create API key');
    }
  };

  const toggleKeyVisibility = (keyId) => {
    setVisibleKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const copyToClipboard = async (key) => {
    try {
      await navigator.clipboard.writeText(key);
      // Optionally add a toast notification here
    } catch (err) {
      console.error('Failed to copy key');
    }
  };

  if (isLoading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Overview</h1>
          <div className="text-sm text-gray-500">Pages / Overview</div>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Operational
          </span>
          {/* Add your header icons here */}
        </div>
      </div>

      {/* Usage Card */}
      <div className="bg-gradient-to-r from-rose-200 via-purple-200 to-blue-200 rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="text-sm text-gray-600 mb-2">CURRENT PLAN</div>
            <h2 className="text-2xl font-bold">Researcher</h2>
          </div>
          <button className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-sm">
            Manage Plan
          </button>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm">API Limit</span>
            <span className="text-sm">{currentUsage}/{usageLimit} Requests</span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-2">
            <div 
              className="bg-white h-full rounded-full"
              style={{ width: `${(currentUsage/usageLimit) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* API Keys Section */}
      <div className="bg-white rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">API Keys</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-blue-500 hover:text-blue-600"
          >
            +
          </button>
        </div>

        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-500 text-sm">
              <th className="pb-4">NAME</th>
              <th className="pb-4">USAGE</th>
              <th className="pb-4">KEY</th>
              <th className="pb-4">OPTIONS</th>
            </tr>
          </thead>
          <tbody>
            {apiKeys.map((key) => (
              <tr key={key.id} className="border-t">
                <td className="py-4">{key.name}</td>
                <td className="py-4">
                  {key.limit ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100">
                      {key.usage || 0}%
                    </span>
                  ) : (
                    '0'
                  )}
                </td>
                <td className="py-4 font-mono text-sm">
                  {visibleKeys[key.id] 
                    ? key.key
                    : key.key.replace(/(?<=^.{4})./g, '*')}
                </td>
                <td className="py-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => toggleKeyVisibility(key.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      {visibleKeys[key.id] ? '👁️' : '👁️‍🗨️'}
                    </button>
                    <button 
                      onClick={() => copyToClipboard(key.key)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      📋
                    </button>
                    <button 
                      onClick={() => deleteApiKey(key.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Email Alerts Section */}
      <div className="bg-white rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Email usage alerts</h2>
        <p className="text-gray-600 mb-6">
          An alert will be sent to your email when your monthly usage reaches the set threshold.
        </p>
        
        <div className="flex items-center gap-4">
          <span>Your alert threshold is currently set to:</span>
          <input
            type="number"
            value={alertThreshold}
            onChange={(e) => setAlertThreshold(e.target.value)}
            className="w-16 p-2 border rounded"
          />
          <span>%</span>
          <button className="p-1 hover:bg-gray-100 rounded">✏️</button>
          <span className="ml-4">{alertEnabled ? 'Enabled' : 'Disabled'}</span>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-[400px]">
            <h2 className="text-xl font-semibold mb-4">Create a new API key</h2>
            <p className="text-sm text-gray-600 mb-4">Enter a name and limit for the new API key.</p>
            
            <form onSubmit={handleCreateKey}>
              <div className="mb-4">
                <label className="block text-sm mb-1">Key Name — A unique name to identify this key</label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Key Name"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" /> Limit monthly usage*
                </label>
                <input
                  type="number"
                  value={keyLimit}
                  onChange={(e) => setKeyLimit(e.target.value)}
                  className="w-full p-2 border rounded mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  *If the combined usage of all your keys exceeds your plan's limit, all requests will be rejected.
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
