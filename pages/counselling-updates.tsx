import CounsellingUpdates from '../src/pages/CounsellingUpdates'
import BetaAccessControl from '../src/components/BetaAccessControl'

export default function CounsellingUpdatesPage() {
  return (
    <BetaAccessControl pageName="Counselling Updates">
      <CounsellingUpdates />
    </BetaAccessControl>
  )
}
