import { PageHeader } from "@/components/page-header";
import { NotificationList } from "@/components/notifications/notification-list";

export default function NotificationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Notifications"
        description="Stay up to date with your grant activity"
      />
      <NotificationList />
    </div>
  );
}
