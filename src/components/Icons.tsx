// SVG 아이콘 컴포넌트 모음 - lucide-react 스타일

interface IconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

const base = (size: number, className: string, sw: number, children: React.ReactNode) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {children}
  </svg>
);

export const IconMoon = ({ size = 24, className = '', strokeWidth = 2 }: IconProps) =>
  base(size, className, strokeWidth,
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  );

export const IconSun = ({ size = 24, className = '', strokeWidth = 2 }: IconProps) =>
  base(size, className, strokeWidth, <>
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </>);

export const IconSearch = ({ size = 24, className = '', strokeWidth = 2 }: IconProps) =>
  base(size, className, strokeWidth, <>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </>);

export const IconShield = ({ size = 24, className = '', strokeWidth = 2 }: IconProps) =>
  base(size, className, strokeWidth,
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  );

export const IconHeart = ({ size = 24, className = '', strokeWidth = 2 }: IconProps) =>
  base(size, className, strokeWidth,
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  );

export const IconUsers = ({ size = 24, className = '', strokeWidth = 2 }: IconProps) =>
  base(size, className, strokeWidth, <>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </>);

export const IconUser = ({ size = 24, className = '', strokeWidth = 2 }: IconProps) =>
  base(size, className, strokeWidth, <>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </>);

export const IconVote = ({ size = 24, className = '', strokeWidth = 2 }: IconProps) =>
  base(size, className, strokeWidth, <>
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
    <polyline points="9 10 12 13 15 10" />
  </>);

export const IconSword = ({ size = 24, className = '', strokeWidth = 2 }: IconProps) =>
  base(size, className, strokeWidth, <>
    <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
    <line x1="13" y1="19" x2="19" y2="13" />
    <line x1="16" y1="16" x2="20" y2="20" />
    <line x1="19" y1="21" x2="21" y2="19" />
  </>);

export const IconKey = ({ size = 24, className = '', strokeWidth = 2 }: IconProps) =>
  base(size, className, strokeWidth, <>
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </>);

export const IconClock = ({ size = 24, className = '', strokeWidth = 2 }: IconProps) =>
  base(size, className, strokeWidth, <>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </>);

export const IconCheck = ({ size = 24, className = '', strokeWidth = 2 }: IconProps) =>
  base(size, className, strokeWidth,
    <polyline points="20 6 9 17 4 12" />
  );

export const IconX = ({ size = 24, className = '', strokeWidth = 2 }: IconProps) =>
  base(size, className, strokeWidth, <>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </>);

export const IconSkull = ({ size = 24, className = '', strokeWidth = 2 }: IconProps) =>
  base(size, className, strokeWidth, <>
    <circle cx="12" cy="11" r="8" />
    <path d="M9 17v1a3 3 0 0 0 6 0v-1" />
    <line x1="9" y1="12" x2="9" y2="12" strokeWidth={3} />
    <line x1="15" y1="12" x2="15" y2="12" strokeWidth={3} />
  </>);

export const IconStar = ({ size = 24, className = '', strokeWidth = 2 }: IconProps) =>
  base(size, className, strokeWidth,
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  );

export const IconPlay = ({ size = 24, className = '', strokeWidth = 2 }: IconProps) =>
  base(size, className, strokeWidth,
    <polygon points="5 3 19 12 5 21 5 3" />
  );

export const IconChevronRight = ({ size = 24, className = '', strokeWidth = 2 }: IconProps) =>
  base(size, className, strokeWidth,
    <polyline points="9 18 15 12 9 6" />
  );

export const IconHome = ({ size = 24, className = '', strokeWidth = 2 }: IconProps) =>
  base(size, className, strokeWidth, <>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </>);

export const IconAlert = ({ size = 24, className = '', strokeWidth = 2 }: IconProps) =>
  base(size, className, strokeWidth, <>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </>);

export const IconCopy = ({ size = 24, className = '', strokeWidth = 2 }: IconProps) =>
  base(size, className, strokeWidth, <>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </>);

export const IconLock = ({ size = 24, className = '', strokeWidth = 2 }: IconProps) =>
  base(size, className, strokeWidth, <>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </>);

export const IconEye = ({ size = 24, className = '', strokeWidth = 2 }: IconProps) =>
  base(size, className, strokeWidth, <>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </>);
