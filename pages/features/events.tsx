import Events from '../../src/pages/Events'
import BetaAccessControl from '../../src/components/BetaAccessControl'

export default function EventsPage() {
  return (
    <BetaAccessControl pageName="Events">
      <Events />
    </BetaAccessControl>
  )
}
