import NotesDownload from '../src/pages/NotesDownload'
import BetaAccessControl from '../src/components/BetaAccessControl'

export default function NotesDownloadPage() {
  return (
    <BetaAccessControl pageName="Download Notes">
      <NotesDownload />
    </BetaAccessControl>
  )
}
