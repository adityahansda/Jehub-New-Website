import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Profile() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard since profile page is not implemented yet
    router.replace('/dashboard');
  }, [router]);

  return (
    <>
      <Head>
        <title>Redirecting to Dashboard - JEHUB</title>
        <meta name="description" content="Redirecting to your student dashboard" />
      </Head>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Redirecting to dashboard...</p>
        </div>
      </div>
    </>
  );
}
