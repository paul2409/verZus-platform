import type { ReactNode } from "react";

export const iconDefinitions = {
  home: (
    <>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10.5V20h13v-9.5" />
      <path d="M9.5 20v-6h5v6" />
    </>
  ),

  gamepad: (
    <>
      <path d="M7 8h10a4 4 0 0 1 3.8 5.3l-1.2 3.5a2 2 0 0 1-3.3.8L14.7 16H9.3l-1.6 1.6a2 2 0 0 1-3.3-.8l-1.2-3.5A4 4 0 0 1 7 8Z" />
      <path d="M7.5 11.5v4" />
      <path d="M5.5 13.5h4" />
      <circle cx="16.5" cy="12" r="0.75" />
      <circle cx="18.5" cy="14" r="0.75" />
    </>
  ),

  swords: (
    <>
      <path d="m4 4 16 16" />
      <path d="m14 10 6-6" />
      <path d="m15 4 5 5" />
      <path d="m4 20 7-7" />
      <path d="m4 4 1 5 4-4-5-1Z" />
      <path d="m15 19 4-4 1 5-5-1Z" />
    </>
  ),

  trophy: (
    <>
      <path d="M8 4h8v4a4 4 0 0 1-8 0V4Z" />
      <path d="M8 6H5v1a4 4 0 0 0 4 4" />
      <path d="M16 6h3v1a4 4 0 0 1-4 4" />
      <path d="M12 12v5" />
      <path d="M8 21h8" />
      <path d="M10 17h4" />
    </>
  ),

  shield: (
    <>
      <path d="M12 3 4.5 6v5.5c0 4.6 3.2 7.5 7.5 9.5 4.3-2 7.5-4.9 7.5-9.5V6L12 3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),

  crown: (
    <>
      <path d="m3 7 4.5 4L12 5l4.5 6L21 7l-2 11H5L3 7Z" />
      <path d="M5 18h14" />
    </>
  ),

  users: (
    <>
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <path d="M14 15.5a4.5 4.5 0 0 1 6.5 4" />
    </>
  ),

  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),

  gift: (
    <>
      <rect x="3" y="9" width="18" height="12" rx="1" />
      <path d="M12 9v12" />
      <path d="M3 13h18" />
      <path d="M12 9H8.5A2.5 2.5 0 1 1 11 6.5L12 9Z" />
      <path d="M12 9h3.5A2.5 2.5 0 1 0 13 6.5L12 9Z" />
    </>
  ),

  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),

  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" />
      <path d="M10 21h4" />
    </>
  ),

  "more-horizontal": (
    <>
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </>
  ),

  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
      <path d="M3 10h18" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 18h.01" />
      <path d="M12 18h.01" />
    </>
  ),

  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),

  hourglass: (
    <>
      <path d="M6 3h12" />
      <path d="M6 21h12" />
      <path d="M7 3c0 4 1.5 6 5 9-3.5 3-5 5-5 9" />
      <path d="M17 3c0 4-1.5 6-5 9 3.5 3 5 5 5 9" />
    </>
  ),

  "message-square": (
    <>
      <path d="M4 5h16v12H8l-4 4V5Z" />
      <path d="M8 9h8" />
      <path d="M8 13h5" />
    </>
  ),

  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3" />
      <path d="M12 19v3" />
      <path d="m4.93 4.93 2.12 2.12" />
      <path d="m16.95 16.95 2.12 2.12" />
      <path d="M2 12h3" />
      <path d="M19 12h3" />
      <path d="m4.93 19.07 2.12-2.12" />
      <path d="m16.95 7.05 2.12-2.12" />
    </>
  ),

  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
      <path d="M12 3V1" />
      <path d="M21 12h2" />
    </>
  ),

  link: (
    <>
      <path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.2" />
      <path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.2-1.2" />
    </>
  ),

  "credit-card": (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18" />
      <path d="M7 15h4" />
    </>
  ),

  play: (
    <>
      <path d="m8 5 11 7-11 7V5Z" />
    </>
  ),

  check: (
    <>
      <path d="m5 12 4 4L19 6" />
    </>
  ),

  x: (
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </>
  ),

  "chevron-down": (
    <>
      <path d="m6 9 6 6 6-6" />
    </>
  ),

  "chevron-right": (
    <>
      <path d="m9 6 6 6-6 6" />
    </>
  ),

  "arrow-up": (
    <>
      <path d="M12 19V5" />
      <path d="m6 11 6-6 6 6" />
    </>
  ),

  "arrow-down": (
    <>
      <path d="M12 5v14" />
      <path d="m18 13-6 6-6-6" />
    </>
  ),

  lock: (
    <>
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      <path d="M12 14v3" />
    </>
  ),

  eye: (
    <>
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),

  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6" />
      <path d="M12 7h.01" />
    </>
  ),

  "alert-triangle": (
    <>
      <path d="M12 3 2.5 20h19L12 3Z" />
      <path d="M12 9v5" />
      <path d="M12 17h.01" />
    </>
  ),

  "refresh-cw": (
    <>
      <path d="M20 7v5h-5" />
      <path d="M4 17v-5h5" />
      <path d="M6.1 8a7 7 0 0 1 11.4-2L20 8" />
      <path d="M17.9 16a7 7 0 0 1-11.4 2L4 16" />
    </>
  ),

  "help-circle": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.8 9a2.5 2.5 0 1 1 3.7 2.2c-1 .6-1.5 1.2-1.5 2.3" />
      <path d="M12 17h.01" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof iconDefinitions;
