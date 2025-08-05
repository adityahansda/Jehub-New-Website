import React, { useEffect, useState } from 'react';
import { deviceTrackingService } from '../../services/deviceTrackingService';

interface BannedDeviceAdminProps {
  bannedDevices: any[];
  onUnbanDevice: (banId: string) => Promise<void>;
}

const BannedDevicesManager: React.FC = () => {
  const [bannedDevices, setBannedDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBannedDevices();
  }, []);

  const fetchBannedDevices = async () => {
    try {
      setLoading(true);
      const devices = await deviceTrackingService.getBannedDevices();
      setBannedDevices(devices);
    } catch (err: any) {
      console.error('Error fetching banned devices:', err);
      setError('Failed to fetch banned devices');
    } finally {
      setLoading(false);
    }
  };

  const handleUnbanDevice = async (banId: string) => {
    try {
      setLoading(true);
      await deviceTrackingService.unbanDevice(banId);
      fetchBannedDevices();
    } catch (err: any) {
      console.error('Error unbanning device:', err);
      alert('Failed to unban device');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Banned Devices</h2>
      {loading ? (
        <p>Loading banned devices...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-auto w-full">
            <thead>
              <tr>
                <th className="border px-4 py-2">IP Address</th>
                <th className="border px-4 py-2">Reason</th>
                <th className="border px-4 py-2">Banned At</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bannedDevices.length > 0 ? (
                bannedDevices.map((device) => (
                  <tr key={device.$id}>
                    <td className="border px-4 py-2">{device.ipAddress}</td>
                    <td className="border px-4 py-2">{device.reason}</td>
                    <td className="border px-4 py-2">{new Date(device.bannedAt).toLocaleString()}</td>
                    <td className="border px-4 py-2">
                      <button
                        onClick={() => handleUnbanDevice(device.$id)}
                        className="text-blue-600 hover:underline"
                      >
                        Unban
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-4 text-center">
                    No banned devices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BannedDevicesManager;
