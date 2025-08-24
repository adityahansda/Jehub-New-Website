import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import Home from '../src/pages/Home_New'
import ComingSoon from '../src/pages/ComingSoon'
import HomeDashboard from '../src/pages/Home-Dashboard'
import { useAuth } from '../src/contexts/AuthContext'
import LoadingSpinner from '../src/components/LoadingSpinner'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  // Check if coming soon mode is enabled
  const isComingSoonMode = process.env.NEXT_PUBLIC_COMING_SOON_MODE === 'true'
  
  // Show loading spinner while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" />
      </div>
    )
  }
  
  // If coming soon mode is enabled, show coming soon page
  if (isComingSoonMode) {
    return <ComingSoon />
  }
  
  // If user is authenticated, show dashboard
  if (user) {
    return <HomeDashboard />
  }
  
  // If user is not authenticated, show regular home page
  return <Home />
}
