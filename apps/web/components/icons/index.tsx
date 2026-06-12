import React from "react";

// interface IconProps {
//   size?: number;
//   stroke?: string;
//   strokeWidth?: number;
//   fill?: string;
//   className?: string;
// }

type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
};


// export const HomeIcon = ({ size = 20, stroke = 'currentColor', strokeWidth = 1.8, ...p }: IconProps) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...p}>
//     <path d="M3 10.5L12 3.5L21 10.5"/><path d="M5 9V20a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1V9"/>
//   </svg>
// );

export const FormPageIcon = ({ size = 20, stroke = 'currentColor', strokeWidth = 1.8, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" {...p}>
    <rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>
  </svg>
);

// export const ResponsesIcon = ({ size = 20, stroke = 'currentColor', strokeWidth = 1.8, ...p }: IconProps) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" {...p}>
//     <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
//   </svg>
// );

// export const AnalyticsIcon = ({ size = 20, stroke = 'currentColor', strokeWidth = 1.8, ...p }: IconProps) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" {...p}>
//     <path d="M3 20h18M7 20V12M12 20V5M17 20V9"/>
//   </svg>
// );

export const ThemeIcon = ({ size = 20, stroke = 'currentColor', strokeWidth = 1.8, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" {...p}>
    <circle cx="12" cy="12" r="9"/><path d="M12 3C12 3 8 9 12 12C16 15 12 21 12 21"/><path d="M3 12h18"/>
  </svg>
);

export const SettingsGearIcon = ({ size = 20, stroke = 'currentColor', strokeWidth = 1.8, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" {...p}>
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
);

// export const StarIcon = ({ size = 20, stroke = 'currentColor', fill = 'none', strokeWidth = 1.8, ...p }: IconProps) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...p}>
//     <path d="M12 2L14.5 9H22L16 13.5L18.5 21L12 16.5L5.5 21L8 13.5L2 9H9.5Z"/>
//   </svg>
// );

// export const BellIcon = ({ size = 20, stroke = 'currentColor', strokeWidth = 1.8, ...p }: IconProps) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" {...p}>
//     <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
//     <path d="M13.73 21a2 2 0 01-3.46 0"/>
//   </svg>
// );

// export const ExportIcon = ({ size = 20, stroke = 'currentColor', strokeWidth = 1.8, ...p }: IconProps) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" {...p}>
//     <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
//     <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
//   </svg>
// );

export const EyeIcon = ({ size = 20, stroke = 'currentColor', strokeWidth = 1.8, open = true, ...p }: IconProps & { open?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" {...p}>
    <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z"/>
    <circle cx="12" cy="12" r="3"/>
    {!open && <line x1="4" y1="4" x2="20" y2="20"/>}
  </svg>
);

export const ArrowRightIcon = ({ size = 20, stroke = 'currentColor', strokeWidth = 1.8, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" {...p}>
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

export const ArrowLeftIcon = ({ size = 20, stroke = 'currentColor', strokeWidth = 1.8, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" {...p}>
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);

export const PlusIcon = ({ size = 20, stroke = 'currentColor', strokeWidth = 2.5, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" {...p}>
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

// export const SearchIcon = ({ size = 20, stroke = 'currentColor', strokeWidth = 1.8, ...p }: IconProps) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" {...p}>
//     <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
//   </svg>
// );

export const ShareIcon = ({ size = 20, stroke = 'currentColor', strokeWidth = 1.8, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" {...p}>
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

export const CopyIcon = ({ size = 20, stroke = 'currentColor', strokeWidth = 1.8, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" {...p}>
    <rect x="9" y="9" width="13" height="13" rx="2"/>
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
  </svg>
);

export const DeleteIcon = ({ size = 20, stroke = 'currentColor', strokeWidth = 1.8, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" {...p}>
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
    <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
  </svg>
);

export const CheckMarkIcon = ({ size = 20, stroke = 'currentColor', strokeWidth = 2.2, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" {...p}>
    <path d="M4 12 Q8 17 9.5 17.5 Q11 10 20 5"/>
  </svg>
);

// export const LockIcon = ({ size = 20, stroke = 'currentColor', strokeWidth = 1.8, ...p }: IconProps) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" {...p}>
//     <rect x="3" y="11" width="18" height="11" rx="2"/>
//     <path d="M7 11V7a5 5 0 0110 0v4"/>
//   </svg>
// );

export const KeyIcon = ({ size = 20, stroke = 'currentColor', strokeWidth = 1.8, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" {...p}>
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
  </svg>
);

export const LogoutIcon = ({ size = 20, stroke = 'currentColor', strokeWidth = 1.8, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" {...p}>
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

export const CrownIcon = ({ size = 20, stroke = 'currentColor', fill = 'none', strokeWidth = 1.8, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M2 20h20M4 20L3 7l5 5 4-8 4 8 5-5-1 13"/>
  </svg>
);

// export const HeartIcon = ({ size = 20, stroke = 'currentColor', fill = 'none', strokeWidth = 1.8, ...p }: IconProps) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...p}>
//     <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
//   </svg>
// );

// export const BulbIcon = ({ size = 20, stroke = 'currentColor', strokeWidth = 1.8, ...p }: IconProps) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" {...p}>
//     <path d="M9 21h6M9 18h6"/>
//     <path d="M12 3a6 6 0 016 6c0 3-2 5-3 6H9c-1-1-3-3-3-6a6 6 0 016-6z"/>
//   </svg>
// );

// export const PlantIcon = ({ size = 20, stroke = 'currentColor', strokeWidth = 1.8, ...p }: IconProps) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" {...p}>
//     <path d="M12 20V12"/>
//     <path d="M12 12C12 12 8 10 8 6a4 4 0 018 0c0 4-4 6-4 6z"/>
//     <path d="M12 14C12 14 16 13 18 10"/>
//     <path d="M9 20h6"/>
//   </svg>
// );

export const DragHandleIcon = ({ size = 20, stroke = 'currentColor', strokeWidth = 1.8, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" {...p}>
    <circle cx="9" cy="7" r="1" fill={stroke}/><circle cx="15" cy="7" r="1" fill={stroke}/>
    <circle cx="9" cy="12" r="1" fill={stroke}/><circle cx="15" cy="12" r="1" fill={stroke}/>
    <circle cx="9" cy="17" r="1" fill={stroke}/><circle cx="15" cy="17" r="1" fill={stroke}/>
  </svg>
);

export const GlobeIcon = ({ size = 20, stroke = 'currentColor', strokeWidth = 1.8, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" {...p}>
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
  </svg>
);

export const WarningIcon = ({ size = 20, stroke = 'currentColor', strokeWidth = 1.8, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

export const CheckCircleIcon = ({ size = 20, stroke = '#2d7d46', strokeWidth = 2, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" {...p}>
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

export const QRCodeIcon = ({ size = 20, stroke = 'currentColor', strokeWidth = 1.8, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" {...p}>
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
    <rect x="14" y="14" width="3" height="3"/><rect x="18" y="18" width="3" height="3"/>
    <rect x="14" y="18" width="3" height="3"/><rect x="18" y="14" width="3" height="3"/>
  </svg>
);

export const PaperPlaneIcon = ({ size = 20, stroke = 'currentColor', fill = 'none', strokeWidth = 1.8, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...p}>
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

export const SmileyIcon = ({ size = 20, stroke = 'currentColor', strokeWidth = 1.8, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" {...p}>
    <circle cx="12" cy="12" r="10"/>
    <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
    <line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
  </svg>
);

export const DotIcon = ({ size = 8, fill = 'currentColor', className }: { size?: number; fill?: string; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 8 8" className={className}>
    <circle cx="4" cy="4" r="3.5" fill={fill}/>
  </svg>
);

// Field type icons
export const ShortTextIcon = ({ size = 20, stroke = 'currentColor', strokeWidth = 1.8, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" {...p}>
    <path d="M4 7V4h16v3"/><path d="M12 4v16"/><path d="M9 20h6"/>
  </svg>
);

export const LongTextIcon = ({ size = 20, stroke = 'currentColor', strokeWidth = 1.8, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" {...p}>
    <path d="M4 6h16M4 10h16M4 14h12M4 18h8"/>
  </svg>
);

export const EmailFieldIcon = ({ size = 20, stroke = 'currentColor', strokeWidth = 1.8, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" {...p}>
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="M2 7l10 7 10-7"/>
  </svg>
);

export const NumberIcon = ({ size = 20, stroke = 'currentColor', strokeWidth = 1.8, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" {...p}>
    <line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/>
    <line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>
  </svg>
);

export const DateIcon = ({ size = 20, stroke = 'currentColor', strokeWidth = 1.8, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" {...p}>
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

export const PhoneIcon = ({ size = 20, stroke = 'currentColor', strokeWidth = 1.8, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" {...p}>
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.1 2.18 2 2 0 012.1 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.08 6.08l1.27-.45a2 2 0 012.11.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
  </svg>
);

export const SingleSelectIcon = ({ size = 20, stroke = 'currentColor', strokeWidth = 1.8, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" {...p}>
    <circle cx="8" cy="12" r="3"/><circle cx="8" cy="12" r="1" fill={stroke}/>
    <line x1="14" y1="12" x2="21" y2="12"/>
  </svg>
);

export const MultiSelectIcon = ({ size = 20, stroke = 'currentColor', strokeWidth = 1.8, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" {...p}>
    <rect x="3" y="5" width="5" height="5" rx="1"/>
    <line x1="11" y1="7.5" x2="21" y2="7.5"/>
    <rect x="3" y="14" width="5" height="5" rx="1"/>
    <line x1="11" y1="16.5" x2="21" y2="16.5"/>
  </svg>
);

export const CheckboxFieldIcon = ({ size = 20, stroke = 'currentColor', strokeWidth = 1.8, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" {...p}>
    <polyline points="9 11 12 14 22 4"/>
    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
  </svg>
);

export const RatingStarIcon = ({ size = 24, filled = false, stroke = 'currentColor', strokeWidth = 1.5, ...p }: IconProps & { filled?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? '#F5C842' : 'none'} stroke={filled ? '#F5C842' : stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M12 2.2L14.6 9.1H21.8L16.1 13.4L18.3 20.8L12 16.9L5.7 20.8L7.9 13.4L2.2 9.1H9.4Z"/>
  </svg>
);

export const FileUploadIcon = ({ size = 20, stroke = 'currentColor', strokeWidth = 1.8, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" {...p}>
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

export const DividerIcon = ({ size = 20, stroke = 'currentColor', strokeWidth = 1.8, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" {...p}>
    <path d="M3 12 Q6 10 9 12 Q12 14 15 12 Q18 10 21 12"/>
    <line x1="3" y1="7" x2="3" y2="17"/><line x1="21" y1="7" x2="21" y2="17"/>
  </svg>
);

export const AddBoxIcon = ({ size = 20, stroke = 'currentColor', strokeWidth = 1.8, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" {...p}>
    <rect x="3" y="3" width="18" height="18" rx="3"/>
    <line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
);

// export const PinIcon = ({ size = 16, stroke = 'currentColor', fill = 'none', strokeWidth = 1.5, ...p }: IconProps) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" {...p}>
//     <circle cx="12" cy="9" r="6"/><path d="M12 15v7"/>
//   </svg>
// );

export const GoogleIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export const PuzzleIcon = ({ size = 20, stroke = 'currentColor', strokeWidth = 1.8, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" {...p}>
    <path d="M4 7h3a1 1 0 001-1V4a2 2 0 114 0v2a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-2a2 2 0 100 4h2a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-2a2 2 0 10-4 0v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-3a1 1 0 011-1h2a2 2 0 100-4H4a1 1 0 01-1-1V8a1 1 0 011-1z"/>
  </svg>
);

export const SpinnerIcon = ({ size = 20, stroke = '#1a1208' }: { size?: number; stroke?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    
    <circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth="2" strokeLinecap="round"
      strokeDasharray="20 40" style={{ transformOrigin: '12px 12px' }} />
  </svg>
);



/* ── Bell ──────────────────────────────────────────────── */
export function BellIcon({ size = 24, color = "#5a4a30", strokeWidth = 1.8 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
      <path d="M12 3a7 7 0 00-7 7v4.5L3 17v1h18v-1l-2-2.5V10a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 21a2 2 0 004 0" strokeLinecap="round"/>
      <path d="M12 3v-1" strokeLinecap="round"/>
    </svg>
  );
}

/* ── Export / Download ─────────────────────────────────── */
export function ExportIcon({ size = 18, color = "currentColor", strokeWidth = 1.8 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth={strokeWidth}>
      <path d="M10 3v10M6 9l4 4 4-4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 16h12" strokeLinecap="round"/>
    </svg>
  );
}

/* ── Arrow (left/right/up/down) ────────────────────────── */
export function ArrowIcon({ size = 16, color = "currentColor", strokeWidth = 1.8, direction = "right" }: IconProps & { direction?: "left" | "right" | "up" | "down" }) {
  const paths: Record<string, string> = {
    right: "M3 8h10M9 4l4 4-4 4",
    left:  "M13 8H3M7 4L3 8l4 4",
    up:    "M8 13V3M4 7l4-4 4 4",
    down:  "M8 3v10M4 9l4 4 4-4",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth={strokeWidth}>
      <path d={paths[direction]} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ── Star (filled) ─────────────────────────────────────── */
export function StarIcon({ size = 20, filled = true, color = "#f5b800" }: IconProps & { filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill={filled ? color : "none"} stroke={filled ? "#d48a00" : "#9a8060"} strokeWidth={0.9}>
      <path d="M10 2l2.4 5H18l-4.4 3.4 1.6 5.6L10 13l-5.2 3 1.6-5.6L2 7h5.6z"/>
    </svg>
  );
}

/* ── Heart ─────────────────────────────────────────────── */
export function HeartIcon({ size = 22, color = "#e05c5c", strokeColor = "#c04040" }: IconProps & { strokeColor?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={strokeColor} strokeWidth={1.2}>
      <path d="M12 20C12 20 3 14 3 8.5C3 6 5 4 7.5 4C9.4 4 11 5.1 12 6.6C13 5.1 14.6 4 16.5 4C19 4 21 6 21 8.5C21 14 12 20 12 20Z" strokeLinejoin="round"/>
      <path d="M8 8Q9.5 6.5 12 7.5" stroke="rgba(255,200,200,0.7)" strokeWidth={1} strokeLinecap="round" fill="none"/>
    </svg>
  );
}

/* ── Lock ──────────────────────────────────────────────── */
export function LockIcon({ size = 18, color = "#5a4a30", strokeWidth = 1.6 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth={strokeWidth}>
      <rect x="5" y="9" width="10" height="9" rx="2" strokeLinejoin="round"/>
      <path d="M7 9V7a3 3 0 016 0v2" strokeLinecap="round"/>
      <circle cx="10" cy="14" r="1.2" fill={color} stroke="none"/>
    </svg>
  );
}

/* ── Plant / Potted ────────────────────────────────────── */
export function PlantIcon({ size = 44 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <ellipse cx="22" cy="40" rx="10" ry="4" fill="#c8b48a" opacity={0.4}/>
      <rect x="20" y="28" width="4" height="12" rx="2" fill="#8b6340"/>
      <path d="M22 30 C14 24 10 16 14 10 C18 4 26 8 22 18" fill="#5a9e4a"/>
      <path d="M22 30 C30 24 34 16 30 10 C26 4 18 8 22 18" fill="#4a8e3a"/>
      <path d="M22 32 C15 28 12 22 16 18 C20 14 26 18 22 26" fill="#6aae5a"/>
    </svg>
  );
}

/* ── Bulb ──────────────────────────────────────────────── */
export function BulbIcon({ size = 16, color = "currentColor", strokeWidth = 1.6 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth={strokeWidth}>
      <path d="M10 2a5 5 0 00-2 9.54V13h4v-1.46A5 5 0 0010 2z" strokeLinecap="round"/>
      <path d="M8 13h4M9 16h2" strokeLinecap="round"/>
    </svg>
  );
}

/* ── Smile ─────────────────────────────────────────────── */
export function SmileIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" fill="#fbe98c" stroke="#5a4a30" strokeWidth={1.4}/>
      <circle cx="7.5" cy="8.5" r="1" fill="#2d2416"/>
      <circle cx="12.5" cy="8.5" r="1" fill="#2d2416"/>
      <path d="M7 12 Q10 15 13 12" stroke="#2d2416" strokeWidth={1.4} strokeLinecap="round" fill="none"/>
    </svg>
  );
}

/* ── Checkbox (SVG scribble style) ─────────────────────── */
export function ScribbleCheckbox({ checked = false, size = 17 }: { checked?: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 17 17" fill="none">
      <path
        d="M2 8 Q2 2.5 8.5 2 Q15 2.5 15 8.5 Q14.5 15 8 15 Q2 14.5 2 8Z"
        fill={checked ? "#fbe98c" : "none"}
        stroke={checked ? "#2d2416" : "#9a8060"}
        strokeWidth={1.5}
      />
      {checked && (
        <path d="M5 8.5 L7.5 11 L12 6" stroke="#2d2416" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
      )}
    </svg>
  );
}

/* ── Pin (map pin / thumbtack) ─────────────────────────── */
export function PinIcon({ size = 22, color = "#7c5cbf" }: IconProps) {
  return (
    <svg width={14} height={size} viewBox="0 0 14 22" fill="none">
      <circle cx="7" cy="7" r="6" fill={color} stroke="#2d2416" strokeWidth={1.2}/>
      <path d="M7 13 L7 20" stroke="#2d2416" strokeWidth={1.5} strokeLinecap="round"/>
    </svg>
  );
}

/* ── Tape / Washi strip ────────────────────────────────── */
export function TapeStrip({ color = "#c8e2fa", width = 36, height = 14, rotate = -3 }: { color?: string; width?: number; height?: number; rotate?: number }) {
  return (
    <div
      style={{
        position: "absolute",
        top: -7,
        left: "50%",
        transform: `translateX(-50%) rotate(${rotate}deg)`,
        width,
        height,
        background: color,
        borderRadius: 2,
        opacity: 0.75,
        pointerEvents: "none",
      }}
    />
  );
}

/* ── Clock ─────────────────────────────────────────────── */
export function ClockIcon({ size = 16, color = "#5a4a30", strokeWidth = 1.5 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth={strokeWidth}>
      <circle cx="8" cy="8" r="6"/>
      <path d="M8 5v3l2 1.5" strokeLinecap="round"/>
    </svg>
  );
}

/* ── Mail / Envelope ───────────────────────────────────── */
export function MailIcon({ size = 14, color = "#9a8060", strokeWidth = 1.4 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke={color} strokeWidth={strokeWidth}>
      <rect x="1" y="3" width="12" height="9" rx="1.5"/>
      <path d="M1 5l6 4 6-4" strokeLinecap="round"/>
    </svg>
  );
}

/* ── Calendar ──────────────────────────────────────────── */
export function CalendarIcon({ size = 16, color = "currentColor", strokeWidth = 1.6 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth={strokeWidth}>
      <rect x="3" y="4" width="14" height="13" rx="2"/>
      <path d="M3 8h14M7 2v4M13 2v4" strokeLinecap="round"/>
    </svg>
  );
}

/* ── Search ────────────────────────────────────────────── */
export function SearchIcon({ size = 16, color = "#9a8060", strokeWidth = 1.8 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth={strokeWidth}>
      <circle cx="9" cy="9" r="6"/>
      <path d="M14 14l4 4" strokeLinecap="round"/>
    </svg>
  );
}

/* ── Filter sliders ────────────────────────────────────── */
export function FilterIcon({ size = 16, color = "currentColor", strokeWidth = 1.6 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth={strokeWidth}>
      <path d="M4 6h12M6 10h8M8 14h4" strokeLinecap="round"/>
    </svg>
  );
}

/* ── Dots (ellipsis) ───────────────────────────────────── */
export function DotsIcon({ size = 18, color = "#9a8060" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill={color}>
      <circle cx="4" cy="10" r="1.8"/>
      <circle cx="10" cy="10" r="1.8"/>
      <circle cx="16" cy="10" r="1.8"/>
    </svg>
  );
}

/* ── Chevron (dropdown arrow) ──────────────────────────── */
export function ChevronIcon({ size = 12, color = "#5a4a30", direction = "down" }: IconProps & { direction?: "down" | "up" | "left" | "right" }) {
  const transforms: Record<string, string> = { down: "", up: "rotate(180)", left: "rotate(90)", right: "rotate(-90)" };
  return (
    <svg width={size} height={size} viewBox="0 0 12 8" fill="none" style={{ transform: transforms[direction] }}>
      <path d="M1 1.5 Q4 5.5 6 6 Q8 5.5 11 1.5" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
    </svg>
  );
}

/* ── Settings/Gear ─────────────────────────────────────── */
export function SettingsIcon({ size = 16, color = "currentColor", strokeWidth = 1.6 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth={strokeWidth}>
      <circle cx="10" cy="10" r="2.5"/>
      <path d="M10 3v2M10 15v2M3 10h2M15 10h2M5.05 5.05l1.41 1.41M13.54 13.54l1.41 1.41M5.05 14.95l1.41-1.41M13.54 6.46l1.41-1.41" strokeLinecap="round"/>
    </svg>
  );
}

/* ── Trending arrow ─────────────────────────────────────── */
export function TrendingIcon({ size = 60, color = "#5a4a30" }: IconProps) {
  return (
    <svg width={size} height={24} viewBox="0 0 60 24" fill="none">
      <path d="M2 18 Q10 16 18 14 Q26 10 30 12 Q36 14 40 8 Q46 2 58 4" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none"/>
      <path d="M54 2 L60 4 L56 8" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

/* ── Nav icons ─────────────────────────────────────────── */
export function HomeIcon({ size = 18, color = "currentColor", strokeWidth = 1.6 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth={strokeWidth}>
      <path d="M3 10L10 3l7 7M5 8v8a1 1 0 001 1h3v-4h2v4h3a1 1 0 001-1V8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function FormsIcon({ size = 18, color = "currentColor", strokeWidth = 1.6 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth={strokeWidth}>
      <rect x="3" y="2" width="14" height="16" rx="2" strokeLinejoin="round"/>
      <path d="M7 7h6M7 11h6M7 15h4" strokeLinecap="round"/>
    </svg>
  );
}

export function ResponsesIcon({ size = 18, color = "currentColor", strokeWidth = 1.6 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth={strokeWidth}>
      <rect x="2" y="4" width="16" height="13" rx="2"/>
      <path d="M2 8l8 5 8-5" strokeLinecap="round"/>
    </svg>
  );
}

export function AnalyticsIcon({ size = 18, color = "currentColor", strokeWidth = 1.6 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth={strokeWidth}>
      <path d="M3 15l4-8 4 5 3-3 3 6" strokeLinecap="round" strokeLinejoin="round"/>
      {/* <rect x="3" y="3" width="14" height="12" rx="1" opacity={0.2} strokeDasharray="2 2"/> */}
    </svg>
  );
}

export function ThemesIcon({ size = 18, color = "currentColor", strokeWidth = 1.6 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth={strokeWidth}>
      <circle cx="10" cy="10" r="3"/>
      <path d="M10 3v2M10 15v2M3 10h2M15 10h2M5.05 5.05l1.41 1.41M13.54 13.54l1.41 1.41M5.05 14.95l1.41-1.41M13.54 6.46l1.41-1.41" strokeLinecap="round"/>
    </svg>
  );
}

export function IntegrationsIcon({ size = 18, color = "currentColor", strokeWidth = 1.6 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth={strokeWidth}>
      <path d="M7 2h2v2H7zM11 2h2v2h-2zM7 16h2v2H7zM11 16h2v2h-2z" strokeLinejoin="round"/>
      <path d="M9 4v3M13 4v3M9 13v3M13 13v3M4 9h3M13 9h3" strokeLinecap="round"/>
      <rect x="6" y="6" width="8" height="8" rx="1.5"/>
    </svg>
  );
}

export function HelpIcon({ size = 18, color = "currentColor", strokeWidth = 1.6 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth={strokeWidth}>
      <circle cx="10" cy="10" r="8"/>
      <path d="M8 8c0-1.1.9-2 2-2s2 .9 2 2c0 1-.6 1.5-1.3 2.1S10 11.5 10 12.5M10 14.5v.5" strokeLinecap="round"/>
    </svg>
  );
}

export function InfoIcon({ size = 18, color = "currentColor", strokeWidth = 1.6 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth={strokeWidth}>
      <circle cx="10" cy="10" r="8"/>
      <path d="M10 14v-4M10 7v.5" strokeLinecap="round"/>
    </svg>
  );
}

/* ── Mascot boy with magnifying glass ─────────────────── */
export function MascotIcon({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.07} viewBox="0 0 54 58" fill="none">
      <ellipse cx="27" cy="55" rx="10" ry="3" fill="#c8b48a" opacity={0.35}/>
      <ellipse cx="27" cy="42" rx="10" ry="12" fill="#f5c87a"/>
      <ellipse cx="27" cy="46" rx="10" ry="9" fill="#7c9ef5"/>
      <circle cx="27" cy="22" r="12" fill="#f5c87a"/>
      <path d="M16 18 Q17 10 27 8 Q37 10 38 18 Q36 12 27 11 Q18 12 16 18Z" fill="#2d2416"/>
      <path d="M16 16 Q14 12 18 10" stroke="#2d2416" strokeWidth={1.5} fill="none" strokeLinecap="round"/>
      <circle cx="23" cy="22" r="1.5" fill="#2d2416"/>
      <circle cx="31" cy="22" r="1.5" fill="#2d2416"/>
      <circle cx="22.5" cy="21.5" r="0.5" fill="white"/>
      <circle cx="30.5" cy="21.5" r="0.5" fill="white"/>
      <path d="M23 27 Q27 30 31 27" stroke="#2d2416" strokeWidth={1.5} fill="none" strokeLinecap="round"/>
      <path d="M37 36 Q42 30 46 28" stroke="#f5c87a" strokeWidth={4} strokeLinecap="round"/>
      <circle cx="48" cy="24" r="6" stroke="#2d2416" strokeWidth={2} fill="rgba(255,255,255,0.3)"/>
      <path d="M52 28 L55 32" stroke="#2d2416" strokeWidth={2} strokeLinecap="round"/>
      <path d="M45 21 L51 21 M48 18 L48 24" stroke="rgba(45,36,22,0.3)" strokeWidth={1} strokeLinecap="round"/>
      <path d="M20 54 Q18 58 17 58" stroke="#2d2416" strokeWidth={3} strokeLinecap="round"/>
      <path d="M34 54 Q36 58 37 58" stroke="#2d2416" strokeWidth={3} strokeLinecap="round"/>
      <path d="M8 14 L10 14 M9 13 L9 15 M7.5 12.5 L10.5 15.5 M10.5 12.5 L7.5 15.5" stroke="#f5c87a" strokeWidth={1.2} strokeLinecap="round"/>
    </svg>
  );
}