'use client';

import { useState } from 'react';

interface NotificationFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

interface FilterState {
  unreadOnly: boolean;
  type: string;
  dateRange: string;
}

export function NotificationFilters({ onFilterChange }: NotificationFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    unreadOnly: false,
    type: 'all',
    dateRange: 'all',
  });

  const updateFilter = (key: keyof FilterState, value: string | boolean) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    onFilterChange(updated);
  };

  return (
    <div className="flex gap-3 items-center">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={filters.unreadOnly}
          onChange={(e) => updateFilter('unreadOnly', e.target.checked)}
        />
        <span className="text-sm">Unread only</span>
      </label>
      <select
        value={filters.type}
        onChange={(e) => updateFilter('type', e.target.value)}
        className="rounded border px-2 py-1 text-sm"
      >
        <option value="all">All types</option>
        <option value="order">Orders</option>
        <option value="system">System</option>
      </select>
    </div>
  );
}
