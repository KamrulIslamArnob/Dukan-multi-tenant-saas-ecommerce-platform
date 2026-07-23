'use client';

import { useQuery } from '@tanstack/react-query';
import { notificationApi } from './api';

export function NotificationList() {
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getAll(),
  });

  if (isLoading) return <div className="animate-pulse space-y-2">Loading...</div>;

  return (
    <div className="space-y-2">
      {notifications?.map((n) => (
        <div
          key={n.id}
          className={ounded-lg border p-3 }
        >
          <p className="font-medium text-sm">{n.title}</p>
          <p className="text-sm text-gray-600">{n.message}</p>
          <p className="text-xs text-gray-400 mt-1">
            {new Date(n.createdAt).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
