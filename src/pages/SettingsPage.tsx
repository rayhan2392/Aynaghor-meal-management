import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store/store';

// Mock users data (should eventually come from Redux)
const initialUsers = [
  { id: '1', name: 'Shawn', active: true },
  { id: '2', name: 'Sadi', active: true },
  { id: '3', name: 'Masud', active: true },
  { id: '4', name: 'Arnab', active: true },
  { id: '5', name: 'Muzahid', active: true },
];

// Mock cycles data
const initialCycles = [
  { id: '1', name: 'January 2025', startDate: '2025-01-01', endDate: '2025-01-31', status: 'closed' as const },
  { id: '2', name: 'February 2025', startDate: '2025-02-01', endDate: '2025-02-28', status: 'open' as const },
];

export function SettingsPage() {
  const [users, setUsers] = useState(initialUsers);
  const [cycles, setCycles] = useState(initialCycles);
  const [activeTab, setActiveTab] = useState('users');
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddCycle, setShowAddCycle] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newCycleName, setNewCycleName] = useState('');
  const [newCycleStart, setNewCycleStart] = useState('');
  const [newCycleEnd, setNewCycleEnd] = useState('');

  // User Management Functions
  const handleAddUser = () => {
    if (newUserName.trim()) {
      const newUser = {
        id: (users.length + 1).toString(),
        name: newUserName.trim(),
        active: true,
      };
      setUsers([...users, newUser]);
      setNewUserName('');
      setShowAddUser(false);
    }
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(users.map(user =>
      user.id === userId ? { ...user, active: !user.active } : user
    ));
  };

  const deleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  // Cycle Management Functions
  const handleAddCycle = () => {
    if (newCycleName.trim() && newCycleStart && newCycleEnd) {
      const newCycle = {
        id: (cycles.length + 1).toString(),
        name: newCycleName.trim(),
        startDate: newCycleStart,
        endDate: newCycleEnd,
        status: 'open' as const,
      };
      setCycles([...cycles, newCycle]);
      setNewCycleName('');
      setNewCycleStart('');
      setNewCycleEnd('');
      setShowAddCycle(false);
    }
  };

  const toggleCycleStatus = (cycleId: string) => {
    setCycles(cycles.map(cycle =>
      cycle.id === cycleId
        ? { ...cycle, status: cycle.status === 'open' ? 'closed' as const : 'open' as const }
        : cycle
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage users, cycles, and application settings</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'users', name: 'User Management' },
            { id: 'cycles', name: 'Cycle Management' },
            { id: 'app', name: 'App Settings' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* User Management Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">User Management</h3>
                <button
                  onClick={() => setShowAddUser(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Add New User
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h4 className="font-medium text-gray-900">{user.name}</h4>
                        <p className="text-sm text-gray-500">User ID: {user.id}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {user.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleUserStatus(user.id)}
                        className={`px-3 py-1 rounded text-sm font-medium ${user.active
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                      >
                        {user.active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm font-medium hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Add User Modal */}
          {showAddUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-semibold mb-4">Add New User</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User Name
                    </label>
                    <input
                      type="text"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter user name"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleAddUser}
                      disabled={!newUserName.trim()}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                    >
                      Add User
                    </button>
                    <button
                      onClick={() => {
                        setShowAddUser(false);
                        setNewUserName('');
                      }}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cycle Management Tab */}
      {activeTab === 'cycles' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Cycle Management</h3>
                <button
                  onClick={() => setShowAddCycle(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Create New Cycle
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {cycles.map((cycle) => (
                  <div key={cycle.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h4 className="font-medium text-gray-900">{cycle.name}</h4>
                        <p className="text-sm text-gray-500">
                          {cycle.startDate} to {cycle.endDate}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${cycle.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                        {cycle.status === 'open' ? 'Active' : 'Closed'}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleCycleStatus(cycle.id)}
                        className={`px-3 py-1 rounded text-sm font-medium ${cycle.status === 'open'
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                      >
                        {cycle.status === 'open' ? 'Close' : 'Reopen'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Add Cycle Modal */}
          {showAddCycle && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-semibold mb-4">Create New Cycle</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cycle Name
                    </label>
                    <input
                      type="text"
                      value={newCycleName}
                      onChange={(e) => setNewCycleName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., March 2025"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={newCycleStart}
                      onChange={(e) => setNewCycleStart(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={newCycleEnd}
                      onChange={(e) => setNewCycleEnd(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleAddCycle}
                      disabled={!newCycleName.trim() || !newCycleStart || !newCycleEnd}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                    >
                      Create Cycle
                    </button>
                    <button
                      onClick={() => {
                        setShowAddCycle(false);
                        setNewCycleName('');
                        setNewCycleStart('');
                        setNewCycleEnd('');
                      }}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* App Settings Tab */}
      {activeTab === 'app' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Application Settings</h3>
            </div>
            <div className="p-6 space-y-6">
              {/* Currency Settings */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Currency</h4>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="currency"
                      value="BDT"
                      defaultChecked
                      className="mr-2"
                    />
                    BDT (Bangladeshi Taka)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="currency"
                      value="USD"
                      className="mr-2"
                    />
                    USD (US Dollar)
                  </label>
                </div>
              </div>

              {/* Default Settings */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Default Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Auto-save meal entries</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Show daily meal summary</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Data Management */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Data Management</h4>
                <div className="space-y-3">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                    Export Data
                  </button>
                  <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium ml-3">
                    Import Data
                  </button>
                  <br />
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">
                    Clear All Data
                  </button>
                </div>
              </div>

              {/* About */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">About</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Aynnaghor Meal Management</strong></p>
                  <p>Version: 1.0.0</p>
                  <p>Built with React, TypeScript, and Redux Toolkit</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
