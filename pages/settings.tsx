import { Settings } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
            <p className="text-gray-600 mb-6">
              Settings page is coming soon. We&apos;re working on adding user preferences and configuration options.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>Coming Soon:</strong> User preferences, notification settings, theme options, and more!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
