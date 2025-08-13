import Link from 'next/link'
import { ChevronLeft, FileText, Search } from 'lucide-react'
import SEO from '../src/components/SEO'

export default function Custom404() {
  return (
    <>
      <SEO
        title="Page Not Found - Jharkhand Engineer's Hub"
        description="The page you're looking for doesn't exist. Return to Jharkhand Engineer's Hub to find engineering notes, study materials, and more."
        tags={['404', 'not found', 'engineering', 'notes']}
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          {/* 404 Icon */}
          <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <FileText className="h-12 w-12 text-gray-400" />
          </div>

          {/* Error Message */}
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            Oops! The page you&apos;re looking for doesn&apos;t exist. It might have been moved, deleted, or you entered the wrong URL.
          </p>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <ChevronLeft className="h-5 w-5 mr-2" />
              Go Back Home
            </Link>
            
            <Link
              href="/notes-download"
              className="inline-flex items-center justify-center w-full bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition-all duration-200"
            >
              <Search className="h-5 w-5 mr-2" />
              Browse Notes
            </Link>
          </div>

          {/* Popular Links */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Popular Pages</h3>
            <div className="space-y-2">
              <Link href="/notes-download" className="block text-blue-600 hover:text-blue-800 transition-colors">
                Engineering Notes
              </Link>
              <Link href="/events" className="block text-blue-600 hover:text-blue-800 transition-colors">
                Events & Updates
              </Link>
              <Link href="/internships" className="block text-blue-600 hover:text-blue-800 transition-colors">
                Internship Opportunities
              </Link>
              <Link href="/about" className="block text-blue-600 hover:text-blue-800 transition-colors">
                About JEHub
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
