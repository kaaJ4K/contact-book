import React from 'react';

const paths = {
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.2 4.2" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  star: <path d="m12 3.6 2.55 5.17 5.7.83-4.13 4.02.98 5.68L12 16.62 6.9 19.3l.98-5.68L3.75 9.6l5.7-.83L12 3.6Z" />,
  'star-filled': (
    <path
      d="m12 3.6 2.55 5.17 5.7.83-4.13 4.02.98 5.68L12 16.62 6.9 19.3l.98-5.68L3.75 9.6l5.7-.83L12 3.6Z"
      fill="currentColor"
      stroke="none"
    />
  ),
  phone: (
    <path d="M8.1 4.1 5.6 5.5c-.8.45-1.15 1.4-.85 2.3 1.8 5.3 5.7 9.2 11 11 .9.3 1.85-.05 2.3-.85l1.4-2.5c.35-.65.15-1.45-.45-1.9l-2.6-1.95c-.55-.4-1.3-.35-1.8.1l-1.2 1.15a13.6 13.6 0 0 1-5.1-5.1l1.15-1.2c.45-.5.5-1.25.1-1.8L7.9 4.55c-.45-.6-1.25-.8-1.9-.45" />
  ),
  mail: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="m4.5 7.5 7.5 5.6 7.5-5.6" />
    </>
  ),
  chat: (
    <>
      <path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.5-4.3a8.5 8.5 0 1 1 15.5-4.7Z" />
      <path d="M8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01" strokeWidth="2.4" />
    </>
  ),
  qq: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.2 10.2h.01M14.8 10.2h.01" strokeWidth="2.2" />
      <path d="M8.9 15.1c1.3 1.55 4.9 1.55 6.2 0" />
      <path d="M15.6 7.2c.7.4 1 1.5.5 2.2M8.4 7.2c-.7.4-1 1.5-.5 2.2" />
    </>
  ),
  pin: (
    <>
      <path d="M19 10.2c0 5.1-7 10.3-7 10.3S5 15.3 5 10.2a7 7 0 1 1 14 0Z" />
      <circle cx="12" cy="10" r="2.4" />
    </>
  ),
  link: (
    <>
      <path d="M9.5 14.5 7.6 16.4a3.7 3.7 0 0 1-5.2-5.2l3.3-3.3a3.7 3.7 0 0 1 5.2 0" />
      <path d="m14.5 9.5 1.9-1.9a3.7 3.7 0 0 1 5.2 5.2l-3.3 3.3a3.7 3.7 0 0 1-5.2 0" />
      <path d="m8.5 12 7 0" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M15 5.5V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h.5" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v11" />
      <path d="m8 11 4 4 4-4" />
      <path d="M4.5 19.5h15" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V5" />
      <path d="m8 9 4-4 4 4" />
      <path d="M4.5 19.5h15" />
    </>
  ),
  trash: (
    <>
      <path d="M4.5 7h15" />
      <path d="M9 7V4.8c0-.7.6-1.3 1.3-1.3h3.4c.7 0 1.3.6 1.3 1.3V7" />
      <path d="m6.5 7 1 12c.1 1 .9 1.7 1.9 1.7h5.2c1 0 1.8-.7 1.9-1.7l1-12" />
      <path d="M10 11v6M14 11v6" />
    </>
  ),
  edit: (
    <>
      <path d="M14.5 5.5 18.5 9.5" />
      <path d="M4.5 19.5 5.2 15 15.8 4.4a2.1 2.1 0 0 1 3 3L8.2 18l-3.7.7Z" />
    </>
  ),
  close: (
    <>
      <path d="m6 6 12 12" />
      <path d="M18 6 6 18" />
    </>
  ),
  check: (
    <>
      <path d="m4.5 12.5 5 5 10-11" />
    </>
  ),
  'chevron-down': <path d="m6 9.5 6 6 6-6" />,
  'chevron-right': <path d="m9 6 6 6-6 6" />,
  'arrow-left': <path d="M19 12H5m6-6-6 6 6 6" />,
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20c.3-3.6 2.7-5.8 5.5-5.8s5.2 2.2 5.5 5.8" />
      <path d="M15.5 5.2a3.2 3.2 0 0 1 0 6.2M17 14.6c2.1.4 3.4 2.3 3.5 5.4" />
    </>
  ),
  tag: (
    <>
      <path d="m20 13-7 7a2 2 0 0 1-2.8 0L4.5 14.4a2 2 0 0 1-.6-1.4V5.5A1.5 1.5 0 0 1 5.5 4H13c.5 0 1 .2 1.4.6l5.6 5.6a2 2 0 0 1 0 2.8Z" />
      <circle cx="8.2" cy="8.2" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  sparkles: (
    <>
      <path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4L12 3Z" />
      <path d="m18.5 14 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" />
      <path d="m5.5 15 .7 1.8 1.8.7-1.8.7L5.5 20l-.7-1.8-1.8-.7 1.8-.7.7-1.8Z" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M8 3v4M16 3v4M3.5 10h17" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3.5" y="7" width="17" height="12.5" rx="2" />
      <path d="M9 7V5.2c0-.7.6-1.2 1.2-1.2h3.6c.7 0 1.2.5 1.2 1.2V7" />
      <path d="M3.5 12.5c5.5 2.8 11.5 2.8 17 0" />
    </>
  ),
  note: (
    <>
      <path d="M5 3.5h9.5L19 8v12.5H5V3.5Z" />
      <path d="M14 3.8V8h4.5" />
      <path d="M8.5 12.5h7M8.5 16h5" />
    </>
  ),
  database: (
    <>
      <ellipse cx="12" cy="5.8" rx="7.5" ry="3" />
      <path d="M4.5 5.8v12.4c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V5.8" />
      <path d="M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3" />
    </>
  ),
  refresh: (
    <>
      <path d="M19 8a8 8 0 1 0 .2 7.5" />
      <path d="M19 3v5h-5" />
    </>
  ),
  sort: (
    <>
      <path d="M8 5v14M5 16l3 3 3-3" />
      <path d="M16 19V5M13 8l3-3 3 3" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5M12 7.8h.01" strokeWidth="2.2" />
    </>
  ),
  file: (
    <>
      <path d="M5.5 3.5h8l5 5v12h-13v-17Z" />
      <path d="M13.5 3.8V8.5h4.7" />
    </>
  ),
  eye: (
    <>
      <path d="M2.8 12S6.5 5.8 12 5.8 21.2 12 21.2 12 17.5 18.2 12 18.2 2.8 12 2.8 12Z" />
      <circle cx="12" cy="12" r="2.7" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.2" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2" />
    </>
  ),
  'external-link': (
    <>
      <path d="M14 4h6v6M20 4l-9 9" />
      <path d="M19 14v5.5a1.5 1.5 0 0 1-1.5 1.5h-12A1.5 1.5 0 0 1 4 19.5v-12A1.5 1.5 0 0 1 5.5 6H11" />
    </>
  ),
};

export default function Icon({ name, size = 20, className = '', title, strokeWidth = 1.8, ...rest }) {
  const content = paths[name] || paths.link;
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : 'true'}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {content}
    </svg>
  );
}

export function BrandMark({ size = 38 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="48" height="48" rx="13" fill="currentColor" />
      <circle cx="17" cy="18.5" r="4.5" fill="#f4b860" />
      <circle cx="32" cy="30" r="4.5" fill="#e97a5d" />
      <path
        d="M21 21.5c3.5 1.2 4.8 4.2 6.6 5.5"
        stroke="#f7f2e7"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M12.5 35.5c0-2.8 2-5 4.5-5s4.5 2.2 4.5 5"
        stroke="#f7f2e7"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
