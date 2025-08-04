import NotesUpload from '../../src/pages/NotesUpload'
import ProtectedRoute from '../../src/components/ProtectedRoute'

export default function NotesUploadPage() {
  return (
    <ProtectedRoute requiredRoles={['admin', 'manager', 'intern', 'team']}>
      <NotesUpload />
    </ProtectedRoute>
  )
}
