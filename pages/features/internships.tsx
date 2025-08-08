import Internships from '../../src/pages/Internships'
import BetaAccessControl from '../../src/components/BetaAccessControl'

export default function InternshipsPage() {
  return (
    <BetaAccessControl pageName="Internships">
      <Internships />
    </BetaAccessControl>
  )
}
