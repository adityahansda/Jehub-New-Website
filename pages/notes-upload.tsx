import NotesUpload from '../src/pages/NotesUpload'
import ProtectedRoute from '../src/components/ProtectedRoute'
import BetaAccessControl from '../src/components/BetaAccessControl'

export default function NotesUploadPage() {
  return (
    <BetaAccessControl pageName="Upload Notes">
      <ProtectedRoute requiredRoles={['admin', 'manager', 'intern', 'team']}>
        <NotesUpload />
      </ProtectedRoute>
    </BetaAccessControl>
  )
}
