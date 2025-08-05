import React, { useEffect, useState } from 'react';
import { deviceTrackingService, DeviceInfo, BannedDevice } from '../../services/deviceTrackingService';
import { Smartphone, Ban, Eye, AlertTriangle, Users, Monitor, Clock, Globe } from 'lucide-react';

const DeviceManagementSection: React.FC = () => {
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [suspiciousDevices, setSuspiciousDevices] = useState<DeviceInfo[]>([]);
  const [bannedDevices, setBannedDevices] = useState<BannedDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'all' | 'suspicious' | 'banned'>('all');
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [deviceToBan, setDeviceToBan] = useState<DeviceInfo | null>(null);
  const [banReason, setBanReason] = useState('');
  const [banNotes, setBanNotes] = useState('');

  useEffect(() => {
    fetchDeviceData();
  }, []);

  const fetchDeviceData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [allDevices, suspicious, banned] = await Promise.all([
        deviceTrackingService.getAllDevices(100),
        deviceTrackingService.getSuspiciousDevices(),
        deviceTrackingService.getBannedDevices(100)
      ]);

      setDevices(allDevices);
      setSuspiciousDevices(suspicious);
      setBannedDevices(banned);
    } catch (err: any) {
      console.error('Error fetching device data:', err);
      setError('Failed to fetch device data');
    } finally {
      setLoading(false);
    }
  };

  const handleBanDevice = (device: DeviceInfo) => {
    setDeviceToBan(device);
    setBanModalOpen(true);
  };

  const confirmBanDevice = async () => {
    if (!deviceToBan || !banReason.trim()) {
      alert('Please provide a reason for banning this device.');
      return;
    }

    try {
      setLoading(true);
      await deviceTrackingService.banDevice(
        deviceToBan.ipAddress,
        banReason,
        'Admin', // You can get the current admin's name from auth context
        deviceToBan.userAgent,
        banNotes
      );

      // Refresh data
      await fetchDeviceData();
      
      // Close modal and reset form
      setBanModalOpen(false);
      setDeviceToBan(null);
      setBanReason('');
      setBanNotes('');
      
      alert('Device banned successfully');
    } catch (err: any) {
      console.error('Error banning device:', err);
      alert('Failed to ban device: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnbanDevice = async (banId: string) => {
    if (!confirm('Are you sure you want to unban this device?')) {
      return;
    }

    try {
      setLoading(true);
      await deviceTrackingService.unbanDevice(banId);
      await fetchDeviceData();
      alert('Device unbanned successfully');
    } catch (err: any) {
      console.error('Error unbanning device:', err);
      alert('Failed to unban device: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceLocation = (device: DeviceInfo) => {
    if (device.city && device.country) {
      return `${device.city}, ${device.country}`;
    } else if (device.country) {
      return device.country;
    }
    return 'Location unknown';
  };

  const formatUserAgent = (userAgent: string) => {
    if (userAgent.length > 50) {
      return userAgent.substring(0, 50) + '...';
    }
    return userAgent;
  };

  const renderDeviceTable = (deviceList: DeviceInfo[], showBanAction: boolean = true) => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User & Device
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              IP Address
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Activity
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            {showBanAction && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {deviceList.map((device, index) => (
            <tr key={device.$id || index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Smartphone className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{device.userEmail}</div>
                    <div className="text-sm text-gray-500" title={device.userAgent}>
                      {formatUserAgent(device.userAgent)}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{device.ipAddress}</div>
                <div className="text-sm text-gray-500">{getDeviceLocation(device)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  <Clock className="inline h-4 w-4 mr-1" />
                  {device.loginCount} logins
                </div>
                <div className="text-sm text-gray-500">
                  Last: {new Date(device.lastSeen).toLocaleDateString()}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {device.isSuspicious ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Suspicious
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Normal
                  </span>
                )}
              </td>
              {showBanAction && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleBanDevice(device)}
                    className="text-red-600 hover:text-red-900 mr-4"
                    title="Ban Device"
                  >
                    <Ban className="h-4 w-4" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {deviceList.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No devices found.
        </div>
      )}
    </div>
  );

  const renderBannedDevicesTable = (bannedList: BannedDevice[]) => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              IP Address
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reason
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Banned At
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {bannedList.map((device, index) => (
            <tr key={device.$id || index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{device.ipAddress}</div>
                {device.userAgent && (
                  <div className="text-sm text-gray-500" title={device.userAgent}>
                    {formatUserAgent(device.userAgent)}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{device.reason}</div>
                {device.notes && (
                  <div className="text-sm text-gray-500">{device.notes}</div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(device.bannedAt).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {device.isActive && (
                  <button
                    onClick={() => handleUnbanDevice(device.$id!)}
                    className="text-green-600 hover:text-green-900"
                    title="Unban Device"
                  >
                    Unban
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {bannedList.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No banned devices found.
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading device data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
            <button
              onClick={fetchDeviceData}
              className="mt-3 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Device Management</h2>
          <p className="text-gray-600">Monitor and manage user devices and IP addresses</p>
        </div>
        <button
          onClick={fetchDeviceData}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Refresh Data
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Monitor className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Devices</dt>
                  <dd className="text-lg font-medium text-gray-900">{devices.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Suspicious</dt>
                  <dd className="text-lg font-medium text-gray-900">{suspiciousDevices.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Ban className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Banned</dt>
                  <dd className="text-lg font-medium text-gray-900">{bannedDevices.filter(d => d.isActive).length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Unique IPs</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {new Set(devices.map(d => d.ipAddress)).size}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'all', label: 'All Devices', count: devices.length },
            { key: 'suspicious', label: 'Suspicious', count: suspiciousDevices.length },
            { key: 'banned', label: 'Banned', count: bannedDevices.filter(d => d.isActive).length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key as any)}
              className={`${
                selectedTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              {tab.label}
              <span className={`${
                selectedTab === tab.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-900'
              } ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium`}>
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {selectedTab === 'all' && renderDeviceTable(devices)}
        {selectedTab === 'suspicious' && renderDeviceTable(suspiciousDevices)}
        {selectedTab === 'banned' && renderBannedDevicesTable(bannedDevices)}
      </div>

      {/* Ban Device Modal */}
      {banModalOpen && deviceToBan && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Ban Device</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">IP Address: <strong>{deviceToBan.ipAddress}</strong></p>
                  <p className="text-sm text-gray-600">User: <strong>{deviceToBan.userEmail}</strong></p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reason *</label>
                  <select
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a reason</option>
                    <option value="Suspicious activity">Suspicious activity</option>
                    <option value="Multiple account abuse">Multiple account abuse</option>
                    <option value="Spam or abuse">Spam or abuse</option>
                    <option value="Security violation">Security violation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
                  <textarea
                    value={banNotes}
                    onChange={(e) => setBanNotes(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Optional additional information..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setBanModalOpen(false);
                    setDeviceToBan(null);
                    setBanReason('');
                    setBanNotes('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBanDevice}
                  disabled={!banReason.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ban Device
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceManagementSection;
