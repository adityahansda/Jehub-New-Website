import ExamUpdates from '../src/pages/ExamUpdates'
import BetaAccessControl from '../src/components/BetaAccessControl'

export default function ExamUpdatesPage() {
  return (
    <BetaAccessControl pageName="Exam Updates">
      <ExamUpdates />
    </BetaAccessControl>
  )
}
