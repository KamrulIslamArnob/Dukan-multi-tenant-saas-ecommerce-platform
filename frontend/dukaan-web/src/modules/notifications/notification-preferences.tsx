'use client';

import { useState } from 'react';

interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  orderUpdates: boolean;
  promotions: boolean;
}

export function NotificationPreferences() {
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    email: true,
    push: true,
    inApp: true,
    orderUpdates: true,
    promotions: false,
  });

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Notification Preferences</h3>
      <div className="space-y-3">
        {(Object.keys(prefs) as Array<keyof NotificationPreferences>).map((key) => (
          <label key={key} className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={prefs[key]}
              onChange={() => handleToggle(key)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' ')}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
