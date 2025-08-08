import Notifications from '../src/pages/Notifications'
import BetaAccessControl from '../src/components/BetaAccessControl'

export default function NotificationsPage() {
  return (
    <BetaAccessControl pageName="Notification Page">
      <Notifications />
    </BetaAccessControl>
  )
}
