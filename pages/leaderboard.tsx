import Leaderboard from '../src/pages/Leaderboard'
import BetaAccessControl from '../src/components/BetaAccessControl'

export default function LeaderboardPage() {
  return (
    <BetaAccessControl pageName="Leaderboard">
      <Leaderboard />
    </BetaAccessControl>
  )
}
