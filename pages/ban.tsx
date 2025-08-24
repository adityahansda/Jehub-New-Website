import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { banService, BanInfo } from '../src/services/banService';
import { showError, showSuccess } from '../src/utils/toast';
import { useAuth } from '../src/contexts/AuthContext';
import { useBan } from '../src/contexts/BanContext';
import { AlertTriangle, Clock, Mail, Shield } from 'lucide-react';

function BanPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { banInfo, isBanned } = useBan();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if not banned
  useEffect(() => {
    if (!isBanned) {
      router.push('/');
    }
  }, [isBanned, router]);

  const handleUnbanRequest = async () => {
    if (!banInfo || !user) {
      showError('Unable to submit request. Please try again.');
      return;
    }

    try {
      setLoading(true);
      await banService.submitUnbanRequest(
        user.email,
        user.name,
        banInfo.$id!,
        message
      );
      showSuccess('Unban request submitted successfully!');
      setMessage('');
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isBanned || !banInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-red-600">You&apos;ve been banned</h1>
        <p className="text-sm text-gray-700">Reason: {banInfo.reason}</p>
        <p className="text-sm text-gray-700 mb-6">Ban Date: {new Date(banInfo.bannedAt).toLocaleDateString()}</p>

        <textarea
          className="w-full border border-gray-300 p-2 rounded mb-4"
          placeholder="Explain why you should be unbanned..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={loading}
        ></textarea>

        <button
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleUnbanRequest}
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Request Unban'}
        </button>
      </div>
    </div>
  );
}

// Fetch ban info server-side
export async function getServerSideProps() {
  const { isBanned, banInfo } = await banService.isUserBanned();

  if (!isBanned) {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  }

  return {
    props: { banInfo },
  };
}

export default BanPage;

