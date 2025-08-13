import NoteHubStyleNotesDownload from '../src/pages/NoteHubStyleNotesDownload';
import SEO from '../src/components/SEO';

export default function NotesDownloadPage() {
  return (
    <>
      <SEO
        title="Notes Download - Engineering Study Hub - Jharkhand Engineer's Hub"
        description="Browse and download thousands of high-quality engineering notes, study materials, and resources with our modern interface. Easy search, filtering, and instant downloads for students."
        tags={['engineering notes', 'study materials', 'computer science', 'electronics', 'mechanical', 'civil', 'download', 'free notes', 'jharkhand', 'engineering', 'note hub']}
      />
      <NoteHubStyleNotesDownload />
    </>
  );
}
