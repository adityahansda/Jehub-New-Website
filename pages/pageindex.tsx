import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function PageIndexRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace('/misc/pageindex')
  }, [router])
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to Page Index...</p>
      </div>
    </div>
  )
}
