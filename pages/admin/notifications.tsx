import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import NotificationsManager from '../../src/components/admin/NotificationsManager';

const AdminNotifications = () => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Notifications Manager - Admin</title>
        <meta name="description" content="Manage system notifications" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
                  <p className="text-gray-600">Notifications Management</p>
                </div>
                <button
                  onClick={() => router.back()}
                  className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-gray-700"
                >
                  ← Back
                </button>
              </div>
            </div>
          </div>
        </div>

        <NotificationsManager />
      </div>
    </>
  );
};

export default AdminNotifications;
