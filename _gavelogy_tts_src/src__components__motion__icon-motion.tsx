"use client";

import {
  motion,
  useAnimationControls,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { type LucideIcon } from "lucide-react";
import {
  useEffect,
  useState,
  type CSSProperties,
  type MouseEventHandler,
} from "react";
import { EASE_OUT } from "@/lib/ease";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";

/** Contextual hover motion — each preset mimics the icon's real-world action. */
export type IconMotionPreset =
  | "bell"
  | "download"
  | "copy"
  | "search"
  | "chevronDown"
  | "bookOpen"
  | "layoutDashboard"
  | "trophy"
  | "gamepad"
  | "alertCircle"
  | "scale"
  | "calendar"
  | "fileText"
  | "sun"
  | "moon"
  | "logOut"
  | "menu"
  | "x"
  | "user"
  | "swords"
  | "zap"
  | "users"
  | "heart"
  | "target"
  | "trendingUp"
  | "sparkles"
  | "grid"
  | "layoutList"
  | "flame"
  | "plus"
  | "arrowRight"
  | "arrowLeft"
  | "chevronRight"
  | "chevronLeft"
  | "chevronUp"
  | "chevronsLeft"
  | "check"
  | "xCircle"
  | "clock"
  | "crown"
  | "trendingDown"
  | "activity"
  | "layers"
  | "folder"
  | "moreHorizontal"
  | "refreshCw"
  | "shield"
  | "barChart3"
  | "brain"
  | "gift"
  | "smartphone"
  | "graduationCap"
  | "play"
  | "pause"
  | "star"
  | "externalLink"
  | "trash2"
  | "upload"
  | "lock"
  | "mail"
  | "eye"
  | "volume"
  | "subtle";

const DURATION = {
  swing: 0.68,
  drop: 0.58,
  snap: 0.42,
  search: 0.56,
  nudge: 0.48,
  spin: 0.62,
  slide: 0.55,
} as const;

function transition(duration: number) {
  return { duration, ease: EASE_OUT };
}

export const ICON_MOTION_VARIANTS: Record<IconMotionPreset, Variants> = {
  bell: {
    rest: { rotate: 0, transformOrigin: "top center" },
    hover: {
      rotate: [0, 14, -12, 8, -5, 0],
      transition: transition(DURATION.swing),
    },
  },
  download: {
    rest: { y: 0 },
    hover: {
      y: [0, 2, 6, 10, 4, 0],
      transition: transition(DURATION.drop),
    },
  },
  copy: {
    rest: { scale: 1, x: 0 },
    hover: {
      scale: [1, 1.1, 0.94, 1.02, 1],
      x: [0, 1, -1, 0],
      transition: transition(DURATION.snap),
    },
  },
  search: {
    rest: { rotate: 0, scale: 1, transformOrigin: "bottom right" },
    hover: {
      rotate: [0, -10, 8, -4, 0],
      scale: [1, 1.06, 1.02, 1],
      transition: transition(DURATION.search),
    },
  },
  chevronDown: {
    rest: { y: 0 },
    hover: {
      y: [0, 2, 5, 2, 0],
      transition: transition(DURATION.nudge),
    },
  },
  bookOpen: {
    rest: { rotate: 0, transformOrigin: "left center" },
    hover: {
      rotate: [0, -6, 4, -2, 0],
      transition: transition(DURATION.swing),
    },
  },
  layoutDashboard: {
    rest: { scale: 1 },
    hover: {
      scale: [1, 0.94, 1.03, 1],
      transition: transition(DURATION.nudge),
    },
  },
  trophy: {
    rest: { y: 0, rotate: 0, transformOrigin: "bottom center" },
    hover: {
      y: [0, -4, -2, 0],
      rotate: [0, -3, 3, 0],
      transition: transition(DURATION.nudge),
    },
  },
  gamepad: {
    rest: { rotate: 0 },
    hover: {
      rotate: [0, -5, 5, -2, 0],
      y: [0, 1, 0],
      transition: transition(DURATION.nudge),
    },
  },
  alertCircle: {
    rest: { rotate: 0, transformOrigin: "top center" },
    hover: {
      rotate: [0, -8, 8, -5, 3, 0],
      transition: transition(DURATION.swing),
    },
  },
  scale: {
    rest: { rotate: 0, transformOrigin: "top center" },
    hover: {
      rotate: [0, -10, 10, -6, 0],
      transition: transition(DURATION.swing),
    },
  },
  calendar: {
    rest: { scaleY: 1, y: 0 },
    hover: {
      scaleY: [1, 0.9, 1.02, 1],
      y: [0, -2, 0],
      transition: transition(DURATION.nudge),
    },
  },
  fileText: {
    rest: { y: 0 },
    hover: {
      y: [0, -3, 1, 0],
      transition: transition(DURATION.nudge),
    },
  },
  sun: {
    rest: { rotate: 0, transformOrigin: "center" },
    hover: {
      rotate: [0, 45, 90, 60, 0],
      transition: transition(DURATION.spin),
    },
  },
  moon: {
    rest: { rotate: 0, transformOrigin: "center" },
    hover: {
      rotate: [0, -14, 8, -4, 0],
      transition: transition(DURATION.swing),
    },
  },
  logOut: {
    rest: { x: 0, rotate: 0 },
    hover: {
      x: [0, 3, 6, 2, 0],
      rotate: [0, 0, -6, 0],
      transition: transition(DURATION.slide),
    },
  },
  menu: {
    rest: { scaleX: 1 },
    hover: {
      scaleX: [1, 1.06, 0.98, 1.02, 1],
      transition: transition(DURATION.snap),
    },
  },
  x: {
    rest: { rotate: 0, scale: 1 },
    hover: {
      rotate: [0, 90],
      scale: [1, 1.05, 1],
      transition: transition(DURATION.snap),
    },
  },
  user: {
    rest: { y: 0 },
    hover: {
      y: [0, -2, 1, 0],
      transition: transition(DURATION.nudge),
    },
  },
  swords: {
    rest: { rotate: 0 },
    hover: {
      rotate: [0, -12, 12, -6, 0],
      transition: transition(DURATION.swing),
    },
  },
  zap: {
    rest: { scale: 1, opacity: 1 },
    hover: {
      scale: [1, 1.18, 0.92, 1.06, 1],
      opacity: [1, 1, 0.85, 1],
      transition: transition(DURATION.snap),
    },
  },
  users: {
    rest: { scale: 1 },
    hover: {
      scale: [1, 1.04, 0.98, 1.02, 1],
      x: [0, -1, 1, 0],
      transition: transition(DURATION.nudge),
    },
  },
  heart: {
    rest: { scale: 1 },
    hover: {
      scale: [1, 1.14, 1.06, 1.1, 1],
      transition: transition(DURATION.snap),
    },
  },
  target: {
    rest: { scale: 1 },
    hover: {
      scale: [1, 1.12, 1.04, 1],
      transition: transition(DURATION.nudge),
    },
  },
  trendingUp: {
    rest: { y: 0, rotate: 0 },
    hover: {
      y: [0, -4, -2, 0],
      rotate: [0, -4, 0],
      transition: transition(DURATION.nudge),
    },
  },
  sparkles: {
    rest: { rotate: 0, scale: 1 },
    hover: {
      rotate: [0, 12, -8, 4, 0],
      scale: [1, 1.08, 1],
      transition: transition(DURATION.swing),
    },
  },
  grid: {
    rest: { scale: 1 },
    hover: {
      scale: [1, 0.95, 1.04, 1],
      transition: transition(DURATION.nudge),
    },
  },
  layoutList: {
    rest: { x: 0 },
    hover: {
      x: [0, 2, -1, 0],
      transition: transition(DURATION.nudge),
    },
  },
  flame: {
    rest: { scale: 1, rotate: 0, y: 0, transformOrigin: "bottom center" },
    hover: {
      scale: [1, 1.1, 0.94, 1.08, 1.02, 1],
      rotate: [0, -5, 5, -4, 3, 0],
      y: [0, -3, 1, -2, 0],
      transition: transition(DURATION.swing),
    },
  },
  plus: {
    rest: { scale: 1, rotate: 0 },
    hover: {
      scale: [1, 1.18, 0.95, 1.08, 1],
      rotate: [0, 90, 90, 0],
      transition: transition(DURATION.snap),
    },
  },
  arrowRight: {
    rest: { x: 0 },
    hover: {
      x: [0, 3, 6, 3, 0],
      transition: transition(DURATION.slide),
    },
  },
  arrowLeft: {
    rest: { x: 0 },
    hover: {
      x: [0, -3, -6, -3, 0],
      transition: transition(DURATION.slide),
    },
  },
  chevronRight: {
    rest: { x: 0 },
    hover: {
      x: [0, 2, 5, 2, 0],
      transition: transition(DURATION.nudge),
    },
  },
  chevronLeft: {
    rest: { x: 0 },
    hover: {
      x: [0, -2, -5, -2, 0],
      transition: transition(DURATION.nudge),
    },
  },
  chevronUp: {
    rest: { y: 0 },
    hover: {
      y: [0, -2, -5, -2, 0],
      transition: transition(DURATION.nudge),
    },
  },
  chevronsLeft: {
    rest: { x: 0 },
    hover: {
      x: [0, -4, -8, -4, 0],
      transition: transition(DURATION.slide),
    },
  },
  check: {
    rest: { scale: 1, rotate: 0 },
    hover: {
      scale: [1, 1.2, 0.92, 1.05, 1],
      rotate: [0, -8, 4, 0],
      transition: transition(DURATION.snap),
    },
  },
  xCircle: {
    rest: { scale: 1, rotate: 0 },
    hover: {
      scale: [1, 1.1, 0.9, 1],
      rotate: [0, -12, 12, -6, 0],
      transition: transition(DURATION.snap),
    },
  },
  clock: {
    rest: { rotate: 0, transformOrigin: "center" },
    hover: {
      rotate: [0, 12, -8, 6, 0],
      transition: transition(DURATION.swing),
    },
  },
  crown: {
    rest: { y: 0, rotate: 0, transformOrigin: "bottom center" },
    hover: {
      y: [0, -5, -2, 0],
      rotate: [0, -4, 4, 0],
      transition: transition(DURATION.nudge),
    },
  },
  trendingDown: {
    rest: { y: 0, rotate: 0 },
    hover: {
      y: [0, 4, 2, 0],
      rotate: [0, 4, 0],
      transition: transition(DURATION.nudge),
    },
  },
  activity: {
    rest: { scaleY: 1, transformOrigin: "bottom center" },
    hover: {
      scaleY: [1, 1.2, 0.85, 1.15, 1],
      transition: transition(DURATION.nudge),
    },
  },
  layers: {
    rest: { y: 0, scale: 1 },
    hover: {
      y: [0, -3, -1, 0],
      scale: [1, 1.04, 0.98, 1],
      transition: transition(DURATION.nudge),
    },
  },
  folder: {
    rest: { rotate: 0, transformOrigin: "left bottom" },
    hover: {
      rotate: [0, -8, -4, 0],
      y: [0, -1, 0],
      transition: transition(DURATION.swing),
    },
  },
  moreHorizontal: {
    rest: { scaleX: 1 },
    hover: {
      scaleX: [1, 1.15, 0.95, 1.08, 1],
      transition: transition(DURATION.snap),
    },
  },
  refreshCw: {
    rest: { rotate: 0, transformOrigin: "center" },
    hover: {
      rotate: [0, -120, -240, -360],
      transition: transition(DURATION.spin),
    },
  },
  shield: {
    rest: { scale: 1, rotate: 0, transformOrigin: "bottom center" },
    hover: {
      scale: [1, 1.06, 1.02, 1],
      rotate: [0, -3, 3, 0],
      transition: transition(DURATION.nudge),
    },
  },
  barChart3: {
    rest: { scaleY: 1, transformOrigin: "bottom center" },
    hover: {
      scaleY: [1, 1.12, 0.95, 1.08, 1],
      transition: transition(DURATION.nudge),
    },
  },
  brain: {
    rest: { scale: 1 },
    hover: {
      scale: [1, 1.08, 1.04, 1.06, 1],
      transition: transition(DURATION.nudge),
    },
  },
  gift: {
    rest: { y: 0, rotate: 0 },
    hover: {
      y: [0, -5, 2, -2, 0],
      rotate: [0, -6, 6, 0],
      transition: transition(DURATION.swing),
    },
  },
  smartphone: {
    rest: { rotate: 0, y: 0 },
    hover: {
      rotate: [0, -8, 8, -4, 0],
      y: [0, -2, 0],
      transition: transition(DURATION.swing),
    },
  },
  graduationCap: {
    rest: { y: 0, rotate: 0, transformOrigin: "center" },
    hover: {
      y: [0, -6, -3, 0],
      rotate: [0, -8, 8, 0],
      transition: transition(DURATION.swing),
    },
  },
  play: {
    rest: { x: 0, scale: 1 },
    hover: {
      x: [0, 2, 4, 2, 0],
      scale: [1, 1.1, 1.04, 1],
      transition: transition(DURATION.nudge),
    },
  },
  pause: {
    rest: { scaleX: 1 },
    hover: {
      scaleX: [1, 0.82, 1.05, 1],
      transition: transition(DURATION.snap),
    },
  },
  star: {
    rest: { rotate: 0, scale: 1, transformOrigin: "center" },
    hover: {
      rotate: [0, 18, -12, 8, 0],
      scale: [1, 1.12, 1.04, 1],
      transition: transition(DURATION.swing),
    },
  },
  externalLink: {
    rest: { x: 0, y: 0 },
    hover: {
      x: [0, 2, 4, 2, 0],
      y: [0, -2, -4, -2, 0],
      transition: transition(DURATION.slide),
    },
  },
  trash2: {
    rest: { rotate: 0, y: 0, transformOrigin: "bottom center" },
    hover: {
      rotate: [0, -6, 6, -4, 0],
      y: [0, 1, -1, 0],
      transition: transition(DURATION.swing),
    },
  },
  upload: {
    rest: { y: 0 },
    hover: {
      y: [0, -4, -8, -4, 0],
      transition: transition(DURATION.drop),
    },
  },
  lock: {
    rest: { y: 0, rotate: 0 },
    hover: {
      y: [0, -2, 0],
      rotate: [0, -4, 4, 0],
      transition: transition(DURATION.nudge),
    },
  },
  mail: {
    rest: { rotate: 0, transformOrigin: "top center" },
    hover: {
      rotate: [0, -8, 4, 0],
      y: [0, -1, 0],
      transition: transition(DURATION.swing),
    },
  },
  eye: {
    rest: { scaleY: 1 },
    hover: {
      scaleY: [1, 0.7, 1.1, 1],
      transition: transition(DURATION.snap),
    },
  },
  volume: {
    rest: { scale: 1 },
    hover: {
      scale: [1, 1.1, 0.95, 1.08, 1],
      transition: transition(DURATION.nudge),
    },
  },
  subtle: {
    rest: { scale: 1 },
    hover: {
      scale: [1, 1.05, 1],
      transition: transition(DURATION.nudge),
    },
  },
};

const ICON_PRESET_BY_NAME: Record<string, IconMotionPreset> = {
  Activity: "activity",
  AlertCircle: "alertCircle",
  ArrowLeft: "arrowLeft",
  ArrowRight: "arrowRight",
  Award: "trophy",
  BarChart3: "barChart3",
  Bell: "bell",
  BookOpen: "bookOpen",
  BookOpenCheck: "bookOpen",
  Brain: "brain",
  Calendar: "calendar",
  CalendarDays: "calendar",
  Check: "check",
  CheckCircle: "check",
  CheckCircle2: "check",
  ChevronDown: "chevronDown",
  ChevronLeft: "chevronLeft",
  ChevronRight: "chevronRight",
  ChevronUp: "chevronUp",
  ChevronsLeft: "chevronsLeft",
  Clock: "clock",
  Copy: "copy",
  Crown: "crown",
  Download: "download",
  ExternalLink: "externalLink",
  Eye: "eye",
  FileCheck: "fileText",
  FileText: "fileText",
  Flame: "flame",
  Folder: "folder",
  Gamepad2: "gamepad",
  Gift: "gift",
  GraduationCap: "graduationCap",
  Grid3X3: "grid",
  Heart: "heart",
  Layers: "layers",
  LayoutDashboard: "layoutDashboard",
  LayoutList: "layoutList",
  Lock: "lock",
  LogOut: "logOut",
  Mail: "mail",
  Menu: "menu",
  Moon: "moon",
  MoreHorizontal: "moreHorizontal",
  Pause: "pause",
  Play: "play",
  Plus: "plus",
  RefreshCw: "refreshCw",
  Scale: "scale",
  Search: "search",
  Shield: "shield",
  Smartphone: "smartphone",
  Sparkles: "sparkles",
  Star: "star",
  Sun: "sun",
  Swords: "swords",
  Target: "target",
  Timer: "clock",
  Trash2: "trash2",
  TrendingDown: "trendingDown",
  TrendingUp: "trendingUp",
  Trophy: "trophy",
  Upload: "upload",
  User: "user",
  Users: "users",
  Volume2: "volume",
  VolumeX: "volume",
  X: "x",
  XCircle: "xCircle",
  Zap: "zap",
  Gavel: "scale",
  Loader2: "refreshCw",
  Settings: "subtle",
  Edit3: "subtle",
  Save: "check",
  RotateCcw: "refreshCw",
  SkipForward: "arrowRight",
  AlertTriangle: "alertCircle",
  UserCheck: "user",
};

export function resolveIconPreset(icon: LucideIcon): IconMotionPreset {
  const name =
    (icon as { displayName?: string; name?: string }).displayName ?? icon.name;
  if (name && ICON_PRESET_BY_NAME[name]) {
    return ICON_PRESET_BY_NAME[name];
  }
  return "subtle";
}

export interface MotionIconProps {
  icon: LucideIcon;
  preset?: IconMotionPreset;
  className?: string;
  wrapperClassName?: string;
  iconStyle?: CSSProperties;
  /** When set, animates on parent row hover (sidebar links, buttons). */
  parentHovered?: boolean;
  /** Self-hover when parentHovered is undefined. Default true. */
  selfHover?: boolean;
}

export function MotionIcon({
  icon: Icon,
  preset,
  className,
  wrapperClassName,
  iconStyle,
  parentHovered,
  selfHover = true,
}: MotionIconProps) {
  const reduce = useReducedMotion();
  const canHover = useHoverCapable();
  const resolved = preset ?? resolveIconPreset(Icon);
  const variants = ICON_MOTION_VARIANTS[resolved];
  const controls = useAnimationControls();

  const parentDriven = parentHovered !== undefined;

  useEffect(() => {
    if (!parentDriven || reduce || !canHover) return;
    void controls.start(parentHovered ? "hover" : "rest");
  }, [parentDriven, parentHovered, reduce, canHover, controls]);

  if (reduce) {
    return <Icon className={className} style={iconStyle} aria-hidden />;
  }

  const wrapClass = wrapperClassName
    ? `inline-flex shrink-0 ${wrapperClassName}`
    : "inline-flex shrink-0";

  if (parentDriven) {
    return (
      <motion.span
        className={wrapClass}
        animate={controls}
        initial="rest"
        variants={variants}
      >
        <Icon className={className} style={iconStyle} aria-hidden />
      </motion.span>
    );
  }

  const hoverEnabled = selfHover && canHover;

  return (
    <motion.span
      className={wrapClass}
      initial="rest"
      animate="rest"
      whileHover={hoverEnabled ? "hover" : undefined}
      variants={variants}
    >
      <Icon className={className} style={iconStyle} aria-hidden />
    </motion.span>
  );
}

/** Tracks row hover so icons animate when the whole interactive row is hovered. */
export function useIconRowHover(
  externalEnter?: MouseEventHandler<HTMLElement>,
  externalLeave?: MouseEventHandler<HTMLElement>,
) {
  const canHover = useHoverCapable();
  const [hovered, setHovered] = useState(false);

  const onMouseEnter: MouseEventHandler<HTMLElement> = (e) => {
    if (canHover) setHovered(true);
    externalEnter?.(e);
  };

  const onMouseLeave: MouseEventHandler<HTMLElement> = (e) => {
    setHovered(false);
    externalLeave?.(e);
  };

  return { hovered: canHover ? hovered : false, onMouseEnter, onMouseLeave };
}