// Icon component - lightweight inline SVG icons to avoid dependencies
import { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const baseProps = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const Icons = {
  Sparkles: ({ size = 24, ...p }: IconProps) => (
    <svg {...baseProps(size)} {...p}>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2 2M16.4 16.4l2 2M5.6 18.4l2-2M16.4 7.6l2-2" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Book: ({ size = 24, ...p }: IconProps) => (
    <svg {...baseProps(size)} {...p}>
      <path d="M4 4h10a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H4z" />
      <path d="M20 4h-2a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h3z" />
    </svg>
  ),
  Moon: ({ size = 24, ...p }: IconProps) => (
    <svg {...baseProps(size)} {...p}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  ),
  Scale: ({ size = 24, ...p }: IconProps) => (
    <svg {...baseProps(size)} {...p}>
      <path d="M12 3v18" />
      <path d="M5 7h14" />
      <path d="M5 7l-2 6a4 4 0 0 0 4 0z" />
      <path d="M19 7l-2 6a4 4 0 0 0 4 0z" />
      <path d="M9 21h6" />
    </svg>
  ),
  Shield: ({ size = 24, ...p }: IconProps) => (
    <svg {...baseProps(size)} {...p}>
      <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  Compass: ({ size = 24, ...p }: IconProps) => (
    <svg {...baseProps(size)} {...p}>
      <circle cx="12" cy="12" r="10" />
      <path d="M16.2 7.8l-2.4 6.4-6.4 2.4 2.4-6.4z" />
    </svg>
  ),
  Heart: ({ size = 24, ...p }: IconProps) => (
    <svg {...baseProps(size)} {...p}>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  ),
  Crown: ({ size = 24, ...p }: IconProps) => (
    <svg {...baseProps(size)} {...p}>
      <path d="M3 18h18" />
      <path d="M5 6l4 4 3-7 3 7 4-4-2 12H7z" />
    </svg>
  ),
  Star: ({ size = 24, ...p }: IconProps) => (
    <svg {...baseProps(size)} {...p}>
      <path d="M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" />
    </svg>
  ),
  Brain: ({ size = 24, ...p }: IconProps) => (
    <svg {...baseProps(size)} {...p}>
      <path d="M9 4a3 3 0 0 0-3 3v0a3 3 0 0 0-3 3v3a3 3 0 0 0 3 3v3a3 3 0 0 0 3 3" />
      <path d="M15 4a3 3 0 0 1 3 3v0a3 3 0 0 1 3 3v3a3 3 0 0 1-3 3v3a3 3 0 0 1-3 3" />
      <path d="M9 4v17M15 4v17" />
    </svg>
  ),
  Trophy: ({ size = 24, ...p }: IconProps) => (
    <svg {...baseProps(size)} {...p}>
      <path d="M6 4h12v3a6 6 0 0 1-12 0z" />
      <path d="M6 6H3a2 2 0 0 0 2 4M18 6h3a2 2 0 0 1-2 4" />
      <path d="M9 17h6l-1 4h-4z" />
      <path d="M8 21h8" />
    </svg>
  ),
  Cards: ({ size = 24, ...p }: IconProps) => (
    <svg {...baseProps(size)} {...p}>
      <rect x="4" y="6" width="14" height="14" rx="2" />
      <path d="M8 4h14a2 2 0 0 1 2 2v14" />
    </svg>
  ),
  Network: ({ size = 24, ...p }: IconProps) => (
    <svg {...baseProps(size)} {...p}>
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M8 6h8M8 18h8M6 8v8M18 8v8" />
    </svg>
  ),
  Diamond: ({ size = 24, ...p }: IconProps) => (
    <svg {...baseProps(size)} {...p}>
      <path d="M6 4h12l4 6-10 12L2 10z" />
      <path d="M2 10h20M9 4l3 6 3-6" />
    </svg>
  ),
  Rocket: ({ size = 24, ...p }: IconProps) => (
    <svg {...baseProps(size)} {...p}>
      <path d="M5 19l4-1 1-4 8-8a3 3 0 0 1 4 4l-8 8-4 1z" />
      <circle cx="15" cy="9" r="1.5" />
      <path d="M9 15l-3-3" />
    </svg>
  ),
  Check: ({ size = 24, ...p }: IconProps) => (
    <svg {...baseProps(size)} {...p}>
      <path d="M5 12l5 5 9-12" />
    </svg>
  ),
  ArrowLeft: ({ size = 24, ...p }: IconProps) => (
    <svg {...baseProps(size)} {...p}>
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  ),
  Sprout: ({ size = 24, ...p }: IconProps) => (
    <svg {...baseProps(size)} {...p}>
      <path d="M12 20v-8" />
      <path d="M12 12c0-4 4-6 8-6-2 4-4 6-8 6z" />
      <path d="M12 14c0-3-3-5-7-5 1 3 3 5 7 5z" />
    </svg>
  ),
};

export const CourseIcon = ({ name, size = 22, className }: { name: string; size?: number; className?: string }) => {
  const map: Record<string, any> = {
    sparkles: Icons.Sparkles,
    "book-open": Icons.Book,
    moon: Icons.Moon,
    scale: Icons.Scale,
    shield: Icons.Shield,
    compass: Icons.Compass,
    heart: Icons.Heart,
    crown: Icons.Crown,
    star: Icons.Star,
    brain: Icons.Brain,
  };
  const Comp = map[name] ?? Icons.Sparkles;
  return <Comp size={size} className={className} />;
};
