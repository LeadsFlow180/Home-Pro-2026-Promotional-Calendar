'use client';

import type { ReactNode } from 'react';

interface HeaderHomeLinkProps {
  children: ReactNode;
}

/**
 * Wraps the main header area and sends a global event
 * so the calendar view can reset back to the "All Months" view.
 */
export default function HeaderHomeLink({ children }: HeaderHomeLinkProps) {
  const handleClick = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('resetCalendarView'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex items-center gap-3 cursor-pointer group bg-transparent border-none p-0 text-left"
    >
      {children}
    </button>
  );
}


