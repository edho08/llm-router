import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { providerApi } from '../api/providerApi';

export default function ProviderList() {
  const [providers, setProviders] = useState([]);
  const [newProvider, setNewProvider] = useState({ label: '', baseUrl: '', weight: 1.0, isEnabled: true });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState({ label: '', baseUrl: '', weight: 1.0, isEnabled: true });

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    const res = await providerApi.getAll();
    setProviders(res.data);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await providerApi.create(newProvider);
    setNewProvider({ label: '', baseUrl: '', weight: 1.0, isEnabled: true });
    loadProviders();
  };

  const handleUpdate = async (id: number) => {
    await providerApi.update(id, editData);
    setEditingId(null);
    loadProviders();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure?')) {
      await providerApi.delete(id);
      loadProviders();
    }
  };

  const startEditing = (p: any) => {
    setEditingId(p.id);
    setEditData({ label: p.label, baseUrl: p.baseUrl, weight: p.weight, isEnabled: p.isEnabled });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">AI Providers</h1>
      
      <form onSubmit={handleCreate} className="mb-8 grid grid-cols-4 gap-4 items-end bg-gray-100 p-4 rounded">
        <div>
          <label className="block text-sm font-medium mb-1">Label</label>
          <input 
            className="w-full p-2 border rounded" 
            value={newProvider.label} 
            onChange={e => setNewProvider({...newProvider, label: e.target.value})} 
            required 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Base URL</label>
          <input 
            className="w-full p-2 border rounded" 
            value={newProvider.baseUrl} 
            onChange={e => setNewProvider({...newProvider, baseUrl: e.target.value})} 
            required 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Weight</label>
          <input 
            type="number" step="0.1" 
            className="w-full p-2 border rounded" 
            value={newProvider.weight} 
            onChange={e => setNewProvider({...newProvider, weight: parseFloat(e.target.value)})} 
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Add Provider</button>
      </form>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2 text-left">Label</th>
            <th className="border p-2 text-left">Base URL</th>
            <th className="border p-2 text-center">Weight</th>
            <th className="border p-2 text-center">Enabled</th>
            <th className="border p-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {providers.map((p: any) => (
            <tr key={p.id} className="hover:bg-gray-50">
              {editingId === p.id ? (
                <>
                  <td className="border p-2">
                    <input 
                      className="w-full p-1 border rounded" 
                      value={editData.label} 
                      onChange={e => setEditData({...editData, label: e.target.value})} 
                    />
                  </td>
                  <td className="border p-2">
                    <input 
                      className="w-full p-1 border rounded" 
                      value={editData.baseUrl} 
                      onChange={e => setEditData({...editData, baseUrl: e.target.value})} 
                    />
                  </td>
                  <td className="border p-2 text-center">
                    <input 
                      type="number" step="0.1" 
                      className="w-20 p-1 border rounded text-center" 
                      value={editData.weight} 
                      onChange={e => setEditData({...editData, weight: parseFloat(e.target.value)})} 
                    />
                  </td>
                  <td className="border p-2 text-center">
                    <input 
                      type="checkbox" 
                      checked={editData.isEnabled} 
                      onChange={e => setEditData({...editData, isEnabled: e.target.checked})} 
                    />
                  </td>
                  <td className="border p-2 text-center">
                    <button onClick={() => handleUpdate(p.id)} className="text-green-600 mr-3">Save</button>
                    <button onClick={() => setEditingId(null)} className="text-gray-600">Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td className="border p-2">{p.label}</td>
                  <td className="border p-2">{p.baseUrl}</td>
                  <td className="border p-2 text-center">{p.weight}</td>
                  <td className="border p-2 text-center">{p.isEnabled ? '✅' : '❌'}</td>
                  <td className="border p-2 text-center">
                    <button onClick={() => startEditing(p)} className="text-blue-600 mr-3">Edit</button>
                    <Link to={`/providers/${p.id}`} className="text-blue-600 mr-3">Manage</Link>
                    <button onClick={() => handleDelete(p.id)} className="text-red-600">Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
