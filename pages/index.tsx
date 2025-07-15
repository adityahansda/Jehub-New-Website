import Home from '../src/pages/Home'
import ComingSoon from '../src/pages/ComingSoon'

export default function HomePage() {
  // Check if coming soon mode is enabled
  const isComingSoonMode = process.env.NEXT_PUBLIC_COMING_SOON_MODE === 'true'
  
  return isComingSoonMode ? <ComingSoon /> : <Home />
}
