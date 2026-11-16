import React from 'react';
import { avatarColors, initials } from '../lib/utils.js';

export default function Avatar({ name, size = 44, className = '', muted = false }) {
  const { bg, fg } = muted ? { bg: '#ece4d6', fg: '#8a7f70' } : avatarColors(name);
  return (
    <span
      className={`avatar ${className}`}
      style={{
        '--avatar-size': `${size}px`,
        '--avatar-bg': bg,
        '--avatar-fg': fg,
        fontSize: `${Math.max(11, Math.round(size * 0.32))}px`,
      }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
