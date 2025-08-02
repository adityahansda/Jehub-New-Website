import NotesRequest from '../src/pages/NotesRequest'
import ProtectedRoute from '../src/components/ProtectedRoute'

export default function NotesRequestPage() {
  return (
    <ProtectedRoute requiredRoles={['admin', 'manager', 'intern', 'team']}>
      <NotesRequest />
    </ProtectedRoute>
  )
}
