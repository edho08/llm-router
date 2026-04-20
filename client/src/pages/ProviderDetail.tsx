import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { providerApi, apiKeyApi, backendApi } from '../api/providerApi';

export default function ProviderDetail() {
  const { id } = useParams();
  const providerId = parseInt(id!);
  const [provider, setProvider] = useState<any>(null);
  const [keys, setKeys] = useState([]);
  const [backends, setBackends] = useState([]);

  const [newKey, setNewKey] = useState({ label: '', apiKey: '', weight: 1.0, isEnabled: true });
  const [newBackend, setNewBackend] = useState({ modelName: '', weight: 1.0, isEnabled: true });

  const [editingKeyId, setEditingKeyId] = useState<number | null>(null);
  const [editKeyData, setEditKeyData] = useState({ label: '', apiKey: '', weight: 1.0, isEnabled: true });

  const [editingBackendId, setEditingBackendId] = useState<number | null>(null);
  const [editBackendData, setEditBackendData] = useState({ modelName: '', weight: 1.0, isEnabled: true });

  // Test state
  const [isTestingProvider, setIsTestingProvider] = useState(false);
  const [isTestingBackend, setIsTestingBackend] = useState<number | null>(null);
  const [errorModal, setErrorModal] = useState<{ code: number; data: any } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    const pRes = await providerApi.getById(providerId);
    setProvider(pRes.data);
    const kRes = await apiKeyApi.getByProvider(providerId);
    setKeys(kRes.data);
    const bRes = await backendApi.getByProvider(providerId);
    setBackends(bRes.data);
  };

  const handleTestProvider = async () => {
    setIsTestingProvider(true);
    setSuccessMessage(null);
    setErrorModal(null);
    try {
      const res = await providerApi.test(providerId);
      if (res.data.status === 'success') {
        setSuccessMessage('Connection successful!');
      } else {
        setErrorModal({ code: res.data.code, data: res.data.data });
      }
    } catch (e: any) {
      setErrorModal({ code: e.response?.status || 500, data: e.response?.data || e.message });
    } finally {
      setIsTestingProvider(false);
    }
  };

  const handleTestBackend = async (backendId: number) => {
    setIsTestingBackend(backendId);
    setSuccessMessage(null);
    setErrorModal(null);
    try {
      const res = await backendApi.test(providerId, backendId);
      if (res.data.status === 'success') {
        setSuccessMessage('Model connection successful!');
      } else {
        setErrorModal({ code: res.data.code, data: res.data.data });
      }
    } catch (e: any) {
      setErrorModal({ code: e.response?.status || 500, data: e.response?.data || e.message });
    } finally {
      setIsTestingBackend(null);
    }
  };

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiKeyApi.create(providerId, newKey);
    setNewKey({ label: '', apiKey: '', weight: 1.0, isEnabled: true });
    loadData();
  };

  const handleUpdateKey = async (keyId: number) => {
    await apiKeyApi.update(providerId, keyId, editKeyData);
    setEditingKeyId(null);
    loadData();
  };

  const handleAddBackend = async (e: React.FormEvent) => {
    e.preventDefault();
    await backendApi.create(providerId, newBackend);
    setNewBackend({ modelName: '', weight: 1.0, isEnabled: true });
    loadData();
  };

  const handleUpdateBackend = async (backendId: number) => {
    await backendApi.update(providerId, backendId, editBackendData);
    setEditingBackendId(null);
    loadData();
  };

  const deleteKey = async (keyId: number) => {
    await apiKeyApi.delete(providerId, keyId);
    loadData();
  };

  const deleteBackend = async (backendId: number) => {
    await backendApi.delete(providerId, backendId);
    loadData();
  };

  const startEditKey = (k: any) => {
    setEditingKeyId(k.id);
    setEditKeyData({ label: k.label, apiKey: k.apiKey, weight: k.weight, isEnabled: k.isEnabled });
  };

  const startEditBackend = (b: any) => {
    setEditingBackendId(b.id);
    setEditBackendData({ modelName: b.modelName, weight: b.weight, isEnabled: b.isEnabled });
  };

  if (!provider) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{provider.label}</h1>
          <p className="text-gray-600">{provider.baseUrl}</p>
        </div>
        <button
          onClick={handleTestProvider}
          disabled={isTestingProvider}
          className={`p-2 rounded text-white ${isTestingProvider ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isTestingProvider ? 'Testing...' : 'Test Connection'}
        </button>
      </div>

      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded border border-green-200">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 gap-12">
        <section>
          <h2 className="text-xl font-semibold mb-4">API Keys</h2>
          <form onSubmit={handleAddKey} className="mb-4 grid grid-cols-4 gap-4 items-end bg-gray-100 p-4 rounded">
            <div>
              <label className="block text-sm font-medium mb-1">Label</label>
              <input className="w-full p-2 border rounded" value={newKey.label} onChange={e => setNewKey({ ...newKey, label: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Key</label>
              <input className="w-full p-2 border rounded" type="password" value={newKey.apiKey} onChange={e => setNewKey({ ...newKey, apiKey: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Weight</label>
              <input type="number" step="0.1" className="w-full p-2 border rounded" value={newKey.weight} onChange={e => setNewKey({ ...newKey, weight: parseFloat(e.target.value) })} />
            </div>
            <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Add Key</button>
          </form>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2 text-left">Label</th>
                <th className="border p-2 text-center">Weight</th>
                <th className="border p-2 text-center">Enabled</th>
                <th className="border p-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k: any) => (
                <tr key={k.id}>
                  {editingKeyId === k.id ? (
                    <>
                      <td className="border p-2">
                        <input className="w-full p-1 border rounded" value={editKeyData.label} onChange={e => setEditKeyData({ ...editKeyData, label: e.target.value })} />
                      </td>
                      <td className="border p-2 text-center">
                        <input type="number" step="0.1" className="w-20 p-1 border rounded text-center" value={editKeyData.weight} onChange={e => setEditKeyData({ ...editKeyData, weight: parseFloat(e.target.value) })} />
                      </td>
                      <td className="border p-2 text-center">
                        <input type="checkbox" checked={editKeyData.isEnabled} onChange={e => setEditKeyData({ ...editKeyData, isEnabled: e.target.checked })} />
                      </td>
                      <td className="border p-2 text-center">
                        <button onClick={() => handleUpdateKey(k.id)} className="text-green-600 mr-3">Save</button>
                        <button onClick={() => setEditingKeyId(null)} className="text-gray-600">Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="border p-2">{k.label}</td>
                      <td className="border p-2 text-center">{k.weight}</td>
                      <td className="border p-2 text-center">{k.isEnabled ? '✅' : '❌'}</td>
                      <td className="border p-2 text-center">
                        <button onClick={() => startEditKey(k)} className="text-blue-600 mr-3">Edit</button>
                        <button onClick={() => deleteKey(k.id)} className="text-red-600">Delete</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Backend Models</h2>
          <form onSubmit={handleAddBackend} className="mb-4 grid grid-cols-3 gap-4 items-end bg-gray-100 p-4 rounded">
            <div>
              <label className="block text-sm font-medium mb-1">Model Name</label>
              <input className="w-full p-2 border rounded" value={newBackend.modelName} onChange={e => setNewBackend({ ...newBackend, modelName: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Weight</label>
              <input type="number" step="0.1" className="w-full p-2 border rounded" value={newBackend.weight} onChange={e => setNewBackend({ ...newBackend, weight: parseFloat(e.target.value) })} />
            </div>
            <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Add Model</button>
          </form>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2 text-left">Model Name</th>
                <th className="border p-2 text-center">Weight</th>
                <th className="border p-2 text-center">Enabled</th>
                <th className="border p-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {backends.map((b: any) => (
                <tr key={b.id}>
                  {editingBackendId === b.id ? (
                    <>
                      <td className="border p-2">
                        <input className="w-full p-1 border rounded" value={editBackendData.modelName} onChange={e => setEditBackendData({ ...editBackendData, modelName: e.target.value })} />
                      </td>
                      <td className="border p-2 text-center">
                        <input type="number" step="0.1" className="w-20 p-1 border rounded text-center" value={editBackendData.weight} onChange={e => setEditBackendData({ ...editBackendData, weight: parseFloat(e.target.value) })} />
                      </td>
                      <td className="border p-2 text-center">
                        <input type="checkbox" checked={editBackendData.isEnabled} onChange={e => setEditBackendData({ ...editBackendData, isEnabled: e.target.checked })} />
                      </td>
                      <td className="border p-2 text-center">
                        <button onClick={() => handleUpdateBackend(b.id)} className="text-green-600 mr-3">Save</button>
                        <button onClick={() => setEditingBackendId(null)} className="text-gray-600">Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="border p-2">{b.modelName}</td>
                      <td className="border p-2 text-center">{b.weight}</td>
                      <td className="border p-2 text-center">{b.isEnabled ? '✅' : '❌'}</td>
                      <td className="border p-2 text-center">
                        <button onClick={() => startEditBackend(b)} className="text-blue-600 mr-3">Edit</button>
                        <button onClick={() => handleTestBackend(b.id)} className={`text-sm ${isTestingBackend === b.id ? 'text-gray-400' : 'text-purple-600 hover:text-purple-800'}`} disabled={isTestingBackend === b.id}>
                          {isTestingBackend === b.id ? 'Testing...' : 'Test'}
                          </button>
                        <button onClick={() => deleteBackend(b.id)} className="text-red-600">Delete</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      {errorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-red-50">
              <h3 className="text-lg font-bold text-red-700">Test Failed</h3>
              <button onClick={() => setErrorModal(null)} className="text-red-700 text-2xl font-bold leading-none">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto">
              <p className="mb-2"><strong>Status Code:</strong> {errorModal.code}</p>
              <p className="mb-4"><strong>Response:</strong></p>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                {JSON.stringify(errorModal.data, null, 2)}
              </pre>
            </div>
            <div className="p-4 border-t text-right">
              <button 
                onClick={() => setErrorModal(null)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
