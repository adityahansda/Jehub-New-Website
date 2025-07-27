import NotesDownload from '../../src/pages/NotesDownload';
import SEO from '../../src/components/SEO';

export default function NotesDownloadPage() {
  return (
    <>
      <SEO
        title="Download Engineering Notes - Jharkhand Engineer's Hub"
        description="Download thousands of high-quality engineering notes, study materials, and resources from students across various branches like Computer Science, Electronics, Mechanical, Civil and more."
        tags={['engineering notes', 'study materials', 'computer science', 'electronics', 'mechanical', 'civil', 'download', 'free notes', 'jharkhand', 'engineering']}
      />
      <NotesDownload />
    </>
  );
}
