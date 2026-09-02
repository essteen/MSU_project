import React from 'react';

export function HouseIcon({ size = 28, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10v9a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-9" />
      <path d="M10 20v-5.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V20" />
    </svg>
  );
}

export function PersonIcon({ size = 18, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20.5c0-3.6 3.36-6.5 7.5-6.5s7.5 2.9 7.5 6.5" />
    </svg>
  );
}

const MAX_VISIBLE_MEMBER_ICONS = 8;

export function MemberIcons({ count }) {
  if (!count) {
    return null;
  }

  const visible = Math.min(count, MAX_VISIBLE_MEMBER_ICONS);
  const overflow = count - visible;

  return (
    <div className="member-icons" role="img" aria-label={`${count} medlem${count === 1 ? '' : 'mer'}`}>
      {Array.from({ length: visible }).map((_, index) => (
        <PersonIcon key={index} className="member-icon" />
      ))}
      {overflow > 0 ? <span className="member-icon-overflow">+{overflow}</span> : null}
    </div>
  );
}
