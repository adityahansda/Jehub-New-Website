import Blog from '../../src/pages/Blog'
import BetaAccessControl from '../../src/components/BetaAccessControl'

export default function BlogPage() {
  return (
    <BetaAccessControl pageName="Blog">
      <Blog />
    </BetaAccessControl>
  )
}
